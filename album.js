(function autoNightMode() {
    const hour = new Date().getHours();
    if (hour >= 20 || hour < 8) {
        document.body.classList.add('night-mode');
    }
})();

// Navegar de vuelta a la invitación (respetando URL personalizada y saltando animación)
(function setupBackToInvite() {
    const link = document.getElementById('back-to-invite');
    if (!link) return;

    function getReturnUrl() {
        if (document.referrer) {
            return document.referrer;
        }
        const params = new URLSearchParams(window.location.search);
        const invitado = params.get('invitado');
        if (invitado) {
            return 'index.html?invitado=' + encodeURIComponent(invitado);
        }
        return 'index.html';
    }

    link.addEventListener('click', (e) => {
        e.preventDefault();
        const url = getReturnUrl();

        try {
            if (window.opener && !window.opener.closed) {
                window.opener.localStorage.setItem('skipEnvelopeOnce', '1');
                window.opener.location.href = url;
                window.close();
                return;
            }
        } catch (err) {
            // Si hay problemas de cross-origin, seguimos con el plan B en esta misma ventana
        }

        // Plan B: misma ventana
        try {
            localStorage.setItem('skipEnvelopeOnce', '1');
        } catch (err) { }
        window.location.href = url;
    });
})();

// Add event listener for the album button loading state
(function setupAlbumButton() {
    const button = document.getElementById('album-loading-button');
    if (!button) return;

    button.addEventListener('click', function (e) {
        // Prevenir la navegación inmediata para mostrar la animación
        e.preventDefault();

        const targetUrl = this.getAttribute('href');
        const targetWindow = this.getAttribute('target') || '_self';

        // Si ya está cargando, no hacer nada
        if (this.classList.contains('loading')) return;

        this.classList.add('loading');
        this.setAttribute('disabled', 'disabled');

        // Esperar 2 segundos de animación antes de abrir el enlace
        setTimeout(() => {
            window.open(targetUrl, targetWindow);

            // Opcional: Quitar la clase loading después de un tiempo por si el usuario vuelve a la pestaña
            setTimeout(() => {
                this.classList.remove('loading');
                this.removeAttribute('disabled');
            }, 1000);
        }, 2000); // 2000ms = 2 segundos de animación
    });
})();
