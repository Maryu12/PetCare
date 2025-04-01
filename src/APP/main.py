from fastapi import FastAPI, Request, Cookie, Form, Depends, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import RedirectResponse
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import uvicorn
from ..models.database import get_db
from ..models.models_db import User, Rol
from passlib.context import CryptContext
import logging


app = FastAPI()
app.add_middleware(GZipMiddleware)

app.mount("/static", StaticFiles(directory="src/views/static"), name="static")
templates = Jinja2Templates(directory="src/views/templates")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@app.post("/")
async def read_root(request: Request, name: str = Form(...), email: str = Form(...), password: str = Form(...)):
    return templates.TemplateResponse("index.html", {"request": request, "name": name, "email": email})

@app.get("/")
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/addpet")
async def get_add_pet(request: Request):
    return templates.TemplateResponse("addPet.html", {"request": request})

@app.get("/login")
async def get_login(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.post("/login")
async def post_login(request: Request, email: str = Form(...), password: str = Form(...)):
   
    return templates.TemplateResponse("login.html", {"request": request, "email": email})
#Request del registro.html para generar las entradas de Mascota
@app.get("/registro")
async def get_registro(request: Request):
    return templates.get_template("registro.html", {"request": request})

@app.post("/registro")
async def post_registro(request: Request, Mascota1: str = Form(...), Mascota2: str = Form(...), Mascota3: str = Form(...)):
    # Aquí puedes hacer lo que necesites con los datos, como guardarlos en una base de datos
    return templates.TemplateResponse("registro.html", {"request": request, "Mascota1": Mascota1, "Mascota2": Mascota2, "Mascota3": Mascota3})


@app.get("/register")
async def get_register(request: Request):
    return templates.get_template("login.html", {"request": request})

@app.post("/register")
async def post_register(request: Request, name: str = Form(...), email: str = Form(...), password: str = Form(...)):
    
    return templates.TemplateResponse("login.html", {"request": request, "name": name, "email": email})

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)