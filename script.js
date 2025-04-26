const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Fullscreen Canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Maze settings
const blockSize = 40;
const rows = Math.floor(canvas.height / blockSize);
const cols = Math.floor(canvas.width / blockSize);

// Snake settings
let snake = [{x: 1, y: 1}];
let dx = 0;
let dy = 0;
let gameInterval;
let maze = [];
let wallTexture;

// Load wall texture
const wallImage = new Image();
wallImage.src = 'wall-texture.png';
wallImage.onload = () => {
  wallTexture = wallImage;
};

const maze = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 1],
  [1, 0, 1, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
];

// Draw Maze
function drawMaze() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (maze[y][x] === 1) {
        if (wallTexture) {
          ctx.drawImage(wallTexture, x * blockSize, y * blockSize, blockSize, blockSize);
        } else {
          ctx.fillStyle = 'black';
          ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
        }
      }
    }
  }
}

// Draw Snake
function drawSnake() {
  ctx.fillStyle = 'lightgreen';
  snake.forEach(segment => {
    ctx.fillRect(segment.x * blockSize, segment.y * blockSize, blockSize, blockSize);
  });
}

// Move Snake
function moveSnake() {
  const head = {x: snake[0].x + dx, y: snake[0].y + dy};

  // Check Wall Collision
  if (head.x < 0 || head.y < 0 || head.x >= cols || head.y >= rows || maze[head.y][head.x] === 1) {
    clearInterval(gameInterval);
    alert('💥 Game Over! You hit a wall!');
    return;
  }

  snake.unshift(head);
  snake.pop();
}

// Main Game Loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMaze();
  drawSnake();
  moveSnake();
}

// Start Game
document.getElementById('startButton').addEventListener('click', () => {
  snake = [{x: 1, y: 1}];
  dx = 1;
  dy = 0;
  generateMaze();
  clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, 150);
});

// Arrow Controls
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp' && dy === 0) {
    dx = 0;
    dy = -1;
  } else if (e.key === 'ArrowDown' && dy === 0) {
    dx = 0;
    dy = 1;
  } else if (e.key === 'ArrowLeft' && dx === 0) {
    dx = -1;
    dy = 0;
  } else if (e.key === 'ArrowRight' && dx === 0) {
    dx = 1;
    dy = 0;
  }
});

// Resize Canvas when window changes
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
