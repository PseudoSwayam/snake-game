const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const tileSize = 20; // smaller tile for a bigger, smoother game
const tileCols = canvas.width / tileSize;
const tileRows = canvas.height / tileSize;

let snake = [{ x: 2, y: 2 }];
let direction = "RIGHT";
let score = 0;
let foods = [];

const defaultWalls = [
  // Border walls
  { x: 0, y: 0, width: 60, height: 1 },    // Top border
  { x: 0, y: 29, width: 60, height: 1 },   // Bottom border
  { x: 0, y: 0, width: 1, height: 30 },    // Left border
  { x: 59, y: 0, width: 1, height: 30 },   // Right border

  // Middle horizontal walls
  { x: 5, y: 7, width: 50, height: 1 },
  { x: 5, y: 22, width: 50, height: 1 },

  // Middle vertical walls with gaps
  { x: 5, y: 7, width: 1, height: 5 },    // Left vertical top
  { x: 5, y: 17, width: 1, height: 5 },   // Left vertical bottom
  { x: 54, y: 7, width: 1, height: 5 },   // Right vertical top
  { x: 54, y: 17, width: 1, height: 5 },  // Right vertical bottom

  // Inner small blocks
  { x: 20, y: 10, width: 5, height: 1 },
  { x: 35, y: 19, width: 5, height: 1 },
];

// Predefined grids (simpler and solvable)
const grids = [
  [
    // Border walls
    { x: 0, y: 0, width: 60, height: 1 },    // Top border
    { x: 0, y: 29, width: 60, height: 1 },   // Bottom border
    { x: 0, y: 0, width: 1, height: 30 },    // Left border
    { x: 59, y: 0, width: 1, height: 30 },   // Right border
  
    // Horizontal walls
    { x: 10, y: 7, width: 40, height: 1 },   // Top inner wall
    { x: 10, y: 22, width: 40, height: 1 },  // Bottom inner wall
  
    // Vertical walls with gaps
    { x: 5, y: 5, width: 1, height: 10 },    // Left vertical wall
    { x: 5, y: 15, width: 1, height: 10 },   // Left vertical bottom
    { x: 54, y: 5, width: 1, height: 10 },   // Right vertical top
    { x: 54, y: 15, width: 1, height: 10 },  // Right vertical bottom
  
    // Inner small blocks
    { x: 20, y: 11, width: 5, height: 1 },
    { x: 35, y: 18, width: 5, height: 1 },
  ],
  [
    // Border walls
    { x: 0, y: 0, width: 60, height: 1 },    // Top border
    { x: 0, y: 29, width: 60, height: 1 },   // Bottom border
    { x: 0, y: 0, width: 1, height: 30 },    // Left border
    { x: 59, y: 0, width: 1, height: 30 },   // Right border
  
    // Horizontal walls
    { x: 5, y: 7, width: 50, height: 1 },    // Upper inner wall
    { x: 5, y: 22, width: 50, height: 1 },   // Lower inner wall
  
    // Vertical walls (with varying gaps)
    { x: 10, y: 5, width: 1, height: 10 },   // Left vertical upper
    { x: 20, y: 15, width: 1, height: 5 },   // Middle vertical block
    { x: 40, y: 10, width: 1, height: 5 },   // Right vertical top
    { x: 50, y: 20, width: 1, height: 10 },  // Right vertical bottom
  
    // Inner small blocks
    { x: 25, y: 10, width: 5, height: 1 },
    { x: 30, y: 18, width: 5, height: 1 },
  ],
  [
    // Border walls
    { x: 0, y: 0, width: 60, height: 1 },    // Top border
    { x: 0, y: 29, width: 60, height: 1 },   // Bottom border
    { x: 0, y: 0, width: 1, height: 30 },    // Left border
    { x: 59, y: 0, width: 1, height: 30 },   // Right border
  
    // Horizontal walls
    { x: 5, y: 12, width: 50, height: 1 },   // Middle horizontal wall
  
    // Vertical walls (random position)
    { x: 10, y: 5, width: 1, height: 15 },   // Left vertical wall
    { x: 50, y: 5, width: 1, height: 15 },   // Right vertical wall
  
    // Inner small blocks
    { x: 20, y: 15, width: 5, height: 1 },
    { x: 35, y: 5, width: 5, height: 1 },
  ],
  [
    // Border walls
    { x: 0, y: 0, width: 60, height: 1 },    // Top border
    { x: 0, y: 29, width: 60, height: 1 },   // Bottom border
    { x: 0, y: 0, width: 1, height: 30 },    // Left border
    { x: 59, y: 0, width: 1, height: 30 },   // Right border
  
    // Horizontal walls with some gaps
    { x: 5, y: 10, width: 50, height: 1 },   // Horizontal middle wall
    { x: 5, y: 20, width: 50, height: 1 },   // Horizontal bottom wall
  
    // Vertical walls with wider gaps
    { x: 5, y: 5, width: 1, height: 10 },    // Left vertical wall
    { x: 5, y: 15, width: 1, height: 5 },    // Left bottom vertical block
    { x: 54, y: 5, width: 1, height: 10 },   // Right vertical wall
    { x: 54, y: 15, width: 1, height: 5 },   // Right bottom vertical block
  
    // Inner small blocks with larger spacing
    { x: 25, y: 8, width: 5, height: 1 },
    { x: 30, y: 18, width: 5, height: 1 },
  ],
  [
    // Border walls
    { x: 0, y: 0, width: 60, height: 1 },    // Top border
    { x: 0, y: 29, width: 60, height: 1 },   // Bottom border
    { x: 0, y: 0, width: 1, height: 30 },    // Left border
    { x: 59, y: 0, width: 1, height: 30 },   // Right border
  
    // Multiple horizontal walls with gaps
    { x: 5, y: 7, width: 40, height: 1 },    // Upper inner wall
    { x: 5, y: 14, width: 30, height: 1 },   // Middle inner wall
    { x: 5, y: 22, width: 50, height: 1 },   // Bottom inner wall
  
    // Vertical walls with varying positions
    { x: 10, y: 5, width: 1, height: 10 },   // Left vertical block
    { x: 25, y: 15, width: 1, height: 5 },   // Middle vertical block
    { x: 45, y: 5, width: 1, height: 10 },   // Right vertical block
  
    // Inner small blocks
    { x: 20, y: 10, width: 5, height: 1 },
    { x: 40, y: 17, width: 5, height: 1 },
  ],
];

