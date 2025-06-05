from fastapi import FastAPI, Request, Cookie, Form, Depends, HTTPException, Body
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi.responses import RedirectResponse
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware import Middleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from src.controllers.auth import role_required
import uvicorn
from ..models.database import get_db
from ..models.models_db import User, Rol, Pet, Veterinarian, MedicHistory, Appointment
from passlib.context import CryptContext
import logging
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from fastapi import Query
from ..controllers.payment_controller import router as payment_router

async def server_status_middleware(request: Request, call_next):
    if getattr(app, 'just_restarted', True):
        response = RedirectResponse(url="/login")
        response.delete_cookie("user_id")
        response.delete_cookie("user_role")
        app.just_restarted = False
        return response
    return await call_next(request)


app = FastAPI()
app.add_middleware(GZipMiddleware)
app.just_restarted = True 
app.middleware("http")(server_status_middleware)

app.include_router(payment_router, prefix="/api/v1")

#Configuracion de Directorios para cada vista 

app.mount("/static", StaticFiles(directory="src/views/static"))

#Configuracion de plantillas

templates = Jinja2Templates(directory="src/views/HTML")

#Schema 
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@app.post("/")
async def read_root(request: Request, name: str = Form(...), email: str = Form(...), password: str = Form(...)):
    return templates.TemplateResponse("index.html", {"request": request, "name": name, "email": email})

@app.get("/")
async def read_root(request: Request, db: Session = Depends(get_db)):
    user_id = request.cookies.get("user_id")
    user_role = request.cookies.get("user_role")
    is_logged_in = user_id is not None 

    # Obtener el nombre del usuario si está logueado
    user_name = None
    if is_logged_in:
        user = db.query(User).filter(User.id_user == user_id).first()
        if user:
            user_name = user.u_name

    return templates.TemplateResponse(
        "index.html",
        {"request": request, "is_logged_in": is_logged_in, "user_role": user_role, "user_name": user_name})
## suscripción lalalala
@app.get("/suscripcion", response_class=HTMLResponse)
async def suscripcion(request: Request, plan: str = Query(None)):
    return templates.TemplateResponse("suscripcion.html", {"request": request, "plan": plan})

@app.get("/login")
async def get_login(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/baño")
async def get_transporte(request: Request):
    return templates.TemplateResponse("servicio_baño.html", {"request": request})

@app.get("/corte")
async def get_transporte(request: Request):
    return templates.TemplateResponse("servicio_corte.html", {"request": request})

@app.get("/consulta")
async def get_transporte(request: Request):
    return templates.TemplateResponse("servicio_consulta.html", {"request": request})

@app.get("/control")
async def get_transporte(request: Request):
    return templates.TemplateResponse("servicio_control.html", {"request": request})

@app.get("/historial")
async def get_transporte(request: Request):
    return templates.TemplateResponse("servicio_historial.html", {"request": request})

@app.get("/veterinarios")
async def get_transporte(request: Request):
    return templates.TemplateResponse("servicio_veterinarios.html", {"request": request})

@app.get("/guarderia")
async def get_transporte(request: Request):
    return templates.TemplateResponse("servicio_guarderia.html", {"request": request})

@app.get("/transporte")
async def get_transporte(request: Request):
    return templates.TemplateResponse("servicio_transporte.html", {"request": request})

@app.get("/perf_vet")
@role_required(["Veterinario", "Administrador de la tienda"])  # Asegura que solo los veterinarios puedan acceder
async def get_perf_vet(request: Request, db: Session = Depends(get_db)):
    user_id = request.cookies.get("user_id")
    user_role = request.cookies.get("user_role")
    is_logged_in = user_id is not None

    if not is_logged_in:
        return RedirectResponse(url="/login", status_code=303)

    # Obtener el perfil del veterinario si existe
    vet_profile = db.query(Veterinarian).filter(Veterinarian.id_user == user_id).first()

    return templates.TemplateResponse(
        "perf_vet.html",
        {
            "request": request,
            "is_logged_in": is_logged_in,
            "user_role": user_role,
            "vet_profile": vet_profile
        }
    )

@app.get("/serv_vet")
@role_required(["Veterinario", "Administrador de la tienda"])  # Asegura que solo los veterinarios puedan acceder
async def get_serv_vet(request: Request, db: Session = Depends(get_db)):
    user_id = request.cookies.get("user_id")
    user_role = request.cookies.get("user_role")
    is_logged_in = user_id is not None

    if not is_logged_in:
        return RedirectResponse(url="/login", status_code=303)

    return templates.TemplateResponse(
        "serv_vet.html",
        {
            "request": request,
            "is_logged_in": is_logged_in,
            "user_role": user_role
        }
    )

@app.get("/getVetProfile")
@role_required(["Veterinario", "Administrador de la tienda"])  # Asegura que solo los veterinarios puedan acceder
async def get_vet_profile(request: Request, db: Session = Depends(get_db)):
    user_id = request.cookies.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="No autenticado")

    # Buscar el perfil del veterinario en la base de datos
    vet_profile = db.query(Veterinarian).filter(Veterinarian.id_user == user_id).first()
    if not vet_profile:
        return JSONResponse(content={}, status_code=200)  # Retorna un objeto vacío si no existe el perfil

    return vet_profile

