let timer = 0;
let timeInterval;
let openedCells = 0;
const size = 8;  // Define the grid size
const mines = 10;  // Define the number of mines
let board = [];
let mineLocations = [];

document.addEventListener('DOMContentLoaded', init);

function init() {
    console.log("Initializing game...");
    document.getElementById('gameContainer').innerHTML = '';
    openedCells = 0;
    mineLocations = [];
    board = Array(size * size).fill(null);
    document.getElementById('winMessage').textContent = '';
    resetTimer();

    while (mineLocations.length < mines) {
        let randomPosition = Math.floor(Math.random() * size * size);
        if (!mineLocations.includes(randomPosition)) {
            mineLocations.push(randomPosition);
            board[randomPosition] = 'M';
        }
    }

    for (let i = 0; i < size * size; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.index = i;
        cell.dataset.mine = board[i] === 'M';

        cell.addEventListener('click', handleCellClick);
        cell.addEventListener('contextmenu', handleRightClick);
        cell.addEventListener('auxclick', handleMiddleClick);  // Add middle-click listener

        document.getElementById('gameContainer').appendChild(cell);
    }
}

function handleCellClick(e) {
    const cell = e.target;
    if (cell.classList.contains('open') || cell.classList.contains('flagged')) return;
    if (cell.dataset.mine) {
        revealMines();
        stopTimer();
        document.getElementById('winMessage').textContent = 'Game Over';
    } else {
        const adjacentMines = calculateAdjacentMines(parseInt(cell.dataset.index));
        cell.textContent = adjacentMines > 0 ? adjacentMines : '';
        cell.classList.add('open');
        openedCells++;
        if (openedCells === size * size - mines) {
            stopTimer();
            const playerName = prompt("Congratulations! Enter your name for the leaderboard:", "Player");
            updateLeaderboard(timer, playerName);
            document.getElementById('winMessage').textContent = 'You Win!';
        }
    }
}

function handleRightClick(e) {
    e.preventDefault();
    const cell = e.target;
    if (!cell.classList.contains('open')) {
        cell.classList.toggle('flagged');
    }
}

function handleMiddleClick(e) {
    if (e.button === 1) { // 1 is the middle button
        const cellIndex = parseInt(e.target.dataset.index);
        const neighbors = getNeighborIndices(cellIndex);
        neighbors.forEach(index => {
            const neighborCell = document.getElementById('gameContainer').children[index];
            if (!neighborCell.classList.contains('open') && !neighborCell.dataset.mine) {
                neighborCell.click(); // simulate click on neighbor cells that are not opened or mined
            }
        });
    }
}

function revealMines() {
    mineLocations.forEach(index => {
        const mineCell = document.getElementById('gameContainer').children[index];
        mineCell.style.backgroundColor = 'red';
        mineCell.textContent = 'M';
    });
}

function calculateAdjacentMines(index) {
    const row = Math.floor(index / size);
    const col = index % size;
    let mines = 0;
    getNeighborIndices(index).forEach(idx => {
        if (mineLocations.includes(idx)) {
            mines++;
        }
    });
    return mines;
}

function getNeighborIndices(index) {
    const row = Math.floor(index / size);
    const col = index % size;
    const neighbors = [];

    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const newRow = row + i;
            const newCol = col + j;
            if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size) {
                neighbors.push(newRow * size + newCol);
            }
        }
    }
    return neighbors;
}

function startTimer() {
    timer = 0;
    timeInterval = setInterval(() => {
        timer++;
        document.getElementById('timer').textContent = 'Time: ' + timer;
    }, 1000);
}

function stopTimer() {
    clearInterval(timeInterval);
}

function updateLeaderboard(time, playerName) {
    const leaderboard = document.getElementById('leaderboard');
    let scores = JSON.parse(localStorage.getItem('minesweeperScores')) || [];
    const currentDate = new Date();
    const currentWeek = `${currentDate.getFullYear()}-W${currentDate.getWeekNumber()}`;

    scores = scores.filter(score => score.week === currentWeek);
    scores.push({ time: time, name: playerName || 'Anonymous', week: currentWeek });
    scores.sort((a, b) => a.time - b.time);

    localStorage.setItem('minesweeperScores', JSON.stringify(scores.slice(0, 10)));

    leaderboard.innerHTML = '';
    scores.forEach(score => {
        const scoreElement = document.createElement('li');
        scoreElement.textContent = `${score.name}: ${score.time} seconds`;
        leaderboard.appendChild(scoreElement);
    });
}

function resetGame() {
    stopTimer();
    init();
}

Date.prototype.getWeekNumber = function() {
    const d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7)
};
