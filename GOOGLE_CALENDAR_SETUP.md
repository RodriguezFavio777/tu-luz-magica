# Integración con Google Calendar

Para conectar la aplicación con tu Google Calendar y mostrar disponibilidades reales, necesitamos habilitar el acceso a la API de Google.

Esta integración permitirá:
1.  **Leer eventos:** Ver qué días y horas ya tienes ocupados.
2.  **Crear eventos:** Agendar automáticamente nuevas sesiones cuando un cliente reserva.

---

## 📅 Pasos para Obtener las Credenciales

Necesitaré que generes un archivo de credenciales (`service-account.json`) siguiendo estos pasos en la consola de Google Cloud.

### 1. Crear un Proyecto en Google Cloud
1.  Ingresa a [Google Cloud Console](https://console.cloud.google.com/).
2.  Crea un **Nuevo Proyecto** y ponle un nombre (ej: `Tu Luz Magica Calendar`).
3.  Espera a que se cree y selecciónalo.

### 2. Habilitar la Google Calendar API
1.  En el menú lateral, ve a **APIs y servicios** > **Biblioteca**.
2.  Busca `Google Calendar API`.
3.  Dale click a **Habilitar**.

### 3. Crear una Cuenta de Servicio (Service Account)
1.  Ve a **APIs y servicios** > **Credenciales**.
2.  Click en **+ CREAR CREDENCIALES** > **Cuenta de servicio**.
3.  Nombre: `booking-system`.
4.  Click en **Crear y Continuar**.
5.  En "Rol", selecciona **Propietario** (o Editor).
6.  Click en **Listo**.

### 4. Generar la Clave Privada (JSON)
1.  En la lista de Cuentas de servicio, haz click en el email de la cuenta que acabas de crear (ej: `booking-system@...`).
2.  Ve a la pestaña **Claves** (Keys).
3.  Click en **Agregar clave** > **Crear clave nueva**.
4.  Selecciona formato **JSON**.
5.  **Se descargará un archivo automáticamente.** ¡Guárdalo bien! Este es el archivo que necesitamos.

### 5. Compartir tu Calendario
Para que el sistema pueda leer/escribir en tu calendario personal (`tucorreo@gmail.com`), debes darle permiso a la cuenta de servicio.

1.  Abre el archivo JSON que descargaste y copia el `client_email`.
2.  Ve a [Google Calendar](https://calendar.google.com/).
3.  En la barra lateral izquierda, busca tu calendario, click en los 3 puntitos > **Configuración y uso compartido**.
4.  Baja hasta "Compartir con personas específicas".
5.  **Agregar personas**: Pega el email de la cuenta de servicio (`booking-system@...`).
6.  **Permisos**: Selecciona "Realizar cambios en eventos".
7.  Guardar.

---

## 📂 ¿Qué necesito que hagas ahora?

1.  Dime cuando tengas el archivo JSON descargado.
2.  No lo pegues en el chat (es información sensible).
3.  Te indicaré cómo configurar las variables de entorno en Vercel/Supabase de forma segura.

### Para Rituales (Días Específicos)
Los rituales suelen depender de fases lunares o días de la semana.
-   Podemos configurar reglas fijas (ej: "Solo Martes y Viernes").
-   O podemos crear un calendario secundario en tu Google Calendar llamado "Disponibilidad Rituales" y bloquear los días que NO trabajas.