@app.get("/modifyHistory")
@role_required(["Veterinario", "Administrador de la tienda"])  
async def get_modify_history(request: Request, db: Session = Depends(get_db)):
    user_id = request.cookies.get("user_id")
    user_role = request.cookies.get("user_role")
    is_logged_in = user_id is not None

    if not is_logged_in:
        return RedirectResponse(url="/login", status_code=303)

    # Obtener el perfil del veterinario si existe
    vet_profile = db.query(Veterinarian).filter(Veterinarian.id_user == user_id).first()

    return templates.TemplateResponse(
        "modifyHistory.html",
        {
            "request": request,
            "is_logged_in": is_logged_in,
            "user_role": user_role,
            "vet_profile": vet_profile
        }
    )

#Obtener viewPests
@app.get("/viewPets")
@role_required(["Cliente", "Veterinario", "Administrador de la tienda"])
async def get_view_pets(request: Request, db: Session = Depends(get_db)):
    user_id = request.cookies.get("user_id")
    if not user_id:
        return RedirectResponse(url="/login", status_code=303)

    return templates.TemplateResponse(
        "viewPets.html",
        {"request": request}
    )

@app.get("/getMyPets")
@role_required(["Cliente", "Veterinario", "Administrador de la tienda"])
async def get_my_pets(request: Request, db: Session = Depends(get_db)):
    user_id = request.cookies.get("user_id")
    user_role = request.cookies.get("user_role")

    # Si el usuario es Veterinario o Administrador, devolver todas las mascotas
    if user_role in ["Veterinario", "Administrador de la tienda"]:
        pets = db.query(Pet).all()
    else:
        # Si el usuario es Cliente, devolver solo sus mascotas
        pets = db.query(Pet).filter(Pet.id_owner == user_id).all()

    return [{"id_pet": pet.id_pet, "pet_name": pet.pet_name, "species": pet.species} for pet in pets]

@app.post("api/bano")
@role_required(["Cliente", "Veterinario", "Administrador de la tienda"])
async def solicitar_bano(
    request: Request,
    data: dict = Body(...),
    db: Session = Depends(get_db)
):
    user_id = request.cookies.get("user_id")

    # Crear nuevo registro en la tabla appointment
    nueva_cita = Appointment(
        id_pet=data.get("id_pet"),
        id_service=1,  # ID del servicio de baño
        id_veterinarian=1,  # No aplica veterinario para baño
        date_hour_status=data.get("hora_bano"),  # Hora del baño
        fecha_rec=data.get("fecha_bano"),  # Fecha del baño
        comentario=data.get("comentarios")  # Comentarios adicionales
    )
    db.add(nueva_cita)
    db.commit()
    db.refresh(nueva_cita)
    return {"success": True, "message": "Solicitud de baño registrada correctamente", "appointment_id": nueva_cita.id_appointment}

