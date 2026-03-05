        // Navegación flotante: toggle móvil + scroll suave + enlace activo
        (function setupLandingNav() {
            const nav = document.querySelector('.landing-nav');
            if (!nav) return;

            const toggle = nav.querySelector('.nav-toggle');
            const links = Array.from(nav.querySelectorAll('[data-scroll]'));

            // Toggle en móvil
            if (toggle) {
                toggle.addEventListener('click', () => {
                    nav.classList.toggle('open');
                });
            }

            // Scroll suave controlado
            links.forEach(link => {
                link.addEventListener('click', e => {
                    e.preventDefault();
                    const targetId = link.getAttribute('href').replace('#', '');
                    const target = document.getElementById(targetId);
                    if (!target) return;

                    nav.classList.remove('open');
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                });
            });

            // Resaltar enlace activo según sección visible
            const sections = links
                .map(link => {
                    const id = link.getAttribute('href').replace('#', '');
                    const el = document.getElementById(id);
                    return el ? { el, link } : null;
                })
                .filter(Boolean);

            if (!('IntersectionObserver' in window)) return;

            const observer = new IntersectionObserver(
                entries => {
                    entries.forEach(entry => {
                        if (!entry.isIntersecting) return;
                        const match = sections.find(s => s.el === entry.target);
                        if (!match) return;
                        links.forEach(l => l.classList.remove('is-active'));
                        match.link.classList.add('is-active');
                    });
                },
                { threshold: 0.4 }
            );

            sections.forEach(({ el }) => observer.observe(el));
        })();

        AOS.init({ duration: 1000, once: true });

        // Si venimos de la página de mesas, saltar animación del sobre y mostrar directamente el contenido
        (function skipEnvelopeIfComingFromTables() {
            try {
                const shouldSkip = localStorage.getItem('skipEnvelopeOnce') === '1';
                if (!shouldSkip) return;
                localStorage.removeItem('skipEnvelopeOnce');
            } catch (err) {
                return;
            }

            const wrapper = document.getElementById('wrapper');
            const content = document.getElementById('main-content');
            if (!wrapper || !content) return;

            wrapper.classList.add('hidden');
            content.style.display = 'block';
            content.style.opacity = '1';

            const floatingBtn = document.getElementById('floating-confirm-btn');
            if (floatingBtn && window.innerWidth <= 768) {
                floatingBtn.style.display = 'block';
            }
        })();

        // Modo día / noche automático (según hora local del visitante)
        (function autoNightMode() {
            const now = new Date();
            const hour = now.getHours();
            // Noche aproximada: de 20:00 a 7:59
            if (hour >= 20 || hour < 8) {
                document.body.classList.add('night-mode');
            }
        })();

        /* === Reveal Scroll Effect (Nuestra Historia) === */
        function revealOnScroll() {
            const reveals = document.querySelectorAll('.reveal-left, .reveal-right');

            reveals.forEach(element => {
                const windowHeight = window.innerHeight;
                const elementTop = element.getBoundingClientRect().top;

                if (elementTop < windowHeight - 100) {
                    element.classList.add('reveal-active');
                }
            });
        }

        window.addEventListener('scroll', revealOnScroll);
        window.addEventListener('load', revealOnScroll);

        function personalizeGuestLanding() {
            const params = new URLSearchParams(window.location.search);
            const guest = params.get('invitado');

            if (guest) {
                const decodedName = decodeURIComponent(guest);

                const seal = document.getElementById('envelope-seal');
                if (seal) {
                    const shortName = decodedName.length > 12
                        ? decodedName.substring(0, 12) + "…"
                        : decodedName;

                    seal.textContent = shortName;
                }

                const cardTitle = document.getElementById('card-invitation-title');
                if (cardTitle) {
                    cardTitle.textContent = `${decodedName}, nos casamos 💚`;
                }

                const mainHeader = document.querySelector('#main-content header h1');
                if (mainHeader) {
                    mainHeader.textContent = `${decodedName}, queremos celebrar contigo 💚`;
                }

                const floatingBtn = document.getElementById('floating-confirm-btn');
                if (floatingBtn) {
                    floatingBtn.textContent = `Confirmar asistencia, ${decodedName}`;
                }
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

        function updateLandingConfirmButtonFromStorage() {
            const cta = document.getElementById('landing-confirm-btn');
            if (!cta) return;

            const key = getInviteStorageKey();
            if (!key) return;

            try {
                if (localStorage.getItem(key) === '1') {
                    cta.textContent = '✔ Asistencia confirmada';
                    cta.classList.add('btn-primary--confirmed');
                }
            } catch (e) { }
        }

        window.addEventListener('load', () => {
            personalizeGuestLanding();
            updateLandingConfirmButtonFromStorage();
        });

        function enableMesasLink() {
            const link = document.getElementById('mesas-link');
            if (!link) return;

            link.classList.remove('btn-disabled');

            const baseHref = 'mesas.html';
            const search = window.location.search;
            const href = search ? baseHref + search : baseHref;

            link.href = href;
            link.textContent = 'Abrir plano de mesas';
        }

        /* Pétalos suaves al hacer scroll (muy sutil) */
        (function setupPetalsOnScroll() {
            const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (reduceMotion) return;

            const layer = document.createElement('div');
            layer.className = 'petal-layer';
            document.body.appendChild(layer);

            let lastSpawnAt = 0;
            let lastScrollY = window.scrollY || 0;

            function spawnPetal(intensity = 1) {
                const p = document.createElement('div');
                p.className = 'petal';

                const size = 10 + Math.random() * 10; // 10-20px
                const left = Math.random() * 100; // vw
                const drift = (Math.random() * 140 - 70).toFixed(0) + 'px';
                const rot = (Math.random() * 360).toFixed(0) + 'deg';
                const dur = (6.6 + Math.random() * 3.6 + intensity * 0.4).toFixed(2) + 's';
                const opacity = (0.22 + Math.random() * 0.22).toFixed(2);

                p.style.left = left + 'vw';
                p.style.setProperty('--petal-size', size + 'px');
                p.style.setProperty('--petal-drift', drift);
                p.style.setProperty('--petal-rot', rot);
                p.style.setProperty('--petal-dur', dur);
                p.style.setProperty('--petal-opacity', opacity);

                layer.appendChild(p);

                const cleanupMs = Math.ceil(parseFloat(dur) * 1000) + 200;
                setTimeout(() => p.remove(), cleanupMs);
            }

            function onScroll() {
                const now = Date.now();
                const y = window.scrollY || 0;
                const delta = Math.abs(y - lastScrollY);
                lastScrollY = y;

                if (delta < 12) return;
                if (now - lastSpawnAt < 220) return;

                const chance = Math.min(0.22, 0.06 + delta / 900);
                if (Math.random() > chance) return;

                lastSpawnAt = now;
                spawnPetal(delta > 140 ? 2 : 1);
                if (delta > 220 && Math.random() < 0.35) spawnPetal(1);

                const maxPetals = 18;
                while (layer.childElementCount > maxPetals) {
                    layer.firstElementChild?.remove();
                }
            }

            window.addEventListener('scroll', onScroll, { passive: true });
        })();

        // WhatsApp flotante (contactos)
        (function setupWhatsAppFloat() {
            const wrap = document.getElementById('whatsapp-float');
            const panel = document.getElementById('wa-panel');
            const toggle = document.getElementById('wa-toggle');
            const closeBtn = document.getElementById('wa-close');
            if (!wrap || !panel || !toggle || !closeBtn) return;

            function open() {
                wrap.classList.add('open');
                panel.setAttribute('aria-hidden', 'false');
                toggle.setAttribute('aria-label', 'Cerrar contactos de WhatsApp');
                toggle.setAttribute('title', 'Cerrar');
            }

            function close() {
                wrap.classList.remove('open');
                panel.setAttribute('aria-hidden', 'true');
                toggle.setAttribute('aria-label', 'Abrir contactos de WhatsApp');
                toggle.setAttribute('title', 'WhatsApp');
            }

            toggle.addEventListener('click', () => {
                if (wrap.classList.contains('open')) close();
                else open();
            });
            closeBtn.addEventListener('click', close);

            document.addEventListener('keydown', (e) => {
                if (!wrap.classList.contains('open')) return;
                if (e.key === 'Escape') close();
            });

            document.addEventListener('click', (e) => {
                if (!wrap.classList.contains('open')) return;
                const target = e.target;
                if (!(target instanceof Node)) return;
                if (wrap.contains(target)) return;
                close();
            });

            // Arranca abierto solo en pantallas grandes; en móvil se queda cerrado para no molestar
            if (window.innerWidth > 768) {
                open();
            } else {
                close();
            }
        })();

        // Galería (lightbox)
        (function setupGallery() {
            const thumbs = Array.from(document.querySelectorAll('.gallery-thumb'));
            const lightbox = document.getElementById('lightbox');
            if (!thumbs.length || !lightbox) return;

            const imgEl = lightbox.querySelector('.lightbox-img');
            const closeBtn = lightbox.querySelector('.lightbox-close');
            const prevBtn = lightbox.querySelector('.lightbox-prev');
            const nextBtn = lightbox.querySelector('.lightbox-next');

            let currentIndex = 0;

            function openAt(index) {
                currentIndex = (index + thumbs.length) % thumbs.length;
                const full = thumbs[currentIndex].getAttribute('data-full') || '';
                imgEl.src = full;
                lightbox.classList.add('open');
                lightbox.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
            }

            function close() {
                lightbox.classList.remove('open');
                lightbox.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
                imgEl.src = '';
            }

            thumbs.forEach((btn, idx) => {
                btn.addEventListener('click', () => openAt(idx));
            });

            closeBtn.addEventListener('click', close);
            prevBtn.addEventListener('click', () => openAt(currentIndex - 1));
            nextBtn.addEventListener('click', () => openAt(currentIndex + 1));

            // Click fuera de la imagen cierra
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) close();
            });

            // Teclado: ESC cierra, flechas navegan
            document.addEventListener('keydown', (e) => {
                if (!lightbox.classList.contains('open')) return;
                if (e.key === 'Escape') close();
                if (e.key === 'ArrowLeft') openAt(currentIndex - 1);
                if (e.key === 'ArrowRight') openAt(currentIndex + 1);
            });
        })();

        function smartCalendar() {
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            const isAndroid = /Android/.test(navigator.userAgent);

            showCalendarAnimation();

            setTimeout(() => {
                if (isIOS) {
                    window.location.href = "webcal://isaanchezz.github.io/nuestra-boda/boda-ivan-nuria.ics";
                    return;
                }

                if (isAndroid) {
                    const googleUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE" +
                        "&text=Boda+de+Iván+y+Nuria" +
                        "&dates=20270626T130000/20270626T230000" +
                        "&details=Ceremonia:+Ermita+de+Nuestra+Señora+de+los+Remedios.+Banquete:+Finca+La+Cabaña." +
                        "&location=Ermita+Nuestra+Señora+de+los+Remedios";

                    window.open(googleUrl, "_blank");
                    return;
                }

                // Escritorio
                window.location.href = "boda-ivan-nuria.ics";

            }, 900);
        }

        // Ajuste del texto del botón de calendario según el dispositivo
        (function setupCalendarButtonLabel() {
            const btn = document.querySelector('.calendar-btn');
            if (!btn) return;

            const ua = navigator.userAgent || '';
            const isIOS = /iPad|iPhone|iPod/.test(ua);
            const isAndroid = /Android/.test(ua);

            if (isIOS) {
                btn.textContent = '📆 Añadir a Calendario (iPhone)';
            } else if (isAndroid) {
                btn.textContent = '📆 Añadir a Google Calendar';
            } else {
                btn.textContent = '📅 Descargar evento (PC)';
            }
        })();

        function showCalendarAnimation() {
            const overlay = document.createElement('div');
            overlay.className = 'calendar-loading';

            overlay.innerHTML = `
                <div class="calendar-card">
                    <div class="calendar-spinner"></div>
                    <div style="font-family:'Dancing Script'; font-size:1.8rem; color:var(--color-eucalipto);">
                        Preparando tu evento 💚
                    </div>
                    <div style="margin-top:10px; color:#777;">
                        Abriendo calendario...
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            setTimeout(() => overlay.classList.add('show'), 10);

            setTimeout(() => {
                overlay.classList.remove('show');
                setTimeout(() => overlay.remove(), 400);
            }, 1800);
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

        function openEnvelope() {
            const song = document.getElementById('wedding-song');
            song.volume = 0.03;
            song.play().catch(() => { });

            const envelope = document.getElementById('envelope');
            const card = envelope.querySelector('.card-invitation');
            const musicToggle = document.getElementById('music-toggle');
            const wrapper = document.getElementById('wrapper');

            // 1) abrir el sobre y hacer que la carta salga hacia arriba
            envelope.classList.add('open');
            // mostrar control de música cuando empieza a sonar
            if (musicToggle) {
                musicToggle.classList.add('visible');
            }

            // 2) cuando ha terminado de salir del sobre, colocarla en el centro de la pantalla
            setTimeout(() => {
                card.classList.add('card-centered');
            }, 900);

            // 3) dejar la carta un momento en el centro y luego animarla hacia la parte superior simulando que se convierte en el header
            setTimeout(() => {
                card.classList.add('card-to-header');
            }, 2900);

            // 4) desvanecer el sobre con blur y mostrar el contenido principal
            setTimeout(() => {
                if (wrapper) {
                    wrapper.classList.add('hidden');
                }
                const content = document.getElementById('main-content');
                content.style.display = 'block';
                setTimeout(() => content.style.opacity = '1', 100);

                // mostrar botón fijo de Confirmar asistencia solo después de entrar en la página (móvil)
                const floatingBtn = document.getElementById('floating-confirm-btn');
                if (floatingBtn && window.innerWidth <= 768) {
                    floatingBtn.style.display = 'block';
                }
            }, 2200);
        }

        // Contador hasta la boda (26 junio 2027, 13:00)
        const weddingDate = new Date("Jun 26, 2027 13:00:00").getTime();
        const countdownInterval = setInterval(() => {
            const now = new Date().getTime();
            const d = weddingDate - now;

            const daysEl = document.getElementById("days");
            const hoursEl = document.getElementById("hours");
            const minsEl = document.getElementById("mins");
            const secsEl = document.getElementById("secs");

            if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

            if (d <= 0) {
                clearInterval(countdownInterval);
                daysEl.innerText = "0";
                hoursEl.innerText = "0";
                minsEl.innerText = "0";
                secsEl.innerText = "0";

                const wrapper = document.querySelector('.countdown-wrapper');
                if (wrapper) {
                    wrapper.classList.add('celebrate');
                    setTimeout(() => wrapper.classList.remove('celebrate'), 1800);
                }

                // Activar botón del plano de mesas cuando llega el día
                enableMesasLink();
                return;
            }

            daysEl.innerText = Math.floor(d / (1000 * 60 * 60 * 24));
            hoursEl.innerText = Math.floor((d % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            minsEl.innerText = Math.floor((d % (1000 * 60 * 60)) / (1000 * 60));
            secsEl.innerText = Math.floor((d % (1000 * 60)) / 1000);
        }, 1000);

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

        // Control de música flotante
        (function setupMusicToggle() {
            const song = document.getElementById('wedding-song');
            const musicToggle = document.getElementById('music-toggle');
            if (!song || !musicToggle) return;

            musicToggle.addEventListener('click', () => {
                if (song.paused) {
                    song.play().then(() => {
                        musicToggle.textContent = '🔊';
                        musicToggle.setAttribute('aria-label', 'Silenciar música');
                        musicToggle.setAttribute('title', 'Silenciar música');
                    }).catch(() => { });
                } else {
                    song.pause();
                    musicToggle.textContent = '🔇';
                    musicToggle.setAttribute('aria-label', 'Reanudar música');
                    musicToggle.setAttribute('title', 'Reanudar música');
                }
            });
        })();

        // Vibración suave solo en móvil (si el dispositivo lo soporta)
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

        // Copiar IBAN regalo
        (function setupGiftIbanCopy() {
            const btn = document.getElementById('gift-iban-copy-btn');
            const ibanEl = document.getElementById('gift-iban');
            const msgEl = document.getElementById('gift-iban-msg');
            if (!btn || !ibanEl || !msgEl) return;

            const iban = ibanEl.textContent.replace(/\s+/g, '');

            function showMessage() {
                msgEl.style.opacity = '1';
                clearTimeout(msgEl._hideTimeout);
                msgEl._hideTimeout = setTimeout(() => {
                    msgEl.style.opacity = '0';
                }, 1800);
            }

            async function copyIban() {
                try {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        await navigator.clipboard.writeText(iban);
                    } else {
                        const area = document.createElement('textarea');
                        area.value = iban;
                        area.style.position = 'fixed';
                        area.style.opacity = '0';
                        document.body.appendChild(area);
                        area.select();
                        document.execCommand('copy');
                        document.body.removeChild(area);
                    }
                    showMessage();
                } catch (e) {
                    alert('No se pudo copiar. Puedes copiarlo manualmente.');
                }
            }

            btn.addEventListener('click', copyIban);
        })();

        // Botón fijo Confirmar asistencia (redirige a página de confirmación)
        (function setupFloatingConfirm() {
            const btn = document.getElementById('floating-confirm-btn');
            if (!btn) return;

            btn.addEventListener('click', () => {
                window.location.href = "confirmar.html" + window.location.search;
            });
        })();

        // Barra de progreso de scroll
        (function setupScrollProgress() {
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
