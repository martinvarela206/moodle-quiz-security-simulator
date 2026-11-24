/**
 * Moodle Quiz Security Simulator - app.js
 * Vanilla JavaScript puro sin dependencias externas
 * Compatible con GitHub Pages y navegadores modernos
 */

(function () {
  'use strict';

  // Identificar el contexto actual por elementos clave del DOM
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('moodle-index-page')) {
      initIndexPage();
    } else if (document.getElementById('moodle-exam-page')) {
      initExamPage();
    }
  });

  /* ==========================================================================
     1. LÓGICA DE LA PÁGINA DE INICIO (index.html)
     ========================================================================== */
  function initIndexPage() {
    const btnStart = document.getElementById('btn-start-quiz');
    const btnTestPopup = document.getElementById('btn-test-popup');
    const popupAlert = document.getElementById('popup-blocked-alert');
    const popupIndicator = document.getElementById('popup-status-indicator');
    const popupStatusText = document.getElementById('popup-status-text');

    // Comprobador activo de ventanas emergentes
    function testPopupCapability(silent = false) {
      let isAllowed = false;
      let testWin = null;

      try {
        // Se intenta abrir una pequeña ventana emergente
        testWin = window.open(
          'about:blank',
          '_blank',
          'width=100,height=100,left=9999,top=9999,toolbar=no,menubar=no'
        );

        if (testWin && !testWin.closed && typeof testWin.closed !== 'undefined') {
          isAllowed = true;
          testWin.close();
        }
      } catch (e) {
        isAllowed = false;
      }

      if (popupIndicator && popupStatusText) {
        if (isAllowed) {
          popupIndicator.className = 'status-dot dot-success';
          popupStatusText.textContent = 'Ventanas emergentes permitidas en este dominio';
          popupStatusText.style.color = 'var(--moodle-success)';
          if (popupAlert) popupAlert.classList.remove('active');
        } else {
          popupIndicator.className = 'status-dot dot-danger';
          popupStatusText.textContent = 'Ventanas emergentes BLOQUEADAS por el navegador';
          popupStatusText.style.color = 'var(--moodle-danger)';
          if (!silent && popupAlert) {
            popupAlert.classList.add('active');
            popupAlert.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }

      return isAllowed;
    }

    if (btnTestPopup) {
      btnTestPopup.addEventListener('click', (e) => {
        e.preventDefault();
        testPopupCapability(false);
      });
    }

    // Botón oficial de Moodle: "Intentar resolver el cuestionario"
    if (btnStart) {
      btnStart.addEventListener('click', (e) => {
        e.preventDefault();

        // Parámetros exactos que utiliza Moodle para "Ventana emergente a pantalla completa con alguna seguridad JavaScript"
        const screenWidth = screen.availWidth;
        const screenHeight = screen.availHeight;
        const windowFeatures = [
          `width=${screenWidth}`,
          `height=${screenHeight}`,
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

        let examPopup = null;

        try {
          examPopup = window.open('./exam.html', 'MoodleQuizPopup', windowFeatures);
        } catch (err) {
          examPopup = null;
        }

        // Detección rigurosa de bloqueo de ventanas emergentes
        if (
          !examPopup ||
          examPopup.closed ||
          typeof examPopup.closed === 'undefined'
        ) {
          if (popupAlert) {
            popupAlert.classList.add('active');
            popupAlert.scrollIntoView({ behavior: 'smooth' });
          }
          if (popupIndicator && popupStatusText) {
            popupIndicator.className = 'status-dot dot-danger';
            popupStatusText.textContent = 'Ventanas emergentes BLOQUEADAS al intentar abrir el examen';
            popupStatusText.style.color = 'var(--moodle-danger)';
          }
        } else {
          // Ventana emergente permitida exitosamente
          if (popupAlert) {
            popupAlert.classList.remove('active');
          }
          if (popupIndicator && popupStatusText) {
            popupIndicator.className = 'status-dot dot-success';
            popupStatusText.textContent = 'Ventana emergente lanzada con éxito';
            popupStatusText.style.color = 'var(--moodle-success)';
          }
          examPopup.focus();
        }
      });
    }

    // Botón para cerrar la alerta de pop-up bloqueado
    const btnDismissAlert = document.getElementById('btn-dismiss-alert');
    if (btnDismissAlert && popupAlert) {
      btnDismissAlert.addEventListener('click', () => {
        popupAlert.classList.remove('active');
      });
    }
  }

  /* ==========================================================================
     2. LÓGICA DE LA VENTANA DE EXAMEN (exam.html)
     ========================================================================== */
  function initExamPage() {
    // Estado de la telemetría
    const state = {
      blurCount: 0,
      visibilityChanges: 0,
      blockedShortcuts: 0,
      blockedContextMenu: 0,
      blockedSelects: 0,
      isWindowFocused: document.hasFocus(),
      timerSeconds: 15 * 60, // 15 minutos
      timerInterval: null,
      isEnded: false
    };

    // Referencias del DOM de telemetría y HUD
    const dom = {
      dock: document.getElementById('telemetry-dock'),
      dockToggle: document.getElementById('telemetry-toggle'),
      console: document.getElementById('telemetry-console'),
      btnClearConsole: document.getElementById('btn-clear-console'),
      statBlur: document.getElementById('stat-blur-count'),
      statVisibility: document.getElementById('stat-vis-count'),
      statShortcuts: document.getElementById('stat-shortcuts-count'),
      statContext: document.getElementById('stat-context-count'),
      pillFocus: document.getElementById('pill-focus-status'),
      pillVisibility: document.getElementById('pill-vis-status'),
      pillScreen: document.getElementById('pill-screen-status'),
      timerDisplay: document.getElementById('quiz-timer-display'),
      toastContainer: document.getElementById('toast-container'),
      btnEndQuiz: document.getElementById('btn-finish-attempt'),
      btnConfirmClose: document.getElementById('btn-confirm-close'),
      btnCancelClose: document.getElementById('btn-cancel-close'),
      modalClose: document.getElementById('modal-finish-quiz'),
      btnFullscreen: document.getElementById('btn-request-fullscreen')
    };

    // Formatear marca de tiempo precisa [HH:MM:SS.mmm]
    function getTimestamp() {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      const ms = String(now.getMilliseconds()).padStart(3, '0');
      return `[${h}:${m}:${s}.${ms}]`;
    }

    // Agregar entrada a la consola de telemetría
    function logEvent(message, type = 'info') {
      if (!dom.console) return;

      const entry = document.createElement('div');
      entry.className = 'log-entry';

      const timeSpan = document.createElement('span');
      timeSpan.className = 'log-time';
      timeSpan.textContent = getTimestamp();

      const textSpan = document.createElement('span');
      textSpan.className = `log-type-${type}`;
      textSpan.innerHTML = message;

      entry.appendChild(timeSpan);
      entry.appendChild(textSpan);
      dom.console.appendChild(entry);

      // Auto scroll hacia el último mensaje
      dom.console.scrollTop = dom.console.scrollHeight;
    }

    // Mostrar notificación flotante (toast no intrusivo)
    function showToast(message, type = 'warning') {
      if (!dom.toastContainer) return;

      const toast = document.createElement('div');
      toast.className = `security-toast toast-${type}`;
      toast.innerHTML = `<span>⚠️</span> <span>${message}</span>`;
      dom.toastContainer.appendChild(toast);

      // Animación de entrada
      requestAnimationFrame(() => {
        toast.classList.add('show');
      });

      // Retirar tras 2.8 segundos
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }, 2800);
    }

    // Actualizar badges e indicadores del HUD
    function updateHUD() {
      // Estado de foco
      state.isWindowFocused = document.hasFocus();
      if (dom.pillFocus) {
        if (state.isWindowFocused) {
          dom.pillFocus.className = 'telemetry-pill pill-active';
          dom.pillFocus.innerHTML = '● Foco ACTIVO';
        } else {
          dom.pillFocus.className = 'telemetry-pill pill-lost';
          dom.pillFocus.innerHTML = '● Foco PERDIDO';
        }
      }

      // Estado de visibilidad
      if (dom.pillVisibility) {
        const isHidden = document.visibilityState === 'hidden';
        if (isHidden) {
          dom.pillVisibility.className = 'telemetry-pill pill-lost';
          dom.pillVisibility.innerHTML = '👁️ Oculto (hidden)';
        } else {
          dom.pillVisibility.className = 'telemetry-pill pill-active';
          dom.pillVisibility.innerHTML = '👁️ Visible';
        }
      }

      // Contadores
      if (dom.statBlur) dom.statBlur.textContent = state.blurCount;
      if (dom.statVisibility) dom.statVisibility.textContent = state.visibilityChanges;
      if (dom.statShortcuts) dom.statShortcuts.textContent = state.blockedShortcuts;
      if (dom.statContext) dom.statContext.textContent = state.blockedContextMenu;
    }

    // Detección de pantallas múltiples (API window.screen.isExtended)
    function detectMultiScreen() {
      if (!dom.pillScreen) return;

      if ('isExtended' in window.screen) {
        const isExtended = window.screen.isExtended;
        if (isExtended) {
          dom.pillScreen.className = 'telemetry-pill pill-lost';
          dom.pillScreen.innerHTML = '🖥️🖥️ Multimonitor detectado';
          logEvent('🖥️ Se detectó configuración de pantalla extendida (múltiples monitores).', 'visibility');
        } else {
          dom.pillScreen.className = 'telemetry-pill pill-active';
          dom.pillScreen.innerHTML = '🖥️ Monitor único';
        }
      } else {
        // Fallback para navegadores sin Window Management API
        const wide = window.screen.availWidth > 2560 || window.screen.width > 2560;
        dom.pillScreen.className = 'telemetry-pill pill-active';
        dom.pillScreen.innerHTML = wide ? '🖥️ Monitor UltraWide' : '🖥️ Monitor Estándar';
      }
    }

    /* --------------------------------------------------------------------------
       RESTRICCIONES JAVASCRIPT NATIVAS DE MOODLE
       -------------------------------------------------------------------------- */

    // 1. Bloquear menú contextual (clic derecho)
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      state.blockedContextMenu++;
      updateHUD();
      showToast('El menú contextual (clic derecho) ha sido deshabilitado en este cuestionario.', 'danger');
      logEvent('🚫 <strong>contextmenu</strong>: Intento de clic secundario bloqueado.', 'security');
    });

    // 2. Bloquear selección de texto mediante selectstart
    document.addEventListener('selectstart', (e) => {
      // Permitir si se trata de un input o textarea editable legítimo, aunque en este examen no hay
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        state.blockedSelects++;
        // No inundar con toasts continuos de selección, registrar en log
        if (state.blockedSelects % 5 === 1) {
          showToast('La selección de texto está bloqueada en la ventana segura.', 'warning');
          logEvent('🚫 <strong>selectstart</strong>: Selección de texto prevenida.', 'security');
        }
      }
    });

    // 3. Bloquear arrastre de elementos
    document.addEventListener('dragstart', (e) => {
      e.preventDefault();
    });

    // 4. Interceptar y bloquear atajos de teclado
    document.addEventListener('keydown', (e) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // Teclas de función (F12, F11, etc.)
      const isF12 = e.key === 'F12';
      const isDevToolsCombo = isCtrlOrCmd && e.shiftKey && (key === 'i' || key === 'j' || key === 'c');
      const isClipboardCopy = isCtrlOrCmd && key === 'c';
      const isClipboardCut = isCtrlOrCmd && key === 'x';
      const isClipboardPaste = isCtrlOrCmd && key === 'v';
      const isSelectAll = isCtrlOrCmd && key === 'a';
      const isViewSource = isCtrlOrCmd && key === 'u';
      const isSavePage = isCtrlOrCmd && key === 's';
      const isPrintPage = isCtrlOrCmd && key === 'p';

      if (
        isF12 ||
        isDevToolsCombo ||
        isClipboardCopy ||
        isClipboardCut ||
        isClipboardPaste ||
        isSelectAll ||
        isViewSource ||
        isSavePage ||
        isPrintPage
      ) {
        e.preventDefault();
        e.stopPropagation();

        state.blockedShortcuts++;
        updateHUD();

        let label = 'Atajo';
        if (isF12) label = 'F12 (Herramientas de Desarrollador)';
        else if (isDevToolsCombo) label = 'Ctrl+Shift+I/J/C (Inspeccionar Elemento)';
        else if (isClipboardCopy) label = 'Ctrl+C (Copiar)';
        else if (isClipboardCut) label = 'Ctrl+X (Cortar)';
        else if (isClipboardPaste) label = 'Ctrl+V (Pegar)';
        else if (isSelectAll) label = 'Ctrl+A (Seleccionar todo)';
        else if (isViewSource) label = 'Ctrl+U (Ver código fuente)';
        else if (isSavePage) label = 'Ctrl+S (Guardar página)';
        else if (isPrintPage) label = 'Ctrl+P (Imprimir)';

        showToast(`El atajo <strong>${label}</strong> ha sido bloqueado por seguridad.`, 'danger');
        logEvent(`🚫 <strong>keydown</strong>: Atajo bloqueado: <code>${label}</code>`, 'security');
      }
    });

    /* --------------------------------------------------------------------------
       TELEMETRÍA: EVENTOS DE FOCO Y VISIBILIDAD
       -------------------------------------------------------------------------- */

    // Pérdida de foco de la ventana (window.blur)
    window.addEventListener('blur', () => {
      state.blurCount++;
      updateHUD();
      logEvent('🔴 <strong>window.blur</strong>: La ventana perdió el foco (posible cambio de pestaña, app o clic en segundo monitor).', 'blur');
    });

    // Recuperación de foco de la ventana (window.focus)
    window.addEventListener('focus', () => {
      updateHUD();
      logEvent('🟢 <strong>window.focus</strong>: La ventana recuperó el foco activo.', 'focus');
    });

    // Cambio en la visibilidad del documento (visibilitychange)
    document.addEventListener('visibilitychange', () => {
      state.visibilityChanges++;
      updateHUD();
      if (document.visibilityState === 'hidden') {
        logEvent(`👁️ <strong>visibilitychange</strong>: El documento pasó a estado <code>hidden</code> (pestaña minimizada o tapada).`, 'visibility');
      } else {
        logEvent(`👁️ <strong>visibilitychange</strong>: El documento pasó a estado <code>visible</code>.`, 'visibility');
      }
    });

    // Interacción de pantalla completa
    if (dom.btnFullscreen) {
      dom.btnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().then(() => {
            logEvent('🖥️ Modo pantalla completa activado por el usuario.', 'info');
          }).catch(err => {
            logEvent(`⚠️ Falló solicitud de pantalla completa: ${err.message}`, 'security');
          });
        } else {
          document.exitFullscreen();
        }
      });
    }

    // Toggle colapsar/expandir dock de telemetría
    if (dom.dockToggle && dom.dock) {
      dom.dockToggle.addEventListener('click', () => {
        dom.dock.classList.toggle('minimized');
        const icon = dom.dockToggle.querySelector('.toggle-icon');
        if (icon) {
          icon.textContent = dom.dock.classList.contains('minimized') ? '▲' : '▼';
        }
      });
    }

    // Botón limpiar consola
    if (dom.btnClearConsole && dom.console) {
      dom.btnClearConsole.addEventListener('click', () => {
        dom.console.innerHTML = '';
        logEvent('🧹 Consola de eventos reiniciada.', 'info');
      });
    }

    /* --------------------------------------------------------------------------
       TEMPORIZADOR REGRESIVO (15:00)
       -------------------------------------------------------------------------- */
    function startTimer() {
      function renderTimer() {
        const mins = Math.floor(state.timerSeconds / 60);
        const secs = state.timerSeconds % 60;
        const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        if (dom.timerDisplay) {
          dom.timerDisplay.textContent = timeStr;
          if (state.timerSeconds <= 120) {
            dom.timerDisplay.parentElement.classList.add('urgent');
          }
        }

        if (state.timerSeconds <= 0) {
          clearInterval(state.timerInterval);
          logEvent('⏱️ <strong>Tiempo agotado</strong>: El examen ha concluido.', 'blur');
          showToast('¡El tiempo del examen ha finalizado!', 'danger');
          openFinishModal(true);
        } else {
          state.timerSeconds--;
        }
      }

      renderTimer();
      state.timerInterval = setInterval(renderTimer, 1000);
    }

    /* --------------------------------------------------------------------------
       GESTIÓN DE PREGUNTAS Y NAVEGACIÓN
       -------------------------------------------------------------------------- */
    // Marcar como respondida al hacer clic en un radio
    const radioInputs = document.querySelectorAll('.que input[type="radio"]');
    radioInputs.forEach(radio => {
      radio.addEventListener('change', () => {
        const questionCard = radio.closest('.que');
        if (!questionCard) return;

        const qId = questionCard.getAttribute('data-question-id');
        const statusLabel = questionCard.querySelector('.status');
        if (statusLabel) {
          statusLabel.textContent = 'Respuesta guardada';
          statusLabel.style.color = '#155724';
          statusLabel.style.fontWeight = '600';
        }

        // Actualizar botón de navegación
        const navButton = document.getElementById(`nav-btn-q${qId}`);
        if (navButton) {
          navButton.classList.add('answered');
        }

        logEvent(`✏️ Pregunta ${qId}: Respuesta registrada.`, 'info');
      });
    });

    // Alternar bandera de señalización en preguntas
    const flagButtons = document.querySelectorAll('.flag-toggle');
    flagButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const questionCard = btn.closest('.que');
        const qId = questionCard ? questionCard.getAttribute('data-question-id') : null;
        const isFlagged = btn.classList.toggle('flagged');
        const flagText = btn.querySelector('.flag-text');

        if (flagText) {
          flagText.textContent = isFlagged ? 'Quitar señalización' : 'Señalar con bandera';
        }

        if (qId) {
          const navButton = document.getElementById(`nav-btn-q${qId}`);
          if (navButton) {
            navButton.classList.toggle('flagged', isFlagged);
          }
        }
      });
    });

    /* --------------------------------------------------------------------------
       MODAL DE FINALIZACIÓN Y CIERRE DE VENTANA
       -------------------------------------------------------------------------- */
    function openFinishModal(isTimeout = false) {
      if (!dom.modalClose) return;

      const titleElem = document.getElementById('modal-finish-title');
      const statsElem = document.getElementById('modal-finish-stats');

      if (titleElem) {
        titleElem.textContent = isTimeout ? 'Tiempo concluido' : 'Finalizar intento';
      }

      if (statsElem) {
        const answeredCount = document.querySelectorAll('.qnbutton.answered').length;
        statsElem.innerHTML = `
          <ul style="list-style-type: none; padding-left: 0; margin-top: 0.5rem; font-size: 0.9rem;">
            <li>📝 <strong>Preguntas respondidas:</strong> ${answeredCount} de 3</li>
            <li>🔴 <strong>Pérdidas de foco registradas (blur):</strong> ${state.blurCount}</li>
            <li>👁️ <strong>Cambios de visibilidad:</strong> ${state.visibilityChanges}</li>
            <li>🚫 <strong>Atajos bloqueados interceptados:</strong> ${state.blockedShortcuts}</li>
            <li>🖱️ <strong>Intentos de clic derecho bloqueados:</strong> ${state.blockedContextMenu}</li>
          </ul>
        `;
      }

      dom.modalClose.classList.add('active');
    }

    if (dom.btnEndQuiz) {
      dom.btnEndQuiz.addEventListener('click', (e) => {
        e.preventDefault();
        openFinishModal(false);
      });
    }

    if (dom.btnCancelClose && dom.modalClose) {
      dom.btnCancelClose.addEventListener('click', () => {
        dom.modalClose.classList.remove('active');
      });
    }

    // Botón definitivo: Finalizar intento y cerrar ventana
    if (dom.btnConfirmClose) {
      dom.btnConfirmClose.addEventListener('click', () => {
        clearInterval(state.timerInterval);
        logEvent('🚪 Cerrando ventana emergente de examen (window.close)...', 'info');
        window.close();
      });
    }

    // Inicializaciones al cargar la página de examen
    startTimer();
    detectMultiScreen();
    updateHUD();
    logEvent('🚀 <strong>Sesión de examen iniciada</strong> en ventana emergente con seguridad JavaScript.', 'info');
    logEvent(`ℹ️ Resolución actual disponible: ${screen.availWidth}x${screen.availHeight}px.`, 'info');
  }
})();
