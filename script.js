const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Detección de dispositivo móvil
const isMobile = window.innerWidth <= 800 && window.innerHeight <= 600;

// Ajuste del tamaño del canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Tamaño y velocidad de los objetos
let paddleWidth, paddleHeight, ballSize, paddleSpeed, ballSpeed;

if (isMobile) {
    paddleWidth = 100;
    paddleHeight = 10;
    ballSize = 10;
    paddleSpeed = 10;
    ballSpeed = 4;
} else {
    paddleWidth = 10;
    paddleHeight = 100;
    ballSize = 10;
    paddleSpeed = 5;
    ballSpeed = 4;
}

let topPaddle = {
    x: canvas.width / 2 - paddleWidth / 2,
    y: 10,
    width: paddleWidth,
    height: paddleHeight,
    dx: 0
};

let bottomPaddle = {
    x: canvas.width / 2 - paddleWidth / 2,
    y: canvas.height - paddleHeight - 10,
    width: paddleWidth,
    height: paddleHeight,
    dx: 0
};

let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: ballSize,
    dx: ballSpeed,
    dy: ballSpeed
};

let topScore = 0;
let bottomScore = 0;
let isSinglePlayer = false; // Indica si el juego es de un solo jugador
let gameStarted = false;

// Función para dibujar los objetos
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar las palas
    ctx.fillStyle = 'white';
    ctx.fillRect(topPaddle.x, topPaddle.y, topPaddle.width, topPaddle.height);
    ctx.fillRect(bottomPaddle.x, bottomPaddle.y, bottomPaddle.width, bottomPaddle.height);

    // Dibujar la pelota
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    // Dibujar el marcador
    ctx.font = '30px Arial';
    ctx.fillText(`Top: ${topScore}`, 20, 30);
    ctx.fillText(`Bottom: ${bottomScore}`, canvas.width - 140, 30);
}

// Función para mover los objetos
function move() {
    // Mover la pelota
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Colisiones con las paredes
    if (ball.x + ball.size > canvas.width || ball.x - ball.size < 0) {
        ball.dx *= -1;
    }

    // Colisiones con las palas
    if (ball.y - ball.size < topPaddle.y + topPaddle.height &&
        ball.x > topPaddle.x &&
        ball.x < topPaddle.x + topPaddle.width) {
        ball.dy *= -1;
        adjustBallAngle(topPaddle);
    }

    if (ball.y + ball.size > bottomPaddle.y &&
        ball.x > bottomPaddle.x &&
        ball.x < bottomPaddle.x + bottomPaddle.width) {
        ball.dy *= -1;
        adjustBallAngle(bottomPaddle);
    }

    // Reglas del juego
    if (ball.y + ball.size < 0) {
        bottomScore++;
        resetBall();
    }

    if (ball.y - ball.size > canvas.height) {
        topScore++;
        resetBall();
    }

    // Mover las palas
    topPaddle.x += topPaddle.dx;
    bottomPaddle.x += bottomPaddle.dx;

    // Limitar el movimiento de las palas
    if (topPaddle.x < 0) topPaddle.x = 0;
    if (topPaddle.x + topPaddle.width > canvas.width) topPaddle.x = canvas.width - topPaddle.width;
    if (bottomPaddle.x < 0) bottomPaddle.x = 0;
    if (bottomPaddle.x + bottomPaddle.width > canvas.width) bottomPaddle.x = canvas.width - bottomPaddle.width;
}

// Función para ajustar el ángulo de la pelota al rebotar en las palas
function adjustBallAngle(paddle) {
    let relativeIntersectX = (paddle.x + (paddle.width / 2)) - ball.x;
    let normalizedRelativeIntersectionX = (relativeIntersectX / (paddle.width / 2));
    let bounceAngle = normalizedRelativeIntersectionX * Math.PI / 4; // Hasta 45 grados de variación

    // Ajusta la dirección de la pelota según el ángulo calculado
    ball.dx = -ballSpeed * Math.sin(bounceAngle);
    ball.dy = ball.dy > 0 ? ballSpeed * Math.cos(bounceAngle) : -ballSpeed * Math.cos(bounceAngle);
}

// Función para reiniciar la pelota
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx *= -1;
}

// Función para manejar las teclas
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowLeft':
            bottomPaddle.dx = -paddleSpeed;
            break;
        case 'ArrowRight':
            bottomPaddle.dx = paddleSpeed;
            break;
        case 'a':
            topPaddle.dx = -paddleSpeed;
            break;
        case 'd':
            topPaddle.dx = paddleSpeed;
            break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowRight':
            bottomPaddle.dx = 0;
            break;
        case 'a':
        case 'd':
            topPaddle.dx = 0;
            break;
    }
});

// Controles táctiles
let touchStartX = 0;

canvas.addEventListener('touchstart', (event) => {
    touchStartX = event.touches[0].clientX;
});

canvas.addEventListener('touchmove', (event) => {
    const touchX = event.touches[0].clientX;
    const touchDifference = touchX - touchStartX;

    if (touchDifference < 0) {
        bottomPaddle.dx = -paddleSpeed;
    } else if (touchDifference > 0) {
        bottomPaddle.dx = paddleSpeed;
    }

    touchStartX = touchX; // Actualiza la posición inicial para el próximo movimiento
});

canvas.addEventListener('touchend', () => {
    bottomPaddle.dx = 0; // Detener la raqueta cuando se termina el toque
});

// Función para mover el bot
function moveBot() {
    if (ball.x < topPaddle.x + topPaddle.width / 2) {
        topPaddle.dx = -paddleSpeed;
    } else if (ball.x > topPaddle.x + topPaddle.width / 2) {
        topPaddle.dx = paddleSpeed;
    } else {
        topPaddle.dx = 0;
    }
}

// Función para iniciar el juego
function startGame() {
    document.getElementById('menu').style.display = 'none';
    canvas.style.display = 'block';
    gameStarted = true;
    gameLoop();
}

// Función para manejar la selección del modo de juego
document.getElementById('singlePlayer').addEventListener('click', () => {
    isSinglePlayer = true;
    startGame();
});

document.getElementById('twoPlayers').addEventListener('click', () => {
    isSinglePlayer = false;
    startGame();
});

// Bucle principal del juego
function gameLoop() {
    if (gameStarted) {
        draw();
        move();
        if (isSinglePlayer) {
            moveBot();
        }
        requestAnimationFrame(gameLoop);
    }
}

