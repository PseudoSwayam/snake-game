// Setup canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Snake settings
const boxSize = 30; // Size of each block
let snake = [{ x: boxSize * 1, y: boxSize * 1 }]; // Start position
let dx = boxSize;
let dy = 0;

// Food settings
let food = { x: boxSize * 5, y: boxSize * 5 };

// Maze map (1 = Wall, 0 = Path)
const maze = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1],
  [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1],
  [1,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,1],
  [1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1],
  [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1],
  [1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

let gameInterval;

function drawMaze() {
  for (let row = 0; row < maze.length; row++) {
    for (let col = 0; col < maze[row].length; col++) {
      if (maze[row][col] === 1) {
        ctx.fillStyle = 'limegreen'; // Walls
      } else {
        ctx.fillStyle = 'black'; // Paths
      }
      ctx.fillRect(col * boxSize, row * boxSize, boxSize, boxSize);
    }
  }
}

function drawSnake() {
  ctx.fillStyle = 'white';
  snake.forEach(part => {
    ctx.fillRect(part.x, part.y, boxSize, boxSize);
  });
}

function drawFood() {
  ctx.fillStyle = 'red';
  ctx.fillRect(food.x, food.y, boxSize, boxSize);
}

function moveSnake() {
  const headX = snake[0].x + dx;
  const headY = snake[0].y + dy;

  // Find which cell snake is moving into
  const gridX = Math.floor(headX / boxSize);
  const gridY = Math.floor(headY / boxSize);

  // Hit Wall?
  if (maze[gridY] && maze[gridY][gridX] === 1) {
    alert('💥 Game Over! You hit a wall!');
    clearInterval(gameInterval);
    return;
  }

  // New snake head
  snake.unshift({ x: headX, y: headY });

  // Eat food?
  if (headX === food.x && headY === food.y) {
    generateFood();
  } else {
    snake.pop(); // Remove last part
  }
}

function generateFood() {
  let valid = false;
  while (!valid) {
    const x = Math.floor(Math.random() * 20) * boxSize;
    const y = Math.floor(Math.random() * 9) * boxSize;
    if (maze[Math.floor(y / boxSize)][Math.floor(x / boxSize)] === 0) {
      food = { x, y };
      valid = true;
    }
  }
}

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp' && dy === 0) {
    dx = 0; dy = -boxSize;
  } else if (e.key === 'ArrowDown' && dy === 0) {
    dx = 0; dy = boxSize;
  } else if (e.key === 'ArrowLeft' && dx === 0) {
    dx = -boxSize; dy = 0;
  } else if (e.key === 'ArrowRight' && dx === 0) {
    dx = boxSize; dy = 0;
  }
});

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawMaze();
  drawSnake();
  drawFood();
  
  moveSnake();
}

function startGame() {
  clearInterval(gameInterval);
  snake = [{ x: boxSize * 1, y: boxSize * 1 }];
  dx = boxSize;
  dy = 0;
  generateFood();
  gameInterval = setInterval(gameLoop, 200);
}
