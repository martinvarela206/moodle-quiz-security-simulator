# Simulador y Verificador de Ventanas Emergentes para Moodle

> 🌐 **Sitio Web en Vivo (GitHub Pages):** [https://martinvarela206.github.io/moodle-quiz-security-simulator/](https://martinvarela206.github.io/moodle-quiz-security-simulator/)  
> 📦 **Repositorio en GitHub:** [https://github.com/martinvarela206/moodle-quiz-security-simulator](https://github.com/martinvarela206/moodle-quiz-security-simulator)

Herramienta web estática desarrollada en HTML5, CSS3 y Vanilla JavaScript puro (sin librerías externas ni bundlers, 100% compatible con GitHub Pages) diseñada para verificar si los navegadores web de los estudiantes permiten abrir cuestionarios seguros de Moodle (*"Ventana emergente a pantalla completa con alguna seguridad JavaScript"*), especialmente pensada para ingresantes y cursillistas del Campus Virtual SIED de la Universidad Nacional de San Juan (UNSJ).

---

## Modos de Uso Disponibles

El proyecto cuenta con dos experiencias diferenciadas según el tipo de usuario:

### 1. Portal para Estudiantes (Modo Simplificado)
- **Ruta principal:** [`index.html`](file:///d:/9.Proyectos/Moodle-Quiz-Security-Simulator/index.html) y ventana de prueba [`exam.html`](file:///d:/9.Proyectos/Moodle-Quiz-Security-Simulator/exam.html).
- **Enfoque UX/UI Anti-Ansiedad:** Elimina todo tecnicismo, aclara de forma enfática que **NO es un examen real ni tiene calificación**, y elimina cuentas regresivas estresantes.
- **Detección y Orientación para Celulares:** Advierte amigablemente a quienes ingresan desde teléfonos móviles que para el examen oficial del cursillo deberán utilizar obligatoriamente una computadora (PC o Notebook).
- **Prueba en Un Clic:** Un botón principal prominente comprueba si el navegador abre la ventana emergente o si está bloqueada.
- **Instructivo de Desbloqueo en 3 Pasos:** Si el navegador bloquea la ventana, ofrece una guía visual sencilla para hacer clic en el ícono de ventana bloqueada en la barra de direcciones y habilitar el permiso.
- **Recomendaciones Oficiales:** Consejos directos sobre navegadores recomendados (Google Chrome, Microsoft Edge, Mozilla Firefox), estabilidad de conexión a internet y alimentación eléctrica.

### 2. Portal Técnico Avanzado (Docentes y Administradores)
- **Ruta avanzada:** [`advanced.html`](file:///d:/9.Proyectos/Moodle-Quiz-Security-Simulator/advanced.html) y ventana técnica [`exam-advanced.html`](file:///d:/9.Proyectos/Moodle-Quiz-Security-Simulator/exam-advanced.html).
- **Auditoría Completa:** Interfaz oficial del tema Boost de Moodle con parámetros exactos (`screen.availWidth`, `screen.availHeight`, etc.).
- **Dock de Telemetría en Vivo:** Monitoreo en tiempo real de `document.hasFocus()`, pérdidas de foco (`window.blur`), cambios de visibilidad (`visibilitychange`), atajos bloqueados (`Ctrl+C`, `F12`, etc.) y detección de pantalla extendida (`window.screen.isExtended`).
- **Prueba de Multimonitor:** Permite verificar empíricamente el comportamiento del foco al desplazar el cursor a una segunda pantalla y mover la rueda del ratón.

---

## Estructura de Archivos

- [`index.html`](file:///d:/9.Proyectos/Moodle-Quiz-Security-Simulator/index.html): Portal simplificado de prueba para estudiantes.
- [`exam.html`](file:///d:/9.Proyectos/Moodle-Quiz-Security-Simulator/exam.html): Ventana emergente amigable que confirma la compatibilidad del navegador.
- [`advanced.html`](file:///d:/9.Proyectos/Moodle-Quiz-Security-Simulator/advanced.html): Portal técnico avanzado para docentes y administradores.
- [`exam-advanced.html`](file:///d:/9.Proyectos/Moodle-Quiz-Security-Simulator/exam-advanced.html): Ventana de examen con telemetría HUD y restricciones nativas de JavaScript.
- [`styles.css`](file:///d:/9.Proyectos/Moodle-Quiz-Security-Simulator/styles.css): Estilos adaptados al tema Moodle Boost, responsivos para computadoras y móviles.
- [`app.js`](file:///d:/9.Proyectos/Moodle-Quiz-Security-Simulator/app.js): Lógica Vanilla JS modular que atiende los flujos simple y avanzado.
- [`README.md`](file:///d:/9.Proyectos/Moodle-Quiz-Security-Simulator/README.md): Documentación del proyecto.

---

## Despliegue en GitHub Pages

Al usar rutas relativas (`./exam.html`, `./styles.css`, etc.), el proyecto se publica automáticamente desde la rama `main` en GitHub Pages sin necesidad de configuración adicional ni pasos de build.
