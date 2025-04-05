from logging.config import fileConfig
from sqlalchemy import create_engine
from alembic import context
import sys
import os

# Añade la ruta del proyecto al sys.path
sys.path.append(os.getcwd())

# Importa la base de datos y los modelos
from src.models.database import Base
from src.models.models_db import *  # Importa todos los modelos

# Configuración de Alembic
config = context.config

# Carga la configuración del archivo alembic.ini
fileConfig(config.config_file_name)

# Obtén la URL de la base de datos desde alembic.ini
url = config.get_main_option("sqlalchemy.url")

# Crea el motor de SQLAlchemy
engine = create_engine(url)

# Configura el contexto de Alembic
target_metadata = Base.metadata

def run_migrations_offline():
    """Ejecuta migraciones en modo offline."""
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    """Ejecuta migraciones en modo online."""
    connectable = engine

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()