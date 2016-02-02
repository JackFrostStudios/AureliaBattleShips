import {inject} from 'aurelia-framework';
import {TaskQueue} from 'aurelia-task-queue';

@inject(TaskQueue)
export class game {
  convertNumberToLetter = function (number){
    var letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
    return letters[number];
  }

  convertTileStateToColour = function (number){
    var colours = ["white", "black", "LightSkyBlue", "red", "green"];
    return colours[number];
  }

  convertShipIdToColour = function (Id){
    var colours = ["DarkMagenta", "Gold", "DeepPink", "Brown", "Navy"];
    return colours[Id];
  }

  clickPlayerBoard = function (row, column){
    if(this.gameStage === 0) {
      this.placeShipPart(row,column);
    }
  }

  clickEnemyBoard = function (row, column){
    if(this.gameStage === 1) {
      if (!this.takePlayerTurn(row, column)) {return;};
      if(this.checkIfGameWon(false)){
        this.gameStage = 2;
        this.log.push("Well done you won!");
        this.updateConsoleLog();
        alert(this.log[this.log.length-1]);
        return;
      };
      this.takeEnemyTurn();
      if(this.checkIfGameWon(true)){
        this.gameStage = 2;
        this.log.push("You lose! Computer won!");
        this.updateConsoleLog();
        alert(this.log[this.log.length-1]);
        return;
      };
    }
  }

  placeShipPart = function (row, column){
    if(this.currentShip.placementFinished){
      this.placeShipPartForNewShip(row,column);
    } else {
      this.placeShipPartForCurrentShip(row,column);
    }
  }

  placeShipPartForCurrentShip = function(row, column){
    if(this.isSelectedCoordinateValidForCurrentShip(row, column))
    {
      var minRow, maxRow, minColumn, maxColumn;
      this.resetValidPositionsPlayerOnBoard();
      if (this.currentShip.confirmedPositions[0].row === row){
        if(this.currentShip.confirmedPositions[0].column > column){
          maxColumn = this.currentShip.confirmedPositions[0].column;
          minColumn = column;
        } else {
          maxColumn = column;
          minColumn = this.currentShip.confirmedPositions[0].column;
        }
        this.currentShip.confirmedPositions = [];
        for (var i = minColumn; i <= maxColumn; i++){
          this.playerBoard[row][i].tileState = 1;
          this.playerBoard[row][i].colour = this.convertShipIdToColour(this.currentShip.shipId);
          this.playerBoard[row][i].shipId = this.currentShip.shipId;
          this.currentShip.confirmedPositions.push({row: row, column: i});
        }
      } else {
        if(this.currentShip.confirmedPositions[0].row > row){
          maxRow = this.currentShip.confirmedPositions[0].row;
          minRow = row;
        } else {
          maxRow = row;
          minRow = this.currentShip.confirmedPositions[0].row;
        }
        this.currentShip.confirmedPositions = [];
        for (var i = minRow; i <= maxRow; i++){
          this.playerBoard[i][column].tileState = 1;
          this.playerBoard[i][column].colour = this.convertShipIdToColour(this.currentShip.shipId);
          this.playerBoard[i][column].shipId = this.currentShip.shipId;
          this.currentShip.confirmedPositions.push({row: i, column: column});
        }
      }
      this.currentShip.validPositions = [];
      this.currentShip.placementFinished = true;
      this.playerShips.push(this.cloneObject(this.currentShip));
      if(this.playerShips.length === 5) {
        this.gameStage = 1;
        this.log.push("Ship placement completed, please click a tile on the enemy board to take a turn.");
        this.updateConsoleLog();
      } else {
        this.log.push("Ship placed successfully, please click a tile on the player board to start placing the next ship.");
        this.updateConsoleLog();
      }
    }
  }

