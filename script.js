const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
const maze = document.getElementById('maze-container');
const controls = document.getElementById('controls');
const pauseButton = document.getElementById('pause-button');
const restartButton = document.getElementById('restart-button');
const mobileControls = document.getElementById('mobile-controls');
const player = document.getElementById('player');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');

const bgMusic = document.getElementById('bg-music');
const moveSound = document.getElementById('move-sound');
const bonusSound = document.getElementById('bonus-sound');
const levelupSound = document.getElementById('levelup-sound');

let currentLevel = 0;
let time = 0;
let timerInterval;
let isPaused = false;
let score = 0;

// Player movement
let playerX = 10;
let playerY = 10;
const playerSize = 20;
const step = 10;

// Levels
const levels = [
  {
    walls: [
      {x: 0, y: 50, width: 300, height: 10},
      {x: 100, y: 100, width: 300, height: 10},
      {x: 0, y: 150, width: 200, height: 10},
      {x: 150, y: 200, width: 250, height: 10},
      {x: 0, y: 250, width: 200, height: 10},
      {x: 200, y: 300, width: 200, height: 10},
    ],
    exit: {x: 370, y: 370, width: 30, height: 30},
    bonuses: [{x: 50, y: 50, size: 15}, {x: 300, y: 200, size: 15}]
  },
  {
    walls: [
      {x: 0, y: 70, width: 250, height: 10},
      {x: 150, y: 120, width: 250, height: 10},
      {x: 0, y: 170, width: 200, height: 10},
      {x: 200, y: 220, width: 200, height: 10},
      {x: 0, y: 270, width: 200, height: 10},
      {x: 200, y: 320, width: 200, height: 10},
    ],
    exit: {x: 370, y: 370, width: 30, height: 30},
    bonuses: [{x: 60, y: 80, size: 15}, {x: 250, y: 250, size: 15}]
  }
];

// Collision function
function isColliding(rect1, rect2) {
  return !(
    rect1.top + rect1.height <= rect2.top ||
    rect1.top >= rect2.top + rect2.height ||
    rect1.left + rect1.width <= rect2.left ||
    rect1.left >= rect2.left + rect2.width
  );
}

// Load Level
function loadLevel(levelIndex) {
  maze.innerHTML = '';
  maze.appendChild(player);

  // Walls
  levels[levelIndex].walls.forEach(data => {
    const wall = document.createElement('div');
    wall.classList.add('wall');
    wall.style.left = data.x + 'px';
    wall.style.top = data.y + 'px';
    wall.style.width = data.width + 'px';
    wall.style.height = data.height + 'px';
    maze.appendChild(wall);
  });

  // Exit
  const exit = document.createElement('div');
  exit.id = 'exit';
  const exitData = levels[levelIndex].exit;
  exit.style.left = exitData.x + 'px';
  exit.style.top = exitData.y + 'px';
  exit.style.width = exitData.width + 'px';
  exit.style.height = exitData.height + 'px';
  maze.appendChild(exit);

  // Bonuses
  levels[levelIndex].bonuses.forEach(bonusData => {
    const bonus = document.createElement('div');
    bonus.classList.add('bonus');
    bonus.style.left = bonusData.x + 'px';
    bonus.style.top = bonusData.y + 'px';
    bonus.style.width = bonusData.size + 'px';
    bonus.style.height = bonusData.size + 'px';
    maze.appendChild(bonus);
  });

  playerX = 10;
  playerY = 10;
  player.style.left = playerX + 'px';
  player.style.top = playerY + 'px';
}

// Timer
function startTimer() {
  timerInterval = setInterval(() => {
    if(!isPaused) {
      time++;
      timerDisplay.textContent = time;
    }
  }, 1000);
}

// Movement function
function movePlayer(dir) {
  let newX = playerX;
  let newY = playerY;
  if(dir==='up') newY -= step;
  if(dir==='down') newY += step;
  if(dir==='left') newX -= step;
  if(dir==='right') newX += step;

  const playerRect = {top: newY, left: newX, width: playerSize, height: playerSize};

  // Wall collision
  let collision = false;
  document.querySelectorAll('.wall').forEach(wall => {
    const rect = wall.getBoundingClientRect();
    const mazeRect = maze.getBoundingClientRect();
    const wallRect = {top: rect.top - mazeRect.top, left: rect.left - mazeRect.left, width: rect.width, height: rect.height};
    if(isColliding(playerRect, wallRect)) collision = true;
  });

  if(!collision) {
    playerX = newX;
    playerY = newY;
    player.style.left = playerX + 'px';
    player.style.top = playerY + 'px';
    moveSound.play();
  }

  // Bonus collision
  document.querySelectorAll('.bonus').forEach(bonus => {
    const rect = bonus.getBoundingClientRect();
    const mazeRect = maze.getBoundingClientRect();
    const bonusRect = {top: rect.top - mazeRect.top, left: rect.left - mazeRect.left, width: rect.width, height: rect.height};
    if(isColliding(playerRect, bonusRect)) {
      score += 5;
      bonus.remove();
      scoreDisplay.textContent = score;
      bonusSound.play();
    }
  });

  // Exit collision
  const exit = document.getElementById('exit');
  const exitRect = exit.getBoundingClientRect();
  const mazeRect = maze.getBoundingClientRect();
  const exitPos = {top: exitRect.top - mazeRect.top, left: exitRect.left - mazeRect.left, width: exitRect.width, height: exitRect.height};
  if(isColliding(playerRect, exitPos)) {
    levelupSound.play();
    alert(`Level ${currentLevel+1} completed! Score: ${score}`);
    currentLevel++;
    if(currentLevel < levels.length) loadLevel(currentLevel);
    else alert(`Congratulations! You finished all levels! Final Score: ${score}`);
  }
}

// Keyboard movement
document.addEventListener('keydown', (e) => {
  if(!isPaused){
    if(e.key==='ArrowUp') movePlayer('up');
    if(e.key==='ArrowDown') movePlayer('down');
    if(e.key==='ArrowLeft') movePlayer('left');
    if(e.key==='ArrowRight') movePlayer('right');
  }
});

// Mobile buttons
document.querySelectorAll('.move-btn').forEach(btn => {
  btn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if(!isPaused) movePlayer(btn.dataset.dir);
  });
});

// Pause & Restart buttons
pauseButton.addEventListener('click', () => {
  isPaused = !isPaused;
  pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
});

restartButton.addEventListener('click', () => {
  time = 0;
  timerDisplay.textContent = time;
  loadLevel(currentLevel);
  isPaused = false;
  pauseButton.textContent = 'Pause';
});

// Start game
startButton.addEventListener('click', () => {
  startScreen.style.display = 'none';
  maze.style.display = 'block';
  controls.style.display = 'block';
  mobileControls.style.display = 'block';
  bgMusic.play();
  loadLevel(currentLevel);
  startTimer();
});
