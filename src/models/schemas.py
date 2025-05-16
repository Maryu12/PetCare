from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    email: EmailStr
    u_name: str
    telefono: str

class UserCreate(UserBase):
    password_hashed: str

class User(UserBase):
    id_user: int
    id_rol: int

    class Config:
        orm_mode = True

class RolBase(BaseModel):
    description: str

class Rol(RolBase):
    id_rol: int

    class Config:
        orm_mode = True

# ------------------------autenticación de usuarios-------------------

class UserLogin(BaseModel):
    email: EmailStr
    password: str  

class UserLoginResponse(User):  
    rol_name: str  
    access_token: str  
    
    class Config:
        orm_mode = True

class RolSimple(BaseModel):
    id_rol: int
    description: str

#------------------------------Payment---------------------------------------

class SubscriptionCreate(BaseModel):
    plan: str
    name: str
    email: str
    stripe_token: str

class SubscriptionResponse(BaseModel):
    subscription_id: str
    status: str

#---------------------------------------------------------------------
class PetBase(BaseModel):
    pet_name: str
    species: str
    birthdate: str
    detalle: Optional[str] = None
    sexo: str
    edad: int

class PetCreate(PetBase):
    id_owner: int

class Pet(PetBase):
    id_pet: int
    id_owner: int

    class Config:
        orm_mode = True

class MedicHistoryBase(BaseModel):
    vaccines: str
    observations: str
    first_cons_date: str

class MedicHistoryCreate(MedicHistoryBase):
    id_pet: int
    id_veterinarian: int

class MedicHistory(MedicHistoryBase):
    id_history: int
    id_pet: int
    id_veterinarian: int

    class Config:
        orm_mode = True

class VeterinarianBase(BaseModel):
    name_vet: str
    last_name: str
    telefono: str
    email: EmailStr
    state: str
    description: str

class VeterinarianCreate(VeterinarianBase):
    id_user: int
class Veterinarian(VeterinarianBase):
    id_veterinarian: int
    id_user: int
    

    class Config:
        orm_mode = True

class AppointmentBase(BaseModel):
    date_hour_status: str
    fecha_rec: str  # Fecha de recogida
    comentario: Optional[str] = None 

class AppointmentCreate(AppointmentBase):
    id_pet: int
    id_service: int
    id_veterinarian: int

class Appointment(AppointmentBase):
    id_appointment: int
    id_pet: int
    id_service: int
    id_veterinarian: int

    class Config:
        orm_mode = True

class ProductBase(BaseModel):
    product_name: str
    description: str
    price: float
    stock: int

class ProductCreate(ProductBase):
    id_supplier: int

class Product(ProductBase):
    id_product: int
    id_supplier: int

    class Config:
        orm_mode = True

class SupplierBase(BaseModel):
    supplier_name: str
    contact: str

class Supplier(SupplierBase):
    id_supplier: int

    class Config:
        orm_mode = True

class ServicesBase(BaseModel):
    type_service: str
    description: str
    service_value: float

class Services(ServicesBase):
    id_service: int

    class Config:
        orm_mode = True

class OrderBase(BaseModel):
    date: datetime
    total: float
    payment_status: bool

class OrderCreate(OrderBase):
    id_user: int

class Order(OrderBase):
    id_order: int
    id_user: int

    class Config:
        orm_mode = True

class OrderDetailBase(BaseModel):
    amount: int
    unit_price: float

class OrderDetailCreate(OrderDetailBase):
    id_order: int
    id_product: int

class OrderDetail(OrderDetailBase):
    id_orderdetail: int
    id_order: int
    id_product: int

    class Config:
        orm_mode = True