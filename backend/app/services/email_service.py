import httpx
from datetime import datetime
from app.config import get_settings

settings = get_settings()

def send_email(to_email: str, subject: str, html_content: str):
    """
    Envía un correo usando Google Apps Script (webhook).
    Si el webhook no está configurado, solo imprime un log.
    """
    if not settings.GAS_WEBHOOK_URL:
        print(f"GAS_WEBHOOK_URL no configurado (Saltando envío de correo) -> Destino: {to_email}")
        return

    payload = {
        "to": to_email,
        "subject": subject,
        "body": "Por favor, abre este correo en un cliente que soporte HTML. Saludos, \n Eryó Bisutería.",
        "htmlBody": html_content
    }

    try:
        response = httpx.post(settings.GAS_WEBHOOK_URL, json=payload, timeout=10.0)
        if response.status_code in (200, 201):
            print(f"Correo '{subject}' enviado existosamente a {to_email}")
        else:
            print(f"Error HTTP {response.status_code} al enviar correo: {response.text}")
    except Exception as e:
        print(f"Error crítico al enviar correo a {to_email}: {e}")

# Templates de Ayuda rápidos

def get_base_template(content: str) -> str:
    year = datetime.now().year
    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f5f7; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f5f7; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
          <!-- Encabezado con Logo -->
          <tr>
            <td align="center" style="background-color: #0f0818; padding: 35px 20px; border-bottom: 3px solid #9356A0;">
              <h1 style="color: #DCCAE9; margin: 0; font-size: 32px; letter-spacing: 3px; font-weight: bold;">ERYÓ</h1>
              <p style="color: #9356A0; margin: 5px 0 0 0; font-size: 13px; letter-spacing: 5px; text-transform: uppercase;">Bisutería Artesanal</p>
            </td>
          </tr>
          <!-- Contenido Principal -->
          <tr>
            <td style="padding: 40px 35px; color: #333333; font-size: 16px; line-height: 1.6;">
              {content}
            </td>
          </tr>
          <!-- Pie de página -->
          <tr>
            <td align="center" style="background-color: #fafbfc; padding: 25px; border-top: 1px solid #eeeeee; color: #888888; font-size: 12px; line-height: 1.5;">
              Estás recibiendo este correo porque realizaste una solicitud en nuestra plataforma.<br>
              <br>
              &copy; {year} Eryó — Bisutería Artesanal. Barranquilla, Colombia.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

def template_pedido_estandar_cliente(nombre, id_pedido, total):
    content = f"""
    <h2 style="color: #1a1025; margin-top: 0; font-size: 22px;">¡Hola, {nombre}!</h2>
    <p>Hemos recibido correctamente tu pedido en <strong>Eryó</strong>. Nos emociona mucho empezar a trabajar en él.</p>
    
    <div style="background-color: #f8f5fc; border-left: 4px solid #9356A0; padding: 15px 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0 0 10px 0;"><strong>Referencia de Orden:</strong> <span style="color: #9356A0; font-size: 18px;">#{id_pedido}</span></p>
        <p style="margin: 0;"><strong>Total aproximado a pagar contraentrega:</strong> <span style="font-weight: bold; font-size: 18px;">${total}</span></p>
    </div>
    
    <p>En este momento nuestro equipo validará tus datos. En breve nos comunicaremos contigo vía WhatsApp para confirmar los detalles finales y programar la entrega.</p>
    <p style="margin-bottom: 0;"><em>¡Gracias por apoyar el talento artesanal!</em></p>
    """
    return get_base_template(content)

def template_pedido_personalizado_cliente(nombre, id_pedido):
    content = f"""
    <h2 style="color: #1a1025; margin-top: 0; font-size: 22px;">¡Hola, {nombre}! ✨</h2>
    <p>Hemos recibido la solicitud para crear tu pieza única y personalizada. ¡Nos encantan las nuevas ideas!</p>
    
    <div style="background-color: #f8f5fc; border-left: 4px solid #9356A0; padding: 15px 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0;"><strong>Referencia de Solicitud:</strong> <span style="color: #9356A0; font-size: 18px;">#{id_pedido}</span></p>
    </div>
    
    <p>Nuestro equipo de artesanos revisará tus especificaciones para validar la viabilidad y disponer de los materiales perfectos. <strong>En menos de 24 horas</strong>, recibirás un nuevo correo indicando el precio del trabajo para que lo apruebes.</p>
    <p style="margin-bottom: 0;"><em>¡Nos emociona crear esta pieza con significado exclusivo para ti!</em></p>
    """
    return get_base_template(content)

