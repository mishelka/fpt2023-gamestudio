import {Field, GameState, TileState} from './mines.model.js';

const API_URL = 'http://localhost:8080/api';
export let field;
export let scores = [];
export let comments = [];

class Score {
  id = -1;
  game = 'mines';
  player;
  points;
  playedOn;

  constructor(player, points) {
    this.player = player;
    this.points = points;
    this.playedOn = JSON.parse(JSON.stringify(Date.now()));
  }
}
class Comment {
  id = -1;
  game = 'mines';
  player;
  comment;
  commentedOn;

  constructor(player, comment, commentedOn) {
    this.player = player;
    this.comment = comment;
    this.commentedOn = commentedOn;
  }

  get id() {
    return this.id;
  }

  set id(value) {
    this.id = value;
  }

  get game() {
    return this.game;
  }

  set game(value) {
    this.game = value;
  }

  get player() {
    return this.player;
  }

  set player(value) {
    this.player = value;
  }

  get comment() {
    return this.comment;
  }

  set comment(value) {
    this.comment = value;
  }

  get commentedOn() {
    return this.commentedOn;
  }

  set commentedOn(value) {
    this.commentedOn = value;
  }
}

function renderField() {
  console.log(field);
  if(!field) return;
  // <div class="tile tile-1" row="0" col="0">1</div>
  // <div class="tile closed"></div>
  // <div class="tile marked"></div>
  // <div class="tile mine"></div>
  const mineFieldElem = document.querySelector("#minefield");
  mineFieldElem.innerHTML = ""; //reset the playing field in the UI
  mineFieldElem.setAttribute("style", "grid-template-columns: " + "0fr ".repeat(field.columnCount));

  for (let r = 0; r < field.rowCount; r++) {
    for (let c = 0; c < field.columnCount; c++) {
      const tile = field.tiles[r][c];
      const tileElem = document.createElement("div");

      if(tile.value === undefined && tile.state === GameState.OPEN) {
        tileElem.setAttribute("class", "tile mine " + tile.state.toLowerCase());
      } else {
        tileElem.setAttribute("class", "tile tile-" + tile.value + " " + tile.state.toLowerCase());
        if(tile.state === TileState.OPEN && tile.value !== 0) {
          tileElem.innerHTML = tile.value;
        }
      }

      tileElem.addEventListener("click", () => openTile(r, c));
      tileElem.addEventListener("contextmenu", () => markTile(r, c, event));

      mineFieldElem.appendChild(tileElem);
    }
  }
}

export function displayScores() {
  // style="display: none;"
  //  score-tab
  //  comment-tab
  const scoreTabElem = document.querySelector("#score-tab");
  const commentTabElem = document.querySelector("#comment-tab");

  scoreTabElem.setAttribute("style", "");
  commentTabElem.setAttribute("style", 'style="display: none;"');
}

export function displayComments() {
  const scoreTabElem = document.querySelector("#score-tab");
  const commentTabElem = document.querySelector("#comment-tab");

  scoreTabElem.setAttribute("style", 'style="display: none;"');
  commentTabElem.setAttribute("style", "");
}

function renderScores() {
  const scoresElem = document.querySelector("#scores");
  scoresElem.innerHTML = ""; //reset the score table in the UI

  for (const s of scores) {
    scoresElem.innerHTML += `
      <tr>
        <td>${s.player}</td>
        <td>${s.points}</td>
        <td>${new Date(s.playedOn).toLocaleString()}</td>
      </tr>
    `;
  }
}
function renderComments() {
  const commentsElem = document.querySelector("#comments");
  commentsElem.innerHTML = ""; //reset the score table in the UI

  for (const c of comments) {
    commentsElem.innerHTML += `
      <tr>
        <td>${c.player}</td>
        <td>${c.comment}</td>
        <td>${new Date(c.commentedOn).toLocaleString()}</td>
      </tr>
    `;
  }
}

