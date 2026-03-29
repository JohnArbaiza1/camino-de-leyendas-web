// Archivo donde se genera el tablero del juego, con sus casillas y eventos relacionados

import { TOTAL, SPECIALS } from '../config/constants.js';

export { TOTAL, SPECIALS }; // Re-exportamos para que players.js pueda seguir importándolos desde board.js

export function buildBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';

    const cols = 8, rows = Math.ceil(TOTAL / cols);

    const order = [];
    for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
            order.push(r * cols + (r % 2 === 0 ? c : cols - 1 - c) + 1);

    for (const num of order) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.id = `cell-${num}`;

        if (num > TOTAL) {
            cell.style.visibility = 'hidden';
            board.appendChild(cell);
            continue;
        }

        let cls = '', icon = '', label = '';

        if (num === 1)          { cls = 'start';  icon = '🏰'; label = 'INICIO'; }
        else if (num === TOTAL) { cls = 'finish'; icon = '👑'; label = 'META';   }
        else if (SPECIALS[num]) { 
            cls = SPECIALS[num].type; 
            icon = SPECIALS[num].emoji; 
            label = SPECIALS[num].nombre.split(' ').slice(0,2).join(' '); 
        }

        if (cls) cell.classList.add(cls);

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