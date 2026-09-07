# Quiz_JSP.java — Escrito interactivo de Servlets & JSP

Examen escrito digital para la asignatura **Programación Avanzada (Java Web)** — Bachillerato Tecnológico UTU.  
Desarrollado para ser utilizado en sala de informática con control de pantalla completa y envío automático de respuestas a Google Sheets.

🔗 **[Abrir escrito → Quiz_JSP.java — Escrito](https://escritos-programacion2.github.io/javaweb1/)**

---

## Archivos del proyecto

| Archivo | Descripción |
|---|---|
| `escrito-jsp.html` | El examen completo — un único archivo HTML autocontenido |
| `codigo-google-sheet.js` | Script de Google Apps Script para recibir y guardar las respuestas |

---

## Características

### Examen

- **11 preguntas** sobre Servlets, JSP, JSTL/EL, Maven y sesiones HTTP
- **Orden aleatorio** — cada vez que se carga la página las preguntas aparecen en un orden diferente, lo que dificulta la copia entre compañeros
- **4 tipos de pregunta:**
  - `Pregunta abierta` — respuesta libre con textarea
  - `Opción única` — radio buttons con 4 opciones
  - `Verdadero / Falso` — radio buttons
  - `Completar` — campos de texto incrustados directamente en el bloque de código
- **Bloques de código** con syntax highlighting (palabras clave, tipos, funciones, strings)
- **Autocorrección automática** — al enviar, el examen califica las preguntas de opción, verdadero/falso y completar; las preguntas abiertas quedan para revisión docente
- **Respuestas correctas protegidas** — las respuestas correctas se almacenan solo en el Apps Script; no son accesibles desde el navegador
- **Anti-doble-envío** — usa `localStorage` para registrar que el examen ya fue enviado; al recargar la página se muestra la pantalla de confirmación sin posibilidad de volver a enviar

### Control de sala

- **Pantalla completa forzada** — al hacer clic por primera vez se activa el modo pantalla completa automáticamente
- **Envío automático al salir de pantalla completa** — si el estudiante sale de pantalla completa (Esc, Alt+Tab, etc.) el examen se envía de inmediato con lo respondido hasta ese momento
- **Bloqueo de campos al enviar** — una vez enviado el examen todos los campos quedan deshabilitados

### Diseño

- Tema oscuro estilo IDE (inspirado en editores de código)
- Fuente monoespaciada en todo el examen
- Responsive — funciona en pantallas pequeñas (aunque el uso previsto es en PC de escritorio)

---

## Configuración

### 1. Google Apps Script

1. Crear una **Google Sheet** nueva (vacía)
2. Menú → **Extensiones → Apps Script**
3. Borrar el código por defecto y pegar el contenido de `codigo-google-sheet.js`
4. Guardar con **Ctrl+S**
5. Hacer clic en **Implementar → Nueva implementación**
   - Tipo: `Aplicación web`
   - Ejecutar como: `Yo`
   - Quién tiene acceso: `Cualquier persona`
6. Copiar la **URL de App web** que aparece

> **Importante:** cada vez que se modifique el código del script es necesario crear una **nueva versión** del deployment para que los cambios tomen efecto: **Implementar → Administrar implementaciones → ✏️ → Nueva versión → Guardar**.

### 2. Vincular el examen con la Sheet

Abrir `escrito-jsp.html` con cualquier editor de texto y reemplazar la URL en esta línea (cerca del inicio del bloque `<script>`):

```js
const SHEET_WEBAPP_URL = "https://script.google.com/macros/s/TU_URL_AQUI/exec";
```

Guardar el archivo. Listo.

### 3. Actualizar las respuestas correctas

Las respuestas correctas se encuentran en el objeto `CORRECT_ANSWERS` dentro de `codigo-google-sheet.js`. Modificar ese objeto para adaptarlo a las preguntas del examen y volver a hacer deployment (nueva versión).

---

## Cómo se guardan las respuestas

Cada envío agrega una fila en la hoja **"Respuestas"** con:

| Columna | Contenido |
|---|---|
| Timestamp | Fecha y hora del envío (ISO 8601) |
| Nombre | Nombre completo ingresado por el estudiante |
| P1 a P11 | Respuesta de cada pregunta |
| Autocorrección (X/9) | Puntaje automático con detalle por pregunta |

Las preguntas de tipo **completar** guardan todos los blancos separados por ` | ` en una sola celda (ej: `CalculoServlet | post | text | nombre | number | sueldo | number | dias | submit`).

La hoja se crea automáticamente con encabezados formateados la primera vez que llega una respuesta.

---

## Uso en clase

1. Subir `escrito-jsp.html` a GitHub Pages, Netlify u otro hosting estático
2. Compartir el enlace con los estudiantes (o proyectarlo en el pizarrón)
3. Los estudiantes ingresan su nombre, responden las preguntas y hacen clic en **Enviar respuestas**
4. Al finalizar, el examen muestra el resultado automático de las preguntas corregibles
5. Las respuestas y el puntaje aparecen en tiempo real en la Google Sheet

> **Tip:** con GitHub Pages el archivo queda en una URL fija que se puede reutilizar en futuros escritos cambiando solo las preguntas y las respuestas correctas en el script.

---

## Personalización

### Cambiar o agregar preguntas

El array `questions` en el `<script>` del HTML contiene todas las preguntas. Cada objeto sigue esta estructura:

```js
// Pregunta abierta
{ id: "q1", type: "open", text: "Texto de la pregunta" }

// Opción única
{ id: "q2", type: "single", text: "Texto", options: [
    { id: "a", label: "Opción A" },
    { id: "b", label: "Opción B" }
]}

// Verdadero / Falso
{ id: "q3", type: "tf", text: "Texto de la pregunta" }

// Completar (con código)
{ id: "q4", type: "blank", text: "Texto", blanks: 2,
  code: `String x = request.__BLANK0__("param");\nreturn __BLANK1__;` }
```

Los marcadores `__BLANK0__`, `__BLANK1__`, etc. se reemplazan automáticamente por campos de texto al renderizar.

### Desactivar el orden aleatorio

Para que las preguntas aparezcan siempre en el mismo orden, comentar esta línea en el `<script>`:

```js
// shuffle(questions);
```

### Desactivar pantalla completa

Para utilizar el examen sin forzar pantalla completa, comentar este bloque al final del script:

```js
// document.addEventListener("click", function initFS() { ... });
```

---

## Tecnologías

- HTML5 / CSS3 / JavaScript vanilla — sin dependencias externas
- Google Apps Script (backend para guardar y calificar respuestas)
- JSONP para comunicación con el script sin restricciones CORS
- Fullscreen API del navegador
- localStorage (control de doble envío)

---

*Programación Avanzada — UTU (DGETP) · Elizabeth Izquierdo*
