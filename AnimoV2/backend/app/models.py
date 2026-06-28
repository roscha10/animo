from sqlalchemy import Column, String, Integer, Boolean, DateTime, Float, Text, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from .database import Base

class Psicologo(Base):
    __tablename__ = "psicologos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    cedula = Column(String, unique=True, nullable=False)
    num_federacion = Column(String)
    especialidades = Column(ARRAY(String), default=[])
    bio = Column(Text)
    telefono = Column(String)
    anos_experiencia = Column(Integer, default=0)
    estado_actual = Column(String, default="disponible")
    verificado = Column(Boolean, default=False)
    total_sesiones = Column(Integer, default=0)
    creado_en = Column(DateTime(timezone=True), server_default=func.now())


class SolicitudAyuda(Base):
    __tablename__ = "solicitudes_ayuda"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre_anonimo = Column(String)
    edad = Column(Integer)
    ciudad = Column(String)
    estado_ve = Column(String)
    latitud = Column(Float)
    longitud = Column(Float)
    sintomas = Column(ARRAY(String), default=[])
    descripcion = Column(Text)
    nivel_crisis = Column(Integer, default=3)
    es_emergencia = Column(Boolean, default=False)
    contacto_preferido = Column(String, default="video")
    estado_solicitud = Column(String, default="esperando")
    psicologo_id = Column(UUID(as_uuid=True), nullable=True)
    creado_en = Column(DateTime(timezone=True), server_default=func.now())


class Sesion(Base):
    __tablename__ = "sesiones"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    solicitud_id = Column(UUID(as_uuid=True), nullable=False)
    psicologo_id = Column(UUID(as_uuid=True), nullable=False)
    sala_jitsi = Column(String, nullable=False)
    iniciado_en = Column(DateTime(timezone=True), server_default=func.now())
    completado_en = Column(DateTime(timezone=True), nullable=True)
    notas = Column(Text)
