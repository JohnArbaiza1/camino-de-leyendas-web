// players.js — Gestión de jugadores, estado del juego y lógica de turnos

import { PLAYER_CONFIG, SPECIAL_TOAST_MAP } from '../config/constants.js';
import { buildBoard, TOTAL, SPECIALS } from '../modules/board.js';
import { mostrarCaras } from '../modules/dados.js';
import { spawnParticle, spawnBurst } from '../render/ui.js';

// Extraemos las constantes del config para usarlas igual que antes
export const playerColors  = PLAYER_CONFIG.colors;
export const defaultNames  = PLAYER_CONFIG.defaultNames;
export const playerEmojis  = PLAYER_CONFIG.emojis;
export const trailColors   = PLAYER_CONFIG.trailColors;

// Variables de estado
export let playerNames  = [...defaultNames];
export let state        = {};
export let numPlayers   = 4;
export let activePlayers = [];

export function initGame(selectedIndexes = [0, 1, 2, 3]) {
    activePlayers = selectedIndexes;
    numPlayers    = selectedIndexes.length;
    buildBoard();

    state = {
        positions:  Array(numPlayers).fill(1),
        skipTurns:  Array(numPlayers).fill(0),
        current:    0,
        rolling:    false
    };

    const log = document.getElementById('log');
    if (log) log.innerHTML = '';

    const container = document.getElementById('players-container');
    container.innerHTML = '';

    for (let i = 0; i < numPlayers; i++) {
        const p = activePlayers[i];
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

export async function rollDice() {

    if (state.rolling) return;
    state.rolling = true;

    const i    = state.current;
    const p    = activePlayers[i];
    const name = playerNames[p];

    if (state.skipTurns[i] > 0) {
        state.skipTurns[i]--;
        addLog(`${playerEmojis[p]} <b>${name}</b> pierde su turno. (${state.skipTurns[i]} restantes)`);
        nextTurn();
        return;
    }

    const diceEl1 = document.getElementById('dice1');
    const diceEl2 = document.getElementById('dice2');
    if (diceEl1) diceEl1.classList.add('rolling');
    if (diceEl2) diceEl2.classList.add('rolling');

    await delay(650);

    if (diceEl1) diceEl1.classList.remove('rolling');
    if (diceEl2) diceEl2.classList.remove('rolling');

    const roll1 = Math.ceil(Math.random() * 6);
    const roll2 = Math.ceil(Math.random() * 6);
    mostrarCaras('dice1', roll1);
    mostrarCaras('dice2', roll2);

    if (roll1 !== roll2) {
        addLog(`${playerEmojis[p]} <b>${name}</b> sacó <b>${roll1}</b> y <b>${roll2}</b> — ¡sin movimiento!`);
        nextTurn();
        return;
    }

    const roll = roll1;

    showCustomToast('¡Golpe de suerte!', `${playerEmojis[p]} ${name} consigue dobles y avanza ${roll} posiciones`, trailColors[p], '🎲');
    addLog(`🎲 ${playerEmojis[p]} <b>${name}</b> sacó dobles de <b>${roll1}</b> — ¡avanza ${roll} casillas!`);

    const oldPos = state.positions[i];
    const newPos = Math.min(oldPos + roll, TOTAL);

    await animateMove(i, oldPos, newPos);
    state.positions[i] = newPos;

    const posLabel = document.getElementById(`pp${i}`);
    if (posLabel) posLabel.textContent = `Casilla ${newPos}`;

    if (newPos >= TOTAL) {
        addLog(`🏆 <b>${name}</b> ¡ha llegado a la meta! ¡VICTORIA!`);
        showWinner(i);
        state.rolling = false;
        return;
    }

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
            const dir  = sp.move > 0 ? `avanza ${sp.move}` : `retrocede ${Math.abs(sp.move)}`;
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

function nextTurn() {
    state.current = (state.current + 1) % numPlayers;
    state.rolling = false;
    highlightCurrentPlayer();
}

function highlightCurrentPlayer() {
    for (let i = 0; i < numPlayers; i++) {
        const row = document.getElementById(`player-row-${i}`);
        if (!row) continue;
        const isActive = i === state.current;
        row.classList.toggle('active', isActive);

        if (isActive) {
            const mobileIndicator = document.getElementById('mobile-current-player');
            if (mobileIndicator) {
                const p = activePlayers[i];
                mobileIndicator.textContent = `${playerEmojis[p]} ${playerNames[p]}`;
            }
        }
    }
}

function showWinner(i) {
    const p      = activePlayers[i];
    const modal  = document.getElementById('winner-modal');
    const nameEl = document.getElementById('winner-name');
    const msgEl  = document.getElementById('winner-msg');

    if (!modal) return;
    if (nameEl) nameEl.textContent = `¡${playerNames[p]} gana!`;
    if (msgEl)  msgEl.textContent  = `${playerEmojis[p]} Ha llegado a la meta y será recordado como una verdadera leyenda.`;

    modal.classList.add('show');
}

// Usa SPECIAL_TOAST_MAP importado desde config en lugar del objeto local
function showToast(sp, p) {
    const cfg = SPECIAL_TOAST_MAP[sp.type];
    if (!cfg) return;
    showCustomToast(sp.nombre, `${cfg.prefix} — ${playerEmojis[p]} ${playerNames[p]} ${cfg.suffix}`, cfg.color, sp.emoji);
}

function showCustomToast(title, desc, color, emoji) {
    const el = document.createElement('div');
    el.className = 'special-toast';
    el.innerHTML = `
        <span class="toast-emoji">${emoji}</span>
        <div class="toast-body">
            <div class="toast-title">${title}</div>
            <div class="toast-desc">${desc}</div>
        </div>
    `;
    el.style.setProperty('--toast-color', color);
    document.body.appendChild(el);

    requestAnimationFrame(() => el.classList.add('visible'));

    setTimeout(() => {
        el.classList.remove('visible');
        setTimeout(() => el.remove(), 400);
    }, 3000);
}

function addLog(html) {
    const log = document.getElementById('log');
    if (!log) return;
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = html;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}

async function animateMove(i, from, to) {
    const p    = activePlayers[i];
    const step = from < to ? 1 : -1;

    for (let pos = from; pos !== to; pos += step) {
        placeToken(i, p, pos);
        const cell = document.getElementById(`cell-${pos}`);
        const rect = cell?.getBoundingClientRect();

        if (rect) spawnParticle(
            rect.left + rect.width / 2,
            rect.top  + rect.height / 2,
            trailColors[p]
        );

        await delay(120);
    }

    placeToken(i, p, to);
    const destCell = document.getElementById(`cell-${to}`);
    const destRect = destCell?.getBoundingClientRect();

    if (destRect) spawnBurst(
        destRect.left + destRect.width / 2,
        destRect.top  + destRect.height / 2,
        trailColors[p]
    );
}

function placeToken(i, p, pos) {
    document.querySelectorAll(`.token-${i}`).forEach(el => el.remove());

    const container = document.getElementById(`tokens-${pos}`);
    if (!container) return;

    const token = document.createElement('div');
    token.className  = `token token-${i} ${playerColors[p]}`;
    token.textContent = playerEmojis[p];
    container.appendChild(token);
}

function delay(seg) {
    return new Promise(resolve => setTimeout(resolve, seg));
}