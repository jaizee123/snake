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

// Define actions
const actions = ["UP", "DOWN", "LEFT", "RIGHT"];

// Main game loop
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
  const stateKey = `${state.x}-${state.y}-${direction}`;
  
  // Initialize Q values for the state if not done already
  if (!Q[stateKey]) {
    Q[stateKey] = { UP: 0, DOWN: 0, LEFT: 0, RIGHT: 0 };
  }

  // Select action using epsilon-greedy policy
  const chosenAction = epsilon > Math.random() ? actions[Math.floor(Math.random() * 4)] : bestAction(stateKey);

  // Simulate the next state
  const nextState = simulateNextState(state, chosenAction);
  const reward = getReward(nextState);

  // Update Q-values using Q-learning formula
  const maxNextQ = Math.max(...Object.values(Q[`${nextState.x}-${nextState.y}-${chosenAction}`] || { UP: 0, DOWN: 0, LEFT: 0, RIGHT: 0 }));
  Q[stateKey][chosenAction] += alpha * (reward + gamma * maxNextQ - Q[stateKey][chosenAction]);

  // Set direction based on the chosen action
  direction = chosenAction;
}

// Best action based on current state Q-values
function bestAction(stateKey) {
  return Object.keys(Q[stateKey]).reduce((best, action) => {
    return Q[stateKey][action] > Q[stateKey][best] ? action : best;
  }, "UP");
}

// Simulate next state based on current action
function simulateNextState(state, action) {
  const nextState = { ...state };
  if (action === "UP") nextState.y -= gridSize;
  if (action === "DOWN") nextState.y += gridSize;
  if (action === "LEFT") nextState.x -= gridSize;
  if (action === "RIGHT") nextState.x += gridSize;
  return nextState;
}

// Get the reward based on the next state
function getReward(state) {
  // Reward for eating food
  if (state.x === food.x && state.y === food.y) return 10;
  // Penalty for hitting the wall or the snake body
  if (state.x < 0 || state.x >= canvasSize || state.y < 0 || state.y >= canvasSize) return -10;
  if (snake.slice(1).some(segment => segment.x === state.x && segment.y === state.y)) return -10;
  return -1; // Slight penalty for each move
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

// Update epsilon based on training
function updateEpsilon() {
  if (epsilon > epsilonMin) {
    epsilon *= epsilonDecay; // Decrease epsilon over time
  }
}

// Start the game
startGame();
