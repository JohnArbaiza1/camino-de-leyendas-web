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

// Recibe un número (1-6) y enciende los puntos correspondientes en el HTML
export function mostrarCaras(n) {

    // Referencias a todos los puntos del dado en el DOM
    const slots = {
        tl  : document.getElementById('d-tl'),
        tr  : document.getElementById('d-tr'),
        ml  : document.getElementById('d-ml'),
        ctr : document.getElementById('d-ctr'),
        mr  : document.getElementById('d-mr'),
        bl  : document.getElementById('d-bl'),
        br  : document.getElementById('d-br'),
    };

    // Apaga todos los puntos primero
    Object.values(slots).forEach(el => { if (el) el.classList.remove('visible'); });

    // Enciende solo los puntos que corresponden a la cara n
    (DADO[n] || []).forEach(key => {
        const slot = slots[KEY_MAP[key]]; // traducción de clave
        if (slot) slot.classList.add('visible');
    });
}