function checkGameState() {
  if(field.state !== GameState.PLAYING) {
    const modalElem = document.querySelector("#winLoseModal");
    const modalTitle = document.querySelector("#modalHeader");
    const modalBody = document.querySelector("#modalContent");

    const title = field.state === GameState.FAILED ? 'You lost!' : 'You won!';
    const text = title + ' Do you want to play again?';

    if(field.state === GameState.SOLVED) addScore();

    modalTitle.innerHTML = title;
    modalBody.innerHTML = text;

    // modalElem.classList.toggle('hidden');
    modalElem.setAttribute('style', 'opacity: 1;');
    modalElem.setAttribute('aria-hidden', 'false');
  }
}

export function openTile(row, col) {
  if(field.state !== GameState.PLAYING) return;

  field.openTile(row, col);
  renderField();
  checkGameState();
}
export function markTile(row, col, event) {
  event.preventDefault();
  if(field.state !== GameState.PLAYING) return;

  field.markTile(row, col);
  renderField();
}

export function newGame(event) {
  if(event)
    event.preventDefault(); //prevent browser refresh on form submit

  //problem bol, ze do new Field mi isli stringy, takze tam dam vsade +, aby z toho bolo cislo :)
  let rows = +document.newGameForm.rows.value;
  let cols = +document.newGameForm.cols.value;
  let mines = +document.newGameForm.mines.value;

  if(!rows) rows = 10;
  if(!cols) cols = 10;
  if(!mines) mines = 10;

  console.log(rows, cols, mines);

  field = new Field(rows, cols, mines);

  renderField();
}

async function loadScores() {
  try {
    const response = await fetch(API_URL +  '/score/mines');
    if(response.status === 200) {
      scores = await response.json();
      renderScores();
    }
  } catch(err) {
    console.error("Sorry, an error occured", err);
  }
}
async function loadComments() {
  try {
    const response = await fetch(API_URL +  '/comment/mines');
    if(response.status === 200) {
      comments = await response.json();
      renderComments();
    }
  } catch(err) {
    console.error("Sorry, an error occured", err);
  }
}

async function addScore() {
  let score = new Score('miska', field.score);
  delete score.id;

  try {
    const response = await fetch(`${API_URL}/score`, {
      method: 'post',
      body: JSON.stringify(score),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    if (response.status === 200) {
      console.log("Score successfully added!");
      await loadScores();
    }
  } catch (error) {
    console.error(error);
  }
}

export async function addComment() {
  const player = document.commentForm.name.value;
  const message = document.commentForm.comment.value;

  // const comment = {
  //   'game': 'mines',
  //   'player': player,
  //   'comment': message,
  //   'commentedOn': JSON.parse(JSON.stringify(Date.now()))
  // };

  const comment = new Comment(player, message, JSON.parse(JSON.stringify(Date.now())));
  delete comment.id;
  console.log(comment);

  try {
    const response = await fetch(`${API_URL}/comment`, {
      method: 'post',
      body: JSON.stringify(comment),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    if (response.status === 200) {
      console.log("Comment successfully added!");
      document.commentForm.name.value = '';
      document.commentForm.comment.value = '';
      await loadComments();
    }
  } catch (error) {
    console.error(error);
  }
}

export function newGameModal() {
  newGame();
  closeModal();
}
export function closeModal() {
  const modalElem = document.querySelector("#winLoseModal");
  // modalElem.classList.toggle('hidden');
  modalElem.setAttribute('style', 'opacity: 0; z-index: -10;');
  modalElem.setAttribute('aria-hidden', 'true');
}

window.onload = () => {
  loadScores();
  loadComments();
  //loadRating();
  newGame();

  document.querySelector("#scoreTabButton").addEventListener("click", displayScores);
  document.querySelector("#commentTabButton").addEventListener("click", displayComments);
  document.querySelector("#formNewGameButton").addEventListener("click", newGame);
  document.querySelector("#modalExitButton").addEventListener("click", closeModal);
  document.querySelector("#modalCloseButton").addEventListener("click", closeModal);
  document.querySelector("#modalNewGameButton").addEventListener("click", newGameModal);

}//when DOM is ready and all content, including images, is loaded
// window.addEventListener("load", renderField);
// $(document).ready(renderField); //when the DOM is ready //you have to have jquery added in head
// document.addEventListener("DOMContentLoaded", newGame);