// ui.js — Efectos visuales en pantalla: partículas de rastro y explosiones de llegada

// Duración en mili segundos que permanece visible cada efecto antes de eliminarse del DOM
const EFFECT_DURATION = 500;

// Crea un elemento div con clase y posición dadas, lo agrega al body y lo elimina después
export function createEffect(className, x, y, styles = {}){

    const el = document.createElement('div');
    el.className = className;
    // Define la posición horizontal del elemento
    el.style.left = x + 'px';

    // Define la posición vertical del elemento
    el.style.top = y + 'px';

    // se encarga de aplicar estilos adicionales al elemento
    Object.assign(el.style, styles);
    document.body.appendChild(el);

    // Después de un tiempo determinado por EFFECT_DURATION, el elemento se elimina del DOM para limpiar los efectos visuales.
    setTimeout(() => el.remove(), EFFECT_DURATION);
}

// Partícula pequeña que se genera en cada casilla durante el movimiento de una ficha
export function spawnParticle(x, y, color) {
    // Dispersión aleatoria para que no todas caigan exactamente en el mismo punto
    const offsetX = (Math.random() - 0.5) * 8;
    const offsetY = (Math.random() - 0.5) * 8;

    createEffect(
        'trail-particle',
        x - 3 + offsetX,
        y - 3 + offsetY,
        {
            background : color,
            boxShadow  : `0 0 6px ${color}`
        }
    );
}

// Explosión de luz que se genera al aterrizar en una casilla especial
export function spawnBurst(x, y, color) {
    createEffect(
        'land-burst',
        x - 20, // resta 20 para centrar (el elemento mide ~40px)
        y - 20,
        {
            color       : color,
            borderColor : color,
            boxShadow   : `0 0 16px ${color}`
        }
    );
}
