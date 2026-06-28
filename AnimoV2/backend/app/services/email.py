import resend
from ..core.config import settings

async def notificar_psicologos(emails: list[str], solicitud) -> None:
    if not settings.RESEND_API_KEY or not emails:
        return

    resend.api_key = settings.RESEND_API_KEY
    urgente = solicitud.es_emergencia or solicitud.nivel_crisis >= 4
    ubicacion = ", ".join(filter(None, [solicitud.ciudad, solicitud.estado_ve])) or "No especificada"

    resend.Emails.send({
        "from": "Ánimo <notificaciones@animo.kaimindconsulting.com>",
        "to": emails,
        "subject": "🚨 URGENTE — Paciente en crisis" if urgente else "💙 Nuevo paciente esperando",
        "html": f"""
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <div style="background:#042f2e;border-radius:16px;padding:24px;text-align:center;margin-bottom:24px">
            <span style="font-size:32px">♥</span>
            <h1 style="color:#14b8a6;margin:8px 0 0;font-size:22px">Ánimo</h1>
          </div>
          {"<div style='background:#fef2f2;border:2px solid #ef4444;border-radius:12px;padding:16px;margin-bottom:20px'><p style='color:#dc2626;font-weight:bold;margin:0'>⚠️ CASO URGENTE — Nivel de crisis " + str(solicitud.nivel_crisis) + "/5</p></div>" if urgente else ""}
          <h2 style="color:#1e293b;font-size:18px">Hay un paciente esperando atención</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Paciente</td><td style="color:#1e293b;font-size:14px;font-weight:600">{solicitud.nombre_anonimo or "Anónimo"}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Ubicación</td><td style="color:#1e293b;font-size:14px">{ubicacion}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Síntomas</td><td style="color:#1e293b;font-size:14px">{", ".join(solicitud.sintomas)}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Modalidad</td><td style="color:#1e293b;font-size:14px">{solicitud.contacto_preferido}</td></tr>
          </table>
          <a href="{settings.APP_URL}/psicologo/dashboard" style="display:block;background:#0d9488;color:white;text-align:center;padding:14px 24px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:16px;margin-bottom:16px">Atender ahora →</a>
          <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0">Ánimo · Kaimind × Vikua · Confidencial y gratuito</p>
        </div>
        """,
    })