def template_precio_definido(nombre, id_pedido, precio, enlace):
    content = f"""
    <h2 style="color: #1a1025; margin-top: 0; font-size: 22px;">¡Buenas noticias, {nombre}! 🎨</h2>
    <p>Hemos analizado los detalles de tu diseño personalizado <strong>(Ref. #{id_pedido})</strong> y tenemos todo listo para comenzar su fabricación.</p>
    
    <div style="background-color: #f8f5fc; border: 1px solid #ebdcf5; padding: 25px 20px; margin: 25px 0; border-radius: 8px; text-align: center;">
        <p style="margin: 0 0 10px 0; color: #555555; font-size: 14px; text-transform: uppercase;">Precio Total Estimado</p>
        <p style="margin: 0; color: #9356A0; font-size: 32px; font-weight: bold;">${precio:,.2f}</p>
    </div>
    
    <p>Para autorizar el inicio del trabajo, haz clic en el siguiente botón (recuerda que el pago lo realizas a contraentrega o cuando acordemos por WhatsApp):</p>
    
    <div style="text-align: center; margin: 35px 0;">
        <a href="{enlace}?accion=aceptar" style="display: inline-block; background-color: #9356A0; color: #ffffff; padding: 14px 28px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 6px; box-shadow: 0 4px 6px rgba(147,86,160,0.25);">Aprobar y Comenzar Fabricación</a>
    </div>
    
    <p style="font-size: 13px; color: #888888; text-align: center; margin-bottom: 0;">
        Si cambiaste de opinión o la cotización no superó tus expectativas, puedes <br><a href="{enlace}?accion=rechazar" style="color: #9356A0; text-decoration: underline;">rechazar esta solicitud</a> sin ningún compromiso.
    </p>
    """
    return get_base_template(content)

def template_pedido_nuevo_vendedor_estandar(id_pedido, cliente_nombre, cliente_telefono, cliente_correo, total, items_texto):
    content = f"""
    <h2 style="color: #1a1025; margin-top: 0; font-size: 22px;">Nuevo pedido estándar</h2>
    <p>Se ha registrado un nuevo pedido en la tienda.</p>
    <div style="background-color: #f8f5fc; border-left: 4px solid #9356A0; padding: 15px 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0 0 8px 0;"><strong>Nº de pedido:</strong> <span style="color: #9356A0;">#{id_pedido}</span></p>
        <p style="margin: 0 0 8px 0;"><strong>Cliente:</strong> {cliente_nombre}</p>
        <p style="margin: 0 0 8px 0;"><strong>Teléfono:</strong> {cliente_telefono}</p>
        <p style="margin: 0 0 8px 0;"><strong>Correo:</strong> {cliente_correo}</p>
        <p style="margin: 0 0 8px 0;"><strong>Total:</strong> ${total}</p>
        <p style="margin: 0; white-space: pre-wrap; font-size: 14px;">{items_texto}</p>
    </div>
    <p style="margin-bottom: 0;">Revisa el panel de administración para confirmar y gestionar el pedido.</p>
    """
    return get_base_template(content)


def template_pedido_nuevo_vendedor_personalizado(id_pedido, cliente_nombre, cliente_telefono, cliente_correo, descripcion):
    content = f"""
    <h2 style="color: #1a1025; margin-top: 0; font-size: 22px;">Nueva solicitud de pedido personalizado</h2>
    <p>Un cliente ha solicitado una pieza personalizada.</p>
    <div style="background-color: #f8f5fc; border-left: 4px solid #9356A0; padding: 15px 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0 0 8px 0;"><strong>Nº de solicitud:</strong> <span style="color: #9356A0;">#{id_pedido}</span></p>
        <p style="margin: 0 0 8px 0;"><strong>Cliente:</strong> {cliente_nombre}</p>
        <p style="margin: 0 0 8px 0;"><strong>Teléfono:</strong> {cliente_telefono}</p>
        <p style="margin: 0 0 8px 0;"><strong>Correo:</strong> {cliente_correo}</p>
        <p style="margin: 0;"><strong>Descripción:</strong></p>
        <p style="margin: 8px 0 0 0; white-space: pre-wrap;">{descripcion or '—'}</p>
    </div>
    <p style="margin-bottom: 0;">Revisa el panel de administración para definir el precio y gestionar la solicitud.</p>
    """
    return get_base_template(content)


def template_estado_actualizado(nombre, id_pedido, nuevo_estado):
    estado_limpio = nuevo_estado.replace("_", " ")
    content = f"""
    <h2 style="color: #1a1025; margin-top: 0; font-size: 22px;">¡Actualización de tu pedido! 📦</h2>
    <p>Hola, {nombre}. Queremos mantenerte informado: el estado de tu pedido <strong>#{id_pedido}</strong> ha sido actualizado con éxito por nuestro equipo.</p>
    
    <div style="text-align: center; margin: 30px 0;">
        <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">Nuevo estado de la orden:</p>
        <div style="display: inline-block; background-color: #f8f5fc; border: 2px solid #9356A0; color: #9356A0; padding: 10px 25px; border-radius: 30px; font-weight: bold; font-size: 18px; text-transform: uppercase;">
            {estado_limpio}
        </div>
    </div>
    
    <p style="margin-bottom: 0;">¡Ya casi lo tienes en tus manos! Pronto recibiremos confirmación de llegada.</p>
    """
    return get_base_template(content)
