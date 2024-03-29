import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getDatabase, ref, update, onValue, get, orderByChild, equalTo, push, query, remove } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-database.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const firebaseConfig = {
  apiKey: "AIzaSyDyHWBLcSszh-WxeiVGe2uuf7oW-obqfME",
  authDomain: "choos-f68c3.firebaseapp.com",
  projectId: "choos-f68c3",
  storageBucket: "choos-f68c3.appspot.com",
  messagingSenderId: "55031481993",
  appId: "1:55031481993:web:dda57375667d2e89f2a858",
  // url
  databaseURL: "https://choos-f68c3-default-rtdb.asia-southeast1.firebasedatabase.app"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

// can join game with name
// can create game with name

let player_name = "";

let current_entered_name = "";
let current_entered_chat = "";

let gameState = "enter_name";
let server_state = {};
let you = 0;

let selected_piece = null;
let view_board_pos = [3, 3];

let armies = {
  "default": [
    null,
    "fmWfceFifmnD",
    "N",
    "B",
    "R",
    "Q",
    "K"
  ],
  "clobber": [
    null,
    "fmWfceFifmnD",
    "WA",
    "FAD",
    "BD",
    "NB",
    "K"
  ],
  "nutters": [
    null,
    "fmWfceFifmnD",
    "ffNbbNF",
    "fNlWrWbWbF",
    "fRlRrRbFbW",
    "fNfRlRrRK",
    "K"
  ],
  "rookies": [
    null,
    "fmWfceFifmnD",
    "WD",
    "HFD",
    "W4",
    "RN",
    "K"
  ],
  "flyings": [
    null,
    "fmWfceFifmnD",
    "ffNWbAA",
    "FAA",
    "WDD",
    "WFAADD",
    "K"
  ],
  "mashers": [
    null,
    "fmWfceFifmnD",
    "ffNbbNF",
    "F4nD",
    "FR4",
    "N2W4",
    "K"
  ],
  "wizards": [
    null,
    "fmWfceFifmnD",
    "ffNbbNW",
    "FC",
    "WllNrrNA",
    "FWAN",
    "K"
  ],
  "pizzaer": [
    null,
    "fmWfceFifmnD",
    "ffNbbNbFfsC",
    "lDrDfAfWbWF",
    "lWrWFffNbbNfHbH",
    "FWADffN",
    "K"
  ],
  "crabbie": [
    null,
    "fmWfceFifmnD",
    "ffNbsNF",
    "fDbDffNF",
    "WfAfNF",
    "llCrrCNFW",
    "K"
  ],
  "poodoos": [
    null,
    "fmWfceFifmnD",
    "bNFfWlWrW",
    "WbNfF",
    "fNbRlRrR",
    "WfFNbRlRrR",
    "K"
  ],
  "knights": [
    null,
    "fmWfceFifmnD",
    "N",
    "ffNbbNF",
    "ND",
    "FNN",
    "K"
  ],
  "bishops": [
    null,
    "fmWfceFifmnD",
    "FA",
    "B",
    "WB",
    "NB",
    "K"
  ],
  "missiles": [
    null,
    "fmWfceFifmnD",
    "ffNfDFnH",
    "fNfDbWlWrWffC",
    "fRfNF",
    "fRfNWFlDrD",
    "K"
  ],
  "nanners": [
    null,
    "fmWfceFifmnD",
    "llCrrCffNbbNlWrW",
    "fsNbFfDfWbW",
    "ffNbbNFlRrR",
    "FWNDlRrR",
    "K"
  ],
  "snipers": [
    null,
    "fmWfceFifmnD",
    "mWmfDmbDzffNzbbNzlDzrD",
    "mWzfDzbDzfsNzbsNzfHzbH",
    "mFzNzC",
    "WzfDzfHFzffNzffC",
    "K"
  ],
  "poopers": [
    null,
    "fmWfceFifmnD",
    "WA",
    "DF",
    "W4A",
    "FAR",
    "K"
  ],
  "tissues": [
    null,
    "fmWfceFifmnD",
    "HFG",
    "fRbbNlWrW",
    "WfFfN",
    "NCE",
    "K"
  ],
  "bananas": [
    null,
    "fmWfceFifmnD",
    "lWrWbWfNfA",
    "FfAfNfDbW",
    "fNfAfRbW",
    "FfAfEfC",
    "K"
  ],
  "goobers": [
    null,
    "fmWfceFifmnD",
    "ffNbbNbFfWfD",
    "FfAfWbWbbN",
    "bbNlW4rW4fW2bWbF",
    "NFWnH",
    "K"
  ],
  "jumpers": [
    null,
    "fmWfceFifmnD",
    "fNfAfDbDD",
    "NA2",
    "FNC",
    "FNCA2",
    "K"
  ],
  "cultist": [
    null, 
    "fmWfceFifmnD",
    "ffNbW",
    "F2",
    "W2",
    "W3F3NC",
    "K"
  ]
}

// let all_pieces = new Set(Object.keys(armies).map(k=>armies[k]).flat())
// console.log(...all_pieces);

let check_valid_move_betza = (board, from, to, force_army = undefined) => {
  let piece = board[from[0]][from[1]];
  let piece_to = board[to[0]][to[1]];

  if (piece === 0) {
    return false;
  }

  if (piece_to !== 0) {
    if (Math.sign(piece) === Math.sign(piece_to)) {
      return false;
    }
  }

  let color = Math.sign(piece);
  let army = server_state[color === 1 ? "white_army" : "black_army"];
  if (force_army) {
    army = force_army;
  }
  let notation = armies[army][Math.abs(piece)];
  notation = notation.replace(/(Q)/g, "RB");
  notation = notation.replace(/(R)/g, "WW");
  notation = notation.replace(/(B)/g, "FF");
  notation = notation.replace(/(K)/g, "WF");

  // parse betza notation
  // https://en.wikipedia.org/wiki/Betza_notation
  
  // get sequences of uppercase letters, and preceding lowercase letters
  // e.g. "fmWfceFifmnD" -> ["fmW", "fceF", "ifmnD"]
  // also! "WW" -> ["WW"]
  // also! "WF" -> ["W","F"] // different letters still get split
  let sequences = [];
  let current_sequence = "";
  for (let i = 0; i < notation.length; i++) {
    let char = notation[i];
    if (char === char.toUpperCase()) {
      // if this is the first uppercase letter, just add it
      if (current_sequence.length === 0) {
        current_sequence += char;
        continue;
      }
      if (current_sequence[current_sequence.length - 1].toUpperCase() !== current_sequence[current_sequence.length - 1]) {
        current_sequence += char;
        continue;
      }
      // if the last letter was the same, add together
      // or a number!!
      if (current_sequence[current_sequence.length - 1] === char || !isNaN(char)) {
        current_sequence += char;
        sequences.push(current_sequence);
        current_sequence = "";
      }
      // if the last letter was different, add to sequences
      else {
        sequences.push(current_sequence);
        current_sequence = char;
      }

    } else {
      // if last was uppercase, add to sequences
      if (current_sequence.length > 0 && current_sequence[current_sequence.length - 1].toUpperCase() === current_sequence[current_sequence.length - 1]) {
        sequences.push(current_sequence);
        current_sequence = "";
      }
      current_sequence += char;
    }
  }

  if (current_sequence.length > 0)
    sequences.push(current_sequence);
  
  // are we moving or capturing?
  let is_capture = piece_to !== 0;

  // initial move? (only applies to pawns, so just check if the position is 2 or 7)
  let is_initial_move = (from[0] === 1 && color === -1) || (from[0] === 6 && color === 1);

  let moves = [];

  // each sequence is a set of moves
  for (let i = 0; i < sequences.length; i++) {
    let sequence = sequences[i];

    // uppercase letters are atoms
    // lowercase letters are constraints
    // e.g. "WW" is a wazir rider
    // e.g. "fWW" is a wazir rider that can only move forward
    // e.g. "fW" is a wazir that can only move forward

    // get atoms
    let atoms = [];
    for (let j = 0; j < sequence.length; j++) {
      let char = sequence[j];
      if (char === char.toUpperCase()) {
        atoms.push(char);
      }
    }
    atoms = atoms.join("");

    // get constraints
    let cs = sequence.replace(atoms, "");

    let direction = "all";
    // one f is forward, two is super forward, same for b, l, r
    if (cs.includes("f")) direction = "forward";
    if (cs.includes("b")) direction = "backward";
    if (cs.includes("l")) direction = "left";
    if (cs.includes("r")) direction = "right";

    if (cs.indexOf("f") !== cs.lastIndexOf("f")) direction = "superforward";
    if (cs.indexOf("b") !== cs.lastIndexOf("b")) direction = "superbackward";
    if (cs.indexOf("l") !== cs.lastIndexOf("l")) direction = "superleft";
    if (cs.indexOf("r") !== cs.lastIndexOf("r")) direction = "superright";

    if (cs.includes("f") && cs.includes("s")) direction = "semiforward"; // crab, etc.
    if (cs.includes("b") && cs.includes("s")) direction = "semibackward";

    // black flipped
    if (color === -1 && !force_army) {
      if (direction === "forward") direction = "backward";
      else if (direction === "backward") direction = "forward";
      else if (direction === "left") direction = "right";
      else if (direction === "right") direction = "left";
      else if (direction === "superforward") direction = "superbackward";
      else if (direction === "superbackward") direction = "superforward";
      else if (direction === "superleft") direction = "superright";
      else if (direction === "superright") direction = "superleft";
      else if (direction === "semiforward") direction = "semibackward";
      else if (direction === "semibackward") direction = "semiforward";
    }
    let type = "all";
    if (cs.includes("m")) type = "move";
    if (cs.includes("c")) type = "capture";
    if (cs.includes("z")) type = "snipe";

    // initial (pawn)
    if (cs.includes("i")) {
      // check if pawn is on initial rank
      if (color === 1 && from[0] !== 6) {
        continue;
      } else if (color === -1 && from[0] !== 1) {
        continue;
      }
    }
    // atoms are the moves
    // W = wazir
    // F = ferz
    // N = knight
    // WW = rook
    // FF = bishop
    // NN = knightrider

    if (atoms.length == 2) {
      // rider

      // first, get direction
      let atom = atoms[0];
      
      let vec = [0, 0];
      if (atom === "W") vec = [1, 0];
      else if (atom === "F") vec = [1, 1];
      else if (atom === "N") vec = [2, 1];
      else if (atom === "A") vec = [2, 2];
      else if (atom === "D") vec = [2, 0];
      else if (atom === "H") vec = [3, 0];
      else if (atom === "C") vec = [3, 1];
      else if (atom === "E") vec = [3, 2];
      else if (atom === "G") vec = [3, 3];

      let length = atoms[1];
      if (atom === length) length = 8;
      else length = parseInt(length);
      // travel in that direction until you hit a piece
      let ride = (vec,l) => {
        let x = from[1] + vec[1] * color;
        let y = from[0] + vec[0];
        while (x >= 0 && x < 8 && y >= 0 && y < 8 && l-- > 0) {
          let piece = board[y][x];
          if (piece !== 0) {
            if (piece.color !== color) {
              // capture
              moves.push([y-from[0], x-from[1], type]);
            }
            break;
          } else {
            // move
            moves.push([y-from[0], x-from[1], type]);
          }
          x += vec[1] * color;
          y += vec[0];
        }
      }

      if (direction === "all" || direction === "forward") {
        ride([-vec[0], vec[1]],length);
        ride([-vec[0], -vec[1]],length);
      }
      if (direction === "all" || direction === "backward") {
        ride([vec[0], vec[1]],length);
        ride([vec[0], -vec[1]],length);
      }
      if (direction === "all" || direction === "right") {
        ride([vec[1], vec[0]],length);
        ride([-vec[1], vec[0]],length);
      }
      if (direction === "all" || direction === "left") {
        ride([vec[1], -vec[0]],length);
        ride([-vec[1], -vec[0]],length);
      }
    } else {
      let atom = atoms;
      // add spaces that are valid for this atom
      if (atom === "W") {
        if (direction === "all" || direction === "forward")
          moves.push([-1, 0, type]);
        if (direction === "all" || direction === "backward")
          moves.push([1, 0, type]);
        if (direction === "all" || direction === "left")
          moves.push([0, -1, type]);
        if (direction === "all" || direction === "right")
          moves.push([0, 1, type]);
      }
      if (atom === "F") {
        if (direction === "all" || direction === "forward" || direction === "left")
          moves.push([-1, -1, type]);
        if (direction === "all" || direction === "forward" || direction === "right")
          moves.push([-1, 1, type]);
        if (direction === "all" || direction === "backward" || direction === "left")
          moves.push([1, -1, type]);
        if (direction === "all" || direction === "backward" || direction === "right")
          moves.push([1, 1, type]);
      }
      if (atom === "N") {
        if (direction === "all" || direction === "forward" || direction === "left" || direction === "superforward")
          moves.push([-2, -1, type]);
        if (direction === "all" || direction === "forward" || direction === "right" || direction === "superforward")
          moves.push([-2, 1, type]);
        if (direction === "all" || direction === "backward" || direction === "left" || direction === "superbackward")
          moves.push([2, -1, type]);
        if (direction === "all" || direction === "backward" || direction === "right" || direction === "superbackward") 
          moves.push([2, 1, type]);
        if (direction === "all" || direction === "left" || direction === "forward" || direction === "superleft" || direction === "semiforward")
          moves.push([-1, -2, type]);
        if (direction === "all" || direction === "left" || direction === "backward" || direction === "superleft" || direction === "semibackward")
          moves.push([1, -2, type]);
        if (direction === "all" || direction === "right" || direction === "forward" || direction === "superright" || direction === "semiforward")
          moves.push([-1, 2, type]);
        if (direction === "all" || direction === "right" || direction === "backward" || direction === "superright" || direction === "semibackward")
          moves.push([1, 2, type]);
      }
      if (atom === "A") {
        if (direction === "all" || direction === "forward" || direction === "left")
          moves.push([-2, -2, type]);
        if (direction === "all" || direction === "forward" || direction === "right")
          moves.push([-2, 2, type]);
        if (direction === "all" || direction === "backward" || direction === "left")
          moves.push([2, -2, type]);
        if (direction === "all" || direction === "backward" || direction === "right")
          moves.push([2, 2, type]);
      }
      if (atom === "D") {
        // IMPORTANT!! CHECK PAWN
        if (cs.includes("n")) {
          // ahead must be empty
          if (direction === "all" || direction === "forward")
            if (board?.[from[0] - 1]?.[from[1]] === 0)
              moves.push([-2, 0, type]);
          if (direction === "all" || direction === "backward")
            if (board?.[from[0] + 1]?.[from[1]] === 0)
              moves.push([2, 0, type]);
          if (direction === "all" || direction === "left")
            if (board?.[from[0]]?.[from[1] - 1] === 0)
              moves.push([0, -2, type]);
          if (direction === "all" || direction === "right")
            if (board?.[from[0]]?.[from[1] + 1] === 0)
              moves.push([0, 2, type]);
        } else {
          if (direction === "all" || direction === "forward")
            moves.push([-2, 0, type]);
          if (direction === "all" || direction === "backward")
           moves.push([2, 0, type]);
          if (direction === "all" || direction === "left")
            moves.push([0, -2, type]);
          if (direction === "all" || direction === "right")
            moves.push([0, 2, type]);
        }
      }
      if (atom === "H") {
        // 3,0
        if (cs.includes("n")) {
          if (direction === "all" || direction === "forward")
            if (board?.[from[0] - 1]?.[from[1]] === 0 && board?.[from[0] - 2]?.[from[1]] === 0)
              moves.push([-3, 0, type]);
          if (direction === "all" || direction === "backward")
            if (board?.[from[0] + 1]?.[from[1]] === 0 && board?.[from[0] + 2]?.[from[1]] === 0)
              moves.push([3, 0, type]);
          if (direction === "all" || direction === "left")
            if (board?.[from[0]]?.[from[1] - 1] === 0 && board?.[from[0]]?.[from[1] - 2] === 0)
              moves.push([0, -3, type]);
          if (direction === "all" || direction === "right")
            if (board?.[from[0]]?.[from[1] + 1] === 0 && board?.[from[0]]?.[from[1] + 2] === 0)
              moves.push([0, 3, type]);
        } else {
          if (direction === "all" || direction === "forward")
            moves.push([-3, 0, type]);
          if (direction === "all" || direction === "backward")
            moves.push([3, 0, type]);
          if (direction === "all" || direction === "left")
            moves.push([0, -3, type]);
          if (direction === "all" || direction === "right")
            moves.push([0, 3, type]);
        }
      }
      if (atom === "C") {
        // 3,1
        if (direction === "all" || direction === "forward" || direction === "left" || direction === "superforward")
          moves.push([-3, -1, type]);
        if (direction === "all" || direction === "forward" || direction === "right" || direction === "superforward")
          moves.push([-3, 1, type]);
        if (direction === "all" || direction === "backward" || direction === "left" || direction === "superbackward")
          moves.push([3, -1, type]);
        if (direction === "all" || direction === "backward" || direction === "right" || direction === "superbackward") 
          moves.push([3, 1, type]);
        if (direction === "all" || direction === "left" || direction === "forward" || direction === "superleft" || direction === "semiforward")
          moves.push([-1, -3, type]);
        if (direction === "all" || direction === "left" || direction === "backward" || direction === "superleft" || direction === "semibackward")
          moves.push([1, -3, type]);
        if (direction === "all" || direction === "right" || direction === "forward" || direction === "superright" || direction === "semiforward")
          moves.push([-1, 3, type]);
        if (direction === "all" || direction === "right" || direction === "backward" || direction === "superright" || direction === "semibackward")
          moves.push([1, 3, type]);
      }
      if (atom === "E") {
        if (direction === "all" || direction === "forward" || direction === "left" || direction === "superforward")
          moves.push([-3, -2, type]);
        if (direction === "all" || direction === "forward" || direction === "right" || direction === "superforward")
          moves.push([-3, 2, type]);
        if (direction === "all" || direction === "backward" || direction === "left" || direction === "superbackward")
          moves.push([3, -2, type]);
        if (direction === "all" || direction === "backward" || direction === "right" || direction === "superbackward")
          moves.push([3, 2, type]);
        if (direction === "all" || direction === "left" || direction === "forward" || direction === "superleft" || direction === "semiforward")
          moves.push([-2, -3, type]);
        if (direction === "all" || direction === "left" || direction === "backward" || direction === "superleft" || direction === "semibackward")
          moves.push([2, -3, type]);
        if (direction === "all" || direction === "right" || direction === "forward" || direction === "superright" || direction === "semiforward")
          moves.push([-2, 3, type]);
        if (direction === "all" || direction === "right" || direction === "backward" || direction === "superright" || direction === "semibackward")
          moves.push([2, 3, type]);
      }
      if (atom === "G") {
        if (direction === "all" || direction === "forward" || direction === "left")
          moves.push([-3, -3, type]);
        if (direction === "all" || direction === "forward" || direction === "right")
          moves.push([-3, 3, type]);
        if (direction === "all" || direction === "backward" || direction === "left")
          moves.push([3, -3, type]);
        if (direction === "all" || direction === "backward" || direction === "right")
          moves.push([3, 3, type]);
      }
    }
  }
  // translate moves to coordinates
  for (let i = 0; i < moves.length; i++) {
    let move = moves[i];
    moves[i] = [from[0] + move[0], from[1] + move[1], move[2]];
  }

  // check if the move is valid
  for (let i = 0; i < moves.length; i++) {
    let move = moves[i];
    if (move[0] === to[0] && move[1] === to[1]) {
      // check if the move is a capture
      if (force_army) return move[2];
      if ((move[2] === "capture" || move[2] === "snipe") && board[to[0]][to[1]] === 0) {
        return false;
      }
      if (move[2] === "move" && board[to[0]][to[1]] !== 0) {
        return false;
      }
      return move[2];
    }
  }
  return false;
}

let selected_square = null;

let getServerUpdate = (snapshot) => {
  if (snapshot.exists()) {
    server_state = snapshot.val();
    if (gameState !== "menu" && server_state.finished === true) {
      // winner
      if (server_state.winner === undefined) {
        gameState = "menu";
        console.log("game finished!");
        alert("The other player left :(")
        current_entered_name = "";
      } else {
        // gameState = game_end
        gameState = "game_end";
      }
      // clear getserverupdate
    }
    if (gameState === "waiting") {
      if (server_state.players === 2) {
        console.log("starting game!");
        gameState = "piece_select";
      }
    }
    if (gameState === "piece_select") {
      if (server_state.white_army && server_state.black_army) {
        console.log("starting game!");
        gameState = "game";
      }
    }
  } else {
    console.log("No data available");
  }
}

let images = {};
let load_image = (id, src) => {
  images[id] = new Image();
  images[id].src = src;
}

load_image(1, "pawn_white.png");
load_image(2, "knight_white.png");
load_image(3, "bishop_white.png");
load_image(4, "rook_white.png");
load_image(5, "queen_white.png");
load_image(6, "king_white.png");
load_image(-1, "pawn_black.png");
load_image(-2, "knight_black.png");
load_image(-3, "bishop_black.png");
load_image(-4, "rook_black.png");
load_image(-5, "queen_black.png");
load_image(-6, "king_black.png");

let new_images = {};
let load_new_image = (id, src) => {
  new_images[id+"_white"] = new Image();
  new_images[id+"_white"].src = src+"-white.png";

  new_images[id+"_black"] = new Image();
  new_images[id+"_black"].src = src+"-black.png";
}

load_new_image("fmWfceFifmnD", "new/pawn");
load_new_image("R", "new/rook");
load_new_image("N", "new/knight");
load_new_image("B", "new/bishop");
load_new_image("Q", "new/queen");
load_new_image("K", "new/king");
load_new_image("WA", "new/waffle");
load_new_image("FAD", "new/fad");
load_new_image("BD", "new/bd");

// keyboard
document.addEventListener("keydown", (e) => {
  if (gameState === "enter_name") {
    if (e.key === "Enter") {
      gameState = "menu";
    } else if (e.key === "Backspace") {
      player_name = player_name.slice(0, -1);
    } else {
      player_name += e.key;
    }
  } else
  if (gameState === "menu") {
    if (e.key === "Enter") {
      if (current_entered_name === "viewpieces") {
        gameState = "view_pieces";
      } else
      if (current_entered_name.length > 0) {
        // check if game exists
        // if not, create game
        // if so, join game

        // check if game with name exists
        get(ref(database, "games/" + current_entered_name)).then((snapshot) => {
          if (snapshot.exists()) {
            console.log("game exists");

            // join game if only 1 player
            if (snapshot.val().players === 1) {
              update(ref(database, "games/" + current_entered_name), {
                players: 2,
                black_name: player_name
              });
              you = -1;
              gameState = "piece_select";
              console.log("starting game!");
              // listen for changes to game
              onValue(ref(database, "games/" + current_entered_name), getServerUpdate);
            } else {
              console.log("game is full");
              // spectate

              gameState = "game";
              you = 0;
              // listen for changes to game
              onValue(ref(database, "games/" + current_entered_name), getServerUpdate);
            }
          } else {
            console.log("game does not exist");
            // create game, player is player 1

            update(ref(database, "games/" + current_entered_name), {
              players: 1,
              board: [
                [-4, -2, -3, -5, -6, -3, -2, -4],
                [-1, -1, -1, -1, -1, -1, -1, -1],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [1, 1, 1, 1, 1, 1, 1, 1],
                [4, 2, 3, 5, 6, 3, 2, 4]
              ],
              turn: 1,
              white_army: null,
              black_army: null,
              white_name: player_name
            });
            gameState = "waiting";
            you = 1;

            // listen for changes to game
            onValue(ref(database, "games/" + current_entered_name), getServerUpdate);
          }
        }).catch((error) => {
          console.error(error);
        });
      } else {
        // enter matchmaking

        // first, check if there is a game with the key "matchmaking", and if it has 1 player using order by child
        get(query(ref(database, "games"), orderByChild("players"), equalTo(1))).then((snapshot) => {
          // now check for games with the key "matchmaking"
          if (snapshot.exists()) {
            // filter for matchmaking games
            let games = snapshot.val();
            console.log(games);
            let matchmaking_games = [];
            for (let game in games) {
              if (snapshot.val()[game].matchmaking === true) {
                matchmaking_games.push(snapshot.val()[game]);
              }
            }
            // join matchmaking game if it exists
            if (matchmaking_games.length > 0) {
              // get key
              let matchmaking_keys = Object.keys(snapshot.val()).filter((key) => {
                return snapshot.val()[key].players === 1 && snapshot.val()[key].matchmaking === true;
              });

              // random
              let matchmaking_key = matchmaking_keys[Math.floor(Math.random() * matchmaking_keys.length)];

              // join game
              update(ref(database, "games/" + matchmaking_key), {
                players: 2,
                black_name: player_name
              });
              you = -1;
              gameState = "piece_select";
              console.log("starting game!");
              // listen for changes to game
              onValue(ref(database, "games/" + matchmaking_key), getServerUpdate);

              current_entered_name = matchmaking_key;

            }
          } else {
            // make a new matchmaking game, push to database
            console.log("game does not exist");
            let newGameRef = push(ref(database, "games"), {
              players: 1,
              board: [
                [-4, -2, -3, -5, -6, -3, -2, -4],
                [-1, -1, -1, -1, -1, -1, -1, -1],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [1, 1, 1, 1, 1, 1, 1, 1],
                [4, 2, 3, 5, 6, 3, 2, 4]
              ],
              turn: 1,
              white_army: null,
              black_army: null,
              white_name: player_name,
              matchmaking: true
            });
            gameState = "waiting";
            you = 1;

            // listen for changes to game
            onValue(newGameRef, getServerUpdate);

            // set current_entered_name to the key of the new game
            current_entered_name = newGameRef.key;
          }
        })
      }
    } else if (e.key === "Backspace") {
      current_entered_name = current_entered_name.slice(0, -1);
    } else if (e.key.length === 1) {
      current_entered_name += e.key;
    }
  } else if (gameState === "game") {
    // chat
    if (e.key === "Enter") {
      // send message
      if (current_entered_chat !== "") {
        let newMessageRef = push(ref(database, "games/" + current_entered_name + "/chat"), {
          name: player_name,
          message: current_entered_chat
        });
        current_entered_chat = "";
      }
    } else if (e.key === "Backspace") {
      current_entered_chat = current_entered_chat.slice(0, -1);
    } else if (e.key.length === 1) {
      current_entered_chat += e.key;
    }
  } else if (gameState === "game_end") {
    if (e.key === "Enter") {
      gameState = "menu";
      current_entered_name = "";
    }
  }
});

let update_screen = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (gameState === "enter_name") {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Enter your name", 10, 50);
    ctx.fillText(player_name, 10, 100);
  } else
  if (gameState === "menu") {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Enter code to join game, enter nothing to enter matchmaking", 10, 50);
    ctx.fillText(current_entered_name, 10, 100);
  } else if (gameState === "waiting") {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Waiting for other player to join...", 10, 50);
  } else if (gameState === "view_pieces") {
    ctx.fillStyle = "white";
    ctx.fillText("Look at all of the pieces.", 10, 50);
    // draw buttons

    ctx.lineWidth = 2;

    // 4 columns, loop over armies
    ctx.textAlign = "center";
    ctx.font = "16px Arial";
    for (let i = 0; i < Object.keys(armies).length; i++) {
      let army = Object.keys(armies)[i];
      let col = i % 7;
      let row = Math.floor(i / 7);
      ctx.strokeStyle = i === selected_piece ? "red" : "white";
      ctx.fillStyle = i === selected_piece ? "red" : "white";
      ctx.strokeRect(10 + col * 90, 100 + row * 90, 80, 80);
      ctx.fillText(army, 50 + col * 90, 100 + row * 90 + 45);
    }
    ctx.textAlign = "left";
    ctx.font = "30px Arial";

    // mini boards
    if (selected_piece !== null) {
      // 2345
      let b = [[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]]
      b[view_board_pos[1]][view_board_pos[0]] = 2
      // draw mini board
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          ctx.fillStyle = (i + j) % 2 === 0 ? "#ffcea0" : "#d18b47";
          let type = check_valid_move_betza(b, [view_board_pos[1],view_board_pos[0]], [j, i], Object.keys(armies)[selected_piece])
          if (type === "all")
            ctx.fillStyle = "#00ff00";
          else if (type === "move")
            ctx.fillStyle = "#0000ff";
          else if (type === "capture")
            ctx.fillStyle = "#ff0000";
          else if (type === "snipe")
            ctx.fillStyle = "#ff00ff";
          ctx.fillRect(i * 48 + 650, j * 48 + 48, 48, 48);
          // draw piece
          if (b[j][i] !== 0) {
            // ctx.drawImage(new_images[Object.values(armies)[selected_piece][2]+"_black"], i * 48 + 650, j * 48 + 48, 48, 48);
            ctx.drawImage(images[b[j][i]], i * 48 + 650, j * 48 + 48, 48, 48);
          }
        }
      }
      b = [[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]]
      b[view_board_pos[1]][view_board_pos[0]] = 3
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          ctx.fillStyle = (i + j) % 2 === 0 ? "#ffcea0" : "#d18b47";
          let type = check_valid_move_betza(b, [view_board_pos[1],view_board_pos[0]], [j, i], Object.keys(armies)[selected_piece])
          if (type === "all")
            ctx.fillStyle = "#00ff00";
          else if (type === "move")
            ctx.fillStyle = "#0000ff";
          else if (type === "capture")
            ctx.fillStyle = "#ff0000";
          else if (type === "snipe")
            ctx.fillStyle = "#ff00ff";
          ctx.fillRect(i * 48 + 1082, j * 48 + 48, 48, 48);
          // draw piece
          if (b[j][i] !== 0) {
            // ctx.drawImage(new_images[Object.values(armies)[selected_piece][3]+"_black"], i * 48 + 1082, j * 48 + 48, 48, 48);
            ctx.drawImage(images[b[j][i]], i * 48 + 1082, j * 48 + 48, 48, 48);
          }
        }
      }
      b = [[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]] 
      b[view_board_pos[1]][view_board_pos[0]] = 4
      // draw mini board
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          ctx.fillStyle = (i + j) % 2 === 0 ? "#ffcea0" : "#d18b47";
          let type = check_valid_move_betza(b, [view_board_pos[1],view_board_pos[0]], [j, i], Object.keys(armies)[selected_piece])
          if (type === "all")
            ctx.fillStyle = "#00ff00";
          else if (type === "move")
            ctx.fillStyle = "#0000ff";
          else if (type === "capture")
            ctx.fillStyle = "#ff0000";
          else if (type === "snipe")
            ctx.fillStyle = "#ff00ff";
          ctx.fillRect(i * 48 + 650, j * 48 + 480, 48, 48);
          // draw piece
          if (b[j][i] !== 0) {
            // ctx.drawImage(new_images[Object.values(armies)[selected_piece][4]+"_black"], i * 48 + 650, j * 48 + 480, 48, 48);
            ctx.drawImage(images[b[j][i]], i * 48 + 650, j * 48 + 480, 48, 48);
          }
        }
      }
      b = [[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]]
      b[view_board_pos[1]][view_board_pos[0]] = 5
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          ctx.fillStyle = (i + j) % 2 === 0 ? "#ffcea0" : "#d18b47";
          let type = check_valid_move_betza(b, [view_board_pos[1],view_board_pos[0]], [j, i], Object.keys(armies)[selected_piece])
          if (type === "all")
            ctx.fillStyle = "#00ff00";
          else if (type === "move")
            ctx.fillStyle = "#0000ff";
          else if (type === "capture")
            ctx.fillStyle = "#ff0000";
          else if (type === "snipe")
            ctx.fillStyle = "#ff00ff";
          ctx.fillRect(i * 48 + 1082, j * 48 + 480, 48, 48);
          // draw piece
          if (b[j][i] !== 0) {
            // ctx.drawImage(new_images[Object.values(armies)[selected_piece][5]+"_black"], i * 48 + 1082, j * 48 + 480, 48, 48);
            ctx.drawImage(images[b[j][i]], i * 48 + 1082, j * 48 + 480, 48, 48);
          }
        }
      }
      
    }
  } else if (gameState === "piece_select") {
    ctx.fillStyle = "white";
    if (you === server_state.turn) {
      ctx.fillText("Your turn to pick your army!", 10, 50);
      // draw buttons

      ctx.lineWidth = 2;

      // 4 columns, loop over armies
      ctx.textAlign = "center";
      ctx.font = "16px Arial";
      for (let i = 0; i < Object.keys(armies).length; i++) {
        let army = Object.keys(armies)[i];
        let col = i % 7;
        let row = Math.floor(i / 7);
        ctx.strokeStyle = i === selected_piece ? "red" : "white";
        ctx.fillStyle = i === selected_piece ? "red" : "white";
        ctx.strokeRect(10 + col * 90, 100 + row * 90, 80, 80);
        ctx.fillText(army, 50 + col * 90, 100 + row * 90 + 45);
      }
      ctx.textAlign = "left";
      ctx.font = "30px Arial";

      // mini boards
      if (selected_piece !== null) {
        // 2345
        let b = [[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,2,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]] 
        // draw mini board
        for (let i = 0; i < 8; i++) {
          for (let j = 0; j < 8; j++) {
            ctx.fillStyle = (i + j) % 2 === 0 ? "#ffcea0" : "#d18b47";
            let type = check_valid_move_betza(b, [3,3], [j, i], Object.keys(armies)[selected_piece])
            if (type === "all")
              ctx.fillStyle = "#00ff00";
            else if (type === "move")
              ctx.fillStyle = "#0000ff";
            else if (type === "capture")
              ctx.fillStyle = "#ff0000";
            else if (type === "snipe")
              ctx.fillStyle = "#ff00ff";
            ctx.fillRect(i * 48 + 650, j * 48 + 48, 48, 48);
            // draw piece
            if (b[j][i] !== 0) {
              // ctx.drawImage(new_images[Object.values(armies)[selected_piece][2]+"_white"], i * 48 + 650, j * 48 + 48, 48, 48);
              ctx.drawImage(images[b[j][i]], i * 48 + 650, j * 48 + 48, 48, 48);
            }
          }
        }
        b = [[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,3,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]]
        for (let i = 0; i < 8; i++) {
          for (let j = 0; j < 8; j++) {
            ctx.fillStyle = (i + j) % 2 === 0 ? "#ffcea0" : "#d18b47";
            let type = check_valid_move_betza(b, [3,3], [j, i], Object.keys(armies)[selected_piece])
            if (type === "all")
              ctx.fillStyle = "#00ff00";
            else if (type === "move")
              ctx.fillStyle = "#0000ff";
            else if (type === "capture")
              ctx.fillStyle = "#ff0000";
            else if (type === "snipe")
              ctx.fillStyle = "#ff00ff";
            ctx.fillRect(i * 48 + 1082, j * 48 + 48, 48, 48);
            // draw piece
            if (b[j][i] !== 0) {
              // ctx.drawImage(new_images[Object.values(armies)[selected_piece][3]+"_white"], i * 48 + 1082, j * 48 + 48, 48, 48);
              ctx.drawImage(images[b[j][i]], i * 48 + 1082, j * 48 + 48, 48, 48);
            }
          }
        }
        b = [[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,4,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]] 
        // draw mini board
        for (let i = 0; i < 8; i++) {
          for (let j = 0; j < 8; j++) {
            ctx.fillStyle = (i + j) % 2 === 0 ? "#ffcea0" : "#d18b47";
            let type = check_valid_move_betza(b, [3,3], [j, i], Object.keys(armies)[selected_piece])
            if (type === "all")
              ctx.fillStyle = "#00ff00";
            else if (type === "move")
              ctx.fillStyle = "#0000ff";
            else if (type === "capture")
              ctx.fillStyle = "#ff0000";
            else if (type === "snipe")
              ctx.fillStyle = "#ff00ff";
            ctx.fillRect(i * 48 + 650, j * 48 + 480, 48, 48);
            // draw piece
            if (b[j][i] !== 0) {
              // ctx.drawImage(new_images[Object.values(armies)[selected_piece][4]+"_white"], i * 48 + 650, j * 48 + 480, 48, 48);
              ctx.drawImage(images[b[j][i]], i * 48 + 650, j * 48 + 480, 48, 48);
            }
          }
        }
        b = [[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,5,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]]
        for (let i = 0; i < 8; i++) {
          for (let j = 0; j < 8; j++) {
            ctx.fillStyle = (i + j) % 2 === 0 ? "#ffcea0" : "#d18b47";
            let type = check_valid_move_betza(b, [3,3], [j, i], Object.keys(armies)[selected_piece])
            if (type === "all")
              ctx.fillStyle = "#00ff00";
            else if (type === "move")
              ctx.fillStyle = "#0000ff";
            else if (type === "capture")
              ctx.fillStyle = "#ff0000";
            else if (type === "snipe")
              ctx.fillStyle = "#ff00ff";
            ctx.fillRect(i * 48 + 1082, j * 48 + 480, 48, 48);
            // draw piece
            if (b[j][i] !== 0) {
              // ctx.drawImage(new_images[Object.values(armies)[selected_piece][5]+"_white"], i * 48 + 1082, j * 48 + 480, 48, 48);
              ctx.drawImage(images[b[j][i]], i * 48 + 1082, j * 48 + 480, 48, 48);
            }
          }
        }
        
      }
    } else {
      ctx.fillText("Waiting for other player to pick their army...", 10, 50);
    }
  } else if (gameState === "game") {
    // draw board
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (server_state.board === undefined) continue;
        // 64x64, centered
        let draw_i = i;
        let draw_j = j;
        if (you === -1) {
          draw_i = 7 - i;
          draw_j = 7 - j;
        }
        ctx.fillStyle = (i + j) % 2 === 0 ? "#ffcea0" : "#d18b47";
        if (selected_square) {
          if (selected_square[0] === i && selected_square[1] === j)
            ctx.fillStyle = "#ff0000";
          let type = check_valid_move_betza(server_state.board, [selected_square[1], selected_square[0]], [j, i])
          if (type === "snipe")
            ctx.fillStyle = "#ff0000"
          else if (type !== false)
            ctx.fillStyle = "#00ff00";
        }

        ctx.fillRect(draw_i * 128, draw_j * 128, 128, 128);
        // draw piece
        if (server_state.board[j][i] !== 0) {
          // // get army
          // let sign = server_state.board[j][i] > 0 ? 1 : -1;
          // let army = sign === 1 ? server_state.white_army : server_state.black_army;
          // let notation = armies[army][Math.abs(server_state.board[j][i])];
          // ctx.drawImage(new_images[notation + "_" + (sign === 1 ? "white" : "black")], draw_i * 128, draw_j * 128, 128, 128);
          ctx.drawImage(images[server_state.board[j][i]], draw_i * 128, draw_j * 128, 128, 128);
        }
      }
    }
    // owned piece moves
    if (selected_square) {
      let b = [[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,server_state.board[selected_square[1]][selected_square[0]],0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]] 
      // draw mini board
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          if (server_state.board === undefined) continue;
          // 64x64, centered
          let draw_i = i;
          let draw_j = j;
          ctx.fillStyle = (i + j) % 2 === 0 ? "#ffcea0" : "#d18b47";
          let type = check_valid_move_betza(b, [3,3], [j, i], ((Math.sign(server_state.board[selected_square[1]][selected_square[0]]) === 1) ? server_state.white_army : server_state.black_army));
          if (type === "all")
            ctx.fillStyle = "#00ff00";
          else if (type === "move")
            ctx.fillStyle = "#0000ff";
          else if (type === "capture")
            ctx.fillStyle = "#ff0000";
          else if (type === "snipe")
            ctx.fillStyle = "#ff00ff";
          ctx.fillRect(draw_i * 64 + 1034, draw_j * 64 + 512, 64, 64);
          // draw piece
          if (b[j][i] !== 0) {
            // let sign = b[j][i] > 0 ? 1 : -1;
            // let army = sign === 1 ? server_state.white_army : server_state.black_army;
            // let notation = armies[army][Math.abs(b[j][i])];
            // ctx.drawImage(new_images[notation + "_" + (sign === 1 ? "white" : "black")], draw_i * 64 + 1034, draw_j * 64 + 512, 64, 64);
            ctx.drawImage(images[b[j][i]], draw_i * 64 + 1034, draw_j * 64 + 512, 64, 64);
          }
        }
      }
    }

    // draw turn
    if (you === 0) {
      ctx.fillStyle = "white";
      ctx.font = "30px Arial";
      ctx.fillText("Spectating...", 1034, 50);
    } else if (you === server_state.turn) {
      ctx.fillStyle = "white";
      ctx.font = "30px Arial";
      ctx.fillText("Your turn!", 1034, 50);
    } else {
      ctx.fillStyle = "white";
      ctx.font = "30px Arial";
      ctx.fillText("Waiting for other player...", 1034, 50);
    }

    // armies
    ctx.fillText("White army: "+server_state.white_army, 1034, 80);
    ctx.fillText("Black army: "+server_state.black_army, 1034, 110);

    // draw names
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";

    ctx.fillText("White: "+server_state.white_name, 1034, 140);
    ctx.fillText("vs", 1034, 170)
    ctx.fillText("Black: "+server_state.black_name, 1034, 200);

    // chat
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Chat (type/enter): " + current_entered_chat, 1034, 230);
    ctx.font = "20px Arial";
    if (!server_state.chat) server_state.chat = {};
    Object.keys(server_state.chat).forEach((k, i) => {
      let msg = server_state.chat[k];
      ctx.fillText(`${msg.name}: ${msg.message}`, 1034, 250 + i * 20);
    });


  } else if (gameState === "game_end") {
    // draw board
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        // 64x64, centered
        let draw_i = i;
        let draw_j = j;
        if (you === -1) {
          draw_i = 7 - i;
          draw_j = 7 - j;
        }
        ctx.fillStyle = (i + j) % 2 === 0 ? "#ffcea0" : "#d18b47";

        ctx.fillRect(draw_i * 128, draw_j * 128, 128, 128);
        // draw piece
        if (server_state.board[j][i] !== 0) {
          // // get army
          // let sign = server_state.board[j][i] > 0 ? 1 : -1;
          // let army = sign === 1 ? server_state.white_army : server_state.black_army;
          // let notation = armies[army][Math.abs(server_state.board[j][i])];
          // ctx.drawImage(new_images[notation + "_" + (sign === 1 ? "white" : "black")], draw_i * 128, draw_j * 128, 128, 128);
          ctx.drawImage(images[server_state.board[j][i]], draw_i * 128, draw_j * 128, 128, 128);
        }
      }
    }

    // draw turn
    if (server_state.winner === "black") {
      ctx.fillStyle = "white";
      ctx.font = "30px Arial";
      ctx.fillText("Black wins!", 1034, 50);
    } else if (server_state.winner === "white") {
      ctx.fillStyle = "white";
      ctx.font = "30px Arial";
      ctx.fillText("White wins!", 1034, 50);
    }

    // armies
    ctx.fillText("White army: "+server_state.white_army, 1034, 80);
    ctx.fillText("Black army: "+server_state.black_army, 1034, 110);

    // draw names
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";

    ctx.fillText("White: "+server_state.white_name, 1034, 140);
    ctx.fillText("vs", 1034, 170)
    ctx.fillText("Black: "+server_state.black_name, 1034, 200);

    ctx.fillText("Enter to return to lobby", 1034, 230);
  }
  requestAnimationFrame(update_screen);
}
update_screen();