let walls = [...defaultWalls]; // Default walls for the first game

document.addEventListener("keydown", changeDirection);
generateFood(); // generate first foods
gameLoop();

function gameLoop() {
  setTimeout(function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    moveSnake();
    drawSnake();
    drawFood();
    drawWalls();
    checkGameOver();
    gameLoop();
  }, 100);
}

function drawBackground() {
  ctx.fillStyle = "#000"; // Dark blackish base
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawWalls() {
  ctx.fillStyle = "#1E90FF"; // Neon blue walls
  ctx.shadowBlur = 10;
  ctx.shadowColor = "#1E90FF";
  walls.forEach(wall => {
    ctx.fillRect(
      wall.x * tileSize,
      wall.y * tileSize,
      wall.width * tileSize,
      wall.height * tileSize
    );
  });
  ctx.shadowBlur = 0;
}

function moveSnake() {
  let head = { ...snake[0] };
  if (direction === "RIGHT") head.x += 1;
  if (direction === "LEFT") head.x -= 1;
  if (direction === "UP") head.y -= 1;
  if (direction === "DOWN") head.y += 1;

  snake.unshift(head);

  // Check if snake eats any food
  let eatenIndex = foods.findIndex(food => food.x === head.x && food.y === head.y);
  if (eatenIndex !== -1) {
    score++;
    foods.splice(eatenIndex, 1);
    generateFood(); // Add a new food
    document.querySelector(".score").textContent = `Score: ${score}`;
  } else {
    snake.pop(); // If no food eaten, remove tail
  }
}

function drawSnake() {
  ctx.fillStyle = "#39FF14"; // Neon green
  ctx.shadowBlur = 10;
  ctx.shadowColor = "#00FF00";
  snake.forEach(segment => {
    ctx.fillRect(segment.x * tileSize, segment.y * tileSize, tileSize, tileSize);
  });
  ctx.shadowBlur = 0;
}

function drawFood() {
  ctx.fillStyle = "#FF007F"; // Neon pink
  ctx.shadowBlur = 10;
  ctx.shadowColor = "#FF007F";
  foods.forEach(food => {
    ctx.fillRect(food.x * tileSize, food.y * tileSize, tileSize, tileSize);
  });
  ctx.shadowBlur = 0;
}

function generateFood() {
  while (foods.length < 3) {
    let newFood = {
      x: Math.floor(Math.random() * tileCols),
      y: Math.floor(Math.random() * tileRows)
    };
    // Ensure food is not inside walls
    if (!isWall(newFood) && !isSnake(newFood)) {
      foods.push(newFood);
    }
  }
}

function isWall(position) {
  return walls.some(wall =>
    position.x >= wall.x &&
    position.x < wall.x + wall.width &&
    position.y >= wall.y &&
    position.y < wall.y + wall.height
  );
}

function isSnake(position) {
  return snake.some(segment => segment.x === position.x && segment.y === position.y);
}

function changeDirection(event) {
  if (event.keyCode === 37 && direction !== "RIGHT") {
    direction = "LEFT";
  } else if (event.keyCode === 38 && direction !== "DOWN") {
    direction = "UP";
  } else if (event.keyCode === 39 && direction !== "LEFT") {
    direction = "RIGHT";
  } else if (event.keyCode === 40 && direction !== "UP") {
    direction = "DOWN";
  }
}

function checkGameOver() {
  let head = snake[0];

  // Check wall collisions
  if (head.x < 0 || head.x >= tileCols || head.y < 0 || head.y >= tileRows || isWall(head)) {
    alert("Game Over! Your score: " + score);
    resetGame();
  }

  // Check self collision
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      alert("Game Over! Your score: " + score);
      resetGame();
    }
  }
}

function resetGame() {
  snake = [{ x: 2, y: 2 }];
  direction = "RIGHT";
  score = 0;
  foods = [];
  generateFood();
  document.querySelector(".score").textContent = `Score: ${score}`;

  // Select a new grid layout after the game over
  const randomGrid = grids[Math.floor(Math.random() * grids.length)];
  walls = randomGrid;
}
