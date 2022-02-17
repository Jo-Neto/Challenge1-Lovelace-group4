const cards = ['w', 'w', 'w', 'w', 'f', 'f', 'f', 'f', 'p', 'p', 'p', 'p', 'e', 'e']
let hand = []
const board = ["", ""];
turn = 1;
count = 0;
score1 = 0;
score2 = 0;


//Sorteia uma carta do array "cards"
function randomArray(arr) {
    let num = Math.floor(Math.random() * (arr.length));
    let elem = arr.splice(num,1)[0];

    return elem;
}

function getCardImage(card) {

    let nameOfImageArchive

    switch (card) {
        case "w" : nameOfImageArchive = 'card-water';
        break;
        case "f" : nameOfImageArchive = 'card-fire';
        break;
        case "p" : nameOfImageArchive = 'card-plant';
        break;
        case "e" : nameOfImageArchive = 'card-ether';
        break;
    }

    return nameOfImageArchive
}

function cleanTheCardField(tagCardId) {

    if ( tagCardId === "card1" ) {
        $("#container-first-hand-card").html("")
        hand[0] = "empty"
    }

    else if (tagCardId === "card2") {
        $("#container-second-hand-card").html("")
        hand[1] = "empty"
    }
    
    else if (tagCardId === "card3") {
        $("#container-third-hand-card").html("")
        hand[2] = "empty"
    }
}

function takeCardFromCheap(tagCardId) {

    hand.forEach( (card, index) => {
        if ( card === "empty" ) {
            hand[index] = randomArray(cards)

            let containerEmpty

            switch (index) {
                case 0: containerEmpty = "first";
                break;

                case 1: containerEmpty = "second";
                break;

                case 2: containerEmpty = "third";
                break;
            }

            $(`#container-${containerEmpty}-hand-card`).html(`<img id=${tagCardId} value=${hand[index]} class="cards-in-hand" src="./assets/${getCardImage(hand[index])}.png" alt="">`)

            $(".cards-in-hand").draggable({
                revert: "invalid",
            })
        }
    })

}

$(document).ready( () => {
    //Soretia 3 cartas para a mão inicial do jogador
    hand[0] = randomArray(cards)
    hand[1] = randomArray(cards)
    hand[2] = randomArray(cards)
    
    //Da linha 40 até 44, adiciona cada imagem de cada carta na mão conforme o array "hand", o atributo value diz qual carta que é
    $("#container-first-hand-card").html(`<img id="card1" value=${hand[0]} class="cards-in-hand" src="./assets/${getCardImage(hand[0])}.png" alt="">`)

    $("#container-second-hand-card").html(`<img id="card2" value=${hand[1]} class="cards-in-hand" src="./assets/${getCardImage(hand[1])}.png" alt="">`)

    $("#container-third-hand-card").html(`<img id="card3" value=${hand[2]} class="cards-in-hand" src="./assets/${getCardImage(hand[2])}.png" alt="">`)
    
    if(turn == 1) {

    $(".cards-in-hand").draggable({
        revert: "invalid",
    })    
    
        $("#playing-card-field").droppable({
            drop: function(event, ui) {
                board[0] =  ui.draggable.attr("value") //identifica qual é a carta
                turn = 2;
                $("#playing-card-field").droppable({disabled: true})
                count++;
                cleanTheCardField(ui.draggable.attr("id"))
                takeCardFromCheap(ui.draggable.attr("id"))
                gameLogic();

            }
        }) //passa o turno para o outro player
        
    }
})

function gameLogic(){

    
    if(count == 2){
        
        if(board[0] == 'e' && board[1] != 'e'){
            score1 ++;
            turn = 1;
            $("#playing-card-field").droppable({disabled: false})
        }
        if(board[1] == 'e' && board[0] != 'e'){
            score2 ++;
            turn = 2;
            $("#playing-card-field").droppable({disabled: true})
        }
        if(board[0] == 'w' && board[1] == 'f'){
            score1 ++;
            turn = 1;
            $("#playing-card-field").droppable({disabled: false})
        }
        if(board[0] == 'w' && board[1] == 'p'){
            score2 ++;
            turn = 2;
            $("#playing-card-field").droppable({disabled: true})
        }
        if(board[0] == 'f' && board[1] == 'w'){
            score2 ++;
            turn = 2;
            $("#playing-card-field").droppable({disabled: true})
        }
        if(board[0] == 'f' && board[1] == 'p'){
            score1 ++;
            turn = 1;
            $("#playing-card-field").droppable({disabled: false})
        }
        if(board[0] == 'p' && board[1] == 'w'){
            score1 ++;
            turn = 1;
            $("#playing-card-field").droppable({disabled: false})
        }
        if(board[0] == 'p' && board[1] == 'f'){
            score2 ++;
            turn = 2;
            $("#playing-card-field").droppable({disabled: true})
        }
        count = 0;
        document.getElementById("score-player1").innerHTML = score1;
        document.getElementById("score-player2").innerHTML = score2;
        
        console.log("turno:"+ turn)
        console.log("board:"+ board)
        console.log("score1: " + score1)
        console.log("score2: " + score2)
        
        if(score1 == 5){
            alert("player 1 wins");
        }
        if(score2 == 5){
            alert("player 2 wins");
        }
        }
}


/*
funçoes para teste do player 2 abaixo
*/

function showCard(element) {
    if(turn == 2){
        switch (element) {
            case 'f':
                $("#container-card-player2").html('<img id="card1" value="w" class="cards-in-hand" src="./assets/card-fire.png" alt="">')
                board[1] = "f";
                break;
            case 'w':
                $("#container-card-player2").html('<img id="card1" value="w" class="cards-in-hand" src="./assets/card-water.png" alt="">')
                board[1] = "w";
                break;
            case 'p':
                $("#container-card-player2").html('<img id="card1" value="w" class="cards-in-hand" src="./assets/card-plant.png" alt="">')
                board[1] = "p";
                break;
            case 'e':
                $("#container-card-player2").html('<img id="card1" value="w" class="cards-in-hand" src="./assets/card-ether.png" alt="">')
                board[1] = "e";
                break;
        
            default:
                break;
        }
        $("#playing-card-field").droppable({disabled: false})
        count++;
        turn = 1; //passa o turno para o player 1
        gameLogic();
    }
}