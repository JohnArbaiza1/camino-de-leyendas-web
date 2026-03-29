// gameIntro.js — Animación de entrada del tablero (desvanecimiento simple)

export function playGameIntro() {
    // Espera a que la transición del #game-screen termine
    setTimeout(() => {
        const board = document.querySelector('.board-frame');
        if (!board) return;

        // Parte invisible
        board.style.opacity   = '0';
        board.style.transform = 'translateY(16px)';
        board.style.transition = 'none';

        // Fuerza repintado antes de activar la transición
        board.getBoundingClientRect();

        // Desvanecimiento suave hacia arriba
        board.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
        board.style.opacity    = '1';
        board.style.transform  = 'translateY(0)';

    }, 100);
}

