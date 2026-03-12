// Este archivo contendra todas las animaciónes que incluyan en el juego

// Función para generar las particulas flotantes en el fondo del juego
export function generateSparks(){
    const sparksContainer = document.getElementById('sparks');
    const colors = ['#c9933a', '#f0c060', '#00ff88', '#003322', '#a080e0'];

    // Generamos una determinada cantidad de particulas
    for(let i = 0; i < 50; i++){
        const spark = document.createElement('div');
        spark.className = 'spark';

        const size = Math.random() * 3 + 0.8 // Tamaño aleatorio
        const color = colors[Math.floor(Math.random() * colors.length)]; // color aleatorio
        // Estilos aleatorios para cada particula
        spark.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${Math.random() * 100}%;
            background: ${color};
            box-shadow: 0 0 ${size * 3}px ${color};
            animation-duration: ${Math.random() * 12 + 8}s;
            animation-delay: ${Math.random() * -15}s;
            opacity: 0;
        `;
        sparksContainer.appendChild(spark);
        
    }
}