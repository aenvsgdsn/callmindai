"""
Authentication: POST /auth/login, POST /auth/register
Uses Supabase `users` table (service role) + local JWT minting.
"""
import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.core.config import settings
from app.db.supabase_client import sb

router = APIRouter(prefix="/auth", tags=["Auth"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    agency_name: str
    role: str = "agency_admin"


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    agency_id: str
    name: str
    role: str


# ── Helpers ───────────────────────────────────────────────────────────────────

def _hash(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


def _verify(plain: str, hashed: str) -> bool:
    if not hashed:
        return False
    try:
        return bcrypt.checkpw(plain.encode(), hashed.encode())
    except Exception:
        return plain == hashed   # dev fallback for unhashed seeds


def _mint_token(user_id: str, agency_id: str, email: str, role: str) -> str:
    payload = {
        "sub":       user_id,
        "agency_id": agency_id,
        "email":     email,
        "role":      role,
        "exp":       datetime.now(timezone.utc) + timedelta(hours=24),
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    try:
        email = payload.email.lower().strip()

        res = sb().table("users").select(
            "id, agency_id, name, email, password_hash, role"
        ).eq("email", email).single().execute()

        if not res.data:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        user = res.data

        if user.get("password_hash") and not _verify(payload.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        token = _mint_token(user["id"], user["agency_id"], user["email"], user["role"])
        return LoginResponse(
            access_token=token,
            user_id=user["id"],
            agency_id=user["agency_id"],
            name=user["name"],
            role=user["role"],
        )
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        err_msg = str(e) + "\n" + traceback.format_exc()
        raise HTTPException(status_code=500, detail=f"Server error: {err_msg}")


@router.post("/register", response_model=LoginResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest):
    email = payload.email.lower().strip()

    # Check duplicate email
    existing = sb().table("users").select("id").eq("email", email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create agency
    agency_res = sb().table("agencies").insert({"name": payload.agency_name}).execute()
    agency = agency_res.data[0]

    # Create user
    user_res = sb().table("users").insert({
        "agency_id":     agency["id"],
        "name":          payload.name,
        "email":         email,
        "password_hash": _hash(payload.password),
        "role":          payload.role,
    }).execute()
    user = user_res.data[0]

    token = _mint_token(user["id"], agency["id"], user["email"], user["role"])
    return LoginResponse(
        access_token=token,
        user_id=user["id"],
        agency_id=agency["id"],
        name=user["name"],
        role=user["role"],
    )
