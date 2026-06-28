from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid

class SolicitudCreate(BaseModel):
    nombre_anonimo: Optional[str] = None
    edad: Optional[int] = None
    ciudad: Optional[str] = None
    estado_ve: Optional[str] = None
    sintomas: List[str]
    descripcion: Optional[str] = None
    nivel_crisis: int = 3
    es_emergencia: bool = False
    contacto_preferido: str = "video"

class SolicitudResponse(BaseModel):
    id: uuid.UUID
    nombre_anonimo: Optional[str]
    ciudad: Optional[str]
    estado_ve: Optional[str]
    sintomas: List[str]
    nivel_crisis: int
    es_emergencia: bool
    contacto_preferido: str
    estado_solicitud: str
    creado_en: datetime

    class Config:
        from_attributes = True
