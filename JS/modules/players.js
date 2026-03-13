// players.js — Gestión de jugadores, estado del juego y lógica de turnos

import { buildBoard, TOTAL, SPECIALS } from './board.js';
import { mostrarCaras } from './dados.js';
import { spawnParticle, spawnBurst } from './render/ui.js';

// Configuración básica de jugadores
export const playerColors = ['p1', 'p2', 'p3', 'p4'];
export const defaultNames = ['Guerrero/a', 'Mago/a', 'Arquero/a', 'Explorador/a'];
export const playerEmojis = ['🛡️', '🧙', '🏹', '🧭'];
export const trailColors  = ['#00ff88', '#f0c060', '#ff3366', '#c9933a'];

// Configuración visual de cada tipo de casilla especial para el toast
const SPECIAL_TOAST = {
    bonus:   { emoji: '✨', color: '#00ff88', prefix: '¡Magia!',     suffix: 'avanza'           },
    penalty: { emoji: '☠️', color: '#cc2222', prefix: '¡Maldición!', suffix: 'retrocede'        },
    trap:    { emoji: '🕸️', color: '#c9933a', prefix: '¡Trampa!',    suffix: 'pierde turno'     },
    skip:    { emoji: '🧊', color: '#00aaff', prefix: '¡Congelado!', suffix: 'pierde turno'     },
    portal:  { emoji: '🌀', color: '#7b4fe0', prefix: '¡Portal!',    suffix: 'teletransportado' },
};

// Variables de estado
export let playerNames   = [...defaultNames]; // copia de los nombres para poder modificarlos
export let state         = {};                // aquí se guardará todo el estado del juego
export let numPlayers  = 4;

// función que construye el tablero, inicializa el estado y genera las tarjetas de jugadores
export function initGame(count = 4){
    numPlayers = count;
    buildBoard();

    state = {
        positions : Array(count).fill(1), //  solo N posiciones según jugadores activos
        skipTurns : Array(count).fill(0), //  solo N turnos según jugadores activos
        current   : 0,                    // índice del jugador activo (empieza el 1)
        rolling   : false                 // semáforo para evitar doble-click en el dado
    };

    // Limpia el log al iniciar partida nueva
    const log = document.getElementById('log');
    if (log) log.innerHTML = '';

    // Genera el HTML de jugadores dinámicamente solo para los activos
    const container = document.getElementById('players-container');
    container.innerHTML = '';

    for (let p = 0; p < count; p++) { // itera solo hasta count, no hasta 4
        container.innerHTML += `
            <div class="player-row" id="player-row-${p}">
                <span class="player-emoji">${playerEmojis[p]}</span>
                <span class="player-name" id="pn${p}">${playerNames[p]}</span>
                <span class="player-pos"  id="pp${p}">Casilla 1</span>
            </div>
        `;
    }

    // Resalta al primer jugador
    highlightCurrentPlayer();
}

// Función que ejecuta el turno completo: tirada, movimiento y efecto de casilla especial
export async function rollDice() {

    // Evita lanzar si ya hay una tirada en curso
    if (state.rolling) return;
    state.rolling = true;

    const p = state.current;
    const name = playerNames[p];

    // Turno penalizado — consume el skip y pasa al siguiente
    if (state.skipTurns[p] > 0) {
        state.skipTurns[p]--;
        addLog(`${playerEmojis[p]} <b>${name}</b> pierde su turno. (${state.skipTurns[p]} restantes)`);
        nextTurn();
        return;
    }

    // Animación de giro del dado
    const diceEl = document.getElementById('dice');
    if (diceEl) {
        diceEl.classList.add('rolling');
        await delay(650);
        diceEl.classList.remove('rolling');
    }

    // Genera un número entre 1 y 6
    const roll = Math.ceil(Math.random() * 6);

    // Muestra la cara del dado en pantalla
    mostrarCaras(roll);

    const oldPos = state.positions[p];
    // Math.min asegura que no se pase de la casilla final
    const newPos = Math.min(oldPos + roll, TOTAL);

    // Mueve la ficha paso a paso
    await animateMove(p, oldPos, newPos);
    state.positions[p] = newPos;

    // Actualiza el indicador de casilla del jugador
    const posLabel = document.getElementById(`pp${p}`);
    if (posLabel) posLabel.textContent = `Casilla ${newPos}`;

    // Verifica victoria 
    if (newPos >= TOTAL) {
        addLog(`🏆 <b>${name}</b> ¡ha llegado a la meta! ¡VICTORIA!`);
        showWinner(p);
        state.rolling = false;
        return; // no pasa turno, el juego termina
    }

    // Aplica el efecto de la casilla especial si existe
    const sp = SPECIALS[newPos];

    if (sp) {
        if (sp.teleport) {
            addLog(`🌀 <b>${name}</b> cae en <i>${sp.nombre}</i> — teletransportado a casilla ${sp.teleport}`);
            showToast(sp, p);
            await delay(400);
            await animateMove(p, newPos, sp.teleport);
            state.positions[p] = sp.teleport;
            if (posLabel) posLabel.textContent = `Casilla ${sp.teleport}`;

        } else if (sp.move && sp.move !== 0) {
            const dest = Math.max(1, Math.min(newPos + sp.move, TOTAL));
            const dir  = sp.move > 0 ? `avanza ${sp.move}` : `retrocede ${Math.abs(sp.move)}`;
            addLog(`${sp.emoji} <b>${name}</b> cae en <i>${sp.nombre}</i> — ${dir} → casilla ${dest}`);
            showToast(sp, p);
            await delay(400);
            await animateMove(p, newPos, dest);
            state.positions[p] = dest;
            if (posLabel) posLabel.textContent = `Casilla ${dest}`;

        } else if (sp.skip) {
            state.skipTurns[p] += sp.skip;
            addLog(`${sp.emoji} <b>${name}</b> cae en <i>${sp.nombre}</i> — pierde ${sp.skip} turno(s)`);
            showToast(sp, p);
        }
    }

    nextTurn();
}

