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
from ..models.models_db import User, Rol, Pet, Veterinarian, MedicHistory, Appointment, Services
from passlib.context import CryptContext
import logging
import os
from datetime import datetime
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

def _build_template_context(request: Request, extra: dict | None = None, db: Session | None = None):
    ctx = {"request": request}
    user_id = request.cookies.get("user_id")
    user_role = request.cookies.get("user_role")
    is_logged_in = user_id is not None
    ctx.update({"is_logged_in": is_logged_in, "user_role": user_role, "user_id": user_id})
    if is_logged_in and db is not None:
        user = db.query(User).filter(User.id_user == user_id).first()
        if user:
            ctx["user_name"] = user.u_name
    if extra:
        ctx.update(extra)
    return ctx

def render_template(request, template_name, extra=None, db=None, status_code=None):
    ctx = _build_template_context(request, extra=extra, db=db)
    return templates.TemplateResponse(template_name, ctx, status_code=status_code) if status_code else templates.TemplateResponse(template_name, ctx)

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
        {"request": request, "is_logged_in": is_logged_in, "user_role": user_role, "user_name": user_name, "user_id": user_id})
## suscripción lalalala
@app.get("/suscripcion", response_class=HTMLResponse)
async def get_suscripcion(request: Request, plan: str = Query(None), db: Session = Depends(get_db)):
    return render_template(request, "suscripcion.html", extra={"plan": plan}, db=db)

