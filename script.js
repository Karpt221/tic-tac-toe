const GameBoard = (function () {
    let gameBoard = [];
    const resetBoard = () => {
        gameBoard = Array(3).fill().map(() => Array(3).fill(null));
    };

    resetBoard();

    const setCellMark = (x, y, player) => {
        if (gameBoard[x][y]) return false;
        gameBoard[x][y] = player.mark;
        return true;
    };

    const getCellMark = (x, y) => gameBoard[x][y];

    const getBoard = () => gameBoard;

    return {
        getCellMark,
        setCellMark,
        getBoard,
        resetBoard
    };
})();

const Game = (function (gameBoard) {
    const players = [
        { name: 'Player1', mark: 'X' },
        { name: 'Player2', mark: 'O' }
    ];
    let activePlayer = players[0];

    const gameStatus = { winnerExist: false, isTie: false, winner: null };

    const resetModel = function () {
        gameBoard.resetBoard();
        activePlayer = players[0];
    }

    const setGameStatus = (winnerExist = false, isTie = false, winner = null) => {
        Object.assign(gameStatus, { winnerExist, isTie, winner });
    };

    const switchPlayerTurn = function () {
        activePlayer = (activePlayer === players[0] ? players[1] : players[0]);
    }

    const checkLine = (a, b, c) => (a === b && b === c && a !== null) ? a : null;

    const checkWinnerExistence = () => {
        const board = gameBoard.getBoard();
        let winnerMark = null;

        // Check rows, columns
        for (let i = 0; i < 3; i++) {
            winnerMark = checkLine(board[i][0], board[i][1], board[i][2]) || checkLine(board[0][i], board[1][i], board[2][i]);
            if (winnerMark) break;
        }
        //Check diagonals
        winnerMark = winnerMark || checkLine(board[0][0], board[1][1], board[2][2]) || checkLine(board[0][2], board[1][1], board[2][0]);

        if (winnerMark) {
            const winner = players.find(player => player.mark === winnerMark);
            setGameStatus(true, false, winner);
        } else if (board.flat().every(cell => cell !== null)) {
            setGameStatus(false, true);
        } else {
            setGameStatus(false, false);
        }
    };

    return {
        checkWinnerExistence,
        switchPlayerTurn,
        resetModel,
        getGameStatus: () => gameStatus,
        getActivePlayer: () => activePlayer,
        getGameBoardObj: () => gameBoard,
        getPlayers: () => players,
    };

})(GameBoard);

const GameView = (function () {
    const msgBoard = document.querySelector('.msg-board > p');
    const domCells = document.querySelectorAll('.cell');
    const gameBtn = document.querySelector('.game-btn');
    const namesBtn = document.querySelector('.names-btn');
    const closeModalBtn = document.querySelector('.close-modal-btn');
    const namesDialog = document.querySelector(".change-names-modal");
    const namesForm = document.querySelector(".change-names-form");

    closeModalBtn.addEventListener('click', () => {
        namesDialog.close();
    });

    namesDialog.addEventListener("close", () => {
        document.querySelector('#player1-form').value = '';
        document.querySelector('#player2-form').value = '';
    });

    const renderBoardValues = (gameBoard) => {
        domCells.forEach(cell => {
            const [x, y] = cell.id.split(':').map(Number);
            const cellValue = gameBoard[x][y];
            const incons = {
                'X': '<img src="icons/cross.svg" alt="">',
                'O': '<img src="icons/circle.svg" alt="">',
                null: ''
            };
            cell.innerHTML = incons[cellValue];
        });
    }

    function updateMessage(newMessage) {
        msgBoard.textContent = newMessage;
    }

    const disableElement = (element) => {
        if (element.tagName === 'DIV') {
            element.classList.add('blocked');
        } else { element.setAttribute('disabled', '') }
    };
    const enableElement = (element) => {
        if (element.tagName === 'DIV') {
            element.classList.remove('blocked');
        } else { element.removeAttribute('disabled') }
    }

    const enableGameBtn = () => enableElement(gameBtn);
    const disableGameBtn = () => disableElement(gameBtn);

    const enableNamesBtn = () => enableElement(namesBtn);
    const disableNamesBtn = () => disableElement(namesBtn);

    const enableCells = () => domCells.forEach(cell => enableElement(cell));
    const disableCells = () => domCells.forEach(cell => disableElement(cell));


    function transferPlayersToNamesListeners(players) {
        namesForm.addEventListener('submit', (e) => {
            const player1Name = document.querySelector('#player1-form').value;
            const player2Name = document.querySelector('#player2-form').value;
            if (player1Name === player2Name) {
                e.preventDefault();
                alert('Names must be unique');
                return;
            }
            players[0].name = player1Name;
            players[1].name = player2Name;
        });

        namesBtn.addEventListener('click', () => {
            document.querySelector('#player1-form').value = players[0].name;
            document.querySelector('#player2-form').value = players[1].name;
            namesDialog.showModal();
        });
    }

    function linkPlayRoundToCells(playRound) {
        domCells.forEach(
            (cell) => cell.addEventListener('click', (e) => {
                playRound(e.target.id.split(':').map(Number));
            })
        )
    }

    function linkStartGameToGameBtn(startGame) {
        gameBtn.addEventListener('click', () => {
            startGame();
        })
    }

    function updateBtn() {
        if (gameBtn.textContent === 'Start game') {
            gameBtn.textContent = 'Reset game';
        }
    }

    return {
        renderBoardValues,
        updateMessage,
        linkPlayRoundToCells,
        disableCells,
        enableCells,
        linkStartGameToGameBtn,
        updateBtn,
        disableGameBtn,
        enableGameBtn,
        disableNamesBtn,
        enableNamesBtn,
        transferPlayersToNamesListeners,
    };
})();

const GameController = (function (game, gameView) {
    const startGame = function () {
        game.resetModel();
        gameView.updateMessage(`Now is ${game.getActivePlayer().name} turn!`);
        gameView.renderBoardValues(game.getGameBoardObj().getBoard());
        gameView.enableCells();
        gameView.disableGameBtn();
        gameView.disableNamesBtn();
    }

    const playRound = function (cellCoord) {
        const [x, y] = cellCoord;
        const isSet = game.getGameBoardObj().setCellMark(x, y, game.getActivePlayer());
        if (!isSet) {
            gameView.updateMessage('Cell is not empty.');
            return;
        }

        gameView.renderBoardValues(game.getGameBoardObj().getBoard());
        game.checkWinnerExistence();

        const { winnerExist, istie, winner } = game.getGameStatus();
        if (winnerExist || istie) {
            gameView.disableCells();
            gameView.updateBtn();
            gameView.enableGameBtn();
            gameView.enableNamesBtn();
        }
        if (winnerExist) {
            gameView.updateMessage('Winner is ' + winner.name);
        } else if (istie) {
            gameView.updateMessage('It is tie!');
        } else {
            game.switchPlayerTurn();
            gameView.updateMessage(`Now is ${game.getActivePlayer().name} turn!`);
        }
    }
    gameView.disableCells();
    gameView.linkStartGameToGameBtn(startGame);
    gameView.linkPlayRoundToCells(playRound);
    gameView.transferPlayersToNamesListeners(game.getPlayers());

})(Game, GameView);