from functools import wraps
from fastapi import Request, HTTPException
import logging

"""
    Decorador para verificar el rol del usuario.
    :param allowed_roles: Lista de roles permitidos.

    forma de representar decorador:
    @role_required(["Administrador de la tienda", "Veterinario"])
    """

from functools import wraps
from fastapi import Request, HTTPException
import logging

def role_required(allowed_roles):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Buscar el objeto Request en args o kwargs
            request: Request = None
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break
            if not request:
                request = kwargs.get("request")
            
            if not request:
                logging.error("El objeto Request no está disponible en el decorador")
                raise HTTPException(status_code=500, detail="Request no encontrado en el decorador")

            # Obtener el rol del usuario desde las cookies
            user_role = request.cookies.get("user_role")
            logging.info(f"Rol del usuario: {user_role}")
            if not user_role or user_role not in allowed_roles:
                raise HTTPException(
                    status_code=403,
                    detail="No tienes permiso para realizar esta acción"
                )
            return await func(*args, **kwargs)
        return wrapper
    return decorator