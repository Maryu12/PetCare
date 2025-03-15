from fastapi import FastAPI, Form
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request
from fastapi.responses import HTMLResponse
import uvicorn

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
async def post_login(request: Request, email: str = Form(...), password: str = Form(...)):
    # Aquí puedes agregar la lógica de autenticación
    return templates.TemplateResponse("login.html", {"request": request, "email": email})

@app.post("/register")
async def post_register(request: Request, name: str = Form(...), email: str = Form(...), password: str = Form(...)):
    
    return templates.TemplateResponse("login.html", {"request": request, "name": name, "email": email})

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)