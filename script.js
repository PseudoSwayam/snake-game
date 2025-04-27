// --- Setup ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d'); // Get the 2D drawing context

// --- Constants (from Python) ---
const GRID_SIZE = 20;
const GRID_WIDTH = 30;
const GRID_HEIGHT = 20;

// Set canvas dimensions based on grid
canvas.width = GRID_SIZE * GRID_WIDTH;
canvas.height = GRID_SIZE * GRID_HEIGHT;

// Colors (using CSS color strings)
const WHITE = 'white';
const BLACK = 'black';
const PACMAN_YELLOW = 'yellow'; // Character color
const SNAKE_COLOR = PACMAN_YELLOW;
const DARK_SNAKE_COLOR = '#B4B400'; // Darker yellow outline
const FOOD_COLOR = 'red';
const DARK_FOOD_COLOR = 'darkred';
const WALL_COLOR = 'aqua';
const DARK_WALL_COLOR = '#008B8B'; // Darker aqua/cyan
const BACKGROUND_COLOR = BLACK;
const MOUTH_COLOR = BLACK;
const RED_TEXT = 'red';
const YELLOW_TEXT = PACMAN_YELLOW;

// Maze Constants
const PATH = 0;
const WALL = 1;

// Game Settings
const FPS = 6; // SLOW speed
const TOTAL_FOOD = 3;
const EATING_ANIMATION_DURATION = Math.floor(FPS / 2); // Frames mouth stays open
const CHARACTER_SIZE_FACTOR = 0.85;
const CHARACTER_BORDER_RADIUS_FACTOR = 0.25; // Relative to GRID_SIZE

