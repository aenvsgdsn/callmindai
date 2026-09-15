"""
Users router — profile update and avatar upload.
POST /api/v1/users/me/avatar  — upload to Supabase Storage
PATCH /api/v1/users/me        — update name, email
GET   /api/v1/users/me        — current user profile
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from pydantic import BaseModel
from typing import Optional

from app.db.supabase_client import sb
from app.core.security import CurrentUser, get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

BUCKET = "avatars"   # create this bucket in Supabase Storage dashboard


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None


@router.get("/me")
def get_profile(current_user: CurrentUser = Depends(get_current_user)):
    if current_user.id == "guest":
        return {
            "id": "guest",
            "agency_id": current_user.agency_id,
            "name": "Guest User",
            "email": "guest@callmind.ai",
            "role": "agency_admin",
            "avatar_url": None,
            "created_at": "2026-01-01T00:00:00Z"
        }
        
    res = sb().table("users").select(
        "id, agency_id, name, email, role, avatar_url, created_at"
    ).eq("id", current_user.id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="User not found")
    return res.data


@router.patch("/me")
def update_profile(
    payload: ProfileUpdate,
    current_user: CurrentUser = Depends(get_current_user),
):
    if current_user.id == "guest":
        raise HTTPException(status_code=400, detail="Cannot update guest profile")
        
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    if "email" in update_data:
        update_data["email"] = update_data["email"].lower().strip()

    res = sb().table("users").update(update_data).eq("id", current_user.id).execute()
    return res.data[0]

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

@router.patch("/me/password")
def update_password(
    payload: PasswordUpdate,
    current_user: CurrentUser = Depends(get_current_user),
):
    if current_user.id == "guest":
        raise HTTPException(status_code=400, detail="Cannot update guest password")

    # Fetch current user to check password
    res = sb().table("users").select("password_hash").eq("id", current_user.id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="User not found")

    from app.api.auth import _verify, _hash
    if not _verify(payload.current_password, res.data.get("password_hash")):
        raise HTTPException(status_code=400, detail="Incorrect current password")

    new_hash = _hash(payload.new_password)
    sb().table("users").update({"password_hash": new_hash}).eq("id", current_user.id).execute()
    return {"message": "Password updated successfully"}


@router.post("/me/avatar", status_code=status.HTTP_200_OK)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Upload profile photo to Supabase Storage and save public URL to user record."""
    if current_user.id == "guest":
        raise HTTPException(status_code=400, detail="Guest users cannot upload avatars")

    # Validate type
    if file.content_type not in ["image/jpeg", "image/png", "image/webp", "image/gif"]:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP, or GIF images allowed")

    # Limit 5 MB
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image must be under 5 MB")

    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else "jpg"
    path = f"{current_user.agency_id}/{current_user.id}.{ext}"

    # Upload to Supabase Storage (upsert = overwrite existing)
    try:
        sb().storage.from_(BUCKET).upload(
            path,
            contents,
            {"content-type": file.content_type, "upsert": "true"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Storage upload failed: {str(e)}")

    # Get public URL
    public_url = sb().storage.from_(BUCKET).get_public_url(path)

    # Save to user record
    sb().table("users").update({"avatar_url": public_url}).eq(
        "id", current_user.id
    ).execute()

    return {"avatar_url": public_url}
