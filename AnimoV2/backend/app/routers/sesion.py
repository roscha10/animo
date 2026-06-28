from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import update
from ..database import get_db
from ..models import Sesion, Psicologo, SolicitudAyuda
from ..core.security import get_psicologo_id
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/sesion", tags=["sesion"])

@router.get("/{sesion_id}")
def get_sesion(sesion_id: str, psicologo_id: str = Depends(get_psicologo_id), db: Session = Depends(get_db)):
    sesion = db.query(Sesion).filter(Sesion.id == uuid.UUID(sesion_id)).first()
    if not sesion:
        raise HTTPException(404, "Sesión no encontrada")

    mi_rol = "psicologo" if str(sesion.psicologo_id) == psicologo_id else "paciente"
    return {
        "id": str(sesion.id),
        "sala_jitsi": sesion.sala_jitsi,
        "iniciado_en": sesion.iniciado_en,
        "completado_en": sesion.completado_en,
        "mi_rol": mi_rol,
    }

@router.put("/{sesion_id}/terminar")
def terminar(sesion_id: str, body: dict, psicologo_id: str = Depends(get_psicologo_id), db: Session = Depends(get_db)):
    sesion = db.query(Sesion).filter(Sesion.id == uuid.UUID(sesion_id)).first()
    if not sesion:
        raise HTTPException(404, "Sesión no encontrada")
    if str(sesion.psicologo_id) != psicologo_id:
        raise HTTPException(403, "No autorizado")

    sesion.completado_en = datetime.now(timezone.utc)
    sesion.notas = body.get("notas", "")

    db.execute(
        update(SolicitudAyuda)
        .where(SolicitudAyuda.id == sesion.solicitud_id)
        .values(estado_solicitud="completada")
    )
    db.execute(
        update(Psicologo)
        .where(Psicologo.id == uuid.UUID(psicologo_id))
        .values(estado_actual="disponible", total_sesiones=Psicologo.total_sesiones + 1)
    )
    db.commit()
    return {"ok": True}
