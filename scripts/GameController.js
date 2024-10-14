const GameBoard = (function () {
    let gameBoard = [];
    const resetBoard = function () {
        gameBoard = Array(3).fill().map(() => Array(3).fill(null));
    };

    resetBoard();

    const getCellMark = function (x, y) {
        return gameBoard[x][y];
    };

    const setCellMark = function (x, y, player) {
        if (gameBoard[x][y] === 'X' || gameBoard[x][y] === 'O') {
            return false;
        }
        gameBoard[x][y] = player.mark;
        return true;
    };

    const getBoard = function () {
        //return JSON.parse(JSON.stringify(gameBoard));
        return gameBoard;
    };

    return {
        getCellMark,
        setCellMark,
        getBoard,
        resetBoard
    };
})();

const Game = (function (gameBoard) {
    const players = [
        {
            name: 'Player1',
            mark: 'O'
        },
        {
            name: 'Player2',
            mark: 'X'
        }
    ];
    let activePlayer = players[0];

    const gameStatus = { winnerExist: false, isToe: false, winner: null };

    const resetModel = function () {
        gameBoard.resetBoard();
        activePlayer = players[0];
    }

    const setGameStatus = function (winnerExist = false, isToe = false, winner = null) {
        gameStatus.isToe = isToe;
        gameStatus.winnerExist = winnerExist;
        gameStatus.winner = winner;
    }

    const getGameStatus = function () {
        return gameStatus;
    }

    const getGameBoardObj = function () {
        return gameBoard;
    }

    const getPlayers = function () {
        return players;
    }

    const getActivePlayer = function () {
        return activePlayer;
    }

    const switchPlayerTurn = function () {
        activePlayer = (activePlayer === players[0] ? players[1] : players[0]);
    }

    const checkWinnerExistence = function () {
        const board = gameBoard.getBoard();
        let winnerMark = null;
        let fullyFilledBoard = false;

        // Check Rows
        for (let row = 0; row < 3; row++) {
            if (board[row][0] === board[row][1]
                && board[row][1] === board[row][2]
                && board[row][0] !== null) {
                winnerMark = board[row][0];
            }
        }

        // Check Columns
        for (let col = 0; col < 3; col++) {
            if (board[0][col] === board[1][col]
                && board[1][col] === board[2][col]
                && board[0][col] !== null) {
                winnerMark = board[0][col];
            }
        }

        // Check Diagonals
        if (board[0][0] === board[1][1]
            && board[1][1] === board[2][2]
            && board[0][0] !== null) {
            winnerMark = board[0][0];
        }

        if (board[0][2] === board[1][1]
            && board[1][1] === board[2][0]
            && board[0][2] !== null) {
            winnerMark = board[0][2];
        }

        if (winnerMark !== null) {
            if (winnerMark === 'O') {
                setGameStatus(true, false, players[0]);
            } else {
                setGameStatus(true, false, players[1]);
            }
        } else {
            fullyFilledBoard = board.every((row) => row.every((cell) => cell !== null));
            if (fullyFilledBoard) {
                setGameStatus(false, true);
            } else {
                setGameStatus(false, false);
            }
        }



    }
    return {
        checkWinnerExistence,
        switchPlayerTurn,
        getGameStatus,
        getActivePlayer,
        getGameBoardObj,
        getPlayers,
        resetModel,
    };

})(GameBoard);

const GameView = (function () {
    const msgBoard = document.querySelector('.msg-board > p');
    const domCells = document.querySelectorAll('.cell');
    const gameBtn = document.querySelector('.game-btn');

    disableCells();

    function idToCoord(id) {
        return id.split(':').map(Number)
    }

    const renderBoardValues = function (gameBoard) {
        for (const cell of domCells) {
            let [x, y] = idToCoord(cell.id);
            if (gameBoard[x][y] === null) {
                cell.textContent = '';
            } else {
                cell.textContent = gameBoard[x][y];
            }
        }
    }

    function disableGameBtn() {
        gameBtn.setAttribute('disabled','');
    }

    function enableGameBtn() {
        gameBtn.removeAttribute('disabled');
    }

    function disableCells() {
        domCells.forEach((cell)=> cell.classList.add('blocked'));
    }

    function enableleCells() {
        domCells.forEach((cell)=> cell.classList.remove('blocked'));
    }

    function updateMessage(newMessage) {
        msgBoard.textContent = newMessage;
    }

    function addListenersToCells(playRound) {
        domCells.forEach(
            (cell) => cell.addEventListener('click', (e) => {
                playRound(idToCoord(e.target.id));
            })
        )
    }

    function updateBtn() {
        if(gameBtn.textContent === 'Start game'){
            gameBtn.textContent = 'Reset game';
        }
    }

    function addListenersToGameBtn(startGame) {
        gameBtn.addEventListener('click', () => {
                startGame();
            })
    }

    return {
        renderBoardValues,
        updateMessage,
        addListenersToCells,
        disableCells,
        enableleCells,
        addListenersToGameBtn,
        updateBtn,
        disableGameBtn,
        enableGameBtn,
    };
})();

const GameController = (function (game, gameView) {
    
    const startGame = function () {
        game.resetModel();
        gameView.updateMessage(`Now is ${game.getActivePlayer().name} turn!`);
        gameView.renderBoardValues(game.getGameBoardObj().getBoard());
        gameView.enableleCells();
        gameView.disableGameBtn();
    }

    
    const playRound = function (cellCoord) {
        let [x, y] = cellCoord;

        let isSet = game.getGameBoardObj().setCellMark(x, y, game.getActivePlayer());
        if (!isSet) {
            gameView.updateMessage('Cell is not empty.')
        } else {
            gameView.renderBoardValues(game.getGameBoardObj().getBoard());
            game.checkWinnerExistence();
            
            let gameStatus = game.getGameStatus();
            if(gameStatus.winnerExist || gameStatus.isToe){
                gameView.disableCells();
                gameView.updateBtn();
                gameView.enableGameBtn();
            }
            if (gameStatus.winnerExist) {
                gameView.updateMessage('Winner is ' + gameStatus.winner.name);
                
            } else if (gameStatus.isToe) {
                gameView.updateMessage('It is Toe!');
            }else{
                game.switchPlayerTurn();
                gameView.updateMessage(`Now is ${game.getActivePlayer().name} turn!`);
            }
        }
    }

    gameView.addListenersToGameBtn(startGame);
    gameView.addListenersToCells(playRound);

})(Game, GameView);
