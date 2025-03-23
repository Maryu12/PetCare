from fastapi import FastAPI, Form, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
import uvicorn
from src.models import database, user

app = FastAPI()

app.mount("/static", StaticFiles(directory="src/views/static"), name="static")
templates = Jinja2Templates(directory="src/views/templates")

@app.get("/")
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/login")
async def get_login(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.post("/login")
async def post_login(request: Request, email: str = Form(...), password: str = Form(...), db: Session = Depends(database.get_db)):
    user_instance = db.query(user.User).filter(user.User.email == email).first()
    if user_instance and user_instance.hashed_password == password:
        return templates.TemplateResponse("login.html", {"request": request, "email": email})
    return templates.TemplateResponse("login.html", {"request": request, "error": "Invalid credentials"})

@app.post("/register")
async def post_register(request: Request, name: str = Form(...), email: str = Form(...), password: str = Form(...), db: Session = Depends(database.get_db)):
    hashed_password = password  # Aquí deberías hashear la contraseña
    new_user = user.User(name=name, email=email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return templates.TemplateResponse("login.html", {"request": request, "name": name, "email": email})

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)