ARCHIVO DE CONOCIMIENTO DEL PROYECTO
E-commerce de Bisutería — Tienda de Manillas y Accesorios
1. Descripción del Proyecto
Tienda en línea para venta de bisutería artesanal (manillas, anillos, collares y más). Permite comprar productos del catálogo existente y también hacer pedidos personalizados eligiendo componentes. Opera únicamente en Barranquilla con entrega contraentrega o transferencia bancaria.

Cliente: proyecto pagado para un amigo. Plazo: 2 a 3 meses (flexible hasta 6). El cliente administra el catálogo y los pedidos de forma autónoma.

2. Stack Tecnológico
Capa	Tecnología	Nota
Frontend	Next.js + TypeScript	SEO incluido para catálogo público
Estilos	Tailwind CSS	
Backend	FastAPI + Python	Ya dominado por el desarrollador
Base de Datos	PostgreSQL	
Despliegue	Railway	Backend + BD
Frontend Deploy	Vercel	Plan gratuito
Emails	Google Apps Script	Correos transaccionales
Archivos	Cloudinary	Fotos de productos

3. Tipos de Pedido
Tipo	Descripción	Precio
Pedido Estándar	El cliente compra un producto existente del catálogo con características fijas.	Precio fijo definido en el catálogo
Pedido Personalizado	El cliente arma su pieza eligiendo componentes disponibles. El vendedor la elabora desde cero.	El vendedor define el precio después de revisar el pedido

4. Flujos de Pedido
4.1 Pedido Estándar
•	Cliente agrega producto al carrito y llena formulario con datos de entrega y método de pago.
•	El vendedor recibe notificación por correo.
•	Estados: PENDIENTE → CONFIRMADO → EN CAMINO → ENTREGADO
•	Cancelación posible en cualquier punto.

4.2 Pedido Personalizado
•	Cliente elige componentes disponibles (tipo, tejido, color, digen, etc.) y envía el pedido sin precio.
•	El vendedor revisa el pedido, define el precio y notifica al cliente por correo con enlace de confirmación.
•	El cliente hace clic en el enlace, llega a una página de confirmación en el sitio y acepta o rechaza el precio.
•	Si acepta: el pedido avanza. Si rechaza: el pedido se cancela.
•	Estados: PENDIENTE → PRECIO DEFINIDO → CONFIRMADO POR CLIENTE → EN ELABORACIÓN → LISTO → ENTREGADO
•	Cancelación posible en cualquier punto.

5. Atributos de Productos
Atributo	Descripción	¿Aplica a personalizado?
Nombre	Nombre del producto	Sí
Precio	Precio fijo (estándar) o definido por vendedor (personalizado)	Sí
Tipo	Manilla, Anillo, Collar, u otro	Sí
Estilo de Tejido	Técnica de tejido utilizada	Sí
Color del Hilo	Color o colores del hilo	Sí
Digen	Piedra central de la manilla (si aplica)	Sí
Fotos	Imágenes del producto (Cloudinary)	No aplica
Categoría	Clasificación para filtrado en catálogo	No aplica
Stock	Disponibilidad del producto	No aplica

6. Portal Público (Lo que ve el cliente)
•	Página de inicio con productos destacados y categorías.
•	Catálogo con filtros por categoría, tipo y otros atributos.
•	Página de detalle de producto con fotos, descripción y atributos.
•	Carrito de compras.
•	Formulario de pedido estándar: nombre, teléfono, dirección de entrega, método de pago (contraentrega o transferencia).
•	Sección de pedido personalizado: selector de componentes disponibles + datos de entrega.
•	Página de confirmación de precio para pedidos personalizados (accesible desde enlace en correo).

7. Panel de Administración (Lo que ve el vendedor)
•	Gestión de productos: crear, editar, eliminar, activar/desactivar.
•	Gestión de categorías.
•	Gestión de componentes disponibles para pedidos personalizados (colores, tejidos, digens, tipos).
•	Gestión de pedidos estándar: ver, cambiar estado, historial completo.
•	Gestión de pedidos personalizados: ver, definir precio, cambiar estado, historial completo.
•	Vista de historial completo de todos los pedidos.

8. Notificaciones por Correo (Google Apps Script)
Evento	Destinatario
Pedido estándar recibido	Cliente (confirmación) + Vendedor (alerta)
Precio definido en pedido personalizado	Cliente (con enlace de confirmación)
Cliente confirma precio	Vendedor
Cliente rechaza precio	Vendedor
Cambio de estado del pedido	Cliente

9. Métodos de Pago
•	Contraentrega: el cliente paga al recibir el pedido.
•	Transferencia bancaria: el cliente transfiere antes de la entrega. El vendedor confirma el pago manualmente desde el panel.
•	No hay pasarela de pagos en línea.

10. Modelo de Datos (Entidades Principales)
Entidad	Campos clave
Producto	id, nombre, precio, tipo, estilo_tejido, color_hilo, digen, categoria_id, stock, activo, fotos[]
Categoría	id, nombre, descripcion
Componente	id, tipo (color/tejido/digen/tipo_pieza), nombre, disponible
Pedido Estándar	id, cliente_nombre, cliente_telefono, cliente_correo, direccion, metodo_pago, estado, items[], creado_en
Pedido Personalizado	id, cliente_nombre, cliente_telefono, cliente_correo, direccion, componentes[], precio_definido, estado, token_confirmacion, creado_en
Item de Pedido	id, pedido_id, producto_id, cantidad, precio_unitario

11. Contexto del Proyecto
•	Proyecto pagado para un amigo cercano. Plazo flexible de hasta 6 meses.
•	Desarrollador individual aprendiendo Next.js con este proyecto.
•	El cliente administra el catálogo y pedidos de forma autónoma.
•	Operación solo en Barranquilla. Sin envíos nacionales por ahora.
•	Sin pasarela de pagos en línea. Solo contraentrega y transferencia.
•	Google Apps Script para correos (restricción de Railway con SMTP).