// --- Maze Template (from Python) ---
const MAZE_TEMPLATE = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,1],
    [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
    [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
    [1,0,0,1,0,0,0,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,0,0,1,0,0,0,0,1],
    [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
    [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
    [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
    [1,0,0,1,0,0,0,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,0,0,1,0,0,0,0,1],
    [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
    [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
    [1,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];


// --- Global Game Variables ---
let snakePositions = []; // Path history [[x, y], [x, y], ...]
let snakeDirection = { dx: 0, dy: 0 }; // {dx: 1, dy: 0} for right, etc.
let foodPosition = { x: 0, y: 0 }; // {x: gridX, y: gridY}
let maze = []; // Will hold a copy of the template
let foodEatenCount = 0;
let gameState = "playing"; // playing, game_over, won
let isEatingAnimating = false;
let eatingAnimationTimer = 0;
let gameInterval = null; // To store the interval ID for stopping/starting

// --- Helper Functions ---

// Deep copy function for the maze template
function deepCopy(arr) {
    return JSON.parse(JSON.stringify(arr));
}

function drawWallBlock(ctx, color, outlineColor, gridX, gridY) {
    ctx.fillStyle = color;
    ctx.strokeStyle = outlineColor;
    ctx.fillRect(gridX * GRID_SIZE, gridY * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    ctx.strokeRect(gridX * GRID_SIZE, gridY * GRID_SIZE, GRID_SIZE, GRID_SIZE);
}

function drawFoodBlock(ctx, color, outlineColor, gridX, gridY) {
    ctx.fillStyle = color;
    ctx.strokeStyle = outlineColor;
    ctx.fillRect(gridX * GRID_SIZE, gridY * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    ctx.strokeRect(gridX * GRID_SIZE, gridY * GRID_SIZE, GRID_SIZE, GRID_SIZE);
}

// Draw the rounded character
function drawCharacter(ctx, headPos, direction, isAnimating) {
    const charSize = Math.floor(GRID_SIZE * CHARACTER_SIZE_FACTOR);
    const offset = Math.floor((GRID_SIZE - charSize) / 2);
    const px = headPos.x * GRID_SIZE + offset;
    const py = headPos.y * GRID_SIZE + offset;
    const borderRadius = Math.floor(GRID_SIZE * CHARACTER_BORDER_RADIUS_FACTOR);

    ctx.fillStyle = SNAKE_COLOR;
    ctx.strokeStyle = DARK_SNAKE_COLOR;
    ctx.lineWidth = 1;

    // Use CanvasRenderingContext2D.roundRect if available (modern browsers)
    // Fallback to simple rect if not
    if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(px, py, charSize, charSize, borderRadius);
        ctx.fill();
        ctx.stroke();
    } else {
        // Fallback for older browsers (no rounded corners)
        ctx.fillRect(px, py, charSize, charSize);
        ctx.strokeRect(px, py, charSize, charSize);
    }


    // Mouth Animation (similar logic, using polygon)
    const center_x = px + charSize / 2;
    const center_y = py + charSize / 2;
    const effective_radius = charSize / 2 - 1;

    const mouth_angle = Math.PI / 5; // Approx 36 degrees
    let base_angle = 0;

    if (direction.dx === 1) base_angle = 0;          // Right
    else if (direction.dx === -1) base_angle = Math.PI; // Left
    else if (direction.dy === -1) base_angle = Math.PI / 2; // Up
    else if (direction.dy === 1) base_angle = 3 * Math.PI / 2; // Down

    if (isAnimating) {
        const p1 = { x: center_x, y: center_y };
        const p2_x = center_x + effective_radius * Math.cos(base_angle - mouth_angle);
        const p2_y = center_y - effective_radius * Math.sin(base_angle - mouth_angle); // Use MINUS sin because Y is down in canvas
        const p3_x = center_x + effective_radius * Math.cos(base_angle + mouth_angle);
        const p3_y = center_y - effective_radius * Math.sin(base_angle + mouth_angle); // Use MINUS sin

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2_x, p2_y);
        ctx.lineTo(p3_x, p3_y);
        ctx.closePath();
        ctx.fillStyle = MOUTH_COLOR;
        ctx.fill();
    }
}

function generateMaze() {
    return deepCopy(MAZE_TEMPLATE); // Use deep copy
}

function placeFood(snakePathHistory, currentMaze) {
    let possibleLocations = [];
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            if (currentMaze[y][x] === PATH) {
                possibleLocations.push({ x: x, y: y });
            }
        }
    }

    // Filter out locations occupied by the snake's path history
    possibleLocations = possibleLocations.filter(loc =>
        !snakePathHistory.some(segment => segment.x === loc.x && segment.y === loc.y)
    );

    if (possibleLocations.length === 0) {
        console.error("No valid location to place food!");
        return { x: 1, y: 1 }; // Absolute fallback
    }

    const randomIndex = Math.floor(Math.random() * possibleLocations.length);
    return possibleLocations[randomIndex];
}

function resetGame() {
    console.log("Resetting game...");

    let startX = Math.floor(GRID_WIDTH / 2);
    let startY = Math.floor(GRID_HEIGHT / 2); // Start center

    // Ensure start position is valid path
    while (startY < GRID_HEIGHT -1 && MAZE_TEMPLATE[startY][startX] === WALL) {
        startY++;
    }
     // If still wall, try moving up
    if (MAZE_TEMPLATE[startY][startX] === WALL) {
         startY = Math.floor(GRID_HEIGHT / 2); // Reset Y
         while (startY > 0 && MAZE_TEMPLATE[startY][startX] === WALL) {
            startY--;
        }
    }
    // Final fallback if center column is wall
    if (MAZE_TEMPLATE[startY][startX] === WALL) {
        startX = 1; startY = 1; // Top left corner path
    }


    // Initial path history (head first)
    snakePositions = [{ x: startX, y: startY }];
    // Add initial segments if possible (for collision logic)
    for (let i = 1; i < 3; i++) {
         const prevX = startX - i;
         if (prevX >= 0 && MAZE_TEMPLATE[startY][prevX] === PATH) {
              snakePositions.push({ x: prevX, y: startY });
         } else {
             break;
         }
    }


    snakeDirection = { dx: 1, dy: 0 }; // Start right
    maze = generateMaze(); // Get a fresh copy of the maze
    foodPosition = placeFood(snakePositions, maze); // Place initial food
    foodEatenCount = 0;
    isEatingAnimating = false;
    eatingAnimationTimer = 0;
    gameState = "playing"; // Set state to playing

    // Clear previous interval if exists and start new one
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    gameInterval = setInterval(gameLoop, 1000 / FPS); // Start game loop
}

// --- Input Handling ---
document.addEventListener('keydown', (event) => {
    // Prevent browser scrolling with arrow keys/space
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
        event.preventDefault();
    }

    if (gameState === "game_over" || gameState === "won") {
        if (event.key === ' ') {
            resetGame();
        }
    } else if (gameState === "playing") {
        const currentDx = snakeDirection.dx;
        const currentDy = snakeDirection.dy;

        switch (event.key) {
            case 'ArrowUp':
                if (currentDy === 0) snakeDirection = { dx: 0, dy: -1 };
                break;
            case 'ArrowDown':
                if (currentDy === 0) snakeDirection = { dx: 0, dy: 1 };
                break;
            case 'ArrowLeft':
                if (currentDx === 0) snakeDirection = { dx: -1, dy: 0 };
                break;
            case 'ArrowRight':
                if (currentDx === 0) snakeDirection = { dx: 1, dy: 0 };
                break;
        }
    }
});

// --- Game Loop ---
function gameLoop() {
    // --- Update Animation Timer ---
    if (isEatingAnimating) {
        eatingAnimationTimer--;
        if (eatingAnimationTimer <= 0) {
            isEatingAnimating = false;
        }
    }

    // --- Update Game State (Only if playing) ---
    if (gameState === "playing") {
        const currentHead = snakePositions[0];
        const newHead = {
            x: currentHead.x + snakeDirection.dx,
            y: currentHead.y + snakeDirection.dy
        };

        // Collision Checks
        const hitEdge = newHead.x < 0 || newHead.x >= GRID_WIDTH || newHead.y < 0 || newHead.y >= GRID_HEIGHT;
        let hitMazeWall = false;
        if (!hitEdge) {
            if (maze[newHead.y][newHead.x] === WALL) hitMazeWall = true;
        } else {
            hitMazeWall = true;
        }

        let hitSelf = false;
        // Check collision against the rest of the path history
        if (snakePositions.length > 1) {
             hitSelf = snakePositions.slice(1).some(segment => segment.x === newHead.x && segment.y === newHead.y);
        }


        // --- Set Game Over State ---
        if (hitMazeWall || hitSelf) {
            console.log(`Collision! Wall:${hitMazeWall}, Self:${hitSelf}. Setting game_state='game_over'`);
            gameState = "game_over";
             // Stop the interval when game is over? Optional, drawing still happens.
             // clearInterval(gameInterval); // If you stop, SPACE needs to restart it in resetGame
        } else {
            // --- No Collision: Update Position & Handle Food ---
            snakePositions.unshift(newHead); // Add new head

            if (newHead.x === foodPosition.x && newHead.y === foodPosition.y) { // Ate food
                foodEatenCount++;
                isEatingAnimating = true;
                eatingAnimationTimer = EATING_ANIMATION_DURATION;
                // Don't pop tail (path grows)

                if (foodEatenCount >= TOTAL_FOOD) { // Check win condition
                    console.log("Win condition met! Setting game_state='won'");
                    gameState = "won";
                    foodPosition = null; // No more food
                     // clearInterval(gameInterval); // Optional stop on win
                } else {
                    foodPosition = placeFood(snakePositions, maze); // Place new food
                }
            } else { // Didn't eat food
                snakePositions.pop(); // Pop tail from path history
            }
        }
    } // End of if (gameState === "playing")

    // --- Draw Everything ---
    // Clear canvas
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Maze Walls
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            if (maze[y][x] === WALL) {
                drawWallBlock(ctx, WALL_COLOR, DARK_WALL_COLOR, x, y);
            }
        }
    }

    // Draw Character Head
    if (snakePositions.length > 0) {
        const headPos = snakePositions[0];
        // Don't animate mouth if game is over/won
        drawCharacter(ctx, headPos, snakeDirection, isEatingAnimating && gameState === "playing");
    }

    // Draw Food
    if (gameState === "playing" && foodPosition) {
        drawFoodBlock(ctx, FOOD_COLOR, DARK_FOOD_COLOR, foodPosition.x, foodPosition.y);
    }

    // Draw Score Text
    ctx.fillStyle = WHITE;
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top'; // Align text nicely at top-left
    ctx.fillText(`Food: ${foodEatenCount} / ${TOTAL_FOOD}`, 10, 10);

    // Draw Game Over / Win Messages
    if (gameState === "game_over" || gameState === "won") {
        ctx.fillStyle = (gameState === "game_over") ? RED_TEXT : YELLOW_TEXT;
        ctx.font = 'bold 40px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle'; // Center text vertically

        const message = (gameState === "game_over") ? "GAME OVER!" : "YOU WIN!";
        ctx.fillText(message, canvas.width / 2, canvas.height / 2 - 40);

        ctx.fillStyle = WHITE;
        ctx.font = '24px sans-serif';
        if (gameState === "game_over") {
             ctx.fillText(`Food Eaten: ${foodEatenCount}`, canvas.width / 2, canvas.height / 2);
        }

        ctx.font = '28px sans-serif';
        ctx.fillText("Press SPACE to Play Again", canvas.width / 2, canvas.height / 2 + 40);
    }
}

// --- Initial Game Start ---
resetGame(); // Call reset once to initialize and start the loop
