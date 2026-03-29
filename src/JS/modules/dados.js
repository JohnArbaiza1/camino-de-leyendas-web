// dados.js — Lógica visual del dado: qué puntos se iluminan según el número

// Mapa de caras: cada número tiene una lista de posiciones a mostrar
export const DADO = {
    1: ['center'],
    2: ['top-left', 'bottom-right'],
    3: ['top-left', 'center', 'bottom-right'],
    4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
    6: ['top-left', 'top-right', 'center-left', 'center-right', 'bottom-left', 'bottom-right']
};

const KEY_MAP = {
    'top-left'     : 'tl',
    'top-right'    : 'tr',
    'center-left'  : 'ml',
    'center'       : 'ctr',
    'center-right' : 'mr',
    'bottom-left'  : 'bl',
    'bottom-right' : 'br'
};

// Recibe el ID del dado y el número (1-6) a mostrar y enciende los puntos correspondientes en el HTML
export function mostrarCaras(diceId, n) {

    const diceEl = document.getElementById(diceId);
    if (!diceEl) return;

    // Referencias a todos los puntos del dado en el DOM
    const slots = {
        tl  : diceEl.querySelector('.pos-tl'),
        tr  : diceEl.querySelector('.pos-tr'),
        ml  : diceEl.querySelector('.pos-ml'),
        ctr : diceEl.querySelector('.pos-center'),
        mr  : diceEl.querySelector('.pos-mr'),
        bl  : diceEl.querySelector('.pos-bl'),
        br  : diceEl.querySelector('.pos-br'),
    };

    // Apaga todos los puntos primero
    Object.values(slots).forEach(el => { if (el) el.classList.remove('visible'); });

    // Enciende solo los puntos que corresponden a la cara n
    (DADO[n] || []).forEach(key => {
        const slot = slots[KEY_MAP[key]]; // traducción de clave
        if (slot) slot.classList.add('visible');
    });
}