// click on buttons
canvas.addEventListener("click", (e) => {
  let x = e.offsetX * canvas.width / canvas.offsetWidth;
  let y = e.offsetY * canvas.height / canvas.offsetHeight;
  if (gameState === "view_pieces") {
    for (let army = 0; army < Object.keys(armies).length; army++) {
      let col = army % 7;
      let row = Math.floor(army / 7);
      if (x > 10 + col * 90 && x < 90 + col * 90 && y > 100 + row * 90 && y < 190 + row * 90)
        selected_piece = army;
    }
    // mini boards
    for (let i = 0; i < 4; i++) {
      // 2x2
      let col = i % 2;
      let row = Math.floor(i / 2);
      if (x > 650 + col * 9 * 48 && x < 1034 + col * 9 * 48 && y > 48 + row * 9 * 48 && y < 432 + row * 9 * 48) {
        // position
        let off_x = x - (650 + col * 9 * 48);
        let off_y = y - (48 + row * 9 * 48);
        let square_x = Math.floor(off_x / 48);
        let square_y = Math.floor(off_y / 48);
        view_board_pos = [square_x, square_y];
      }
    }
  } else if (gameState === "piece_select") {
    if (you === server_state.turn) {
      for (let army = 0; army < Object.keys(armies).length; army++) {
        let col = army % 7;
        let row = Math.floor(army / 7);
        if (x > 10 + col * 90 && x < 90 + col * 90 && y > 100 + row * 90 && y < 190 + row * 90)
          if (selected_piece !== army) {
            selected_piece = army;
          } else {
            if (you === 1) {
              update(ref(database, "games/" + current_entered_name), {
                white_army: Object.keys(armies)[army],
                turn: -1
              });
            } else {
              update(ref(database, "games/" + current_entered_name), {
                black_army: Object.keys(armies)[army],
                turn: 1
              });
            }
          }
      }
      
    }
  } else if (gameState === "game") {
    if (true) {
      // click square to select piece
      if (!selected_square) {
        if (x < 1024 && y < 1024) {
          selected_square = [Math.floor(x / 128), Math.floor(y / 128)];
          if (you === -1) {
            selected_square[0] = 7 - selected_square[0];
            selected_square[1] = 7 - selected_square[1];
          }
          // check if piece is yours
          if (server_state.board[selected_square[1]][selected_square[0]] * you <= 0) {
            // selected_square = null;
          }
        }
      } else {
        if (x < 1024 && y < 1024) {
          // click square to move piece
          let new_square = [Math.floor(x / 128), Math.floor(y / 128)];
          if (you === -1) {
            new_square[0] = 7 - new_square[0];
            new_square[1] = 7 - new_square[1];
          }
          // if we don't own, don't move
          if (server_state.board[selected_square[1]][selected_square[0]] * you <= 0 || you !== server_state.turn) {
            selected_square = null;
          } else
          if (check_valid_move_betza(server_state.board, [selected_square[1], selected_square[0]], [new_square[1], new_square[0]])) {
            // move piece
            let new_board = server_state.board;
            let type = check_valid_move_betza(server_state.board, [selected_square[1], selected_square[0]], [new_square[1], new_square[0]]);
            if (type !== "snipe") {
              new_board[new_square[1]][new_square[0]] = new_board[selected_square[1]][selected_square[0]];
              new_board[selected_square[1]][selected_square[0]] = 0;
              
              // promotion!
              // on the 0th rank, promote pawn to queen
              if (new_square[1] === 0 && new_board[new_square[1]][new_square[0]] === 1) {
                new_board[new_square[1]][new_square[0]] = 5;
              }
              if (new_square[1] === 7 && new_board[new_square[1]][new_square[0]] === -1) {
                new_board[new_square[1]][new_square[0]] = -5;
              }
            } else {
              new_board[new_square[1]][new_square[0]] = 0;
            }
            // check game end
            let is_game_over = false;
            let winner = null;
            let all_squares = new_board.flat();
            if (!all_squares.includes(6)) {
              is_game_over = true;
              winner = "black";
            }
            if (!all_squares.includes(-6)) {
              is_game_over = true;
              winner = "white";
            }

            update(ref(database, "games/" + current_entered_name), {
              board: new_board,
              turn: -server_state.turn,
              finished: is_game_over,
              winner: winner
            });
            selected_square = null;
          } else {
            selected_square = null;
          }
        }
      }
    }
  }
});

window.addEventListener("beforeunload", (e)=>{
  // IF we are in a game, and IF there is only one player, delete the game
  if (gameState === "waiting" && server_state.players === 1) {
    remove(ref(database, "games/" + current_entered_name));
  }
  // IF we **are** in a game, set flag "finished" to true
  if ((gameState === "game" || gameState === "piece_select") && you !== 0) {
    update(ref(database, "games/" + current_entered_name), {
      finished: true
    });
  }
})
