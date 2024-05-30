const canvas = document.getElementById('boardCanvas');
const ctx = canvas.getContext('2d');
const resetButton = document.getElementById('resetButton');
const statusDiv = document.getElementById('status');

const cellSize = 50;
const boardSize = 8;
const board = Array(boardSize).fill(null).map(() => Array(boardSize).fill(null));
let currentPlayer = 'B';
let gameActive = true;

board[3][3] = 'W';
board[3][4] = 'B';
board[4][3] = 'B';
board[4][4] = 'W';

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;

    for (let i = 0; i <= boardSize; i++) {
        const pos = i * cellSize;
        ctx.beginPath();
        ctx.moveTo(pos, 0);
        ctx.lineTo(pos, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, pos);
        ctx.lineTo(canvas.width, pos);
        ctx.stroke();
    }

    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const cellValue = board[row][col];
            if (cellValue !== null) {
                drawStone(row, col, cellValue);
            }
        }
    }
}

function drawStone(row, col, color) {
    const x = col * cellSize + cellSize / 2;
    const y = row * cellSize + cellSize / 2;
    ctx.beginPath();
    ctx.arc(x, y, cellSize / 2 - 4, 0, 2 * Math.PI);
    ctx.fillStyle = color === 'B' ? 'black' : 'white';
    ctx.fill();
    ctx.stroke();
}

function isValidMove(row, col, player) {
    if (board[row][col] !== null) return false;

    const opponent = player === 'B' ? 'W' : 'B';
    const directions = [
        [0, 1], [1, 0], [0, -1], [-1, 0],
        [1, 1], [1, -1], [-1, 1], [-1, -1]
    ];

    for (let [dx, dy] of directions) {
        let x = row + dx;
        let y = col + dy;
        let foundOpponent = false;

        while (x >= 0 && x < boardSize && y >= 0 && y < boardSize) {
            if (board[x][y] === opponent) {
                foundOpponent = true;
            } else if (board[x][y] === player) {
                if (foundOpponent) return true;
                break;
            } else {
                break;
            }
            x += dx;
            y += dy;
        }
    }

    return false;
}

function flipStones(row, col, player) {
    const opponent = player === 'B' ? 'W' : 'B';
    const directions = [
        [0, 1], [1, 0], [0, -1], [-1, 0],
        [1, 1], [1, -1], [-1, 1], [-1, -1]
    ];

    for (let [dx, dy] of directions) {
        let x = row + dx;
        let y = col + dy;
        let stonesToFlip = [];

        while (x >= 0 && x < boardSize && y >= 0 && y < boardSize) {
            if (board[x][y] === opponent) {
                stonesToFlip.push([x, y]);
            } else if (board[x][y] === player) {
                for (let [fx, fy] of stonesToFlip) {
                    board[fx][fy] = player;
                }
                break;
            } else {
                break;
            }
            x += dx;
            y += dy;
        }
    }
}

function placeStone(row, col) {
    if (gameActive && isValidMove(row, col, currentPlayer)) {
        board[row][col] = currentPlayer;
        flipStones(row, col, currentPlayer);
        drawBoard();

        if (!hasValidMove('B') && !hasValidMove('W')) {
            gameActive = false;
            declareWinner();
            return;
        }

        currentPlayer = currentPlayer === 'B' ? 'W' : 'B';
        if (!hasValidMove(currentPlayer)) {
            currentPlayer = currentPlayer === 'B' ? 'W' : 'B';
            if (!hasValidMove(currentPlayer)) {
                gameActive = false;
                declareWinner();
            } else {
                alert(currentPlayer + ' has no valid moves. Passing turn.');
            }
        }

        updateStatus();
    }
}

function hasValidMove(player) {
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (isValidMove(row, col, player)) {
                return true;
            }
        }
    }
    return false;
}

function countStones() {
    let blackCount = 0;
    let whiteCount = 0;

    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (board[row][col] === 'B') blackCount++;
            if (board[row][col] === 'W') whiteCount++;
        }
    }

    return { blackCount, whiteCount };
}

function declareWinner() {
    const { blackCount, whiteCount } = countStones();
    if (blackCount > whiteCount) {
        alert('黒の勝利');
    } else if (whiteCount > blackCount) {
        alert('白の勝利');
    } else {
        alert('引き分け');
    }
}

function reset() {
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            board[row][col] = null;
        }
    }
    board[3][3] = 'W';
    board[3][4] = 'B';
    board[4][3] = 'B';
    board[4][4] = 'W';
    currentPlayer = 'B';
    gameActive = true;
    drawBoard();
    updateStatus();
}
canvas.addEventListener('click', function(event) {
    if (!gameActive) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    placeStone(row, col);
});

resetButton.addEventListener('click', reset);

reset();
drawBoard();
