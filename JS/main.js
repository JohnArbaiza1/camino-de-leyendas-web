// Main.js es el Archivo principal que conecta los módulos del juego

// llamamos a las funciones de cada uno de los módulos para que se ejecuten al cargar la página
import { updatePlayerSelect, startGame, updateCharacterOptions } from './modules/menu.js';
import { generateSparks } from './render/animations.js';
import { rollDice, initGame } from './modules/players.js';

generateSparks();

// ── Menú ───
// actualiza qué filas de jugadores se muestran según cantidad elegida
document.getElementById('player-count').addEventListener('change', updatePlayerSelect);
// Botón de inicio: valida el formulario y arranca el juego
document.querySelector('.btn-start').addEventListener('click', startGame);

// ── Dado ───
// Botón del dado: ejecuta el turno del jugador actual
document.getElementById('roll-btn').addEventListener('click', rollDice);

// Detecta cambios en los selects de personajes para bloquear repetidos
for (let i = 0; i < 4; i++) {
    const select = document.getElementById('char' + i);
    if (select) {
        select.addEventListener('change', updateCharacterOptions);
    }
}

// ── Botones del modal de victoria ─────
// "Nueva Aventura" — reinicia el juego con los mismos jugadores
document.getElementById('btn-new-game').addEventListener('click', () => {
    document.getElementById('winner-modal').classList.remove('show');
    // Obtiene el número de jugadores de la última partida y reinicia
    const count = parseInt(document.getElementById('player-count').value) || 2;
    initGame(count);
});

// "Menú" — vuelve a la pantalla de selección de personajes
document.getElementById('btn-go-menu').addEventListener('click', () => {
    document.getElementById('winner-modal').classList.remove('show');

    // Oculta la pantalla de juego
    const gameScreen = document.getElementById('game-screen');
    gameScreen.classList.remove('show');
    setTimeout(() => { gameScreen.style.display = 'none'; }, 500);

    // Muestra el menú
    const menuScreen = document.getElementById('menu-screen');
    menuScreen.style.display = 'flex';
    menuScreen.classList.remove('hide');
});