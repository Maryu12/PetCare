from fastapi import FastAPI, Request, Cookie, Form, Depends, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
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


# Por favor no tocar esto :)


# Por favor no tocar esto :)

ROLE_URLS = {
    "Cliente": "/cliente/dashboard",
    "Veterinario": "/vet/dashboard",
    "Administrador de la tienda": "/admin/dashboard"
}

@app.post("/login")

async def post_login(request: Request, email: str = Form(...), password: str = Form(...)):
   
    return templates.TemplateResponse("login.html", {"request": request, "email": email})

async def login(
    request: Request,
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    # 1. Autenticar usuario
    user = db.query(User).filter(User.email == email).first()
    if not user or not pwd_context.verify(password, user.password_hash):
        return templates.TemplateResponse(
            "login.html",
            {"request": request, "error": "Credenciales inválidas"},
            status_code=401
        )
    
    # 2. Obtener rol
    rol = db.query(Rol).filter(Rol.id_rol == user.id_rol).first()
    
    if not rol or rol.description not in ROLE_URLS:
        raise HTTPException(
            status_code=403,
            detail="Rol no tiene dashboard asignado"
        )
    
    response = RedirectResponse(
        url=ROLE_URLS[rol.description],
        status_code=303
    )
    response.set_cookie(key="user_role", value=rol.description)
    
    # 3. Crear sesión 
    response.set_cookie(
        key="user_role",
        value=rol.description,
        httponly=True,
        secure=True,  
        samesite="lax"
    )
    return response

def get_current_role(request: Request, user_role: str = Cookie(None)):
    if not user_role:
        raise HTTPException(status_code=401, detail="No autenticado")
    return user_role

@app.get("/admin/dashboard")
async def admin_dashboard(
    request: Request,
    user_role: str = Cookie(None)
):
    if user_role != "Administrador de la tienda":
        raise HTTPException(
            status_code=403,
            detail="Solo para administradores"
        )
    return templates.TemplateResponse(
        "admin_dashboard.html",
        {"request": request, "user_role": user_role}
    )

@app.get("/vet/dashboard")
async def vet_dashboard(
    request: Request,
    user_role: str = Cookie(None)
):
    if user_role != "Veterinario":
        raise HTTPException(
            status_code=403,
            detail="Solo para veterinarios"
        )
    return templates.TemplateResponse(
        "vet_dashboard.html",
        {"request": request, "user_role": user_role}
    )

@app.get("/cliente/dashboard")
async def client_dashboard(
    request: Request,
    user_role: str = Cookie(None)
):
    if user_role != "Cliente":
        raise HTTPException(
            status_code=403,
            detail="Solo para clientes"
        )
    return templates.TemplateResponse(
        "client_dashboard.html",
        {"request": request, "user_role": user_role}
    )

@app.get("/logout")
async def logout():
    response = RedirectResponse(url="/login", status_code=303)
    response.delete_cookie("user_id")
    response.delete_cookie("user_role")
    return response

@app.post("/register")
async def register_user(
    request: Request,
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    telefono: str = Form(...),
    rol_id: int = Form(...),
    db: Session = Depends(get_db)
):
    try:
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            return templates.TemplateResponse(
                "login.html",
                {
                    "request": request,
                    "register_error": "El correo ya está registrado",
                    "show_register": True
                }
            )
        
        name = name.encode('latin-1').decode('utf-8', 'ignore')
        password = password.encode('latin-1').decode('utf-8', 'ignore')

        hashed_password = pwd_context.hash(password)
        new_user = User(
            u_name=name,
            email=email,
            password_hash=hashed_password,
            telefono = telefono.encode('ascii', 'ignore').decode('ascii'),
            id_rol=rol_id
        )
        
        db.add(new_user)
        db.commit()
        
        return RedirectResponse(
            url="/login?register_success=1",
            status_code=303
        )
        
    except Exception as e:
        logging.error(f"Error en registro: {str(e)}")
        db.rollback()
        return templates.TemplateResponse(
            "login.html",
            {
                "request": request,
                "register_error": "Error en el registro. Intente nuevamente.",
                "show_register": True
            }
        )
async def login(
    request: Request,
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    # 1. Autenticar usuario
    user = db.query(User).filter(User.email == email).first()
    if not user or not pwd_context.verify(password, user.password_hash):
        return templates.TemplateResponse(
            "login.html",
            {"request": request, "error": "Credenciales inválidas"},
            status_code=401
        )
    
    # 2. Obtener rol
    rol = db.query(Rol).filter(Rol.id_rol == user.id_rol).first()
    
    if not rol or rol.description not in ROLE_URLS:
        raise HTTPException(
            status_code=403,
            detail="Rol no tiene dashboard asignado"
        )
    
    response = RedirectResponse(
        url=ROLE_URLS[rol.description],
        status_code=303
    )
    response.set_cookie(key="user_role", value=rol.description)
    
    # 3. Crear sesión 
    response.set_cookie(
        key="user_role",
        value=rol.description,
        httponly=True,
        secure=True,  
        samesite="lax"
    )
    return response

def get_current_role(request: Request, user_role: str = Cookie(None)):
    if not user_role:
        raise HTTPException(status_code=401, detail="No autenticado")
    return user_role

@app.get("/admin/dashboard")
async def admin_dashboard(
    request: Request,
    user_role: str = Cookie(None)
):
    if user_role != "Administrador de la tienda":
        raise HTTPException(
            status_code=403,
            detail="Solo para administradores"
        )
    return templates.TemplateResponse(
        "admin_dashboard.html",
        {"request": request, "user_role": user_role}
    )

@app.get("/vet/dashboard")
async def vet_dashboard(
    request: Request,
    user_role: str = Cookie(None)
):
    if user_role != "Veterinario":
        raise HTTPException(
            status_code=403,
            detail="Solo para veterinarios"
        )
    return templates.TemplateResponse(
        "vet_dashboard.html",
        {"request": request, "user_role": user_role}
    )

@app.get("/cliente/dashboard")
async def client_dashboard(
    request: Request,
    user_role: str = Cookie(None)
):
    if user_role != "Cliente":
        raise HTTPException(
            status_code=403,
            detail="Solo para clientes"
        )
    return templates.TemplateResponse(
        "client_dashboard.html",
        {"request": request, "user_role": user_role}
    )

@app.get("/logout")
async def logout():
    response = RedirectResponse(url="/login", status_code=303)
    response.delete_cookie("user_id")
    response.delete_cookie("user_role")
    return response

@app.post("/register")
async def register_user(
    request: Request,
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    telefono: str = Form(...),
    rol_id: int = Form(...),
    db: Session = Depends(get_db)
):
    try:
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            return templates.TemplateResponse(
                "login.html",
                {
                    "request": request,
                    "register_error": "El correo ya está registrado",
                    "show_register": True
                }
            )
        
        name = name.encode('latin-1').decode('utf-8', 'ignore')
        password = password.encode('latin-1').decode('utf-8', 'ignore')

        hashed_password = pwd_context.hash(password)
        new_user = User(
            u_name=name,
            email=email,
            password_hash=hashed_password,
            telefono = telefono.encode('ascii', 'ignore').decode('ascii'),
            id_rol=rol_id
        )
        
        db.add(new_user)
        db.commit()
        
        return RedirectResponse(
            url="/login?register_success=1",
            status_code=303
        )
        
    except Exception as e:
        logging.error(f"Error en registro: {str(e)}")
        db.rollback()
        return templates.TemplateResponse(
            "login.html",
            {
                "request": request,
                "register_error": "Error en el registro. Intente nuevamente.",
                "show_register": True
            }
        )

# Por favor no tocar esto :)

#Request del registro.html para generar las entradas de Mascota
@app.get("/registro")
async def get_registro(request: Request):
    return templates.TemplateResponse("registro.html", {"request": request})

@app.post("/registro")
async def post_registro(request: Request, Mascota1: str = Form(...), Mascota2: str = Form(...), Mascota3: str = Form(...)):
    # Aquí puedes hacer lo que necesites con los datos, como guardarlos en una base de datos
    return templates.TemplateResponse("registro.html", {"request": request, "Mascota1": Mascota1, "Mascota2": Mascota2, "Mascota3": Mascota3})

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)