@app.get("/login")
async def get_login(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/transporte")
async def get_transporte(request: Request, db: Session = Depends(get_db)):
    return render_template(request, "transporte.html", db=db)

@app.get("/agendaVet")
async def get_agenda_vet(request: Request, db: Session = Depends(get_db)):
    return render_template(request, "agendaVet.html", db=db)

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

@app.get("/conf", response_class=HTMLResponse)
async def get_conf(request: Request, db: Session = Depends(get_db)):
    return render_template(request, "conf.html", db=db)

@app.get("/user", response_class=HTMLResponse)
async def get_user(request: Request, db: Session = Depends(get_db)):
    return render_template(request, "user.html", db=db)

@app.get("/bano", response_class=HTMLResponse)
async def get_bano(request: Request, db: Session = Depends(get_db)):
    return render_template(request, "bano.html", db=db)

@app.get("/control", response_class=HTMLResponse)
async def get_control(request: Request, db: Session = Depends(get_db)):
    return render_template(request, "control.html", db=db)

@app.get("/vet", response_class=HTMLResponse)
async def get_vet(request: Request, db: Session = Depends(get_db)):
    return render_template(request, "vet.html", db=db)

@app.get("/guarderia", response_class=HTMLResponse)
async def get_guarderia(request: Request, db: Session = Depends(get_db)):
    return render_template(request, "guarderia.html", db=db)

@app.get("/viewPets", response_class=HTMLResponse)
async def get_view_pets(request: Request, db: Session = Depends(get_db)):
    return render_template(request, "viewPets.html", db=db)

@app.get("/viewService", response_class=HTMLResponse)
async def get_view_services(request: Request, db: Session = Depends(get_db)):
    return render_template(request, "viewService.html", db=db)

@app.get("/getVetProfile")
@role_required(["Veterinario", "Administrador de la tienda"])  # Asegura que solo los veterinarios puedan acceder
async def get_vet_profile(request: Request, db: Session = Depends(get_db)):
    user_id = request.cookies.get("user_id")
    # Si no hay cookie, redirigir al login (UX para formularios web)
    if not user_id:
        return RedirectResponse(url="/login", status_code=303)

    # Convertir a entero y manejar cookie inválida
    try:
        user_id_int = int(user_id)
    except (TypeError, ValueError):
        logging.warning("add_pet: cookie user_id inválida: %r", user_id)
        resp = RedirectResponse(url="/login", status_code=303)
        resp.delete_cookie("user_id")
        resp.delete_cookie("user_role")
        return resp

    # logging de depuración removido para evitar falsos positivos del analizador

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
        "historiaClinica.html",
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

    user_role = request.cookies.get("user_role")
    is_logged_in = True
    # try to fetch user name
    user_name = None
    try:
        user = db.query(User).filter(User.id_user == user_id).first()
        if user:
            user_name = user.u_name
    except Exception:
        pass

    return templates.TemplateResponse(
        "viewPets.html",
        {"request": request, "is_logged_in": is_logged_in, "user_role": user_role, "user_name": user_name, "user_id": user_id}
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

@app.get("/getAgendaVet")
@role_required(["Veterinario"])
async def get_agenda_vet_api(request: Request, db: Session = Depends(get_db)):
    user_id = request.cookies.get("user_id")

    if not user_id:
        return JSONResponse(content=[], status_code=200)

    vet = db.query(Veterinarian).filter(Veterinarian.id_user == user_id).first()
    if not vet:
        return JSONResponse(content=[], status_code=200)

    # Log which user is being recognized for debugging
    try:
        user_obj = db.query(User).filter(User.id_user == user_id).first()
        user_name = user_obj.u_name if user_obj else None
    except Exception:
        user_name = None
        logging.info(f"getAgendaVet: cookie user_id={user_id} -> user_name={user_name}; vet_id={getattr(vet,'id_veterinarian', None)}")
        print(f"getAgendaVet: cookie user_id={user_id} -> user_name={user_name}; vet_id={getattr(vet,'id_veterinarian', None)}")

    # Query appointments assigned to this veterinarian
    appointments = db.query(Appointment).filter(Appointment.id_veterinarian == vet.id_veterinarian).all()

    result = []
    for a in appointments:
        pet = db.query(Pet).filter(Pet.id_pet == a.id_pet).first() if a.id_pet else None
        service = db.query(Services).filter(Services.id_service == a.id_service).first() if a.id_service else None
        veterinarian_name = f"{vet.name_vet} {vet.last_name}" if getattr(vet, 'name_vet', None) else None

        result.append({
            "appointment_id": a.id_appointment,
            "id_service": a.id_service,
            "pet_id": a.id_pet,
            "pet_name": pet.pet_name if pet else None,
            "service_type": service.type_service if service else None,
            "service_description": service.description if service else None,
            "service_date": a.fecha_rec,
            "service_time": a.date_hour_status,
            "veterinarian_id": vet.id_veterinarian,
            "veterinarian_name": veterinarian_name,
            "description": a.comentario,
            "allergies": a.allergies_sensitivities,
            "temperament": a.temperament_grooming,
            "status": a.status
        })

    return JSONResponse(content=jsonable_encoder(result))

# Obtener veterinarios disponibles
@app.get("/getVeterinarians")
@role_required(["Cliente", "Veterinario", "Administrador de la tienda"])
async def get_veterinarians(request: Request, db: Session = Depends(get_db)):
    user_id = request.cookies.get("user_id")
    user_role = request.cookies.get("user_role")
    # Si el usuario es Veterinario o Administrador, devolver todos los veterinarios
    if user_role in ["Veterinario", "Administrador de la tienda"]:
        veterinarians = db.query(Veterinarian).all()
    else:
        # Si el usuario es Cliente, devolver solo los veterinarios disponibles
        veterinarians = db.query(Veterinarian).filter(Veterinarian.state == "Activo").all()
    return [
        {
            "id_veterinarian": vet.id_veterinarian,
            "name_vet": vet.name_vet,
            "last_name": vet.last_name,
            "telefono": vet.telefono,
            "email": vet.email,
            "state": vet.state,
            "description": vet.description
        } for vet in veterinarians
    ]

@app.get("/user")
@role_required(["Cliente", "Veterinario", "Administrador de la tienda"])
async def get_user(request: Request, db: Session = Depends(get_db)):
    user_id = request.cookies.get("user_id")
    user_role = request.cookies.get("user_role")
    # Si el usuario es Veterinario o Administrador, devolver todos los usuarios
    if user_role in ["Veterinario", "Administrador de la tienda"]:
        users = db.query(User).all()
    return [
        {
            "id_users": user.id_user,
            "id_rol": user.id_rol,
            "u_name": user.u_name,
            "telefono": user.telefono,
            "email": user.email
        } for user in users
    ]

# Solicitar baño o corte
@app.post("/api/banoCorte")
@role_required(["Cliente", "Veterinario", "Administrador de la tienda"])
async def solicitar_bano(
    request: Request,
    data: dict = Body(...),
    db: Session = Depends(get_db)
):
    print("Datos recibidos en /api/banoCorte:", data)
    user_id = request.cookies.get("user_id")
    # Mapeo de tipos de servicio a sus IDs
    TIPOS_SERVICIO = {
        "bano-normal": 7,
        "bano-medicado": 8,
        "bano-antipulgas": 9,
        "bano-sensible": 10,
        "corte-puntas": 11,
        "corte-completo": 12,
        "corte-unas": 13,
        "corte-oidos": 14
    }

    # Obtención del tipo de servicio correctamente
    tipo_servicio = data.get("tipo-bano") or data.get("servicios-corte")
    id_service = TIPOS_SERVICIO.get(tipo_servicio)

    if not id_service:
        raise HTTPException(status_code=400, detail="Tipo de servicio inválido")
    
    # Crear nuevo registro en la tabla appointment
    nueva_cita = Appointment(
        id_pet=data.get("id_pet"),
        id_service= id_service,  # ID del servicio de baño
        id_veterinarian=1,  # No aplica veterinario para baño
        date_hour_status=data.get("hora_cita"),  # Hora del baño
        fecha_rec=data.get("fecha_cita"),  # Fecha del baño
        comentario=data.get("comentarios"),  # Comentarios adicionales
        temperament_grooming=data.get("temperamento"),  # Temperamento del grooming
        allergies_sensitivities=data.get("alergias")  # Alergias o sensibilidades
    )
    
    db.add(nueva_cita)
    db.commit()
    db.refresh(nueva_cita)
    
    return {"success": True, "message": "Solicitud de baño registrada correctamente", "appointment_id": nueva_cita.id_appointment}

# Solicitar control veterinario
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
        id_service=6,  # ID del servicio de control veterinario
        id_veterinarian=data.get("id_veterinarian"),  # ID del veterinario asignado
        date_hour_status=data.get("hora_cita"),  # Hora de la cita
        fecha_rec=data.get("fecha_cita"),  # Fecha de la cita
        comentario=data.get("comentarios")  # Comentarios adicionales
    )
    
    db.add(nueva_cita)
    db.commit()
    db.refresh(nueva_cita)
    
    return RedirectResponse(url="/control?register_success=1", status_code=303)
# Solicitar guardería 
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
        id_service=1,  # ID del servicio de guardería
        id_veterinarian=1,  # No aplica veterinario para guardería
        date_hour_status=data.get("hora_salida"),  # Hora de salida
        fecha_rec=data.get("fecha_salida"),  # Fecha de salida
        comentario=data.get("comentarios"),  # Comentarios adicionales
        allergies_sensitivities=data.get("alergias"),  # Alergias o sensibilidades
        fecha_salida=data.get("fecha_salida"),  # Fecha de salida  
        date_hour_salida=data.get("hora_salida")  # Hora de salida
    )
    
    db.add(nueva_cita)
    db.commit()
    db.refresh(nueva_cita)
    
    return RedirectResponse(url="/guarderia?register_success=1", status_code=303)