@app.post("/api/corte")
@role_required(["Cliente", "Veterinario", "Administrador de la tienda"])
async def solicitar_corte(
    request: Request,
    data: dict = Body(...),
    db: Session = Depends(get_db)
):
    user_id = request.cookies.get("user_id")
    # Crear nuevo registro en la tabla appointment
    nueva_cita = Appointment(
        id_pet=data.get("id_pet"),
        id_service=3,  # ID del servicio de corte
        id_veterinarian=1,  # No aplica veterinario para corte
        date_hour_status=data.get("hora_corte"),  # Hora del corte
        fecha_rec=data.get("fecha_corte"),  # Fecha del corte
        comentario=data.get("comentarios")  # Comentarios adicionales
    )
    db.add(nueva_cita)
    db.commit()
    db.refresh(nueva_cita)
    return {"success": True, "message": "Solicitud de corte registrada correctamente", "appointment_id": nueva_cita.id_appointment}

@app.post("/api/consulta")
@role_required(["Cliente", "Veterinario", "Administrador de la tienda"])
async def solicitar_consulta(
    request: Request,
    data: dict = Body(...),
    db: Session = Depends(get_db)
):
    user_id = request.cookies.get("user_id")
    # Crear nuevo registro en la tabla appointment
    nueva_cita = Appointment(
        id_pet=data.get("id_pet"),
        id_service=4,  # ID del servicio de consulta
        id_veterinarian=data.get("id_veterinarian"),  # ID del veterinario seleccionado
        date_hour_status=data.get("hora_consulta"),  # Hora de la consulta
        fecha_rec=data.get("fecha_consulta"),  # Fecha de la consulta
        comentario=data.get("comentarios")  # Comentarios adicionales
    )
    db.add(nueva_cita)
    db.commit()
    db.refresh(nueva_cita)
    return {"success": True, "message": "Solicitud de consulta registrada correctamente", "appointment_id": nueva_cita.id_appointment}

@app.post("/api/control")
@role_required(["Cliente", "Veterinario", "Administrador de la tienda"])
async def solicitar_control(
    request: Request,
    data: dict = Body(...),
    db: Session = Depends(get_db)
):
    user_id = request.cookies.get("user_id")
    # Crear nuevo registro en la tabla appointment
    nueva_cita = Appointment(
        id_pet=data.get("id_pet"),
        id_service=6,  # ID del servicio de control
        id_veterinarian=data.get("id_veterinarian"),  # ID del veterinario seleccionado
        date_hour_status=data.get("hora_control"),  # Hora del control
        fecha_rec=data.get("fecha_control"),  # Fecha del control
        comentario=data.get("comentarios")  # Comentarios adicionales
    )
    db.add(nueva_cita)
    db.commit()
    db.refresh(nueva_cita)
    return {"success": True, "message": "Solicitud de control registrada correctamente", "appointment_id": nueva_cita.id_appointment}

@app.post("/api/guarderia")
@role_required(["Cliente", "Veterinario", "Administrador de la tienda"])
async def solicitar_guarderia(
    request: Request,
    data: dict = Body(...),
    db: Session = Depends(get_db)
):
    user_id = request.cookies.get("user_id")
    # Crear nuevo registro en la tabla appointment
    nueva_cita = Appointment(
        id_pet=data.get("id_pet"),
        id_service=7,  # ID del servicio de guardería
        id_veterinarian=1,  # No aplica veterinario para guardería
        date_hour_status=data.get("hora_guarderia"),  # Hora de la guardería
        fecha_rec=data.get("fecha_guarderia"),  # Fecha de la guardería
        comentario=data.get("comentarios")  # Comentarios adicionales
    )
    db.add(nueva_cita)
    db.commit()
    db.refresh(nueva_cita)
    return {"success": True, "message": "Solicitud de guardería registrada correctamente", "appointment_id": nueva_cita.id_appointment}

