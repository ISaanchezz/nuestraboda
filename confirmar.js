        // Modo día / noche automático también en la página de confirmación
        (function autoNightModeConfirm() {
            const now = new Date();
            const hour = now.getHours();
            if (hour >= 20 || hour < 8) {
                document.body.classList.add('night-mode');
            }
        })();

        function personalizeGuestConfirm() {
            const params = new URLSearchParams(window.location.search);
            const guest = params.get('invitado');

            if (!guest) return;

            const decodedName = decodeURIComponent(guest);

            const input = document.getElementById('guest-input');
            if (input) {
                input.value = decodedName;
                input.style.backgroundColor = "#f5f5f5";
                input.style.fontWeight = "bold";
            }

            const title = document.getElementById('confirm-title');
            if (title) {
                title.textContent = `📝 Confirmar asistencia de ${decodedName}`;
            }

            const submitBtn = document.getElementById('submit-btn');
            if (submitBtn) {
                submitBtn.textContent = `Confirmar asistencia, ${decodedName}`;
            }
        }

        function getInviteStorageKey() {
            try {
                const params = new URLSearchParams(window.location.search);
                const invitado = params.get('invitado');
                if (invitado) {
                    return 'formSubmitted_invitado_' + invitado;
                }
                const input = document.getElementById('guest-input');
                if (input && input.value.trim()) {
                    return 'formSubmitted_nombre_' + input.value.trim().toLowerCase();
                }
            } catch (e) { }
            return null;
        }

        function applyFormSubmittedState() {
            const formEl = document.getElementById('wedding-form');
            const successEl = document.getElementById('success-msg');
            if (!formEl || !successEl) return;

            const key = getInviteStorageKey();
            if (!key) return;

            try {
                if (localStorage.getItem(key) === '1') {
                    formEl.style.display = 'none';
                    successEl.style.display = 'block';
                }
            } catch (e) { }
        }

        function togglePartner() {
            const val = document.getElementById('has-partner').value;
            document.getElementById('partner-details').style.display = (val === 'Sí') ? 'block' : 'none';
        }

        function toggleBusDetails() {
            const select = document.getElementById('bus-select');
            const details = document.getElementById('bus-details');
            if (!select || !details) return;
            details.style.display = (select.value === 'Sí') ? 'block' : 'none';
        }

        function launchFireworks() {
            const container = document.createElement('div');
            container.className = 'fireworks-container';
            document.body.appendChild(container);

            const width = window.innerWidth;
            const height = window.innerHeight;

            const bursts = 4;
            const particlesPerBurst = 25;
            const colors = ['#b59d7e', '#ffffff', '#f9f7f2', '#86a397'];

            for (let i = 0; i < bursts; i++) {
                const centerX = Math.random() * width * 0.8 + width * 0.1;
                const centerY = Math.random() * height * 0.4 + height * 0.1;

                for (let j = 0; j < particlesPerBurst; j++) {
                    const p = document.createElement('div');
                    p.className = 'firework-particle';

                    const angle = (Math.PI * 2 * j) / particlesPerBurst;
                    const distance = 80 + Math.random() * 60;
                    const dx = Math.cos(angle) * distance;
                    const dy = Math.sin(angle) * distance;

                    p.style.left = `${centerX}px`;
                    p.style.top = `${centerY}px`;
                    p.style.setProperty('--dx', `${dx}px`);
                    p.style.setProperty('--dy', `${dy}px`);
                    p.style.backgroundColor = colors[(i + j) % colors.length];

                    container.appendChild(p);
                }
            }

            setTimeout(() => {
                container.remove();
            }, 1500);
        }

        function isMobileDevice() {
            const ua = navigator.userAgent || '';
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
        }

        function softVibrate() {
            if (!('vibrate' in navigator)) return;
            if (!isMobileDevice()) return;
            navigator.vibrate(40);
        }

        function showCheckAnimation() {
            const overlay = document.createElement('div');
            overlay.className = 'check-overlay';
            overlay.innerHTML = `
                <div class="check-card">
                    <div class="check-circle">✔</div>
                    <div class="check-text">Confirmación enviada</div>
                </div>
            `;

            document.body.appendChild(overlay);

            requestAnimationFrame(() => {
                overlay.classList.add('show');
            });

            setTimeout(() => {
                overlay.classList.remove('show');
                setTimeout(() => overlay.remove(), 250);
            }, 1500);
        }

        function setupFormSubmit() {
            const form = document.getElementById('wedding-form');
            if (!form) return;

            const scriptURL = 'https://script.google.com/macros/s/AKfycbwMOYv9vtDvTXGz30hq0le7UASZDyEEvy8ndIP2l4bglntfgIqhwogcP2ksH5OB7HTtnA/exec';

            form.addEventListener('submit', e => {
                e.preventDefault();
                const btn = document.getElementById('submit-btn');
                if (btn) {
                    btn.disabled = true;
                    btn.innerText = "Guardando...";
                }

                const formData = new FormData(form);
                const preferences = formData.getAll('Preferencia').join(', ');
                formData.set('Preferencia', preferences);

                fetch(scriptURL, { method: 'POST', body: formData })
                    .then(() => {
                        softVibrate();
                        launchFireworks();
                        showCheckAnimation();
                        form.style.display = 'none';
                        document.getElementById('success-msg').style.display = 'block';
                        try {
                            const key = getInviteStorageKey();
                            if (key) {
                                localStorage.setItem(key, '1');
                            }
                        } catch (e) { }
                    })
                    .catch(() => {
                        alert('Error al enviar. Inténtalo de nuevo.');
                        if (btn) {
                            btn.disabled = false;
                            btn.innerText = "ENVIAR CONFIRMACIÓN";
                        }
                    });
            });
        }

        // Barra de progreso de scroll (misma que en la landing)
        (function setupScrollProgressConfirm() {
            const bar = document.getElementById('scroll-progress-bar');
            if (!bar) return;

            function update() {
                const doc = document.documentElement;
                const scrollTop = window.pageYOffset || doc.scrollTop || 0;
                const scrollHeight = doc.scrollHeight - doc.clientHeight;
                const ratio = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
                bar.style.width = `${Math.min(100, Math.max(0, ratio * 100))}%`;
            }

            window.addEventListener('scroll', update, { passive: true });
            window.addEventListener('resize', update);
            window.addEventListener('load', update);
        })();

        window.addEventListener('load', () => {
            personalizeGuestConfirm();
            applyFormSubmittedState();
            setupFormSubmit();
        });

