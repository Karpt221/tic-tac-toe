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
        if(gameBoard[x][y] === 'X' || gameBoard[x][y] === 'O'){
            return false;
        }
        gameBoard[x][y] = player.mark;
        return true;
    };

    const getBoardCopy = function () {
        return JSON.parse(JSON.stringify(gameBoard));
    };

    return {
        getCellMark,
        setCellMark,
        getBoardCopy,
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

    const setGameStatus = function (winnerExist = false, isToe = false, winner = null) {
        gameStatus.isToe = isToe;
        gameStatus.winnerExist = winnerExist;
        gameStatus.winner = winner;
    }

    const getGameStatus = function () {
        return gameStatus;
    }

    const getGameBoard = function () {
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
        const board = gameBoard.getBoardCopy();
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
        getGameBoard,
        getPlayers
    };

})(GameBoard);

const GameView = (function () {
    
})();

const GameController = (function (game, gameView) {
    function getBoardStr(board) {
        let boardString = '';
        for (let row of board) {
            let boardRow = row.map(cell => cell === null ? '.' : cell).join('   ');
            boardString += boardRow + '\n';
        }

        return boardString;
    }
    const playGame = function () {
        console.log('Game begins!');
        alert('Game begins!');

        let player1Name = prompt('Enter player 1 name');
        let player2Name = prompt('Enter player 2 name');

        game.getPlayers()[0].name = player1Name;
        game.getPlayers()[1].name = player2Name;

        let gameStatus = game.getGameStatus();

        while (!gameStatus.winner && !gameStatus.isToe) {
            gameStatus = playRound();
        }

        if (gameStatus.winnerExist) {
            console.log('Winner is ' + gameStatus.winner.name);
            alert('Winner is ' + gameStatus.winner.name);
            alert(getBoardStr(game.getGameBoard().getBoardCopy()));
        } else if (gameStatus.isToe) {
            console.log('It is Toe!');
            alert('It is Toe!');
            alert(getBoardStr(game.getGameBoard().getBoardCopy()));
        }
    }

    const playRound = function () {
        console.log('It is ' + game.getActivePlayer().name + ' turn!');
        console.log(game.getGameBoard().getBoardCopy());

        alert('It is ' + game.getActivePlayer().name + ' turn!');
        alert(getBoardStr(game.getGameBoard().getBoardCopy()));

        let isSet = null;
        while (! isSet) {
            let playersChoice = prompt('Enter cell x:y coordinates!');
            playersChoice = {
                x: Number.parseInt(playersChoice.at(0)),
                y: Number.parseInt(playersChoice.at(2))
            };
            isSet = game.getGameBoard().setCellMark(playersChoice.x, playersChoice.y, game.getActivePlayer());
            if(! isSet){
                alert('This cell already set!');
            }
        }
        game.checkWinnerExistence();
        game.switchPlayerTurn();
        return game.getGameStatus()
    }

    return { playGame };
})(Game, GameView);

GameController.playGame();