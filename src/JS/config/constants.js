// Exportamos la constante TOTAL que representa el número total de casillas en el tablero
export const TOTAL = 40;

export const PLAYER_CONFIG = {
    colors: ['p1', 'p2', 'p3', 'p4'],
    defaultNames: ['Guerrero/a', 'Mago/a', 'Arquero/a', 'Explorador/a'],
    emojis: ['🛡️', '🧙', '🏹', '🧭'],
    trailColors: ['#00ff88', '#f0c060', '#ff3366', '#c9933a']
};

// Constantes que representa las casillas especiales del tablero, con su tipo, nombre, emoji, movimiento adicional y turnos de espera
export const SPECIALS = {
    5:  { type: 'bonus',   nombre: 'Magia Brillante',      emoji: '✨', move:  3, skip: 0 },
    9:  { type: 'penalty', nombre: 'Hechizo del Mago',     emoji: '🧙', move: -3, skip: 0 },
    12: { type: 'bonus',   nombre: 'Bendición Estelar',    emoji: '🌟', move:  4, skip: 0 },
    14: { type: 'bonus',   nombre: 'Poder de los Antiguos',emoji: '🪄', move:  3, skip: 0 },
    18: { type: 'skip',    nombre: 'Congelado por Hielo',  emoji: '🧊', move:  0, skip: 1 },
    20: { type: 'trap',    nombre: 'Telaraña Gigante',     emoji: '🕸️', move:  0, skip: 1 },
    22: { type: 'penalty', nombre: 'Maldición Oscura',     emoji: '☠️', move: -5, skip: 0 },
    27: { type: 'bonus',   nombre: 'Runas Antiguas',       emoji: '✨', move:  4, skip: 0 },
    29: { type: 'bonus',   nombre: 'Cofre del Tesoro',     emoji: '🧰', move:  5, skip: 0 },
    31: { type: 'trap',    nombre: 'Pozo Olvidado',        emoji: '🕳️', move: -3, skip: 0 },
    33: { type: 'skip',    nombre: 'Aturdido por Hechizo', emoji: '😵', move:  0, skip: 1 },
    35: { type: 'penalty', nombre: 'Abismo de Serpientes', emoji: '🐍', move: -4, skip: 0 },
    37: { type: 'portal',  nombre: 'Portal de la perdición',        emoji: '🌀', move:  0, skip: 0, teleport: 15 },
};

// Configuración visual de cada tipo de casilla especial para el toast
export const SPECIAL_TOAST_MAP = {
    bonus: { emoji: '✨', color: '#00ff88', prefix: '¡Magia!', suffix: 'avanza' },
    penalty: { emoji: '☠️', color: '#cc2222', prefix: '¡Maldición!', suffix: 'retrocede' },
    trap: { emoji: '🕸️', color: '#c9933a', prefix: '¡Trampa!', suffix: 'pierde turno' },
    skip: { emoji: '🧊', color: '#00aaff', prefix: '¡Congelado!', suffix: 'pierde turno' },
    portal: { emoji: '🌀', color: '#7b4fe0', prefix: '¡Portal!', suffix: 'teletransportado' }
};
