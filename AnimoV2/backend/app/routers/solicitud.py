from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select, update
from ..database import get_db
from ..models import SolicitudAyuda, Psicologo, Sesion
from ..schemas.solicitud import SolicitudCreate, SolicitudResponse
from ..core.security import get_psicologo_id
from ..services.email import notificar_psicologos
import uuid, random, string

router = APIRouter(prefix="/solicitud", tags=["solicitud"])

def _sala():
    return "animo-" + "".join(random.choices(string.ascii_lowercase + string.digits, k=10))

@router.post("", status_code=201)
def crear(data: SolicitudCreate, db: Session = Depends(get_db)):
    if not data.sintomas:
        raise HTTPException(400, "Debes indicar cómo te sientes")
    if data.contacto_preferido not in ("video", "llamada", "chat"):
        raise HTTPException(400, "Tipo de contacto inválido")

    solicitud = SolicitudAyuda(
        nombre_anonimo=data.nombre_anonimo,
        edad=data.edad,
        ciudad=data.ciudad,
        estado_ve=data.estado_ve,
        sintomas=data.sintomas,
        descripcion=data.descripcion,
        nivel_crisis=min(5, max(1, data.nivel_crisis)),
        es_emergencia=data.es_emergencia,
        contacto_preferido=data.contacto_preferido,
    )
    db.add(solicitud)
    db.commit()
    db.refresh(solicitud)

    # Notificar psicólogos disponibles (sin bloquear respuesta)
    import asyncio
    psicologos = db.query(Psicologo).filter(Psicologo.estado_actual == "disponible").all()
    emails = [p.email for p in psicologos]
    if emails:
        import threading
        threading.Thread(
            target=lambda: asyncio.run(notificar_psicologos(emails, solicitud)),
            daemon=True
        ).start()

    return {"id": str(solicitud.id)}

@router.get("/pendientes")
def pendientes(psicologo_id: str = Depends(get_psicologo_id), db: Session = Depends(get_db)):
    solicitudes = db.query(SolicitudAyuda).filter(
        SolicitudAyuda.estado_solicitud == "esperando"
    ).order_by(
        SolicitudAyuda.es_emergencia.desc(),
        SolicitudAyuda.nivel_crisis.desc(),
        SolicitudAyuda.creado_en.asc()
    ).all()
    return solicitudes

@router.get("/{solicitud_id}/estado")
def estado(solicitud_id: str, db: Session = Depends(get_db)):
    s = db.query(SolicitudAyuda).filter(SolicitudAyuda.id == uuid.UUID(solicitud_id)).first()
    if not s:
        raise HTTPException(404, "No encontrada")
    sesion = None
    if s.estado_solicitud == "en_sesion":
        sesion = db.query(Sesion).filter(Sesion.solicitud_id == uuid.UUID(solicitud_id)).first()
    return {"estado": s.estado_solicitud, "sesion_id": str(sesion.id) if sesion else None}

@router.post("/{solicitud_id}/aceptar")
def aceptar(solicitud_id: str, psicologo_id: str = Depends(get_psicologo_id), db: Session = Depends(get_db)):
    resultado = db.execute(
        update(SolicitudAyuda)
        .where(SolicitudAyuda.id == uuid.UUID(solicitud_id))
        .where(SolicitudAyuda.estado_solicitud == "esperando")
        .values(estado_solicitud="en_sesion", psicologo_id=uuid.UUID(psicologo_id))
        .returning(SolicitudAyuda.id)
    )
    db.commit()

    if resultado.rowcount == 0:
        raise HTTPException(409, "Esta solicitud ya fue tomada por otro psicólogo")

    sala = _sala()
    sesion = Sesion(
        solicitud_id=uuid.UUID(solicitud_id),
        psicologo_id=uuid.UUID(psicologo_id),
        sala_jitsi=sala,
    )
    db.add(sesion)
    db.execute(
        update(Psicologo)
        .where(Psicologo.id == uuid.UUID(psicologo_id))
        .values(estado_actual="en_sesion")
    )
    db.commit()
    db.refresh(sesion)
    return {"sesion_id": str(sesion.id), "sala_jitsi": sala}