  placeShipPartForNewShip = function (row,column) {
    if(this.playerBoard[row][column].shipId === -1)
    {
    this.currentShip.shipId += 1;
    this.currentShip.placementFinished = false;
    this.currentShip.type = this.getShipTypeFromId(this.currentShip.shipId);
    this.currentShip.confirmedPositions = [{row: row, column: column}];
    this.resetValidPositionsPlayerOnBoard();
    this.calculateValidPositionsForCurrentShip();
      if(this.currentShip.validPositions.length > 0){
        this.updateValidPositionsOnPlayerBoard();
        this.playerBoard[row][column].tileState = 1;
        this.playerBoard[row][column].colour = this.convertShipIdToColour(this.currentShip.shipId);
        this.playerBoard[row][column].shipId = this.currentShip.shipId;

        this.log.push("Please select a green tile to finish the placement of the current ship.");
        this.updateConsoleLog();
      } else {
        this.resetConfirmedPositionsOnPlayerBoardForCurrentShip();
        this.currentShip.confirmedPositions = [];
        this.currentShip.shipId--;
        this.currentShip.placementFinished = true;

        this.log.push(`The current ship can't be placed here, it needs ${this.getShipTypeLength(this.currentShip.type)} consecutive tiles. Please click on another tile to start ship placement.`);
        this.updateConsoleLog();
      }
    }
  }

  getShipTypeFromId = function (Id){
    var ships = ["Destroyer", "Sub", "Sub", "Battleship", "Carrier"];
    return ships[Id];
  }

  getShipTypeLength = function(type){
    var ships = [{type: "Destroyer", length: 2}, {type: "Sub", length: 3}, {type: "Battleship", length: 4}, {type: "Carrier", length: 5}];
    for(let ship of ships){
      if(ship.type === type) { return ship.length;}
    }
  }

  resetValidPositionsPlayerOnBoard = function(){
      for(let position of this.currentShip.validPositions){
        this.playerBoard[position.row][position.column].tileState = 0;
        this.playerBoard[position.row][position.column].colour = this.convertTileStateToColour(0);
      }
  }

  updateValidPositionsOnPlayerBoard = function(){
    for(let position of this.currentShip.validPositions){
      this.playerBoard[position.row][position.column].tileState = 5;
      this.playerBoard[position.row][position.column].colour = this.convertTileStateToColour(4);
    }
  }

  resetConfirmedPositionsOnPlayerBoardForCurrentShip = function(){
    for(let position of this.currentShip.confirmedPositions){
      this.playerBoard[position.row][position.column].shipId = -1;
      this.playerBoard[position.row][position.column].tileState = 0;
      this.playerBoard[position.row][position.column].colour = this.convertTileStateToColour(0);

    }
  }

  calculateValidPositionsForCurrentShip = function(){
    this.currentShip.validPositions = [];
    var adjustedShipLength = this.getShipTypeLength(this.currentShip.type) - 1;
    if(this.canShipCanBePlaced(this.currentShip.confirmedPositions[0].row, this.currentShip.confirmedPositions[0].column, 0, this.currentShip.shipId, this.playerBoard)){
      this.currentShip.validPositions.push({row: this.currentShip.confirmedPositions[0].row, column: this.currentShip.confirmedPositions[0].column + adjustedShipLength})
    }
    if(this.canShipCanBePlaced(this.currentShip.confirmedPositions[0].row, this.currentShip.confirmedPositions[0].column, 1, this.currentShip.shipId, this.playerBoard)){
      this.currentShip.validPositions.push({row: this.currentShip.confirmedPositions[0].row + adjustedShipLength, column: this.currentShip.confirmedPositions[0].column})
    }
    if(this.canShipCanBePlaced(this.currentShip.confirmedPositions[0].row, this.currentShip.confirmedPositions[0].column, 2, this.currentShip.shipId, this.playerBoard)){
      this.currentShip.validPositions.push({row: this.currentShip.confirmedPositions[0].row, column: this.currentShip.confirmedPositions[0].column - adjustedShipLength})
    }
    if(this.canShipCanBePlaced(this.currentShip.confirmedPositions[0].row, this.currentShip.confirmedPositions[0].column, 3, this.currentShip.shipId, this.playerBoard)){
      this.currentShip.validPositions.push({row: this.currentShip.confirmedPositions[0].row - adjustedShipLength, column: this.currentShip.confirmedPositions[0].column})
    }
  }

