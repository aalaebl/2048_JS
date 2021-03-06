// Global Variables
const cards = document.querySelectorAll("li");
const score = document.querySelector("#score");
const status = document.querySelector(".info");
const high_score = document.querySelector("#highscore");
const sfx = document.querySelector("#sfx");
const container = document.querySelector("#container");

let board = [ [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0]];
let prevboard = [ [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0]];
const boardSize = 4;
let limit_undo = 0;
let score_num = 0;
let prevScore = 0;

let HIGHSCORE = localStorage.getItem("highScore");
  if(HIGHSCORE != null){
    HIGHSCORE = JSON.parse(HIGHSCORE);
  } else {
    HIGHSCORE = 0;
  }

let pageWidth = window.innerWidth || document.body.clientWidth;
let treshold = Math.max(1,Math.floor(0.01 * (pageWidth)));
let touchstartX = 0;
let touchstartY = 0;
let touchendX = 0;
let touchendY = 0;

const limit = Math.tan(45 * 1.5 / 180 * Math.PI);
const gestureZone = document.getElementById('modalContent');

// Functions

const PopUpText = () => {
  const popup = document.querySelector("#myPopup");
  popup.classList.toggle("show");
}
const NewValue = () => {
  const value = Math.floor(Math.random() * 8 + 1) === 1? 4 : 2;
  return value;
}

const IsEmpty = () => {
  for(let i=0; i < boardSize; i++){
    for(let j=i; j< boardSize; j++){
      if(board[i][j] === 0){
        return true;
      }
    }
  }
  return false;
}

const AddNewValue = () => {
  if(IsEmpty()){
    let row = Math.floor(Math.random() * boardSize);
    let col = Math.floor(Math.random() * boardSize);

    while(!(board[row][col] === 0)){
      row = Math.floor(Math.random() * boardSize);
      col = Math.floor(Math.random() * boardSize);
    }
    board[row][col] = NewValue();
}
}

const InitBoard = () => {
  AddNewValue();
  AddNewValue();
  UpdateBoard(board);
}

const UpdateBoard = (board) =>{
  sfx.play();
  score.innerHTML = score_num;
  high_score.innerHTML = HIGHSCORE;
  for(let _ = 0; _< boardSize ; _++){
    board[_].map((number, index) => {
      Reset(_, index);

    })
  }

  for(let _ = 0; _< boardSize ; _++){
    board[_].map((number, index) => {
      cards[4 * _+ index].classList.add(`_${number}_`)
      if(number === 0){
        Reset(_, index);
        cards[4 * _+ index].innerText = "";
      }else{
        cards[4 * _+ index].innerText = number;
      }
         
    })
  }
}

const Reset = (i, j) => {
  cards[i * 4 + j].className = '';
}

const MergeLeft= (board) => {
  for(let i = 0; i< boardSize ; i++){
    for(let _ = 0; _< boardSize ; _++){
      for(let j = boardSize - 1; j> 0 ; j--){
        if(board[i][j-1] === 0){
          board[i][j-1] = board[i][j];
          board[i][j] = 0;
        }
      }}
    
    for(let j = 0; j< boardSize -1 ; j++){
      if(board[i][j] === board[i][j+1]){
        board[i][j] *= 2;
        score_num += board[i][j] + (board[i][j] % 9);
        if(score_num > HIGHSCORE){
          HIGHSCORE = score_num;
          localStorage.setItem("highScore", JSON.stringify(HIGHSCORE));
        }
        board[i][j+1] =0;
      }
    }

    for(let j = boardSize - 1; j> 0 ; j--){
        if(board[i][j-1] === 0){
          board[i][j-1] = board[i][j];
          board[i][j] = 0;
        }
      }
    
  }
  return board;
}

const Reverse= (board) => {
  for(let row = 0; row < boardSize; row++){
    board[row].reverse()
  }
}

const MergeRight = (board) => {
  Reverse(board);
  MergeLeft(board);
  Reverse(board);
  return board;
}

const Transpose = (board) => {
  for(let i=0; i < boardSize; i++){
    for(let j=i; j< boardSize; j++){
      const temp = board[i][j];
      board[i][j] = board[j][i];
      board[j][i] = temp;
    }
  }
}

const MergeUp = (board) => {
  Transpose(board);
  MergeLeft(board);
  Transpose(board);
  return board;
}

const MergeDown = (board) => {
  Transpose(board);
  MergeRight(board);
  Transpose(board);
  return board;
}

const HandleGesture = (e) => {
    let x = touchendX - touchstartX;
    let y = touchendY - touchstartY;
    let xy = Math.abs(x / y);
    let yx = Math.abs(y / x);
    if (Math.abs(x) > treshold || Math.abs(y) > treshold) {
        if (yx <= limit) {
            if (x < 0) {
                return 'left';
            } else {
                return 'right';
            }
        }
        if (xy <= limit) {
            if (y < 0) {
                return 'up';
            } else {
                return 'down';
            }
        }
    } 
}

