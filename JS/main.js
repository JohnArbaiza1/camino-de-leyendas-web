// Main.js es el Archivo principal que conecta los módulos del juego

// llamamos a las funciones de cada uno de los módulos para que se ejecuten al cargar la página
import { updatePlayerSelect, startGame, updateCharacterOptions } from './modules/menu.js';
import { generateSparks } from './render/animations.js';
import { rollDice } from './modules/players.js';

generateSparks();

// Menú: actualiza qué filas de jugadores se muestran según cantidad elegida
document.getElementById('player-count').addEventListener('change', updatePlayerSelect);

// Botón de inicio: valida el formulario y arranca el juego
document.querySelector('.btn-start').addEventListener('click', startGame);

// Botón del dado: ejecuta el turno del jugador actual
document.getElementById('roll-btn').addEventListener('click', rollDice);

// Detecta cambios en los selects de personajes para bloquear repetidos
for (let i = 0; i < 4; i++) {
    const select = document.getElementById('char' + i);
    if (select) {
        select.addEventListener('change', updateCharacterOptions);
    }
}
