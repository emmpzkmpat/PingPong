const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Ajuste del tamaño del canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Verificar si el dispositivo es móvil
const isMobile = window.innerWidth < 768; // Puedes ajustar el valor según necesites

// Tamaño y velocidad de los objetos según el dispositivo
const paddleWidth = isMobile ? 4 : 10;
const paddleHeight = isMobile ? 70 : 100;
const ballSize = isMobile ? 8 : 10;
const paddleSpeed = isMobile ? 6 : 9;
let ballSpeed = isMobile ? 7 : 10;

let leftPaddle = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0
};

let rightPaddle = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0
};

let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: ballSize,
    dx: ballSpeed,
    dy: ballSpeed
};

let leftScore = 0;
let rightScore = 0;
let isSinglePlayer = false; // Indica si el juego es de un solo jugador
let gameStarted = false;
let currentPlayerCanMove = "both"; // Permite que ambos jugadores se muevan inicialmente
let firstHit = false; // Para rastrear si la pelota ha sido golpeada por primera vez

// Función para dibujar los objetos
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar las palas
    ctx.fillStyle = 'white';
    ctx.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
    ctx.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);

    // Dibujar la pelota
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    // Dibujar el marcador
    ctx.font = '30px Arial';
    ctx.fillText(`Left: ${leftScore}`, 20, 30);
    ctx.fillText(`Right: ${rightScore}`, canvas.width - 120, 30);
}

// Función para mover los objetos
function move() {
    // Mover la pelota
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Colisiones con las paredes
    if (ball.y + ball.size > canvas.height || ball.y - ball.size < 0) {
        ball.dy *= -1;
    }

    // Colisiones con las palas
    if (ball.x - ball.size < leftPaddle.x + leftPaddle.width &&
        ball.y > leftPaddle.y &&
        ball.y < leftPaddle.y + leftPaddle.height) {
        ball.dx *= -1;
        adjustBallAngle(leftPaddle);
        if (!firstHit) {
            firstHit = true; // Marca el primer golpe
            currentPlayerCanMove = "right"; // Turno para el jugador derecho
        } else {
            currentPlayerCanMove = "right"; // Cambio de turno
        }
    }

    if (ball.x + ball.size > rightPaddle.x &&
        ball.y > rightPaddle.y &&
        ball.y < rightPaddle.y + rightPaddle.height) {
        ball.dx *= -1;
        adjustBallAngle(rightPaddle);
        if (!firstHit) {
            firstHit = true; // Marca el primer golpe
            currentPlayerCanMove = "left"; // Turno para el jugador izquierdo
        } else {
            currentPlayerCanMove = "left"; // Cambio de turno
        }
    }

    // Reglas del juego
    if (ball.x + ball.size < 0) {
        rightScore++;
        resetBall();
    }

    if (ball.x - ball.size > canvas.width) {
        leftScore++;
        resetBall();
    }

    // Mover las palas
    leftPaddle.y += leftPaddle.dy;
    rightPaddle.y += rightPaddle.dy;

    // Limitar el movimiento de las palas
    if (leftPaddle.y < 0) leftPaddle.y = 0;
    if (leftPaddle.y + leftPaddle.height > canvas.height) leftPaddle.y = canvas.height - leftPaddle.height;
    if (rightPaddle.y < 0) rightPaddle.y = 0;
    if (rightPaddle.y + rightPaddle.height > canvas.height) rightPaddle.y = canvas.height - rightPaddle.height;
}

// Función para ajustar el ángulo de la pelota al rebotar en las palas
function adjustBallAngle(paddle) {
    let relativeIntersectY = (paddle.y + (paddle.height / 2)) - ball.y;
    let normalizedRelativeIntersectionY = (relativeIntersectY / (paddle.height / 2));
    let bounceAngle = normalizedRelativeIntersectionY * Math.PI / 4; // Hasta 45 grados de variación

    // Ajusta la dirección de la pelota según el ángulo calculado
    ball.dy = -ballSpeed * Math.sin(bounceAngle);
    ball.dx = ball.dx > 0 ? ballSpeed * Math.cos(bounceAngle) : -ballSpeed * Math.cos(bounceAngle);
}

// Función para reiniciar la pelota
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx *= -1;
    firstHit = false; // Reinicia el estado de primer golpe
    currentPlayerCanMove = "both"; // Ambos pueden moverse nuevamente al inicio
}

// Función para manejar las teclas
document.addEventListener('keydown', (event) => {
    if (currentPlayerCanMove === "left" || currentPlayerCanMove === "both") {
        switch (event.key) {
            case 'w':
                leftPaddle.dy = -paddleSpeed;
                break;
            case 's':
                leftPaddle.dy = paddleSpeed;
                break;
        }
    }
    if (currentPlayerCanMove === "right" || currentPlayerCanMove === "both") {
        switch (event.key) {
            case 'ArrowUp':
                rightPaddle.dy = -paddleSpeed;
                break;
            case 'ArrowDown':
                rightPaddle.dy = paddleSpeed;
                break;
        }
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'ArrowUp':
        case 'ArrowDown':
            rightPaddle.dy = 0;
            break;
        case 'w':
        case 's':
            leftPaddle.dy = 0;
            break;
    }
});

// Función para mover el bot
function moveBot() {
    if (ball.y < rightPaddle.y + rightPaddle.height / 2) {
        rightPaddle.dy = -paddleSpeed;
    } else if (ball.y > rightPaddle.y + rightPaddle.height / 2) {
        rightPaddle.dy = paddleSpeed;
    } else {
        rightPaddle.dy = 0;
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
