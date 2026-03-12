// players.js — Gestión de jugadores, estado del juego y lógica de turnos

import { buildBoard, TOTAL, SPECIALS } from './board.js';
import { mostrarCaras } from './dados.js';
import { spawnParticle, spawnBurst } from '../render/ui.js';

// Configuración básica de jugadores
export const playerColors = ['p1', 'p2', 'p3', 'p4'];
export const defaultNames = ['Guerrero/a', 'Mago/a', 'Arquero/a', 'Explorador/a'];
export const playerEmojis = ['🛡️', '🧙', '🏹', '🧭'];
export const trailColors  = ['#00ff88', '#f0c060', '#ff3366', '#c9933a'];

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
}

// Función que ejecuta el turno completo: tirada, movimiento y efecto de casilla especial
export async function rollDice() {

    // Evita lanzar si ya hay una tirada en curso
    if (state.rolling) return;
    state.rolling = true;

    const p = state.current;

    // Si el jugador tiene turnos penalizados, los consume y pasa el turno
    if (state.skipTurns[p] > 0) {
        state.skipTurns[p]--;
        nextTurn();
        return;
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

    // Aplica el efecto de la casilla especial si existe
    const sp = SPECIALS[newPos];

    if (sp) {
        if (sp.teleport) {
            // Teletransporta al jugador a otra casilla
            await animateMove(p, newPos, sp.teleport);
            state.positions[p] = sp.teleport;
        } else if (sp.move && sp.move !== 0) {
            // Avanza o retrocede al jugador
            const dest = newPos + sp.move;
            await animateMove(p, newPos, dest);
            state.positions[p] = dest;
        } else if (sp.skip) {
            // Penaliza con turnos perdidos
            state.skipTurns[p] += sp.skip;
        }
    }

    nextTurn();
}

// Pasa al siguiente jugador y libera el semáforo del dado
function nextTurn() {
    state.current = (state.current + 1) % numPlayers;
    state.rolling  = false;
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