@app.post("/api/transporte")
@role_required(["Cliente", "Veterinario", "Administrador de la tienda"])
async def solicitar_transporte(
    request: Request,
    data: dict = Body(...),
    db: Session = Depends(get_db)
):
    user_id = request.cookies.get("user_id")
    
    # Determinar el ID del servicio según el tipo de transporte
    tipo_transporte = data.get("tipo_transporte")
    if tipo_transporte == "ida":
        id_service = 2  # Solo ida
    elif tipo_transporte in ["ida-vuelta", "urgente"]:
        id_service = 5  # Ida y vuelta o servicio urgente
    else:
        raise HTTPException(status_code=400, detail="Tipo de transporte inválido")
    
    # Crear nuevo registro en la tabla appointment
    nueva_cita = Appointment(
        id_pet=data.get("id_pet"),
        id_service=id_service,  # ID del servicio determinado
        id_veterinarian=1,  # No aplica veterinario para transporte
        date_hour_status=data.get("hora_recogida"),  # Hora de recogida
        fecha_rec=data.get("fecha_recogida"),  # Fecha de recogida
        comentario=data.get("comentarios")  # Comentarios adicionales
    )
    
    db.add(nueva_cita)
    db.commit()
    db.refresh(nueva_cita)
    
    return {"success": True, "message": "Solicitud de transporte registrada correctamente", "appointment_id": nueva_cita.id_appointment}

@app.delete("/api/cancelAppointment/{id_appointment}")
async def cancelar_servicio(id_appointment: int, db: Session = Depends(get_db)):
    # Buscar el servicio en la base de datos
    servicio = db.query(Appointment).filter(Appointment.id_appointment == id_appointment).first()

    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")

    # Eliminar el servicio
    db.delete(servicio)
    db.commit()

    return {"success": True, "message": "Servicio cancelado con éxito"}

@app.get("/api/getAppointments")
@role_required(["Cliente", "Veterinario", "Administrador de la tienda"])
async def get_appointments(request: Request, db: Session = Depends(get_db)):
    user_id = request.cookies.get("user_id")
    user_role = request.cookies.get("user_role")

    # Si el usuario es Cliente, devolver solo sus citas
    if user_role == "Cliente":
        appointments = db.query(Appointment).join(Pet).filter(Pet.id_owner == user_id).all()
    else:
        # Si es Veterinario o Administrador, devolver todas las citas
        appointments = db.query(Appointment).all()

    return [
        {
            "id_appointment": appointment.id_appointment,
            "pet_name": appointment.pet.pet_name,
            "tipo_transporte": "Ida" if appointment.id_service == 2 else "Ida y vuelta",
            "fecha_recogida": appointment.fecha_rec,
            "hora_recogida": appointment.date_hour_status,
            "comentarios": appointment.comentario,
        }
        for appointment in appointments
    ]

@app.get("/viewHistory/{id_pet}")
@role_required(["Cliente", "Veterinario", "Administrador de la tienda"])
async def view_pet_history(id_pet: int, request: Request, db: Session = Depends(get_db)):
    print(f"Consultando historial médico para mascota con id {id_pet}")
    history = db.query(MedicHistory).filter(MedicHistory.id_pet == id_pet).all()
    
    return jsonable_encoder([
        {
            "date": record.first_cons_date,
            "description": record.observations
        } for record in history
    ])

@app.get("/getMyPets")
@role_required(["Cliente", "Veterinario", "Administrador de la tienda"])
async def get_my_pets(request: Request, db: Session = Depends(get_db)):
    user_id = request.cookies.get("user_id")
    user_role = request.cookies.get("user_role")
    print("USER ID:", user_id)
    print("USER ROLE:", user_role)

    # Si el usuario es Veterinario o Administrador, devolver todas las mascotas
    if user_role in ["Veterinario", "Administrador de la tienda"]:
        pets = db.query(Pet).all()
    else:
        # Si el usuario es Cliente, devolver solo sus mascotas
        pets = db.query(Pet).filter(Pet.id_owner == user_id).all()

    print("MASCOTAS:", pets)

    return [{"id_pet": pet.id_pet, "pet_name": pet.pet_name, "species": pet.species} for pet in pets]

@app.get("/serv")
async def get_serv(request: Request):
    return templates.TemplateResponse("serv.html", {"request": request})

@app.get("/about")
async def get_about(request: Request):
    return templates.TemplateResponse("about.html", {"request": request})

