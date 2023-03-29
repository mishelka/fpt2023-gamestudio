import {Random} from './utils.js';

export const GameState = {PLAYING: "PLAYING", FAILED: "FAILED", SOLVED: "SOLVED"};
export const TileState = { OPEN: "OPEN", CLOSED: "CLOSED", MARKED: "MARKED" };

export class Field {
  tiles;
  state = GameState.PLAYING;
  startMillis = 0;
  rowCount; columnCount; mineCount;

  constructor(rowCount = 10, columnCount = 10, mineCount = 10) {
    this.rowCount = rowCount;
    this.columnCount = columnCount;
    this.mineCount = mineCount;

    this.tiles = new Array(this.rowCount);
    for (let row = 0; row < this.rowCount; row++) {
      this.tiles[row] = new Array(this.columnCount);
    }

    this.generate();
  }

  generate() {
    this.state = GameState.PLAYING;

    this.generateMines();
    this.fillWithClues();
    this.startMillis = new Date().getMilliseconds();
  }

  generateMines() {
    const random = new Random();
    let minesToSet = this.mineCount;

    while (minesToSet > 0) {
      const row = random.next(this.rowCount - 1);
      const col = random.next(this.columnCount - 1);

      if (!this.tiles[row][col]) {
        this.tiles[row][col] = new Mine();
        minesToSet--;
      }
    }
  }

  fillWithClues() {
    for (let row = 0; row < this.rowCount; row++) {
      for (let col = 0; col < this.columnCount; col++) {
        if (!this.tiles[row][col]) {
          this.tiles[row][col] = new Clue(this.countNeighbourMines(row, col));
        }
      }
    }
  }

  countNeighbourMines(row, col) {
    let count = 0;

    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
      const acurRow = row + rowOffset;

      if (acurRow >= 0 && acurRow < this.rowCount) {
        for (let colOffset = -1; colOffset <= 1; colOffset++) {
          const acurColumn = col + colOffset;

          if (acurColumn >= 0 && acurColumn < this.columnCount) {
            if (this.tiles[acurRow][acurColumn] instanceof Mine) {
              count++;
            }
          }
        }
      }
    }
    return count;
  }

  getTile(row, col) {
    return this.tiles[row][col];
  }

  openTile(row, col) {
    const tile = this.tiles[row][col];

    if (tile.state === TileState.CLOSED) {
      tile.state = TileState.OPEN;
      if (tile instanceof Mine) {
        this.state = GameState.FAILED;
        return;
      }
      if (tile instanceof Clue) {
        if (tile.value === 0) {
          this.openNeighbouringTiles(row, col);
        }
      }
      if (this.isSolved()) {
        this.state = GameState.SOLVED;
      }
    }
  }

  openNeighbouringTiles(row, col) {
    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
      const acurRow = row + rowOffset;
      if (acurRow >= 0 && acurRow < this.rowCount) {
        for (let colOffset = -1; colOffset <= 1; colOffset++) {
          const acurColumn = col + colOffset;
          if (acurColumn >= 0 && acurColumn < this.columnCount) {
            this.openTile(acurRow, acurColumn);
          }
        }
      }
    }
  }

  markTile(row, col) {
    const tile = this.tiles[row][col];

    if (tile.state === TileState.CLOSED) {
      tile.state = TileState.MARKED;
    } else if (tile.state === TileState.MARKED) {
      tile.state = TileState.CLOSED;
    }
  }

  isSolved() {
    return this.rowCount * this.columnCount - this.mineCount === this.getNumberOfOpen();
  }

  getNumberOfOpen() {
    let count = 0;
    for (let row = 0; row < this.rowCount; row++) {
      for (let col = 0; col < this.columnCount; col++) {
        if (this.tiles[row][col].state === TileState.OPEN) {
          count++;
        }
      }
    }
    return count;
  }

  getScore() {
    if (this.state === GameState.SOLVED) {
      const seconds = Math.ceil((new Date().getMilliseconds() - this.startMillis) / 1000);
      return this.rowCount * this.columnCount * 3 - seconds;
    }
    return 0;
  }
}

export class Tile {
  state = TileState.CLOSED;
}

export class Clue extends Tile {
  constructor(value) {
    super();
    this.value = value;
  }
}

export class Mine extends Tile {
}