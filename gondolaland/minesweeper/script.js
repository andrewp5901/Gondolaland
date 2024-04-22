let timer = 0;
let timeInterval;
let openedCells = 0;
const size = 8;  // Define the grid size
const mines = 10;  // Define the number of mines
let board = [];
let mineLocations = [];

document.addEventListener('DOMContentLoaded', init);
let firstClick = true; // Track if the first click has happened

function loadLeaderboard() {
    const leaderboard = document.getElementById('leaderboard');
    let scores = JSON.parse(localStorage.getItem('minesweeperScores')) || [];
    leaderboard.innerHTML = '';
    scores.forEach(score => {
        const scoreElement = document.createElement('li');
        scoreElement.textContent = `${score.name}: ${score.time} seconds`;
        leaderboard.appendChild(scoreElement);
    });
}




function init() {
    console.log("Initializing game...");
    document.getElementById('gameContainer').innerHTML = '';
    openedCells = 0;
    mineLocations = [];
    board = Array(size * size).fill(null);
    document.getElementById('winMessage').textContent = '';
    resetTimer();
    loadLeaderboard();

    for (let i = 0; i < size * size; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.index = i;

        cell.addEventListener('click', handleCellClick);
        cell.addEventListener('contextmenu', handleRightClick);
        cell.addEventListener('auxclick', handleMiddleClick);
        document.getElementById('gameContainer').appendChild(cell);
    }
}

function handleCellClick(e) {
    const cell = e.target;
    const index = parseInt(cell.dataset.index);

    if (firstClick) {
        startTimer();
        placeMines(index);
        firstClick = false;
    }

    if (cell.classList.contains('open') || cell.classList.contains('flagged')) return;

    openCell(cell, index);
}

function openCell(cell, index) {
    if (board[index] === 'M') {
        if (!cell.classList.contains('open')) {
            revealMines();
            stopTimer();
            document.getElementById('winMessage').textContent = 'Game Over';
        }
        return;
    }

    const adjacentMines = calculateAdjacentMines(index);
    cell.textContent = adjacentMines > 0 ? adjacentMines : '';
    cell.classList.add('open');
    openedCells++;

    if (adjacentMines === 0 && !cell.classList.contains('flagged')) {
        let neighbors = getNeighborIndices(index);
        neighbors.forEach(neighborIndex => {
            const neighborCell = document.getElementById('gameContainer').children[neighborIndex];
            if (!neighborCell.classList.contains('open')) {
                openCell(neighborCell, neighborIndex);
            }
        });
    }

    if (openedCells === size * size - mines) {
        stopTimer();
        const playerName = prompt("Congratulations! Enter your name for the leaderboard:", "Player");
        updateLeaderboard(timer, playerName);
        document.getElementById('winMessage').textContent = 'You Win!';
    }
}


function placeMines(firstClickedIndex) {
    while (mineLocations.length < mines) {
        let randomPosition = Math.floor(Math.random() * size * size);
        if (!mineLocations.includes(randomPosition) && randomPosition !== firstClickedIndex) {
            mineLocations.push(randomPosition);
            board[randomPosition] = 'M';
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
    if (e.button === 1) { // Check if the middle button was clicked
        const cellIndex = parseInt(e.target.dataset.index);
        if (!document.getElementById('gameContainer').children[cellIndex].classList.contains('open')) {
            return; // Do nothing if the cell is not open
        }

        const neighbors = getNeighborIndices(cellIndex);
        const flaggedCount = neighbors.filter(index => document.getElementById('gameContainer').children[index].classList.contains('flagged')).length;
        const mineCount = calculateAdjacentMines(cellIndex);

        if (flaggedCount === mineCount) {
            neighbors.forEach(index => {
                const neighborCell = document.getElementById('gameContainer').children[index];
                if (!neighborCell.classList.contains('open') && !neighborCell.classList.contains('flagged')) {
                    neighborCell.dispatchEvent(new MouseEvent('click'));  // Trigger click event programmatically
                }
            });
        }
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
    stopTimer();  // Stop the current game's timer
    firstClick = true;  // Reset the first click flag
    document.getElementById('gameContainer').innerHTML = '';  // Clear the game container
    openedCells = 0;  // Reset the count of opened cells
    mineLocations = [];  // Clear the existing mine locations
    board = Array(size * size).fill(null);  // Reset the board
    document.getElementById('winMessage').textContent = '';  // Clear any win/lose messages
    init();  // Reinitialize the game setup
}


function resetTimer() {
    if (timeInterval) {
        clearInterval(timeInterval);
    }
    timer = 0;
    document.getElementById('timer').textContent = 'Time: ' + timer;
    //startTimer(); // Assumes you have a function to start the timer
}


Date.prototype.getWeekNumber = function() {
    const d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7)
};