@app.get("/myPets")
async def get_my_pets(request: Request):
    return templates.TemplateResponse("myPets.html", {"request": request})

@app.get("/addPet")
@role_required(["Cliente", "Administrador de la tienda"])
async def get_add_pet(request: Request):
    return templates.TemplateResponse("addPet.html", {"request": request})

@app.post("/guardar")
async def guardar_datos(nombre: str = Form(...)):
    
    print("Guardando:", nombre)
    
    
    return RedirectResponse(url="/mascotas", status_code=303)

@app.post("/addPet")
@role_required(["Cliente", "Administrador de la tienda"])
async def add_pet(
    request: Request,
    pet_name: str = Form(...),
    sexo: str = Form(...),
    especie: str = Form(...),
    edad: int = Form(...),
    descripcion: str = Form(None),
    birthdate: str = Form(...),
    db: Session = Depends(get_db)
):
    user_id = request.cookies.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    try:
        new_pet = Pet(
            id_owner=user_id,
            pet_name=pet_name,
            species=especie,
            birthdate=birthdate,
            detalle=descripcion,
            sexo=sexo,
            edad=edad
        )
        db.add(new_pet)
        db.commit()
        db.refresh(new_pet)
        return RedirectResponse(url="/myPets", status_code=303)
    except Exception as e:
        logging.error(f"Error al registrar mascota: {str(e)}")
        db.rollback()
        return templates.TemplateResponse(
            "addPet.html",
            {
                "request": request,
                "error": "Error al registrar la mascota. Intente nuevamente."
            }
        )
    
#Post para obtener los datos de las mascotas del usuario
@app.get("/myPetsData")
@role_required(["Cliente", "Administrador de la tienda"])
async def get_my_pets_data(request: Request, db: Session = Depends(get_db)):
    user_id = request.cookies.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="No autenticado")

    pets = db.query(Pet).filter(Pet.id_owner == user_id).all()
    return [{"pet_name": pet.pet_name, "species": pet.species, "edad": pet.edad} for pet in pets]

@app.get("/manage_users")
@role_required(["Administrador de la tienda", "Cliente"])
async def get_manage_users(request: Request, db: Session = Depends(get_db)):
    users = db.query(User).all()
    return templates.TemplateResponse("manage_users.html", {"request": request, "users": users})

# Por favor no tocar esto :)

