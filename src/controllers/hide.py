from functools import wraps
from fastapi import Request, HTTPException
import logging

def hide_elements(allowed_roles):
    """
    Decorador para ocultar elementos visuales en base al rol del usuario.
    Agrega una variable 'show_elements' al contexto de la plantilla.
    """
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
            if not user_role:
                raise HTTPException(
                    status_code=401,
                    detail="No autenticado"
                )

            # Determinar si los elementos deben mostrarse
            show_elements = user_role in allowed_roles

            # Agregar 'show_elements' al contexto
            kwargs["context"] = kwargs.get("context", {})
            kwargs["context"]["show_elements"] = show_elements

            return await func(*args, **kwargs)
        return wrapper
    return decorator