const GetMove = () => {
  // for mobile devices
  container.addEventListener('touchstart', function(event) {
    touchstartX = event.changedTouches[0].screenX;
    touchstartY = event.changedTouches[0].screenY;
}, false);

  container.addEventListener('touchend', function(event) {
    touchendX = event.changedTouches[0].screenX;
    touchendY = event.changedTouches[0].screenY;
    switch(HandleGesture(event)) {
      case 'left':
        const temp1 = JSON.parse(JSON.stringify(board));
        prevBoard = temp1;
        prevScore = score_num;
        IsOver();
        MergeLeft(board);
        if(UselessMove(temp1, board)){
          break;
        } else {
          AddNewValue();
          UpdateBoard(board);
          return board;
        }
      case 'up':
        const temp2 = JSON.parse(JSON.stringify(board));
        prevBoard = temp2;
        prevScore = score_num;
        IsOver();
        MergeUp(board);
        if(UselessMove(temp2, board)){
          break;
        } else {
          AddNewValue();
          UpdateBoard(board);
          return board;
        }
      case 'right':
        const temp3 = JSON.parse(JSON.stringify(board));
        prevBoard = temp3;
        prevScore = score_num;
        IsOver();
        MergeRight(board);
        if(UselessMove(temp3, board)){
          break;
        } else {
          AddNewValue();
          UpdateBoard(board);
          return board;
        }
      case 'down':
        const temp4 = JSON.parse(JSON.stringify(board));
        prevBoard = temp4;
        prevScore = score_num;
        IsOver();
        MergeDown(board);
        if(UselessMove(temp4, board)){
          break;
        } else {
          AddNewValue();
          UpdateBoard(board);
          return board;
        }
      default:
        break;  
    }
  }, false); 

  // for computers
  this.addEventListener("keydown", (event) => {
    switch(event.which) {
      case 37:
        const temp1 = JSON.parse(JSON.stringify(board));
        prevBoard = temp1;
        prevScore = score_num;
        IsOver();
        MergeLeft(board);
        if(UselessMove(temp1, board)){
          break;
        } else {
          AddNewValue();
          UpdateBoard(board);
          return board;
        }
      case 38:
        const temp2 = JSON.parse(JSON.stringify(board));
        prevBoard = temp2;
        prevScore = score_num;
        IsOver();
        MergeUp(board);
        if(UselessMove(temp2, board)){
          break;
        } else {
          AddNewValue();
          UpdateBoard(board);
          return board;
        }
      case 39:
        const temp3 = JSON.parse(JSON.stringify(board));
        prevBoard = temp3;
        prevScore = score_num;
        IsOver();
        MergeRight(board);
        if(UselessMove(temp3, board)){
          break;
        } else {
          AddNewValue();
          UpdateBoard(board);
          return board;
        }
      case 40:
        const temp4 = JSON.parse(JSON.stringify(board));
        prevBoard = temp4;
        prevScore = score_num;
        IsOver();
        MergeDown(board);
        if(UselessMove(temp4, board)){
          break;
        } else {
          AddNewValue();
          UpdateBoard(board);
          return board;
        }
      default:
        break;  
    }
  });
}

const UselessMove = (temp, board) =>{
  for(let i=0; i<boardSize; i++){
    for(let j=0; j<boardSize; j++){
      if(temp[i][j] != board[i][j]){
        return false;
      }
    }
  }
  return true;
}

const Won = () => {
  for(let row=0; row< boardSize; row++){
    for(let col=0; col< boardSize; col++){
      if(board[row][col] === 2048){
        status.innerHTML = 'YOU WIN';
        status.className = 'info win';
        return true;
      }
    }
  }
  return false;
}

const NoMoves = () => {
  if(!(IsEmpty())){
    const temp = JSON.parse(JSON.stringify(board));
    MergeLeft(temp);
    MergeRight(temp);
    MergeUp(temp);
    MergeDown(temp);
    for(let i=0; i<boardSize; i++){
      for(let j=0; j<boardSize; j++){
        if(temp[i][j] != board[i][j]){
          return false;
        }
      }
    }
    status.innerHTML = 'GAME OVER';
    status.className = 'info lost';
    return true;
  } 
  return false;
}

const IsOver = () =>{
  Won();
  NoMoves();
  UpdateBoard(board);
}

const Restart = () => {
  board = [ [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0]];
  score_num = 0;
  status.className = 'info popup';
  status.innerHTML = `<i class="fa fa-info-circle"></i>2048<span class="popuptext" id="myPopup">2048 is a single-player sliding block puzzle game designed by Italian web developer Gabriele Cirulli. The objective of the game is to slide numbered tiles on a grid to combine them to create a tile with the number 2048; however, one can continue to play the game after reaching the goal, creating tiles with larger numbers.</span>`;
  InitBoard();
  UpdateBoard(board);
}

const Undo = () => {
  score_num = prevScore;
  board = prevBoard;
  UpdateBoard(board);
}

const PlayGame = () => {
  InitBoard();
  UpdateBoard(board);
  GetMove();
}

  
PlayGame();

