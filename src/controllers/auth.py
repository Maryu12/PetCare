from functools import wraps
from fastapi import Request, HTTPException


def role_required(allowed_roles):
    """
    Decorador para verificar el rol del usuario.
    :param allowed_roles: Lista de roles permitidos.
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            request: Request = kwargs.get("request")
            user_role = request.cookies.get("user_role")
            if not user_role or user_role not in allowed_roles:
                raise HTTPException(
                    status_code=403,
                    detail="No tienes permiso para acceder a esta función"
                )
            return await func(*args, **kwargs)
        return wrapper
    return decorator