// llamamos a las funciones de cada uno de los módulos para que se ejecuten al cargar la página
import { updatePlayerSelect, startGame } from './modules/menu.js';
import { generateSparks } from './render/animations.js';

// funciones del menú
document.getElementById('player-count').addEventListener('change', updatePlayerSelect);
document.querySelector('.btn-start').addEventListener('click', startGame);

//funciones de animaciones
document.getElementById('sparks').addEventListener('load', generateSparks());