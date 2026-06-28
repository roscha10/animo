from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Psicologo
from ..schemas.psicologo import PsicologoRegistro, PsicologoLogin, PsicologoResponse
from ..core.security import hash_password, verify_password, create_token, get_psicologo_id

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/registro", response_model=PsicologoResponse, status_code=201)
def registro(data: PsicologoRegistro, db: Session = Depends(get_db)):
    if db.query(Psicologo).filter(Psicologo.email == data.email).first():
        raise HTTPException(400, "Email ya registrado")
    if db.query(Psicologo).filter(Psicologo.cedula == data.cedula).first():
        raise HTTPException(400, "Cédula ya registrada")

    psicologo = Psicologo(
        nombre=data.nombre,
        email=data.email,
        password_hash=hash_password(data.password),
        cedula=data.cedula,
        num_federacion=data.num_federacion,
        especialidades=data.especialidades,
        bio=data.bio,
        telefono=data.telefono,
        anos_experiencia=data.anos_experiencia,
    )
    db.add(psicologo)
    db.commit()
    db.refresh(psicologo)
    return psicologo

@router.post("/login")
def login(data: PsicologoLogin, response: Response, db: Session = Depends(get_db)):
    psicologo = db.query(Psicologo).filter(Psicologo.email == data.email).first()
    if not psicologo or not verify_password(data.password, psicologo.password_hash):
        raise HTTPException(401, "Credenciales incorrectas")

    token = create_token({"sub": str(psicologo.id), "nombre": psicologo.nombre})
    response.set_cookie("animo_token", token, httponly=True, samesite="lax", max_age=86400)
    return {"nombre": psicologo.nombre, "id": str(psicologo.id)}

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("animo_token")
    return {"ok": True}

@router.get("/me", response_model=PsicologoResponse)
def me(psicologo_id: str = Depends(get_psicologo_id), db: Session = Depends(get_db)):
    p = db.query(Psicologo).filter(Psicologo.id == psicologo_id).first()
    if not p:
        raise HTTPException(404, "No encontrado")
    return p