  isSelectedCoordinateValidForCurrentShip = function(row, column){
    var matches = this.currentShip.validPositions.filter((position) => {
      if(position.row === row && position.column === column){
        return true;
      } else {
        return false;
      }
    });

    if(matches.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  takePlayerTurn = function(row, column){
    if (this.enemyBoard[row][column].tileState > 1) { return false; }
    var shipId = this.enemyBoard[row][column].shipId;

    if(shipId === -1){
      this.enemyBoard[row][column].tileState = 2;
      this.enemyBoard[row][column].colour = this.convertTileStateToColour(2);
      this.log.push(`You missed at ${this.convertNumberToLetter(row)}${column}.`);
      this.updateConsoleLog();
    } else {
      this.enemyBoard[row][column].tileState = 3;
      this.enemyBoard[row][column].colour = this.convertTileStateToColour(3);
      this.log.push(`You hit at ${this.convertNumberToLetter(row)}${column+1}.`);
      this.updateConsoleLog();
      this.updateShipSunkStatus(shipId, false);
    }

    return true;
  }

  takeEnemyTurn = function() {
      var row = this.getRandomNumber(this.boardSize -1, 0);
      var column = this.getRandomNumber(this.boardSize - 1, 0);

      while(this.playerBoard[row][column].tileState > 1){
        column += 1;
        if(column > this.boardSize - 1) {
          column = 0;
          row +=1;
          if (row > this.boardSize -1){
            row = 0;
          }
        }
      }

      var shipId = this.playerBoard[row][column].shipId;

      if(shipId === -1){
        this.playerBoard[row][column].tileState = 2;
        this.playerBoard[row][column].colour = this.convertTileStateToColour(2);
        this.log.push(`Computer missed at ${this.convertNumberToLetter(row)}${column}.`);
        this.updateConsoleLog();
      } else {
        this.playerBoard[row][column].tileState = 3;
        this.playerBoard[row][column].colour = this.convertTileStateToColour(3);
        this.log.push(`Computer hit at ${this.convertNumberToLetter(row)}${column}.`);
        this.updateConsoleLog();
        this.updateShipSunkStatus(shipId, true);
      }
  }

  updateShipSunkStatus(Id, checkPlayer){
    if(checkPlayer) {
      var ships = this.playerShips;
      var board = this.playerBoard;
      var consoleText = "Player";
    } else {
      var ships = this.enemyShips;
      var board = this.enemyBoard;
      var consoleText = "Computer";
    }

    for (let ship of ships){
      if(ship.shipId === Id){
        for (let position of ship.confirmedPositions){
          if(board[position.row][position.column].tileState !== 3){
            return;
          }
        }
        ship.sunk = true;
        this.log.push(`${consoleText} ${ship.type} was sunk!`);
        this.updateConsoleLog();
        return;
      }
    }
  }

  checkIfGameWon = function(checkPlayer){
    if(checkPlayer){
      var ships = this.playerShips;
    } else {
      var ships = this.enemyShips;
    }
    for (let ship of ships){
      if(ship.sunk === false){
        return false;
      }
    }

    return true;
  }

  updateConsoleLog(){
      this.consoleLog = this.consoleLog + (this.log[this.log.length-1]) + "\n";
      this.taskQueue.queueMicroTask(() => {
          if(document.getElementById("battleshipsConsole")) {
            document.getElementById("battleshipsConsole").scrollTop = document.getElementById("battleshipsConsole").scrollHeight;
          }
      });
  }

  constructor(TaskQueue){
    this.taskQueue = TaskQueue;
    this.gameStage = 0;
    this.currentShip = {shipId: -1, confirmedPositions: [], validPositions: [], placementFinished: true, type: "none", sunk: false};
    this.playerShips = [];
    this.enemyShips = [];
    this.consoleLog = "";
    this.log = [];
    this.log.push("Welcome to battleships!");
    this.updateConsoleLog();
    this.log.push("Please click a tile on the player board to start placing a ship.");
    this.updateConsoleLog();

    this.initialiseGameBoard();
  }

  initialiseGameBoard = function (){
    this.boardSize = 10;
    this.playerBoard = [];
    this.enemyBoard = [];
    for(var i = 0; i < this.boardSize; i++){
        this.playerBoard.push([]);
        this.enemyBoard.push([]);

        for(var j = 0; j < this.boardSize; j++){
          this.playerBoard[i][j] = {tileState: 0, colour: this.convertTileStateToColour(0), shipId: -1};
          this.enemyBoard[i][j] = {tileState: 0, colour: this.convertTileStateToColour(0), shipId: -1};
        }
    }
    this.setEnemyBoardRandomShipPlacements();
  }

  setEnemyBoardRandomShipPlacements = function (){
    var shipPlaced;
    for (var i = 0; i < 5; i++){
      shipPlaced = false;
      while (!shipPlaced){
        var column = this.getRandomNumber(this.boardSize -1, 0);
        var row = this.getRandomNumber(this.boardSize -1, 0);
        var direction = this.getRandomNumber(1, 4);
        if(this.canShipCanBePlaced(row, column, direction, i, this.enemyBoard))
        {
          this.placeEnemyShip(row, column, direction, i);
          shipPlaced=true;
        }
      }
    }
  }

  canShipCanBePlaced = function(row, column, direction, Id, board){
    var shipSize = this.getShipTypeLength(this.getShipTypeFromId(Id));
    if(direction === 0){
      for (var i = column; i < column + shipSize; i++){
        if(i>this.boardSize-1 || board[row][i].shipId !== -1){
          return false;
        }
      }
    } else if (direction === 1){
      for (var i = row; i < row + shipSize; i++){
        if(i>this.boardSize-1 || board[i][column].shipId !== -1){
          return false;
        }
      }
    } else if(direction === 2){
      for (var i = column; i > column - shipSize; i--){
        if(i<0 || board[row][i].shipId !== -1){
          return false;
        }
      }
    } else if (direction === 3){
      for (var i = row; i > row - shipSize; i--){
        if(i<0 || board[i][column].shipId !== -1){
          return false;
        }
      }
    }

    return true;
  }

  placeEnemyShip = function (row, column, direction, Id){
    var shipType = this.getShipTypeFromId(Id);
    var shipSize = this.getShipTypeLength(shipType);
    var confirmedPositions = [];
    if(direction === 0){
      for (var i = column; i < column + shipSize; i++){
        this.enemyBoard[row][i].shipId = Id;
        //this.enemyBoard[row][i].colour = this.convertShipIdToColour(Id);
        confirmedPositions.push({row: row, column: i});
      }
    } else if (direction === 1){
      for (var i = row; i < row + shipSize; i++){
        this.enemyBoard[i][column].shipId = Id;
        //this.enemyBoard[i][column].colour = this.convertShipIdToColour(Id);
        confirmedPositions.push({row: i, column: column});
      }
    } else if(direction === 2){
      for (var i = column; i > column - shipSize; i--){
        this.enemyBoard[row][i].shipId = Id;
        //this.enemyBoard[row][i].colour = this.convertShipIdToColour(Id);
        confirmedPositions.push({row: row, column: i});
      }
    } else if (direction === 3){
      for (var i = row; i > row - shipSize; i--){
        this.enemyBoard[i][column].shipId = Id;
        //this.enemyBoard[i][column].colour = this.convertShipIdToColour(Id);
        confirmedPositions.push({row: i, column: column});
      }
    }
    this.enemyShips.push({confirmedPositions: confirmedPositions, shipId: Id, sunk: false, type: shipType});
  }

  getRandomNumber = function (max, min){
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  cloneObject = function (obj){
    if(obj == null || typeof(obj) != 'object')
        return obj;

    var temp = new obj.constructor();
    for(var key in obj)
        temp[key] = this.cloneObject(obj[key]);

    return temp;
}
}
