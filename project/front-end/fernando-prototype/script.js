const deck1 = ['a','a','a','a','f','f','f','f','p','p','p','p','e'];
const deck2 = ['a','a','a','a','f','f','f','f','p','p','p','p','e'];
var hand1 = [];
var hand2 = [];
var turn = 1;
var board = [];
var count = 0;
var score1 = 0;
var score2 = 0;

function randomArray(arr,player) {
    let num = Math.floor(Math.random() * (arr.length));
    let elem = arr.splice(num,1)[0];
    if(player == 1){
        hand1.push(elem);
    }
    if(player == 2){
        hand2.push(elem);
    }
    return elem;
  }

  function randomArray1(arr) {
    let num = Math.floor(Math.random() * (arr.length));
    let elem = arr.splice(num,1)[0];
    return elem;
  }

function firstHand(player, arr){

    var card1 = document.getElementById(`${player}-1`);
    let elem1 = randomArray(arr,player);
    cardColor(elem1, card1);
    var card2 = document.getElementById(`${player}-2`);
    let elem2 = randomArray(arr,player);
    cardColor(elem2, card2);
    var card3 = document.getElementById(`${player}-3`);
    let elem3 = randomArray(arr,player);
    cardColor(elem3, card3);
    var card4 = document.getElementById(`${player}-4`);
    let elem4 = randomArray(arr,player);
    cardColor(elem4, card4);
}

function cardColor (elem, card){
    switch(elem){
        case 'a':
            return card.style.backgroundColor = "blue";
        case 'f':
            return card.style.backgroundColor = "red";
        case 'p':
            return card.style.backgroundColor = "green";
        case 'e':
            return card.style.backgroundColor = "purple";
    }
}

function btn11(){
    if(turn == 1) {
    document.getElementById("cardPlayer1").style.backgroundColor = document.getElementById("1-1").style.backgroundColor;
    let elem = randomArray1(deck1);
    let card = document.getElementById("1-1");
    board[0] = hand1[0];
    hand1[0] = elem;
    cardColor(elem, card);
    turn = 2;
    count ++;
    game();
    }
}
function btn12(){
    if(turn == 1) {
    document.getElementById("cardPlayer1").style.backgroundColor = document.getElementById("1-2").style.backgroundColor;
    let elem = randomArray1(deck1);
    let card = document.getElementById("1-2");
    board[0] = hand1[1];
    hand1[1] = elem;
    cardColor(elem, card);
    turn = 2;
    count ++;
    game();
    }
}
function btn13(){
    if(turn == 1) {
    document.getElementById("cardPlayer1").style.backgroundColor = document.getElementById("1-3").style.backgroundColor;
    let elem = randomArray1(deck1);
    let card = document.getElementById("1-3");
    board[0] = hand1[2]
    hand1[2] = elem;
    cardColor(elem, card);
    turn = 2;
    count ++;
    game();
    }
}
function btn14(){
    if(turn == 1) {
    document.getElementById("cardPlayer1").style.backgroundColor = document.getElementById("1-4").style.backgroundColor;
    let elem = randomArray1(deck1);
    let card = document.getElementById("1-4");
    board[0] = hand1[3]
    hand1[3] = elem;
    cardColor(elem, card);
    turn = 2;
    count ++;
    game();
    }
}

function btn21(){
    if(turn == 2) {
    document.getElementById("cardPlayer2").style.backgroundColor = document.getElementById("2-1").style.backgroundColor;
    let elem = randomArray1(deck2);
    let card = document.getElementById("2-1");
    board[1] = hand2[0]
    hand2[0] = elem;
    cardColor(elem, card);
    turn = 1;
    count ++;
    game();
    }
}
function btn22(){
    if(turn == 2) {
    document.getElementById("cardPlayer2").style.backgroundColor = document.getElementById("2-2").style.backgroundColor;
    let elem = randomArray1(deck2);
    let card = document.getElementById("2-2");
    board[1] = hand2[1]
    hand2[1] = elem;
    cardColor(elem, card);
    turn = 1;
    count ++;
    game();
    }
}
function btn23(){
    if(turn == 2) {
    document.getElementById("cardPlayer2").style.backgroundColor = document.getElementById("2-3").style.backgroundColor;
    let elem = randomArray1(deck2);
    let card = document.getElementById("2-3");
    board[1] = hand2[2]
    hand2[2] = elem;
    cardColor(elem, card);
    turn = 1;
    count ++;
    game();
    }
}
function btn24(){
    if(turn == 2) {
    document.getElementById("cardPlayer2").style.backgroundColor = document.getElementById("2-4").style.backgroundColor;
    let elem = randomArray1(deck2);
    let card = document.getElementById("2-4");
    board[1] = hand2[3]
    hand2[3] = elem;
    cardColor(elem, card);
    turn = 1;
    count ++;
    game();
    }
}

function game(){
    console.log("hand1: "+ hand1)
        console.log("hand2: "+ hand2)
        console.log("board: "+ board)
        document.getElementById("1-0").innerHTML = deck1.length;
    document.getElementById("2-0").innerHTML = deck2.length;
    if(count == 2){
        
    if(board[0] == 'e' && board[1] != 'e'){
        score1 ++;
        turn = 1;
        count = 0;
    }
    if(board[1] == 'e' && board[0] != 'e'){
        score2 ++;
        turn = 2;
        count = 0;
    }
    if(board[0] == 'e' && board[1] == 'e'){
        count = 0;
    }
    if(board[0] == 'a' && board[1] == 'a'){
        count = 0;
    }
    if(board[0] == 'a' && board[1] == 'f'){
        score1 ++;
        turn = 1;
        count = 0;
    }
    if(board[0] == 'a' && board[1] == 'p'){
        score2 ++;
        turn = 2;
        count = 0;
    }
    if(board[0] == 'f' && board[1] == 'a'){
        score2 ++;
        turn = 2;
        count = 0;
    }
    if(board[0] == 'f' && board[1] == 'f'){
        count = 0;
    }
    if(board[0] == 'f' && board[1] == 'p'){
        score1 ++;
        turn = 1;
        count = 0;
    }
    if(board[0] == 'p' && board[1] == 'a'){
        score1 ++;
        turn = 1;
        count = 0;
    }
    if(board[0] == 'p' && board[1] == 'f'){
        score2 ++;
        turn = 2;
        count = 0;
    }
    if(board[0] == 'p' && board[1] == 'p'){
        count = 0;
    }
    resetBoard();
    document.getElementById("score1").innerHTML = score1;
    document.getElementById("score2").innerHTML = score2;
    
    
    if(score1 == 5){
        alert("player 1 wins");
    }
    if(score2 == 5){
        alert("player 2 wins");
    }
    }
}

function resetBoard(){
    board[0] = "";
    board[1] = "";
    document.getElementById("cardPlayer1").style.backgroundColor = "white";
    document.getElementById("cardPlayer2").style.backgroundColor = "white";
}


firstHand(1,deck1);
firstHand(2,deck2);
game();
