/**
 * Moodle Quiz Security Simulator - app.js
 * Vanilla JavaScript puro sin dependencias externas
 * Compatible con GitHub Pages y navegadores modernos
 */

(function () {
  'use strict';

  // Detección del contexto por el ID del body
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('moodle-student-page')) {
      initStudentPortal();
    } else if (document.getElementById('moodle-advanced-page') || document.getElementById('moodle-index-page')) {
      initAdvancedPortal();
    } else if (document.getElementById('moodle-exam-page')) {
      initStudentExam();
    } else if (document.getElementById('moodle-exam-advanced-page')) {
      initAdvancedExam();
    }
  });

  /* ==========================================================================
     1. PORTAL SIMPLIFICADO PARA ESTUDIANTES (index.html)
     ========================================================================== */
  function initStudentPortal() {
    const btnTest = document.getElementById('btn-test-student');
    const successBanner = document.getElementById('student-success-banner');
    const blockedCard = document.getElementById('student-blocked-card');
    const btnDismiss = document.getElementById('btn-dismiss-student-alert');

    if (btnDismiss && blockedCard) {
      btnDismiss.addEventListener('click', () => {
        blockedCard.classList.remove('active');
      });
    }

    if (btnTest) {
      btnTest.addEventListener('click', (e) => {
        e.preventDefault();

        // Parámetros oficiales de Moodle para pop-up seguro
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

        let testWindow = null;

        try {
          testWindow = window.open('./exam.html', 'MoodleQuizPopup', windowFeatures);
        } catch (err) {
          testWindow = null;
        }

        // Detección de bloqueo de ventanas emergentes
        if (
          !testWindow ||
          testWindow.closed ||
          typeof testWindow.closed === 'undefined'
        ) {
          // Bloqueada por el navegador
          if (successBanner) successBanner.classList.remove('active');
          if (blockedCard) {
            blockedCard.classList.add('active');
            blockedCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        } else {
          // Abierta con éxito
          if (blockedCard) blockedCard.classList.remove('active');
          if (successBanner) successBanner.classList.add('active');
          testWindow.focus();
        }
      });
    }
  }

  /* ==========================================================================
     2. PORTAL TÉCNICO AVANZADO (advanced.html)
     ========================================================================== */
  function initAdvancedPortal() {
    const btnStart = document.getElementById('btn-start-quiz');
    const btnTestPopup = document.getElementById('btn-test-popup');
    const popupAlert = document.getElementById('popup-blocked-alert');
    const popupIndicator = document.getElementById('popup-status-indicator');
    const popupStatusText = document.getElementById('popup-status-text');

    function testPopupCapability(silent = false) {
      let isAllowed = false;
      let testWin = null;

      try {
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

    if (btnStart) {
      btnStart.addEventListener('click', (e) => {
        e.preventDefault();

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
          examPopup = window.open('./exam-advanced.html', 'MoodleQuizPopupAdvanced', windowFeatures);
        } catch (err) {
          examPopup = null;
        }

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
          if (popupAlert) popupAlert.classList.remove('active');
          if (popupIndicator && popupStatusText) {
            popupIndicator.className = 'status-dot dot-success';
            popupStatusText.textContent = 'Ventana emergente lanzada con éxito';
            popupStatusText.style.color = 'var(--moodle-success)';
          }
          examPopup.focus();
        }
      });
    }

    const btnDismissAlert = document.getElementById('btn-dismiss-alert');
    if (btnDismissAlert && popupAlert) {
      btnDismissAlert.addEventListener('click', () => {
        popupAlert.classList.remove('active');
      });
    }
  }

  /* ==========================================================================
     3. VENTANA DE PRUEBA AMIGABLE PARA ESTUDIANTES (exam.html)
     ========================================================================== */
  function initStudentExam() {
    const dock = document.getElementById('telemetry-dock');
    const dockToggle = document.getElementById('telemetry-toggle');
    const consoleElem = document.getElementById('telemetry-console');
    const btnFullscreen = document.getElementById('btn-request-fullscreen');

    // Asegurarse de que el dock inicie minimizado para no tapar la pantalla
    if (dock) {
      dock.classList.add('minimized');
    }

    if (dockToggle && dock) {
      dockToggle.addEventListener('click', () => {
        dock.classList.toggle('minimized');
        const icon = dockToggle.querySelector('.toggle-icon');
        if (icon) {
          icon.textContent = dock.classList.contains('minimized') ? '▲' : '▼';
        }
      });
    }

    // Pantalla completa opcional
    if (btnFullscreen) {
      btnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen();
        }
      });
    }

    // Registro sutil en consola técnica sin toasts estresantes
    function logEvent(msg) {
      if (!consoleElem) return;
      const entry = document.createElement('div');
      entry.className = 'log-entry';
      entry.innerHTML = `<span class="log-time">[${new Date().toLocaleTimeString()}]</span> <span>${msg}</span>`;
      consoleElem.appendChild(entry);
    }

    window.addEventListener('blur', () => {
      const statBlur = document.getElementById('stat-blur-count');
      if (statBlur) statBlur.textContent = parseInt(statBlur.textContent || '0', 10) + 1;
      logEvent('Ventana perdió el foco (blur)');
    });

    window.addEventListener('focus', () => {
      logEvent('Ventana recuperó el foco');
    });

    logEvent('Ventana de prueba iniciada con éxito');
  }

  /* ==========================================================================
     4. VENTANA TÉCNICA AVANZADA (exam-advanced.html)
     ========================================================================== */
  function initAdvancedExam() {
    const state = {
      blurCount: 0,
      visibilityChanges: 0,
      blockedShortcuts: 0,
      blockedContextMenu: 0,
      blockedSelects: 0,
      isWindowFocused: document.hasFocus(),
      timerSeconds: 15 * 60,
      timerInterval: null
    };

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

    function getTimestamp() {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      const ms = String(now.getMilliseconds()).padStart(3, '0');
      return `[${h}:${m}:${s}.${ms}]`;
    }

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
      dom.console.scrollTop = dom.console.scrollHeight;
    }

    function showToast(message, type = 'warning') {
      if (!dom.toastContainer) return;
      const toast = document.createElement('div');
      toast.className = `security-toast toast-${type}`;
      toast.innerHTML = `<span>⚠️</span> <span>${message}</span>`;
      dom.toastContainer.appendChild(toast);
      requestAnimationFrame(() => toast.classList.add('show'));
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }, 2800);
    }

    function updateHUD() {
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

      if (dom.statBlur) dom.statBlur.textContent = state.blurCount;
      if (dom.statVisibility) dom.statVisibility.textContent = state.visibilityChanges;
      if (dom.statShortcuts) dom.statShortcuts.textContent = state.blockedShortcuts;
      if (dom.statContext) dom.statContext.textContent = state.blockedContextMenu;
    }

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
        const wide = window.screen.availWidth > 2560 || window.screen.width > 2560;
        dom.pillScreen.className = 'telemetry-pill pill-active';
        dom.pillScreen.innerHTML = wide ? '🖥️ Monitor UltraWide' : '🖥️ Monitor Estándar';
      }
    }

    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      state.blockedContextMenu++;
      updateHUD();
      showToast('El menú contextual (clic derecho) está deshabilitado en este cuestionario.', 'danger');
      logEvent('🚫 <strong>contextmenu</strong>: Intento de clic secundario bloqueado.', 'security');
    });

    document.addEventListener('selectstart', (e) => {
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        state.blockedSelects++;
        if (state.blockedSelects % 5 === 1) {
          showToast('La selección de texto está bloqueada en la ventana segura.', 'warning');
          logEvent('🚫 <strong>selectstart</strong>: Selección de texto prevenida.', 'security');
        }
      }
    });

    document.addEventListener('dragstart', (e) => {
      e.preventDefault();
    });

    document.addEventListener('keydown', (e) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

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
        else if (isDevToolsCombo) label = 'Ctrl+Shift+I/J/C (Inspeccionar)';
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

    window.addEventListener('blur', () => {
      state.blurCount++;
      updateHUD();
      logEvent('🔴 <strong>window.blur</strong>: La ventana perdió el foco.', 'blur');
    });

    window.addEventListener('focus', () => {
      updateHUD();
      logEvent('🟢 <strong>window.focus</strong>: La ventana recuperó el foco activo.', 'focus');
    });

    document.addEventListener('visibilitychange', () => {
      state.visibilityChanges++;
      updateHUD();
      if (document.visibilityState === 'hidden') {
        logEvent('👁️ <strong>visibilitychange</strong>: El documento pasó a <code>hidden</code>.', 'visibility');
      } else {
        logEvent('👁️ <strong>visibilitychange</strong>: El documento pasó a <code>visible</code>.', 'visibility');
      }
    });

    if (dom.btnFullscreen) {
      dom.btnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().then(() => {
            logEvent('🖥️ Modo pantalla completa activado.', 'info');
          }).catch(err => {
            logEvent(`⚠️ Error al solicitar pantalla completa: ${err.message}`, 'security');
          });
        } else {
          document.exitFullscreen();
        }
      });
    }

    if (dom.dockToggle && dom.dock) {
      dom.dockToggle.addEventListener('click', () => {
        dom.dock.classList.toggle('minimized');
        const icon = dom.dockToggle.querySelector('.toggle-icon');
        if (icon) {
          icon.textContent = dom.dock.classList.contains('minimized') ? '▲' : '▼';
        }
      });
    }

    if (dom.btnClearConsole && dom.console) {
      dom.btnClearConsole.addEventListener('click', () => {
        dom.console.innerHTML = '';
        logEvent('🧹 Consola de eventos reiniciada.', 'info');
      });
    }

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
        } else {
          state.timerSeconds--;
        }
      }

      renderTimer();
      state.timerInterval = setInterval(renderTimer, 1000);
    }

    function openFinishModal() {
      if (!dom.modalClose) return;
      const statsElem = document.getElementById('modal-finish-stats');
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
        openFinishModal();
      });
    }

    if (dom.btnCancelClose && dom.modalClose) {
      dom.btnCancelClose.addEventListener('click', () => {
        dom.modalClose.classList.remove('active');
      });
    }

    if (dom.btnConfirmClose) {
      dom.btnConfirmClose.addEventListener('click', () => {
        clearInterval(state.timerInterval);
        window.close();
      });
    }

    startTimer();
    detectMultiScreen();
    updateHUD();
    logEvent('🚀 <strong>Sesión de examen avanzada iniciada</strong>.', 'info');
  }
})();