@app.post("/admin/users/assign-role")
@role_required(["Administrador de la tienda", "Cliente"])
async def assign_role(
    request: Request,
    user_id: int = Form(...),
    new_role: int = Form(...),
    db: Session = Depends(get_db)
):
    try:
        user = db.query(User).filter(User.id_user == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        # Asignar nuevo rol al usuario
        user.id_rol = new_role
        db.commit()
        db.refresh(user)
        
        return {"message": "Rol asignado correctamente"}
    except Exception as e:
        logging.error(f"Error al asignar rol: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Error al asignar rol")



@app.post("/login")
async def login(
    request: Request,
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    # 1. Autenticar usuario
    user = db.query(User).filter(User.email == email).first()
    if not user or not pwd_context.verify(password, user.password_hashed):
        return templates.TemplateResponse(
            "login.html",
            {"request": request, "error": "Credenciales inválidas"},
            status_code=401
        )
    
    # 2. Obtener rol
    rol = db.query(Rol).filter(Rol.id_rol == user.id_rol).first()
    
    if not rol:
        raise HTTPException(
            status_code=403,
            detail="Rol no tiene dashboard asignado"
        )
    

    response = RedirectResponse(
        url="/",
        status_code=303
    )
   # response.set_cookie(key="user_role", value=rol.description)

    response.set_cookie(
        key="user_id",
        value=user.id_user,
        httponly=True,
        secure=True,  
        samesite="lax"
    )
    
    
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
    rol_id: int = Form(1),
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
            password_hashed=hashed_password,
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
    
from fastapi import Form


@app.post("/createOrUpdateVetProfile")
@role_required(["Veterinario"])  # Asegura que solo los veterinarios puedan acceder
async def create_or_update_vet_profile(
    request: Request,
    name_vet: str = Form(...),
    last_name: str = Form(...),
    telefono: str = Form(...),
    email: str = Form(...),
    state: str = Form(...),
    description: str = Form(...),
    db: Session = Depends(get_db)
):
    user_id = request.cookies.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="No autenticado")

    # Verificar si el perfil ya existe
    vet_profile = db.query(Veterinarian).filter(Veterinarian.id_user == user_id).first()

    if vet_profile:
        # Actualizar perfil existente
        vet_profile.name_vet = name_vet
        vet_profile.last_name = last_name
        vet_profile.telefono = telefono
        vet_profile.email = email
        vet_profile.state = state
        vet_profile.description = description
    else:
        # Crear nuevo perfil
        vet_profile = Veterinarian(
            id_user=user_id,
            name_vet=name_vet,
            last_name=last_name,
            telefono=telefono,
            email=email,
            state=state,
            description=description
        )
        db.add(vet_profile)

    db.commit()
    db.refresh(vet_profile)

    return {"message": "Perfil guardado exitosamente"}

@app.post("/modifyPetHistory")
@role_required(["Veterinario"])  # Asegura que solo los veterinarios puedan acceder
async def modify_pet_history(
    request: Request,
    id_pet: int = Form(...),
    vaccines: str = Form(...),
    observations: str = Form(...),
    first_cons_date: str = Form(...),
    db: Session = Depends(get_db)
):
    user_id = request.cookies.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="No autenticado")

    # Obtener el veterinario asociado al usuario
    veterinarian = db.query(Veterinarian).filter(Veterinarian.id_user == user_id).first()
    if not veterinarian:
        raise HTTPException(status_code=403, detail="No autorizado")

    # Crear o actualizar el historial médico
    medic_history = db.query(MedicHistory).filter(MedicHistory.id_pet == id_pet).first()
    if medic_history:
        # Actualizar historial existente
        medic_history.vaccines = vaccines
        medic_history.observations = observations
        medic_history.first_cons_date = first_cons_date
        medic_history.id_veterinarian = veterinarian.id_veterinarian
    else:
        # Crear nuevo historial
        medic_history = MedicHistory(
            id_pet=id_pet,
            id_veterinarian=veterinarian.id_veterinarian,
            vaccines=vaccines,
            observations=observations,
            first_cons_date=first_cons_date
        )
        db.add(medic_history)

    db.commit()
    db.refresh(medic_history)

    return {"message": "Historial médico guardado exitosamente"}

# Por favor no tocar esto :)

#Request del registro.html para generar las entradas de Mascota
@app.get("/registro")
async def get_registro(request: Request):
    return templates.TemplateResponse("Reg.html", {"request": request})

@app.post("/registro")
async def post_registro(request: Request, Mascota1: str = Form(...), Mascota2: str = Form(...), Mascota3: str = Form(...)):
        return templates.TemplateResponse("Reg.html", {"request": request, "Mascota1": Mascota1, "Mascota2": Mascota2, "Mascota3": Mascota3})

##codigo para conectar la bd con los vet list de serv.html




##
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)

#Esta mierda no quiere servir. Matenme, si esto no funciona pronto cosas malas sucederan att: el programador/TRIVI
#Ya la mierda quiere funcionar pero igual malas cosas malas sucederan a este ritmo att: el programador/TRIVI 18/4/2025
#Ya tengo demasiadas decepciones, como para que no me funcione esto att: el programador/TRIVI 18/4/2025 😭😢
#Maldita sea, tras de que no he terminado esto, las decepciones solo aumentan, lo lakers pierden el primer partido
#Que alguien me desviva por favor att: el programador/TRIVI 19/4/2025
#Yo que le hice a la vida?, cada dia mas triste y aburrido. att: el programador/TRIVI 21/4/2025
#Esta mierda funciona por obra y gracia del espiritu santo. att: La loca de Karen
#estar triste es malo, no estes triste
#Malditas esto es solo pa mi, no toque mi leyenda att: el programador/TRIVI 21/4/2025 🔫🔫🔫

