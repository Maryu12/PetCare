from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, DateTime, Boolean
from sqlalchemy.orm import relationship
from .database import Base


class User(Base):
    __tablename__ = 'users'

    id_user = Column(Integer, primary_key=True, index=True)
    id_rol = Column(Integer, ForeignKey('rol.id_rol'))
    email = Column(String(100), unique=True, index=True)
    password_hashed = Column(String, nullable=False)
    u_name = Column(String(100))
    telefono = Column(String(20))

    rol = relationship("Rol", back_populates="users")
    pets = relationship("Pet", back_populates="owner")
    orders = relationship("Order", back_populates="user")
    veterinarian = relationship("Veterinarian", back_populates="user")

class Rol(Base):
    __tablename__ = 'rol'

    id_rol = Column(Integer, primary_key=True, index=True)
    description = Column(String(100))

    users = relationship("User", back_populates="rol")

class Pet(Base):
    __tablename__ = 'pet'

    id_pet = Column(Integer, primary_key=True, index=True)
    id_owner = Column(Integer, ForeignKey('users.id_user'))
    pet_name = Column(String(50))
    species = Column(String(50))
    birthdate = Column(String(50))
    detalle = Column(String, nullable=True)
    sexo = Column(String(10), nullable=False)
    edad = Column(Integer, nullable=False)


    owner = relationship("User", back_populates="pets")
    medical_history = relationship("MedicHistory", back_populates="pet")
    appointments = relationship("Appointment", back_populates="pet")

class MedicHistory(Base):
    __tablename__ = 'medic_history'

    id_history = Column(Integer, primary_key=True, index=True)
    id_pet = Column(Integer, ForeignKey('pet.id_pet'))
    id_veterinarian = Column(Integer, ForeignKey('veterinarian.id_veterinarian'))
    vaccines = Column(String(255))
    observations = Column(String(255))
    first_cons_date = Column(String(100))

    pet = relationship("Pet", back_populates="medical_history")
    veterinarian = relationship("Veterinarian", back_populates="medical_history")

class Veterinarian(Base):
    __tablename__ = 'veterinarian'

    id_veterinarian = Column(Integer, primary_key=True, index=True)
    name_vet = Column(String(100))
    last_name = Column(String(100))
    telefono = Column(String(20))
    email = Column(String(100))
    state = Column(String(20))
    description = Column(String(500))
    id_user = Column(Integer, ForeignKey('users.id_user'))

    user = relationship("User", back_populates="veterinarian")
    medical_history = relationship("MedicHistory", back_populates="veterinarian")
    appointments = relationship("Appointment", back_populates="veterinarian")

class Appointment(Base):
    __tablename__ = 'appointment'

    id_appointment = Column(Integer, primary_key=True, index=True)
    id_pet = Column(Integer, ForeignKey('pet.id_pet'))
    id_service = Column(Integer, ForeignKey('services.id_service'))
    id_veterinarian = Column(Integer, ForeignKey('veterinarian.id_veterinarian'))
    date_hour_status = Column(String(100))
    fecha_rec = Column(String(200), nullable=True)  # Fecha de recogida
    comentario = Column(String(200), nullable=True)  # Comentario
    temperament_grooming = Column(String(50), nullable=True)  # Temperamento del grooming
    allergies_sensitivities = Column(String(150), nullable=True)  # Alergias o sensibilidades
    fecha_salida = Column(String(200), nullable=True)  # Fecha de salida
    date_hour_salida = Column(String(200), nullable=True)  # Fecha y hora de salida

    pet = relationship("Pet", back_populates="appointments")
    service = relationship("Services", back_populates="appointments")
    veterinarian = relationship("Veterinarian", back_populates="appointments")

class Product(Base):
    __tablename__ = 'product'

    id_product = Column(Integer, primary_key=True, index=True)
    id_supplier = Column(Integer, ForeignKey('supplier.id_supplier'))
    product_name = Column(String(50))
    description = Column(String(50))
    price = Column(Numeric(10, 2))
    stock = Column(Integer)

    supplier = relationship("Supplier", back_populates="products")
    order_details = relationship("OrderDetail", back_populates="product")

class Supplier(Base):
    __tablename__ = 'supplier'

    id_supplier = Column(Integer, primary_key=True, index=True)
    supplier_name = Column(String(100))
    contact = Column(String(50))

    products = relationship("Product", back_populates="supplier")

class Services(Base):
    __tablename__ = 'services'

    id_service = Column(Integer, primary_key=True, index=True)
    type_service = Column(String(20))
    description = Column(String(100))
    service_value = Column(Numeric(10, 2))

    appointments = relationship("Appointment", back_populates="service")

class Order(Base):
    __tablename__ = 'orders'

    id_order = Column(Integer, primary_key=True, index=True)
    id_user = Column(Integer, ForeignKey('users.id_user'))
    date = Column(DateTime)
    total = Column(Numeric(10, 2))
    payment_status = Column(Boolean)

    user = relationship("User", back_populates="orders")
    order_details = relationship("OrderDetail", back_populates="order")

class OrderDetail(Base):
    __tablename__ = 'order_detail'

    id_orderdetail = Column(Integer, primary_key=True, index=True)
    id_order = Column(Integer, ForeignKey('orders.id_order'))
    id_product = Column(Integer, ForeignKey('product.id_product'))
    amount = Column(Integer)
    unit_price = Column(Numeric(10, 2))

    order = relationship("Order", back_populates="order_details")
    product = relationship("Product", back_populates="order_details")

class Subscription(Base):
    __tablename__ = "subscriptiondata"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String)
    plan = Column(String)
    stripetoken = Column(String)