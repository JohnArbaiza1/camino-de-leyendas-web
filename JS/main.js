// Main.js es el Archivo principal que conecta los módulos del juego

// llamamos a las funciones de cada uno de los módulos para que se ejecuten al cargar la página
import { updatePlayerSelect, startGame, updateCharacterOptions } from './modules/menu.js';
import { generateSparks } from './render/animations.js';

// funciones del menú
document.getElementById('player-count').addEventListener('change', updatePlayerSelect);
document.querySelector('.btn-start').addEventListener('click', startGame);

// Detecta cuando los jugadores eligen personajes lo que permite bloquear personajes ya seleccionados
for(let i = 0; i < 4; i++){

    const select = document.getElementById('char' + i);

    if(select){
        select.addEventListener('change', updateCharacterOptions);
    }

}

//funciones de animaciones
document.getElementById('sparks').addEventListener('load', generateSparks());