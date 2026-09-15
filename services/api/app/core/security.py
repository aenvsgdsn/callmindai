"""
Security: JWT decode + CurrentUser extraction.
Works with tokens minted by our own /auth/login route (stored in Supabase users table).
No SQLAlchemy dependency — user lookup via supabase-py.
"""
import jwt
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel

from app.core.config import settings
from app.db.supabase_client import sb

_bearer = HTTPBearer()


class CurrentUser(BaseModel):
    id: str
    agency_id: str
    email: str
    role: str


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(_bearer),
) -> CurrentUser:
    token = credentials.credentials

    # Guest mode (demo only)
    if token == "GUEST_TOKEN":
        return CurrentUser(
            id="guest",
            agency_id="00000000-0000-0000-0000-000000000001",
            email="guest@callmind.ai",
            role="agency_admin",
        )

    # Decode our own JWT (minted by /auth/login)
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        user_id   = payload.get("sub")
        agency_id = payload.get("agency_id")
        email     = payload.get("email")
        role      = payload.get("role", "agent")

        if user_id and agency_id and email:
            return CurrentUser(id=user_id, agency_id=agency_id, email=email, role=role)
    except Exception:
        pass

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )


def require_role(allowed_roles: list[str]):
    def _checker(current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted for your role",
            )
        return current_user
    return _checker