const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const pauseBtn = document.getElementById("pauseBtn");

const gridSize = 20;
const tileCount = 25;
canvas.width = gridSize * tileCount;
canvas.height = gridSize * tileCount;

let snake = [{ x: 10, y: 10 }];
let food = randomFood();
let dx = 1;
let dy = 0;
let score = 0;
let speed = 150;
let gameInterval;
let paused = false;

function randomFood() {
  return {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount)
  };
}

function drawSnake() {
  for (let i = 0; i < snake.length; i++) {
    const glow = 10 + i * 2;
    ctx.fillStyle = `hsl(${i * 30}, 100%, 50%)`;
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = glow;
    ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize, gridSize);
  }
}

function drawFood() {
  ctx.fillStyle = "red";
  ctx.shadowColor = "red";
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize / 2.5, 0, Math.PI * 2);
  ctx.fill();
}

function moveSnake() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  if (
    head.x < 0 ||
    head.x >= tileCount ||
    head.y < 0 ||
    head.y >= tileCount ||
    snake.some(segment => segment.x === head.x && segment.y === head.y)
  ) {
    clearInterval(gameInterval);
    alert(`Game Over! Your score was ${score}`);
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    food = randomFood();
    score++;
    scoreEl.innerText = `Score: ${score}`;
    if (speed > 50) {
      speed -= 5;
      clearInterval(gameInterval);
      gameInterval = setInterval(game, speed);
    }
  } else {
    snake.pop();
  }
}

function game() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawSnake();
  drawFood();
  moveSnake();
}

function togglePause() {
  if (paused) {
    gameInterval = setInterval(game, speed);
    pauseBtn.innerText = "⏸️ Pause";
    paused = false;
  } else {
    clearInterval(gameInterval);
    pauseBtn.innerText = "▶️ Resume";
    paused = true;
  }
}

pauseBtn.addEventListener("click", togglePause);

document.addEventListener("keydown", function (event) {
  if (event.key === "ArrowUp" && dy === 0) {
    dx = 0;
    dy = -1;
  } else if (event.key === "ArrowDown" && dy === 0) {
    dx = 0;
    dy = 1;
  } else if (event.key === "ArrowLeft" && dx === 0) {
    dx = -1;
    dy = 0;
  } else if (event.key === "ArrowRight" && dx === 0) {
    dx = 1;
    dy = 0;
  }
});

document.getElementById("up").onclick = () => { if (dy === 0) { dx = 0; dy = -1; }};
document.getElementById("down").onclick = () => { if (dy === 0) { dx = 0; dy = 1; }};
document.getElementById("left").onclick = () => { if (dx === 0) { dx = -1; dy = 0; }};
document.getElementById("right").onclick = () => { if (dx === 0) { dx = 1; dy = 0; }};

gameInterval = setInterval(game, speed);
