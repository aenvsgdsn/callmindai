from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api import leads, auth, analytics, strategies, conversations, appointments
from app.api import users

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="CallMind AI — Agentic Lead Qualification Backend (Supabase Edition)",
    version="2.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "*",  # restrict to your domain in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router,          prefix=settings.API_V1_STR)
app.include_router(leads.router,         prefix=settings.API_V1_STR)
app.include_router(strategies.router,    prefix=settings.API_V1_STR)
app.include_router(conversations.router, prefix=settings.API_V1_STR)
app.include_router(appointments.router,  prefix=settings.API_V1_STR)
app.include_router(analytics.router,     prefix=settings.API_V1_STR)
app.include_router(users.router,         prefix=settings.API_V1_STR)


@app.get("/health")
def health_check():
    return {"status": "healthy", "project": settings.PROJECT_NAME, "db": "supabase"}


@app.get("/")
def root():
    return {"message": "CallMind AI API", "docs": "/docs", "version": "2.0.0"}