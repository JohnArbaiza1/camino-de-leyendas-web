// Archivo donde se genera el tablero del juego, con sus casillas y eventos relacionados

// Exportamos la constante TOTAL que representa el número total de casillas en el tablero
export const TOTAL = 40;

// Constantes que representa las casillas especiales del tablero, con su tipo, nombre, emoji, movimiento adicional y turnos de espera
export const SPECIALS = {
    5:  { type: 'bonus',   nombre: 'Magia Brillante',      emoji: '✨', move:  3, skip: 0 },
    9:  { type: 'penalty', nombre: 'Hechizo del Mago',     emoji: '🧙', move: -3, skip: 0 },
    12: { type: 'bonus',   nombre: 'Bendición Estelar',    emoji: '🌟', move:  4, skip: 0 },
    14: { type: 'bonus',   nombre: 'Poder de los Antiguos',emoji: '🪄', move:  3, skip: 0 },
    18: { type: 'skip',    nombre: 'Congelado por Hielo',  emoji: '🧊', move:  0, skip: 1 },
    20: { type: 'trap',    nombre: 'Telaraña Gigante',     emoji: '🕸️', move:  0, skip: 1 },
    22: { type: 'penalty', nombre: 'Maldición Oscura',     emoji: '☠️', move: -5, skip: 0 },
    27: { type: 'bonus',   nombre: 'Runas Antiguas',       emoji: '✨', move:  4, skip: 0 },
    29: { type: 'bonus',   nombre: 'Cofre del Tesoro',     emoji: '🧰', move:  5, skip: 0 },
    31: { type: 'trap',    nombre: 'Pozo Olvidado',        emoji: '🕳️', move: -3, skip: 0 },
    33: { type: 'skip',    nombre: 'Aturdido por Hechizo', emoji: '😵', move:  0, skip: 1 },
    35: { type: 'penalty', nombre: 'Abismo de Serpientes', emoji: '🐍', move: -4, skip: 0 },
    37: { type: 'portal',  nombre: 'Portal de la perdición',        emoji: '🌀', move:  0, skip: 0, teleport: 15 },
};

export function buildBoard() {
    const board = document.getElementById('board');
    board.innerHTML = ''; // Limpiar tablero

    const cols = 8, rows = Math.ceil(TOTAL / cols);

    // Crear orden serpenteante de casillas
    const order = [];
    for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
            order.push(r * cols + (r % 2 === 0 ? c : cols - 1 - c) + 1);

    for (const num of order) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.id = `cell-${num}`;

        if (num > TOTAL) { // Casillas extra ocultas
            cell.style.visibility = 'hidden';
            board.appendChild(cell);
            continue;
        }

        let cls = '', icon = '', label = '';

        // Casilla de inicio, fin o especial
        if (num === 1)          { cls = 'start';  icon = '🏰'; label = 'INICIO'; }
        else if (num === TOTAL) { cls = 'finish'; icon = '👑'; label = 'META';   }
        else if (SPECIALS[num]) { 
            cls = SPECIALS[num].type; 
            icon = SPECIALS[num].emoji; 
            label = SPECIALS[num].nombre.split(' ').slice(0,2).join(' '); 
        }

        if (cls) cell.classList.add(cls);

        // Contenido de la celda: número, ícono, etiqueta y contenedor de tokens
        cell.innerHTML = `
            <span class="num">${num}</span>
            ${icon ? `<span class="cell-icon">${icon}</span>` 
                    : `<span style="font-size:0.55rem;color:rgba(186, 156, 6, 0.2);font-family:'Cinzel',serif">${num}</span>`}
            ${label ? `<span class="cell-label">${label}</span>` : ''}
            <div class="tokens" id="tokens-${num}"></div>
        `;
        board.appendChild(cell);
    }
}