from pydantic import BaseModel, EmailStr
from typing import Optional, List
import uuid

class PsicologoRegistro(BaseModel):
    nombre: str
    email: EmailStr
    password: str
    cedula: str
    num_federacion: Optional[str] = None
    especialidades: List[str] = []
    bio: Optional[str] = None
    telefono: Optional[str] = None
    anos_experiencia: int = 0

class PsicologoLogin(BaseModel):
    email: EmailStr
    password: str

class PsicologoResponse(BaseModel):
    id: uuid.UUID
    nombre: str
    email: str
    cedula: str
    num_federacion: Optional[str]
    especialidades: List[str]
    bio: Optional[str]
    telefono: Optional[str]
    anos_experiencia: int
    estado_actual: str
    verificado: bool
    total_sesiones: int

    class Config:
        from_attributes = True