# Solicitar transporte
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

    # Marcar como cancelado en lugar de eliminar
    servicio.status = "cancelled"
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
            "description": record.observations,
            "vaccines": record.vaccines
        } for record in history
    ])


@app.get("/getAppointment/{id_appointment}")
@role_required(["Cliente", "Veterinario", "Administrador de la tienda"])
async def get_appointment(id_appointment: int, request: Request, db: Session = Depends(get_db)):
    # Buscar la cita por id
    appointment = db.query(Appointment).filter(Appointment.id_appointment == id_appointment).first()
    if not appointment:
        return JSONResponse(content={}, status_code=404)

    pet = appointment.pet
    service = appointment.service
    veterinarian = appointment.veterinarian

    result = {
        "id_appointment": appointment.id_appointment,
        "id_pet": appointment.id_pet,
        "pet_name": pet.pet_name if pet is not None else None,
        "id_service": appointment.id_service,
        "service_type": service.type_service if service is not None else None,
        "service_description": service.description if service is not None else None,
        "fecha_rec": appointment.fecha_rec,
        "date_hour_status": appointment.date_hour_status,
        "comentario": appointment.comentario,
        "allergies": appointment.allergies_sensitivities,
        "temperament": appointment.temperament_grooming,
        "veterinarian_id": veterinarian.id_veterinarian if veterinarian is not None else None,
        "veterinarian_name": f"{veterinarian.name_vet} {veterinarian.last_name}" if veterinarian is not None else None
    }

    return JSONResponse(content=jsonable_encoder(result))

