// Acá se trabaja la logica del menú principal

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

    // Si todo está correcto se inicia el juego (alerta de momento para ver que funcione)
    alert("¡La aventura comienza!");
}

