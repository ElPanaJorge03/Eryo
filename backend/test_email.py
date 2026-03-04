import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.email_service import send_email, template_pedido_estandar_cliente

def probar_correo():
    print("Iniciando prueba de conexión con Google Apps Script...")
    
    # Pon aquí tu correo real para que puedas ver el mensaje de prueba en tu bandeja de entrada
    correo_destino = "test@ejemplo.com" # CAMBIA ESTO POR TU CORREO
    
    html_de_prueba = template_pedido_estandar_cliente(
        nombre="Jorge (Prueba)", 
        id_pedido=9999, 
        total="45,000"
    )
    
    # Enviamos la petición directamente
    send_email(
        to_email=correo_destino,
        subject="🚀 Prueba de Conexión - Eryó Frontend",
        html_content=html_de_prueba
    )
    
    print("Prueba completada. Revisa la consola para ver si hubo un error 200 (Éxito) o algún fallo.")

if __name__ == "__main__":
    probar_correo()
