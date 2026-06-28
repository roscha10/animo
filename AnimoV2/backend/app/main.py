from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, solicitud, sesion, psicologo
from .core.config import settings
import httpx

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Ánimo API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.APP_URL, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(solicitud.router)
app.include_router(sesion.router)
app.include_router(psicologo.router)

@app.get("/health")
def health():
    return {"status": "ok", "app": "Ánimo v2"}

@app.get("/geoip")
async def geoip(request: Request):
    forwarded = request.headers.get("X-Forwarded-For")
    ip = forwarded.split(",")[0].strip() if forwarded else (request.client.host if request.client else None)
    if not ip or ip in ("127.0.0.1", "::1"):
        return {"ciudad": None, "estado_ve": None}
    try:
        async with httpx.AsyncClient(timeout=3) as client:
            r = await client.get(f"http://ip-api.com/json/{ip}?fields=status,city,regionName&lang=es")
            data = r.json()
            if data.get("status") == "success":
                return {"ciudad": data.get("city"), "estado_ve": data.get("regionName")}
    except Exception:
        pass
    return {"ciudad": None, "estado_ve": None}
