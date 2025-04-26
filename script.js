const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const blockSize = 40;

// 0 = path, 1 = wall
const mazeMap = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1]
];

const rows = maze.length;
const cols = maze[0].length;

canvas.width = cols * blockSize;
canvas.height = rows * blockSize;

// Snake starting position
let snake = { x: 1, y: 1 };
let dx = 0;
let dy = 0;
let intervalId = null;

// Draw the maze
function drawMaze() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (maze[y][x] === 1) {
        ctx.fillStyle = 'black';
      } else {
        ctx.fillStyle = '#1a3d1a'; // dark green background
      }
      ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
    }
  }
}

// Draw the snake
function drawSnake() {
  ctx.fillStyle = 'lightgreen';
  ctx.fillRect(snake.x * blockSize, snake.y * blockSize, blockSize, blockSize);
}

// Move the snake
function moveSnake() {
  const newX = snake.x + dx;
  const newY = snake.y + dy;

  // Check for collision with walls
  if (
    newX < 0 || newX >= cols ||
    newY < 0 || newY >= rows ||
    maze[newY][newX] === 1
  ) {
    clearInterval(intervalId);
    alert("Game Over! You hit a wall!");
    return;
  }

  snake.x = newX;
  snake.y = newY;
}

// Game loop
function gameLoop() {
  moveSnake();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMaze();
  drawSnake();
}

// Start button functionality
document.getElementById('startButton').addEventListener('click', () => {
  snake = { x: 1, y: 1 }; // Reset position
  dx = 1; // Start moving to the right
  dy = 0;
  if (intervalId) {
    clearInterval(intervalId);
  }
  intervalId = setInterval(gameLoop, 200); // Move every 200ms
});

// Arrow key control
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