@app.get("/viewService/{id_pet}")
@role_required(["Cliente", "Veterinario", "Administrador de la tienda"])
async def view_pet_service(id_pet: int, request: Request, db: Session = Depends(get_db)):
    print(f"Consultando historial de servicios para mascota con id {id_pet}")
    service = db.query(Appointment).filter(Appointment.id_pet == id_pet).all()
    
    return jsonable_encoder([
        {
            "service_name": record.service.type_service if getattr(record, 'service', None) is not None else None,
            "fecha_rec": record.fecha_rec,
            "date": record.date_hour_status,
            "description": record.comentario,
            "veterinarian": f"{record.veterinarian.name_vet} {record.veterinarian.last_name}" if getattr(record, 'veterinarian', None) is not None else None
        } for record in service
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
async def get_serv(request: Request, db: Session = Depends(get_db)):
    return render_template(request, "serv.html", db=db)

@app.get("/about")
async def get_about(request: Request, db: Session = Depends(get_db)):
    return render_template(request, "about.html", db=db)

@app.get("/myPets")
async def get_my_pets(request: Request, db: Session = Depends(get_db)):
    return render_template(request, "myPets.html", db=db)

@app.get("/addPet")
@role_required(["Cliente", "Administrador de la tienda"])
async def get_add_pet(request: Request, db: Session = Depends(get_db)):
    return render_template(request, "addPet.html", db=db)

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
    # Si no hay cookie, redirigir al login (UX para formularios web)
    if not user_id:
        return RedirectResponse(url="/login", status_code=303)

    # Convertir a entero y manejar cookie inválida
    try:
        user_id_int = int(user_id)
    except (TypeError, ValueError):
        logging.warning("add_pet: cookie user_id inválida: %r", user_id)
        resp = RedirectResponse(url="/login", status_code=303)
        resp.delete_cookie("user_id")
        resp.delete_cookie("user_role")
        return resp
    
    try:
        
        new_pet = Pet(
            id_owner=user_id_int,
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
        return RedirectResponse(
            url="/addPet?register_success=1", 
            status_code=303)
    
    except Exception as e:
        # Log full traceback to server logs for diagnosis
        logging.exception("Error al registrar mascota")
        db.rollback()

        # In development, surface the error detail to the template to aid debugging
        ctx = {"request": request, "register_error": "Error al registrar la mascota. Intente nuevamente."}
        if os.getenv("DEBUG") == "1":
            ctx["register_error_detail"] = str(e)

        return templates.TemplateResponse("addPet.html", ctx)
    
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
@role_required(["Administrador de la tienda", "Veterinario"])
async def get_manage_users(request: Request, db: Session = Depends(get_db)):
    
    users = db.query(User).all()
    return render_template(request, "manage_users.html", extra={"users": users}, db=db)

@app.get("/api/users")
@role_required(["Administrador de la tienda", "Cliente"])
async def api_get_users(request: Request, db: Session = Depends(get_db)):
    """Devuelve la lista de usuarios en formato JSON (incluye rol si existe)."""
    users = db.query(User).all()
    result = []
    for u in users:
        result.append({
            "id_user": u.id_user,
            "u_name": u.u_name,
            "email": u.email,
            "telefono": u.telefono,
            "rol": {"id_rol": u.rol.id_rol, "description": u.rol.description} if getattr(u, 'rol', None) else None
        })

    return JSONResponse(content=jsonable_encoder(result))

# Por favor no tocar esto :)

@app.post("/admin/users/assign-role")
@role_required(["Administrador de la tienda", "Veterinario"])
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
        
        return RedirectResponse(
            url="/manage_users?register_success=1",
            status_code=303
        )
    except Exception as e:
        logging.error(f"Error al asignar rol: {str(e)}")
        db.rollback()
        return templates.TemplateResponse(
            "recoveryPassword.html",
            {
                "request": request,
                "register_error": "Error al asignar el rol",
                "show_register": True
            },
            status_code=500
        )
    

@app.post("/guarderia-service")
async def reservar_guarderia(
    request: Request,
    mascota: int = Form(...),  # id_pet
    convive_animales: str = Form(...),      # "si" o "no"
    convive_gatos: str = Form(...),         # "si" o "no"
    alergias: str = Form(...),              # "si" o "no"
    detalle_alergia: str = Form(""),        # texto libre
    fecha_llegada: str = Form(...),         # fecha_rec
    hora_llegada: str = Form(...),          # date_hour_status
    fecha_salida: str = Form(...),          # fecha_salida
    hora_salida: str = Form(...),           # date_hour_salida
    comentarios_adicionales: str = Form(""),# comentario
    db: Session = Depends(get_db)
):
    id_service = 1

    # Generar mensaje de temperamento
    if convive_animales == "si" and convive_gatos == "si":
        temperamento = "Convive bien con otros animales y gatos."
    elif convive_animales == "si" and convive_gatos == "no":
        temperamento = "Convive con otros animales, pero no con gatos."
    elif convive_animales == "no" and convive_gatos == "si":
        temperamento = "No convive con otros animales, pero sí con gatos."
    else:
        temperamento = "No convive con otros animales ni gatos."

    # Mensaje de alergias
    if alergias == "si":
        alergias_msg = detalle_alergia
    else:
        alergias_msg = "No tiene alergias"

    nueva_reserva = Appointment(
        id_pet=mascota,
        id_service=id_service,
        id_veterinarian=1,
        fecha_rec=fecha_llegada,
        date_hour_status=hora_llegada,
        fecha_salida=fecha_salida,
        date_hour_salida=hora_salida,
        temperament_grooming=temperamento,
        allergies_sensitivities=alergias_msg,
        comentario=comentarios_adicionales
    )
    db.add(nueva_reserva)
    db.commit()
    db.refresh(nueva_reserva)
    return RedirectResponse(url="/guarderia?success=1", status_code=303)



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
            {"request": request, "login_error": "Credenciales inválidas"},
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


@app.get("/recoveryPassword")
async def get_recovery_password(request: Request):
    """Renderiza el formulario de recuperación de contraseña (acceso por GET)."""
    return templates.TemplateResponse("recoveryPassword.html", {"request": request})


@app.post("/recoveryPassword")
async def recovery_password(
    request: Request,
    email: str = Form(...),
    new_password: str = Form(...),
    confirm_password: str = Form(...),
    db: Session = Depends(get_db)
):
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return templates.TemplateResponse(
                "recoveryPassword.html",
                {
                    "request": request,
                    "register_error": "El correo no está registrado",
                    "show_register": True
                }
            )
        # 1) Validar que las contraseñas coincidan
        if new_password != confirm_password:
            return templates.TemplateResponse(
                "recoveryPassword.html",
                {
                    "request": request, 
                    "register_error": "Las contraseñas no coinciden.",
                    "show_register": True
                }
            )


        # 4) Normalizar y hashear la nueva contraseña
        new_password_clean = new_password.encode('latin-1').decode('utf-8', 'ignore')
        hashed_password = pwd_context.hash(new_password_clean)
        user.password_hashed = hashed_password
        db.commit()

        return RedirectResponse(
            url="/login?change_success=1",
            status_code=303
        )
    except Exception as e:
        logging.error(f"Error en recuperación de contraseña: {str(e)}")
        db.rollback()
        return templates.TemplateResponse(
            "recoveryPassword.html",
            {
                "request": request,
                "register_error": "Error al procesar la solicitud. Intente nuevamente.",
                "show_register": True
            },
            status_code=500
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

    return RedirectResponse(
            url="/serv_vet?register_success=1",
            status_code=303
        )

@app.post("/modifyPetHistory")
@role_required(["Veterinario"])  # Asegura que solo los veterinarios puedan acceder
async def modify_pet_history(
    request: Request,
    id_pet: int = Form(...),
    vaccines: str = Form(...),
    observations: str = Form(...),
    first_cons_date: str = Form(...),
    appointment_id: int = Form(None),
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

    # Si viene un appointment_id, actualizar la cita con fecha/hora de salida
    if appointment_id:
        logging.info(f"modifyPetHistory: Recibido appointment_id={appointment_id}")
        appointment = db.query(Appointment).filter(Appointment.id_appointment == appointment_id).first()
        if appointment:
            now = datetime.now()
            appointment.fecha_salida = now.strftime("%Y-%m-%d")
            appointment.date_hour_salida = now.strftime("%Y-%m-%d %H:%M:%S")
            appointment.status = "attended"
            logging.info(f"modifyPetHistory: Cita {appointment_id} marcada como attended")
        else:
            logging.warning(f"modifyPetHistory: No se encontró cita con id={appointment_id}")
    else:
        logging.info("modifyPetHistory: No se recibió appointment_id")

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


