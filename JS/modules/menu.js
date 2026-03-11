// Acá se trabaja la logica del menú principal

// importamos la función buildBoard para construir el tablero al iniciar el juego
import { buildBoard } from './board.js';

// Función para encargada de actualizar la visibilidad de los selcts de personajes según la cantidad seleccionda
export function updatePlayerSelect(){

    // se encarga de obtener la caltidad de jugadores seleccionados
    const playerCount = parseInt(document.getElementById('player-count').value);

    //Definimos un for que recorra la posible cantidad de jugadores
    for(let i = 1; i <= 4; i++){

        // se encarga de obtener la fila del jugador i
        const playerRow = document.getElementById('row-player-' + i);

        // obtenemos el select donde el jugador selecciona a su personaje
        const playerSelect = document.getElementById("char" + (i - 1));

        // Verificamos si el jugador i está dentro de los parametros establecidos
        if( i <= playerCount){
            // Muestra la fila del jugador
            playerRow.classList.remove('hidden');
        } else{
            // Oculta la fila si no se usa
            playerRow.classList.add('hidden');
           playerSelect.value = ''; // Reseteamos el select del jugador i
        }
    }
}

// Función que evita que se repitan personajes
export function updateCharacterOptions(){

    // obtenemos todos los selects de personajes
    const selects = document.querySelectorAll("select[id^='char']");

    // obtenemos los personajes elegidos
    const selectedCharacters = [];

    selects.forEach(select=>{
        if(select.value){
            selectedCharacters.push(select.value);
        }
    });

    // recorremos nuevamente los selects
    selects.forEach(select=>{

        const options = select.querySelectorAll("option");

        options.forEach(option=>{

            // ignoramos la opción vacía
            if(option.value === "") return;

            // si ya fue elegido lo bloqueamos
            if(selectedCharacters.includes(option.value) && select.value !== option.value){
                option.disabled = true;
            }else{
                option.disabled = false;
            }

        });

    });

}

// Función encargada de iniciar el juego
export function startGame() {

    // Obtiene el número de jugadores seleccionado
    const count = parseInt(document.getElementById("player-count").value);

    // Si no se seleccionó número de jugadores
    if (!count) {
        alert("Por favor selecciona cuántos jugadores van a jugar.");
        return; // Detiene la ejecución
    }

    // Recorre todos los jugadores que van a jugar
    for (let i = 0; i < count; i++) {

        // Obtiene el personaje seleccionado por cada jugador
        const val = document.getElementById("char" + i).value;

        // Si el jugador no eligió personaje
        if (!val) {
            alert("Jugador " + (i + 1) + " debe elegir un personaje.");
            return; // Detiene el inicio del juego
        }
    }

    // Escondemos el menú para mostrar la pantalla de juego
    document.getElementById('menu-screen').classList.add('hide');
    const gameScreen = document.getElementById('game-screen');
    gameScreen.style.display = 'flex';
    setTimeout(() => gameScreen.classList.add('show'), 20);
    setTimeout(() => document.getElementById('menu-screen').style.display = 'none', 700);

    // Construir tablero y preparar estado inicial
    buildBoard();
}

