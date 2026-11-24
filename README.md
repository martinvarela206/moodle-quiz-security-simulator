# Simulador de Seguridad en Cuestionarios Moodle

> 🌐 **Demo en vivo (GitHub Pages):** [https://martinvarela206.github.io/moodle-quiz-security-simulator/](https://martinvarela206.github.io/moodle-quiz-security-simulator/)  
> 📦 **Repositorio en GitHub:** [https://github.com/martinvarela206/moodle-quiz-security-simulator](https://github.com/martinvarela206/moodle-quiz-security-simulator)

Aplicación web estática y ligera desarrollada en HTML5, CSS3 y Vanilla JavaScript puro (sin frameworks ni bundlers, 100% compatible con GitHub Pages) que replica el comportamiento exacto de la opción nativa de Moodle: **"Ventana emergente a pantalla completa con alguna seguridad JavaScript"** (*Full screen pop-up with some JavaScript security*).

Permite auditar el comportamiento de los navegadores ante ventanas emergentes restringidas, comprobar si los bloqueadores de pop-ups impiden el acceso a los exámenes, verificar la efectividad de las restricciones del portapapeles y evaluar en tiempo real si el cambio de foco o el uso de múltiples pantallas dispara eventos de pérdida de foco (`blur` y `visibilitychange`).

---

## Estructura del Proyecto

El simulador está compuesto por los siguientes archivos modulares con rutas relativas:

- [`index.html`](file:///d:/9.Proyectos/Moodle-Quiz-Security-Simulator/index.html): Pantalla de inicio previa al intento con la estética del tema Boost de Moodle. Incluye el diagnóstico de compatibilidad de pop-ups y el lanzador con parámetros exactos de Moodle.
- [`exam.html`](file:///d:/9.Proyectos/Moodle-Quiz-Security-Simulator/exam.html): Ventana emergente segura de examen. Contiene la interfaz sin barras de navegación, temporizador regresivo de 15:00, 3 preguntas interactivas de prueba y el dock de telemetría en vivo.
- [`styles.css`](file:///d:/9.Proyectos/Moodle-Quiz-Security-Simulator/styles.css): Hoja de estilos inspirada en Moodle Boost (Bootstrap 4/5 base), que incluye el formato oficial de preguntas `.que.multichoice`, bloques de navegación `.qnbutton`, toasts no intrusivos y el panel técnico HUD.
- [`app.js`](file:///d:/9.Proyectos/Moodle-Quiz-Security-Simulator/app.js): Lógica Vanilla JS para la comprobación de ventanas emergentes, captura y bloqueo de atajos de teclado, bloqueo de menú contextual, telemetría de eventos en tiempo real y temporizador.
- [`README.md`](file:///d:/9.Proyectos/Moodle-Quiz-Security-Simulator/README.md): Documentación técnica del proyecto, instrucciones de despliegue y análisis de seguridad web.

---

## Características y Requisitos Implementados

### 1. Pantalla Previa al Intento (`index.html`)
- **Comprobación activa de pop-ups:** Evalúa si el navegador permite abrir ventanas emergentes en el dominio actual y muestra un indicador de estado en tiempo real.
- **Lanzador idéntico a Moodle:** Al pulsar *"Intentar resolver el cuestionario"*, ejecuta `window.open` con la cadena de configuración oficial de Moodle:
  ```javascript
  const windowFeatures = [
    `width=${screen.availWidth}`,
    `height=${screen.availHeight}`,
    'top=0',
    'left=0',
    'toolbar=no',
    'location=no',
    'directories=no',
    'status=no',
    'menubar=no',
    'scrollbars=yes',
    'resizable=yes',
    'fullscreen=yes'
  ].join(',');

  window.open('./exam.html', 'MoodleQuizPopup', windowFeatures);
  ```
- **Detección de bloqueo y ayuda visual:** Si `window.open` devuelve `null` o `closed`, se despliega un panel de advertencia rojo idéntico al de Moodle, indicando paso a paso cómo habilitar las ventanas emergentes en la barra de direcciones del navegador.

### 2. Ventana Emergente Segura (`exam.html`)
- **Diseño minimalista Moodle:** Oculta el menú general y la navegación del sitio para emular la vista restringida de examen.
- **Temporizador regresivo:** Cuenta atrás de 15:00 minutos que cambia a estado urgente al restar menos de 2 minutos.
- **Rejilla interactiva de preguntas:** Los botones de navegación reflejan el estado real de la pregunta (mitad inferior gris para "Respuesta guardada" y triángulo rojo para "Señalar con bandera").
- **Restricciones JavaScript nativas:**
  - Bloqueo de menú contextual (`contextmenu` -> `e.preventDefault()`).
  - Bloqueo de selección de texto (`selectstart` -> `e.preventDefault()` y `user-select: none`).
  - Bloqueo de arrastre de imágenes y texto (`dragstart`).
  - Bloqueo de atajos de teclado clave (`Ctrl+C`, `Ctrl+X`, `Ctrl+V`, `Ctrl+A`, `Ctrl+U`, `Ctrl+S`, `Ctrl+P`, `F12`, `Ctrl+Shift+I/J/C`).
  - Alertas flotantes (toasts) no intrusivas que avisan cada vez que una acción es interceptada.

### 3. Panel de Diagnóstico Técnico (Telemetría en Vivo)
- **Monitoreo de Foco:** Informa en tiempo real si la ventana tiene el foco activo (`document.hasFocus()`).
- **Contador de Eventos:**
  - Pérdidas de foco de la ventana (`window.blur`).
  - Cambios en el estado de visibilidad del documento (`visibilitychange` / `document.visibilityState`).
  - Intentos de uso de atajos bloqueados.
  - Intentos de clic derecho bloqueados.
- **Consola de Eventos con Marcas de Tiempo:** Flujo en vivo con timestamps en formato `[HH:MM:SS.mmm]` que detalla cada interacción.
- **Detección de Monitores:** Consulta `window.screen.isExtended` (API Window Management) para identificar configuraciones con pantallas múltiples.
- **Comprobación de Scroll en Segundo Monitor:** Permite verificar que en Windows, al mover la rueda del ratón sobre una ventana inactiva en una segunda pantalla, el scroll se realiza pero la ventana del examen **no pierde el foco** hasta que se efectúa un clic explícito o un cambio de tarea (`Alt+Tab`).
- **Cierre Seguro:** Botón *"Finalizar intento y cerrar ventana"* que resume los eventos registrados y ejecuta `window.close()`.

---

## Cómo Probar el Proyecto Localmente

Al no utilizar dependencias externas ni compiladores, puede ejecutarse de cualquiera de las siguientes formas:

### Opción A: Servidor HTTP Local con Python
1. Abra una terminal en la carpeta del proyecto.
2. Inicie un servidor estático rápido:
   ```bash
   python -m http.server 8000
   ```
3. Abra su navegador en: `http://localhost:8000`

### Opción B: Servidor HTTP Local con Node.js
```bash
npx serve .
```

### Opción C: Apertura directa
Puede hacer doble clic directamente en `index.html`. Sin embargo, para evaluar de forma realista las políticas de ventanas emergentes de los navegadores modernos, se recomienda acceder a través de `http://localhost` o desplegarlo en GitHub Pages.

---

## Despliegue en GitHub Pages

1. Suba los archivos del repositorio a una rama en GitHub (ej. `main`).
2. En GitHub, ingrese a la pestaña **Settings** (Configuración) del repositorio.
3. En el menú lateral izquierdo, seleccione **Pages**.
4. En la sección **Build and deployment**:
   - **Source:** Seleccione `Deploy from a branch`.
   - **Branch:** Elija `main` y la carpeta `/ (root)`.
   - Presione **Save**.
5. Tras unos minutos, su sitio estará publicado en:
   ```text
   https://<tu-usuario>.github.io/moodle-quiz-security-simulator/
   ```
6. Al utilizar exclusivamente rutas relativas (`./exam.html`, `./styles.css`, `./app.js`), todos los recursos cargarán correctamente tanto en la raíz de un dominio como bajo el subdirectorio de GitHub Pages.
