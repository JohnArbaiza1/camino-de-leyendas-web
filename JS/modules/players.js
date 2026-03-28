// players.js — Gestión de jugadores, estado del juego y lógica de turnos

import { buildBoard, TOTAL, SPECIALS } from './board.js';
import { mostrarCaras } from './dados.js';
import { spawnParticle, spawnBurst } from '../render/ui.js';

// Configuración básica de jugadores
export const playerColors = ['p1', 'p2', 'p3', 'p4'];
export const defaultNames = ['Guerrero/a', 'Mago/a', 'Arquero/a', 'Explorador/a'];
export const playerEmojis = ['🛡️', '🧙', '🏹', '🧭'];
export const trailColors = ['#00ff88', '#f0c060', '#ff3366', '#c9933a'];

// Configuración visual de cada tipo de casilla especial para el toast
const SPECIAL_TOAST = {
    bonus: { emoji: '✨', color: '#00ff88', prefix: '¡Magia!', suffix: 'avanza' },
    penalty: { emoji: '☠️', color: '#cc2222', prefix: '¡Maldición!', suffix: 'retrocede' },
    trap: { emoji: '🕸️', color: '#c9933a', prefix: '¡Trampa!', suffix: 'pierde turno' },
    skip: { emoji: '🧊', color: '#00aaff', prefix: '¡Congelado!', suffix: 'pierde turno' },
    portal: { emoji: '🌀', color: '#7b4fe0', prefix: '¡Portal!', suffix: 'teletransportado' },
};

// Variables de estado
export let playerNames = [...defaultNames]; // copia de los nombres para poder modificarlos
export let state = {};                // aquí se guardará todo el estado del juego
export let numPlayers = 4;
export let activePlayers = []; // índices reales de los personajes seleccionados

// Construye el tablero, inicializa el estado y genera las tarjetas de jugadores
// selectedIndexes: array con los índices elegidos, ej: [0, 2] para Guerrero y Arquero
export function initGame(selectedIndexes = [0, 1, 2, 3]) {
    activePlayers = selectedIndexes;
    numPlayers = selectedIndexes.length;
    buildBoard();

    state = {
        positions: Array(numPlayers).fill(1),
        skipTurns: Array(numPlayers).fill(0),
        current: 0,
        rolling: false
    };

    // Limpia el log al iniciar partida nueva
    const log = document.getElementById('log');
    if (log) log.innerHTML = '';

    // Genera el HTML de jugadores dinámicamente solo para los seleccionados
    const container = document.getElementById('players-container');
    container.innerHTML = '';

    for (let i = 0; i < numPlayers; i++) {
        const p = activePlayers[i]; // índice real del personaje
        container.innerHTML += `
            <div class="player-row" id="player-row-${i}">
                <span class="player-emoji">${playerEmojis[p]}</span>
                <span class="player-name" id="pn${i}">${playerNames[p]}</span>
                <span class="player-pos"  id="pp${i}">Casilla 1</span>
            </div>
        `;
    }

    highlightCurrentPlayer();
}

