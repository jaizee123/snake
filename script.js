const canvas = document.getElementById("snakeCanvas");
const ctx = canvas.getContext("2d");

const gridSize = 20;
const canvasSize = 400;
const gameSpeed = 100; // Milliseconds

let snake = [{ x: 160, y: 160 }];
let food = { x: 60, y: 60 };
let direction = "RIGHT";
let score = 0;
let gameInterval;

// Q-learning variables
let Q = {};
let alpha = 0.1; // learning rate
let gamma = 0.9; // discount factor
let epsilon = 1.0; // exploration rate
const epsilonMin = 0.1; // Minimum epsilon
const epsilonDecay = 0.995; // Epsilon decay rate

// Basic snake game logic
function drawGame() {
  ctx.clearRect(0, 0, canvasSize, canvasSize);

  // Draw snake
  snake.forEach(segment => {
    ctx.fillStyle = "green";
    ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
  });

  // Draw food
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, gridSize, gridSize);

  // Move snake
  const head = { ...snake[0] };
  if (direction === "UP") head.y -= gridSize;
  if (direction === "DOWN") head.y += gridSize;
  if (direction === "LEFT") head.x -= gridSize;
  if (direction === "RIGHT") head.x += gridSize;

  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score++;
    food = generateFood();
  } else {
    snake.pop();
  }

  // Check if snake hits the wall or itself
  if (
    head.x < 0 ||
    head.x >= canvasSize ||
    head.y < 0 ||
    head.y >= canvasSize ||
    snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)
  ) {
    clearInterval(gameInterval);
    alert("Game Over! Score: " + score);
    resetGame();
  }

  // Update Q-table based on the current state
  updateQTable(head);

  // Update epsilon (exploration vs exploitation)
  updateEpsilon();
}

// Generate new food
function generateFood() {
  const x = Math.floor(Math.random() * (canvasSize / gridSize)) * gridSize;
  const y = Math.floor(Math.random() * (canvasSize / gridSize)) * gridSize;
  return { x, y };
}

// Update the Q-table based on the current state
function updateQTable(state) {
  const actions = ["UP", "DOWN", "LEFT", "RIGHT"];
  const stateKey = `${state.x}-${state.y}`;
  
  if (!Q[stateKey]) Q[stateKey] = { UP: 0, DOWN: 0, LEFT: 0, RIGHT: 0 };

  const maxQValue = Math.max(...Object.values(Q[stateKey]));
  const chosenAction = epsilon > Math.random() ? actions[Math.floor(Math.random() * 4)] : Object.keys(Q[stateKey]).find(action => Q[stateKey][action] === maxQValue);

  // Simulate next step (basic Q-learning)
  const reward = state.x === food.x && state.y === food.y ? 10 : -1;
  Q[stateKey][chosenAction] += alpha * (reward + gamma * maxQValue - Q[stateKey][chosenAction]);
}

// Start the game and the interval
function startGame() {
  gameInterval = setInterval(drawGame, gameSpeed);
}

// Reset the game
function resetGame() {
  snake = [{ x: 160, y: 160 }];
  food = generateFood();
  score = 0;
  direction = "RIGHT";
  startGame();
}

// User input to control the snake (for testing interaction)
document.addEventListener("keydown", event => {
  if (event.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  if (event.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
  if (event.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  if (event.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
});

// Update epsilon based on training
function updateEpsilon() {
  if (epsilon > epsilonMin) {
    epsilon *= epsilonDecay; // Decrease epsilon over time
  }
}

// Start the game
startGame();
