from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import update
from ..database import get_db
from ..models import Psicologo
from ..core.security import get_psicologo_id

router = APIRouter(prefix="/psicologo", tags=["psicologo"])

@router.put("/estado")
def cambiar_estado(body: dict, psicologo_id: str = Depends(get_psicologo_id), db: Session = Depends(get_db)):
    nuevo = body.get("estado")
    if nuevo not in ("disponible", "no_disponible"):
        raise HTTPException(400, "Estado inválido")
    db.execute(
        update(Psicologo)
        .where(Psicologo.id == psicologo_id)
        .values(estado_actual=nuevo)
    )
    db.commit()
    return {"ok": True}