// Ejecuta el turno completo: tirada, movimiento y efecto de casilla especial
export async function rollDice() {

    if (state.rolling) return;
    state.rolling = true;

    const i = state.current;        // índice del turno (0, 1, 2...)
    const p = activePlayers[i];     // índice real del personaje
    const name = playerNames[p];

    // Turno penalizado — consume el skip y pasa al siguiente
    if (state.skipTurns[i] > 0) {
        state.skipTurns[i]--;
        addLog(`${playerEmojis[p]} <b>${name}</b> pierde su turno. (${state.skipTurns[i]} restantes)`);
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

    const roll = Math.ceil(Math.random() * 6);
    mostrarCaras(roll);

    const oldPos = state.positions[i];
    const newPos = Math.min(oldPos + roll, TOTAL);

    await animateMove(i, oldPos, newPos);
    state.positions[i] = newPos;

    const posLabel = document.getElementById(`pp${i}`);
    if (posLabel) posLabel.textContent = `Casilla ${newPos}`;

    // Verifica victoria
    if (newPos >= TOTAL) {
        addLog(`🏆 <b>${name}</b> ¡ha llegado a la meta! ¡VICTORIA!`);
        showWinner(i);
        state.rolling = false;
        return;
    }

    // Aplica el efecto de la casilla especial si existe
    const sp = SPECIALS[newPos];

    if (sp) {
        if (sp.teleport) {
            addLog(`🌀 <b>${name}</b> cae en <i>${sp.nombre}</i> — teletransportado a casilla ${sp.teleport}`);
            showToast(sp, p);
            await delay(400);
            await animateMove(i, newPos, sp.teleport);
            state.positions[i] = sp.teleport;
            if (posLabel) posLabel.textContent = `Casilla ${sp.teleport}`;

        } else if (sp.move && sp.move !== 0) {
            const dest = Math.max(1, Math.min(newPos + sp.move, TOTAL));
            const dir = sp.move > 0 ? `avanza ${sp.move}` : `retrocede ${Math.abs(sp.move)}`;
            addLog(`${sp.emoji} <b>${name}</b> cae en <i>${sp.nombre}</i> — ${dir} → casilla ${dest}`);
            showToast(sp, p);
            await delay(400);
            await animateMove(i, newPos, dest);
            state.positions[i] = dest;
            if (posLabel) posLabel.textContent = `Casilla ${dest}`;

        } else if (sp.skip) {
            state.skipTurns[i] += sp.skip;
            addLog(`${sp.emoji} <b>${name}</b> cae en <i>${sp.nombre}</i> — pierde ${sp.skip} turno(s)`);
            showToast(sp, p);
        }
    }

    nextTurn();
}

// Pasa al siguiente jugador y libera el semáforo del dado
function nextTurn() {
    state.current = (state.current + 1) % numPlayers;
    state.rolling = false;
    highlightCurrentPlayer();
}

// Marca con la clase 'active' la fila del jugador que tiene el turno actual
function highlightCurrentPlayer() {
    for (let i = 0; i < numPlayers; i++) {
        const row = document.getElementById(`player-row-${i}`);
        if (!row) continue;
        const isActive = i === state.current;
        row.classList.toggle('active', isActive);

        // Actualizar el indicador SPA del Drawer Móvil
        if (isActive) {
            const mobileIndicator = document.getElementById('mobile-current-player');
            if (mobileIndicator) {
                const p = activePlayers[i];
                mobileIndicator.textContent = `${playerEmojis[p]} ${playerNames[p]}`;
            }
        }
    }
}

// Rellena y muestra el modal de victoria
function showWinner(i) {
    const p = activePlayers[i];
    const modal = document.getElementById('winner-modal');
    const nameEl = document.getElementById('winner-name');
    const msgEl = document.getElementById('winner-msg');

    if (!modal) return;
    if (nameEl) nameEl.textContent = `¡${playerNames[p]} gana!`;
    if (msgEl) msgEl.textContent = `${playerEmojis[p]} Ha llegado a la meta y será recordado como una verdadera leyenda.`;

    modal.classList.add('show');
}

// Notificación flotante al caer en casilla especial
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

    requestAnimationFrame(() => el.classList.add('visible'));

    setTimeout(() => {
        el.classList.remove('visible');
        setTimeout(() => el.remove(), 400);
    }, 3000);
}

// Añade una línea al log de la crónica
function addLog(html) {
    const log = document.getElementById('log');
    if (!log) return;
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = html;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}

// Mueve la ficha del jugador casilla por casilla
async function animateMove(i, from, to) {
    const p = activePlayers[i];
    const step = from < to ? 1 : -1;

    for (let pos = from; pos !== to; pos += step) {
        placeToken(i, p, pos);
        const cell = document.getElementById(`cell-${pos}`);
        const rect = cell?.getBoundingClientRect();

        if (rect) spawnParticle(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            trailColors[p]
        );

        await delay(120);
    }

    placeToken(i, p, to);
    const destCell = document.getElementById(`cell-${to}`);
    const destRect = destCell?.getBoundingClientRect();

    if (destRect) spawnBurst(
        destRect.left + destRect.width / 2,
        destRect.top + destRect.height / 2,
        trailColors[p]
    );
}

// Quita la ficha de su casilla anterior y la coloca en la nueva
function placeToken(i, p, pos) {
    // Usa el índice de turno (i) para identificar el token en el DOM
    document.querySelectorAll(`.token-${i}`).forEach(el => el.remove());

    const container = document.getElementById(`tokens-${pos}`);
    if (!container) return;

    const token = document.createElement('div');
    token.className = `token token-${i} ${playerColors[p]}`;
    token.textContent = playerEmojis[p];
    container.appendChild(token);
}

// Utilidad para pausas con async/await
function delay(seg) {
    return new Promise(resolve => setTimeout(resolve, seg));
}