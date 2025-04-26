const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const box = 20; // Size of snake parts and walls
let snake = [{x: 60, y: 60}]; // Start in safe area
let direction = null;
let game;

const wallTexture = new Image();
wallTexture.src = 'wall-texture.png';

const maze = [
  // 1 = wall, 0 = empty space
  [0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1],
  [1,1,0,1,0,1,1,1,0,1,1,1,0,1,1,1],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
  [0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1],
  [1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

function drawMaze() {
  for (let row = 0; row < maze.length; row++) {
    for (let col = 0; col < maze[row].length; col++) {
      if (maze[row][col] === 1) {
        ctx.drawImage(wallTexture, col * box, row * box, box, box);
      }
    }
  }
}

function drawSnake() {
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? '#00e676' : '#66bb6a'; // Head: bright green, Body: soft green
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#00e676";
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
    ctx.shadowBlur = 0; // reset shadow
  }
}

function moveSnake() {
  const head = {...snake[0]};

  if (direction === 'LEFT') head.x -= box;
  if (direction === 'UP') head.y -= box;
  if (direction === 'RIGHT') head.x += box;
  if (direction === 'DOWN') head.y += box;

  // Check wall collision
  const mazeRow = Math.floor(head.y / box);
  const mazeCol = Math.floor(head.x / box);

  if (maze[mazeRow] && maze[mazeRow][mazeCol] === 1) {
    clearInterval(game);
    setTimeout(() => {
      alert('💥 Game Over! You hit a wall!');
    }, 100);
    return;
  }

  // Check boundary collision
  if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
    clearInterval(game);
    setTimeout(() => {
      alert('💥 Game Over! You hit the boundary!');
    }, 100);
    return;
  }

  snake.unshift(head);
  snake.pop();
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' && direction !== 'RIGHT') direction = 'LEFT';
  if (e.key === 'ArrowUp' && direction !== 'DOWN') direction = 'UP';
  if (e.key === 'ArrowRight' && direction !== 'LEFT') direction = 'RIGHT';
  if (e.key === 'ArrowDown' && direction !== 'UP') direction = 'DOWN';
});

document.getElementById('startButton').addEventListener('click', () => {
  clearInterval(game);
  snake = [{x: 60, y: 60}]; // Reset snake
  direction = null;
  game = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMaze();
    moveSnake();
    drawSnake();
  }, 150);
});
