
import { updatePlayerSelect, startGame } from './modules/menu.js';

document.getElementById('player-count').addEventListener('change', updatePlayerSelect);
document.querySelector('.btn-start').addEventListener('click', startGame);
