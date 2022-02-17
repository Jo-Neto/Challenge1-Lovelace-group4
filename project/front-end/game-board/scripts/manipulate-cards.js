const cards = ['w', 'w', 'w', 'w', 'f', 'f', 'f', 'f', 'p', 'p', 'p', 'p', 'e', 'e']
let hand = []
const board = ["", ""];
let cardImageTagId //Essa variável serve para pegar a id da imagem da carta que foi jogada, pois isso será usado em diferentes funções
let turn = 1;
let howManyCardsInThePlayingField = 0;
let score1 = 0;
let score2 = 0;

//Receber objeto do server com informções iniciais da partida

$(document).ready( () => {
    //Soretia 3 cartas para a mão inicial do jogador
    hand[0] = randomArray(cards)
    hand[1] = randomArray(cards)
    hand[2] = randomArray(cards)
    
    //Da linha 40 até 44, adiciona cada imagem de cada carta na mão conforme o array "hand", o atributo value diz qual carta que é
    $("#container-first-hand-card").html(`<img id="card1" value=${hand[0]} class="cards-in-hand" src="./assets/${getCardImage(hand[0])}.png" alt="">`)

    $("#container-second-hand-card").html(`<img id="card2" value=${hand[1]} class="cards-in-hand" src="./assets/${getCardImage(hand[1])}.png" alt="">`)

    $("#container-third-hand-card").html(`<img id="card3" value=${hand[2]} class="cards-in-hand" src="./assets/${getCardImage(hand[2])}.png" alt="">`)

    //Esse if recebe a informação de quem vai começar, talvez precise redefenir a variável "turn" aqui
    if(turn == 1) {

        $("#show-if-is-your-turn").text("É sua vez de jogar!")

        $(".cards-in-hand").draggable({
            revert: "invalid",
        })

        $("#playing-card-field").droppable({
            drop: function(event, ui) {
                cardImageTagId = ui.draggable.attr("id")
                board[0] =  ui.draggable.attr("value") //identifica qual é a carta
                turn = 2;
                showWhosTurn(turn)
                $("#playing-card-field").droppable({disabled: true})
                howManyCardsInThePlayingField++;

                //Socket send que informa ao server a carta jogada

                gameLogic();
            }
        }) //passa o turno para o outro player
    }
})

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

function showWhosTurn(turn) {
    turn === 1 ? $("#show-if-is-your-turn").text("É sua vez de jogar!") : $("#show-if-is-your-turn").text("É a vez do oponente");
}

function gameLogic(){

    if(turn == 1){
        document.getElementById("container-card-player2").style.zIndex = 4;
    }
    if(turn == 2){
        console.log(document.getElementById("container-card-player2").style.zIndex = 2);
    }


    if(howManyCardsInThePlayingField == 2){

        if(board[0] == 'e' && board[1] != 'e'){
            turn = 1;
        }
        if(board[1] == 'e' && board[0] != 'e'){
            turn = 2;            
        }
        if(board[0] == 'w' && board[1] == 'f'){
            turn = 1;
        }
        if(board[0] == 'w' && board[1] == 'p'){
            turn = 2;
        }
        if(board[0] == 'f' && board[1] == 'w'){
            turn = 2;
        }
        if(board[0] == 'f' && board[1] == 'p'){
            turn = 1;
        }
        if(board[0] == 'p' && board[1] == 'w'){
            turn = 1;
        }
        if(board[0] == 'p' && board[1] == 'f'){            
            turn = 2;
        }

        if(turn == 2){
            score2 ++;
            $("#playing-card-field").droppable({disabled: true});
        }
        if(turn == 1){
            score1 ++;
            $("#playing-card-field").droppable({disabled: false});
            //$("#container-card-player2").css('z-index','0');
        }

        howManyCardsInThePlayingField = 0;
        document.getElementById("score-player1").innerHTML = score1;
        document.getElementById("score-player2").innerHTML = score2;

        setTimeout( () => {
            cleanTheCardField(cardImageTagId)
            $("#container-card-player2").html('')
            takeCardFromCheap(cardImageTagId)
        }, 2000)

        showWhosTurn(turn)

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

//Socket onmessage vai chamar showCard()
//Obs: tem q mexer na showCard()

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
        howManyCardsInThePlayingField++;
        turn = 1; //passa o turno para o player 1
        showWhosTurn(turn)

        gameLogic();
    }
}