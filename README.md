Milenzo - Sistema de Gestión Veterinaria
Descripción General
Milenzo es una aplicación web integral diseñada para la gestión de clínicas veterinarias y tiendas de mascotas. La plataforma permite administrar eficientemente registros de mascotas, historiales médicos, clientes y servicios veterinarios con una interfaz intuitiva y funcional.

Tecnologías Utilizadas

Backend: FastAPI, SQLAlchemy
Frontend: HTML, CSS, JavaScript
Base de Datos: SQLite/PostgreSQL
Autenticación: Sistema de cookies con manejo de roles
Deployment: Docker (opcional)


Características Principales

Gestión de Mascotas
Registro de nuevas mascotas
Visualización de mascotas por propietario
Historial médico completo por mascota
Filtrado de mascotas según diversos criterios
Historiales Médicos
Creación y edición de historiales médicos
Registro de vacunas, tratamientos y observaciones
Fechas de consultas y seguimiento
Acceso diferenciado según rol de usuario


Sistema de Usuarios y Roles

Cliente: Acceso a sus propias mascotas e historiales
Veterinario: Acceso a todas las mascotas para gestionar historiales médicos
Administrador: Control total del sistema
Servicios
Catálogo de servicios disponibles
Programación de citas

Milenzo/
├── src/
│   ├── APP/
│   │   └── main.py           # Punto de entrada de la aplicación
│   ├── controllers/
│   │   ├── auth.py           # Control de autenticación y roles
│   │   └── ...               # Otros controladores
│   ├── models/
│   │   └── models_db.py      # Modelos de base de datos
│   └── views/
│       ├── HTML/             # Plantillas HTML
│       └── static/
│           ├── CSS/          # Estilos CSS
│           ├── JS/           # Scripts JavaScript
│           └── images/       # Imágenes y recursos
├── requirements.txt          # Dependencias del proyecto
└── README.md                 # Documentación