// Pasa al siguiente jugador y libera el semáforo del dado
function nextTurn() {
    state.current = (state.current + 1) % numPlayers;
    state.rolling  = false;
    highlightCurrentPlayer();
}

// Marca con la clase 'active' la fila del jugador que tiene el turno actual
function highlightCurrentPlayer() {
    for (let p = 0; p < numPlayers; p++) {
        const row = document.getElementById(`player-row-${p}`);
        if (!row) continue;
        row.classList.toggle('active', p === state.current);
    }
}

// Rellena y muestra el modal de victoria
function showWinner(p) {
    const modal  = document.getElementById('winner-modal');
    const nameEl = document.getElementById('winner-name');
    const msgEl  = document.getElementById('winner-msg');

    if (!modal) return;
    if (nameEl) nameEl.textContent = `¡${playerNames[p]} gana!`;
    if (msgEl)  msgEl.textContent  = `${playerEmojis[p]} Ha llegado a la meta y será recordado como una verdadera leyenda.`;

    modal.classList.add('show');
}

// Notificación flotante que aparece al caer en casilla especial
function showToast(sp, p) {
    const cfg = SPECIAL_TOAST[sp.type];
    if (!cfg) return;

    const el = document.createElement('div');
    el.className = 'special-toast';
    el.innerHTML = `
        <span class="toast-emoji">${sp.emoji}</span>
        <div class="toast-body">
            <div class="toast-title">${sp.nombre}</div>
            <div class="toast-desc">${cfg.prefix} — ${playerEmojis[p]} ${playerNames[p]} ${cfg.suffix}</div>
        </div>
    `;
    el.style.setProperty('--toast-color', cfg.color);
    document.body.appendChild(el);

    // Entrada con pequeño delay para que la transición CSS sea visible
    requestAnimationFrame(() => el.classList.add('visible'));

    // Auto-cierre a los 3 segundos
    setTimeout(() => {
        el.classList.remove('visible');
        setTimeout(() => el.remove(), 400);
    }, 3000);
}

// Añade una línea al log de la crónica y hace scroll al último mensaje
function addLog(html) {
    const log = document.getElementById('log');
    if (!log) return;
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = html;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}

// Mueve la ficha del jugador casilla por casilla con una pequeña pausa entre pasos
async function animateMove(p, from, to) {
    const step = from < to ? 1 : -1;

    for (let pos = from; pos !== to; pos += step) {
        placeToken(p, pos);
        const cell  = document.getElementById(`cell-${pos}`);
        const rect  = cell?.getBoundingClientRect();

        // Partícula de rastro en cada casilla recorrida
        if (rect) spawnParticle(
            rect.left + rect.width  / 2,
            rect.top  + rect.height / 2,
            trailColors[p]
        );

        await delay(120); // pausa entre pasos 
    }

    // Coloca la ficha en la casilla destino
    placeToken(p, to);
    const destCell = document.getElementById(`cell-${to}`);
    const destRect = destCell?.getBoundingClientRect();

    // Efecto de llegada en la casilla destino
    if (destRect) spawnBurst(
        destRect.left + destRect.width  / 2,
        destRect.top  + destRect.height / 2,
        trailColors[p]
    );
}

// Quita la ficha de su casilla anterior y la coloca en la nueva
function placeToken(p, pos) {
    // Elimina el token del jugador de cualquier casilla donde esté
    document.querySelectorAll(`.token-${p}`).forEach(el => el.remove());

    const container = document.getElementById(`tokens-${pos}`);
    if (!container) return;

    const token = document.createElement('div');
    token.className = `token token-${p} ${playerColors[p]}`;
    token.textContent = playerEmojis[p];
    container.appendChild(token);
}

// Pequeña utilidad para crear pausas con async/await
function delay(seg) {
    return new Promise(resolve => setTimeout(resolve, seg));
}