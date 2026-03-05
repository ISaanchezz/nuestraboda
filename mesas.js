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
            return 'index.html.html?invitado=' + encodeURIComponent(invitado);
        }
        return 'index.html.html';
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

// Datos de ejemplo de mesas y comensales.
// Puedes editar libremente nombres, mesas y asientos.
const tablesData = [
    {
        id: 'mesa-1',
        number: 1,
        label: 'Familia Novia',
        guests: [
            { name: 'Nuria', seat: 1 },
            { name: 'Mamá Nuria', seat: 2 },
            { name: 'Papá Nuria', seat: 3 },
            { name: 'Hermano Nuria', seat: 4 },
            { name: 'Tía 1', seat: 5 },
            { name: 'Tío 1', seat: 6 }
        ]
    },
    {
        id: 'mesa-2',
        number: 2,
        label: 'Familia Novio',
        guests: [
            { name: 'Iván', seat: 1 },
            { name: 'Mamá Iván', seat: 2 },
            { name: 'Papá Iván', seat: 3 },
            { name: 'Hermano Iván', seat: 4 },
            { name: 'Tía 2', seat: 5 },
            { name: 'Tío 2', seat: 6 }
        ]
    },
    {
        id: 'mesa-3',
        number: 3,
        label: 'Amigos Talavera',
        guests: [
            { name: 'Laura García', seat: 1 },
            { name: 'Carlos López', seat: 2 },
            { name: 'Marta Pérez', seat: 3 },
            { name: 'Jorge Ruiz', seat: 4 },
            { name: 'Ana Díaz', seat: 5 },
            { name: 'Pedro Sánchez', seat: 6 }
        ]
    },
    {
        id: 'mesa-4',
        number: 4,
        label: 'Amigos Universidad',
        guests: [
            { name: 'Sara Martín', seat: 1 },
            { name: 'David Fernández', seat: 2 },
            { name: 'Lucía Torres', seat: 3 },
            { name: 'Alberto Gómez', seat: 4 },
            { name: 'Elena Romero', seat: 5 },
            { name: 'Raúl Navarro', seat: 6 }
        ]
    },
    {
        id: 'mesa-5',
        number: 5,
        label: 'Peques',
        guests: [
            { name: 'Peque 1', seat: 1 },
            { name: 'Peque 2', seat: 2 },
            { name: 'Peque 3', seat: 3 },
            { name: 'Peque 4', seat: 4 }
        ]
    }
];

const tablesMapEl = document.getElementById('tables-map');
const searchInput = document.getElementById('guest-search');
const clearBtn = document.getElementById('clear-search');
const searchResultEl = document.getElementById('search-result');
const selectedTableEl = document.getElementById('selected-table');

let currentHighlightedTableId = null;
let currentHighlightedGuestName = null;

function renderTables() {
    tablesMapEl.innerHTML = '';
    tablesData.forEach(table => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'table-card';
        card.dataset.tableId = table.id;

        if (table.id === currentHighlightedTableId) {
            card.classList.add('active');
        }

        card.innerHTML = `
                    <div class="table-number">${table.number}</div>
                    <div class="table-name">${table.label}</div>
                    <div class="table-meta">${table.guests.length} comensales</div>
                    <div class="guest-list">
                        ${table.guests.map(g => `
                            <span class="guest-pill ${currentHighlightedGuestName && g.name.toLowerCase() === currentHighlightedGuestName.toLowerCase() ? 'highlight' : ''}">
                                <span class="seat">${g.seat}</span>
                                <span>${g.name}</span>
                            </span>
                        `).join('')}
                    </div>
                `;

        card.addEventListener('click', () => {
            currentHighlightedTableId = table.id;
            currentHighlightedGuestName = null;
            updateSelectedTableInfo(table);
            renderTables();
        });

        tablesMapEl.appendChild(card);
    });
}

function updateSelectedTableInfo(table) {
    if (!table) {
        selectedTableEl.textContent = 'Ninguna todavía. Pulsa en una mesa del plano o busca tu nombre.';
        return;
    }

    const guestNames = table.guests.map(g => g.name).join(', ');
    selectedTableEl.innerHTML = `
                Estás viendo la <strong>Mesa ${table.number} - ${table.label}</strong>.<br>
                Comensales: ${guestNames}.
            `;
}

function findGuest(query) {
    const q = query.trim().toLowerCase();
    if (!q) return null;

    const matches = [];

    tablesData.forEach(table => {
        table.guests.forEach(guest => {
            if (guest.name.toLowerCase().includes(q)) {
                matches.push({ table, guest });
            }
        });
    });

    return matches;
}

function handleSearchInput() {
    const value = searchInput.value;
    const matches = findGuest(value);

    if (!value.trim()) {
        currentHighlightedTableId = null;
        currentHighlightedGuestName = null;
        searchResultEl.textContent = 'Escribe tu nombre para ver tu mesa.';
        updateSelectedTableInfo(null);
        renderTables();
        return;
    }

    if (!matches || matches.length === 0) {
        currentHighlightedTableId = null;
        currentHighlightedGuestName = null;
        searchResultEl.innerHTML = `
                    No hemos encontrado a nadie con "<strong>${value}</strong>".
                    Prueba con otra combinación (por ejemplo, solo tu primer apellido).
                `;
        updateSelectedTableInfo(null);
        renderTables();
        return;
    }

    // Si hay varias coincidencias, mostramos todas.
    const first = matches[0];
    currentHighlightedTableId = first.table.id;
    currentHighlightedGuestName = value.trim();

    if (matches.length === 1) {
        searchResultEl.innerHTML = `
                    Hemos encontrado a <strong>${first.guest.name}</strong>.<br>
                    Está en la <strong>Mesa ${first.table.number} - ${first.table.label}</strong>, asiento ${first.guest.seat}.
                `;
    } else {
        searchResultEl.innerHTML = `
                    Hemos encontrado <strong>${matches.length}</strong> personas que coinciden con "<strong>${value}</strong>":<br>
                    ${matches.map(m => `
                        • ${m.guest.name} — Mesa ${m.table.number} (${m.table.label}), asiento ${m.guest.seat}
                    `).join('<br>')}
                `;
    }

    updateSelectedTableInfo(first.table);
    renderTables();

    // Intentamos hacer scroll suave hacia la mesa encontrada.
    requestAnimationFrame(() => {
        const activeCard = document.querySelector('.table-card.active');
        if (activeCard) {
            activeCard.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        }
    });
}

searchInput.addEventListener('input', handleSearchInput);

clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    currentHighlightedGuestName = null;
    currentHighlightedTableId = null;
    searchResultEl.textContent = 'Escribe tu nombre para ver tu mesa.';
    updateSelectedTableInfo(null);
    renderTables();
    searchInput.focus();
});

// Inicializamos el plano
renderTables();
