//Objeto recebido do front
// this.gameState = {
//     turnNum: 1,  
//     player1turn: true or false,
//     board: ['', ''],
//     scoreP1: 0,
//     scoreP2: 0
//  };
let isMyTurn = false

$(document).ready( () => {
    $(".btn-back-to-home").attr("href", `http://${url}:${port}`)

    $(".cards-in-hand").draggable({
        revert: "invalid",
    })

    if ( youStart ) {
        openModal('modal-initial')
        $("#description-modal-initial").text('É sua vez de jogar')
        isMyTurn = true
        turnControlAndPlayCard()
        greenShine()
    } else {
        openModal('modal-initial')
        $("#description-modal-initial").text('É a vez do oponente jogar, aguarde')
        redShine()
    }
})

function greenShine() {
    $("#container-first-hand-card").attr("class", "container-cards-from-hand card green-shine")
    $("#container-second-hand-card").attr("class", "container-cards-from-hand card green-shine")
    $("#container-third-hand-card").attr("class", "container-cards-from-hand card green-shine")
}

function redShine() {
    $("#container-first-hand-card").attr("class", "container-cards-from-hand card red-shine")
    $("#container-second-hand-card").attr("class", "container-cards-from-hand card red-shine")
    $("#container-third-hand-card").attr("class", "container-cards-from-hand card red-shine")
}

let cardImageTagId; //Essa variável serve para pegar a id da imagem da carta que foi jogada, pois isso será usado em diferentes funções

//primeira mensagem do back define qual player voce é, é uma string: "p1" / "p2"

//se receber um array com 3 strings, é a sua nova mão

//objeto recebido do back em cada jogada
/* 
    turnNum: 1,  
    player1turn: true/false,
    board: ['', ''],  [ P1 , P2 ]
    scoreP1: 0,
    scoreP2: 0
*/

socket.onopen = (event) => {
    playCardSound("backgroundSound");
}

let gameState

socket.onmessage = (event) => {

    clearTimeout(timeout)
    let data = JSON.parse(event.data)

    if( data instanceof Array ) {
        hand = data
    } else {
        if ( whichPlayer === "p2" ) {
            data.board = data.board.reverse()
        }

        try {
            showEnemyCard(data.board[1])
        } catch {
        }

        gameState = data

        verifyIfIsYourTurn(data)
        console.log(data)
        console.log(isMyTurn)
        console.log("==============================")
        verifyIfHaveTwoCardsInTheField(data)
    }

    if(isMyTurn) {
        timeout = setInterval(() => {
            $(".cards-in-hand").draggable({
                revert: "invalid",
            });
        }, 500);

        greenShine()
    } else {
        redShine()
    }

    turnControlAndPlayCard();

}

socket.onclose = (event) => {

    console.log("SOCKET CLOSE: ");
    console.log(event);
    console.log("CLOSE CODE: " + event.code);
    console.log("CLOSE REASON: " + event.reason);

    if ( event.code === 4000 || event.code === 4200 ) {
        $("#description-modal").text("O oponente desconectou")
        openModal("modal-general")
    } else if ( event.code === 4008 ) {
        $("#description-modal").text("O oponente trapaceou")
        openModal("modal-general")
    } else if ( event.code === 4004 ) {
        $("#description-modal").text("Você não esta em nenhuma partida")
        openModal("modal-general")
    } else if ( event.code === 1008 ) {
        $("#description-modal").text("Você trapaceou")
        openModal("modal-general")
    }
}

let timeout = setInterval(() => {
    $(".cards-in-hand").draggable({
        revert: "invalid",
    });
}, 500);

function turnControlAndPlayCard() {

    if (isMyTurn) {
            $("#playing-card-field").droppable({
                disabled: false,
                drop: function (event, ui) {
                    cardImageTagId = ui.draggable.attr("id");
                    $("#playing-card-field").droppable({ disabled: true })
                    isMyTurn = false

                    socket.send(Number(cardImageTagId.slice(-1)))
                }
            });
    }
}

function verifyIfIsYourTurn(data) {
    if ( whichPlayer === 'p1' && data.player1turn ) {
        isMyTurn = true
    } else if ( whichPlayer === 'p2' && !data.player1turn ) {
        isMyTurn = true
    } else {
        isMyTurn = false
    }
}

function showEnemyCard(cardString) {

    switch (cardString) {
        case 'f':
            $("#container-card-player2").html('<img class="cards-in-hand" src="./board-assets/card-fire.svg">');
            playCardSound("f");
            break;
        case 'w':
            $("#container-card-player2").html('<img class="cards-in-hand" src="./board-assets/card-water.svg">');
            playCardSound("w");
            break;
        case 'p':
            $("#container-card-player2").html('<img class="cards-in-hand" src="./board-assets/card-plant.svg">');
            playCardSound("p");
            break;
        case 'e':
            $("#container-card-player2").html('<img class="cards-in-hand" src="./board-assets/card-ether.svg">');
            playCardSound("e");
            break;
        case 'v':
            $("#container-card-player2").html('<img class="cards-in-hand" src="./board-assets/card-void.svg">');
            //playCardSound("v");
            break;
        case 'd':
            $("#container-card-player2").html('<img class="cards-in-hand" src="./board-assets/card-dark-matter.svg">');
            //playCardSound("d");
            break;
        default:
            break;
    }
}

function verifyIfHaveTwoCardsInTheField(data) {
    if ( data.board[0] != '' && data.board[1] != '' ) {
        setTimeout(() => {
            cleanTheCardField(cardImageTagId);
            $("#container-card-player2").html('');
            //hideCheap();
        }, 3000);

        clearTimeout(timeout)
    } else if ( data.board[0] == '' && data.board[1] == '' ) {
        setTimeout(() => {
            $("#score-player1").text(data.scoreP1)
            $("#score-player2").text(data.scoreP2)
        }, 3000)
    }

}

function takeCard(hand) {
    $("#container-first-hand-card").html(`<img id="card1" value=${hand[0]} class="cards-in-hand" src="./board-assets/${getCardImage(hand[0])}.svg" alt="">`);
    $("#container-second-hand-card").html(`<img id="card2" value=${hand[1]} class="cards-in-hand" src="./board-assets/${getCardImage(hand[1])}.svg" alt="">`);
    $("#container-third-hand-card").html(`<img id="card3" value=${hand[2]} class="cards-in-hand" src="./board-assets/${getCardImage(hand[2])}.svg" alt="">`);
}

function getCardImage(card) {

    let nameOfImageArchive;

    switch (card) {
        case "w":
            nameOfImageArchive = 'card-water';
            break;
        case "f":
            nameOfImageArchive = 'card-fire';
            break;
        case "p":
            nameOfImageArchive = 'card-plant';
            break;
        case "e":
            nameOfImageArchive = 'card-ether';
            break;
        case "v":
            nameOfImageArchive = 'card-void';
            break;
        case "d":
            nameOfImageArchive = 'card-dark-matter';
            break;
    }

    return nameOfImageArchive;
}

function backgroundSound(){
    myAudio = new Audio('someSound.ogg');
    if (typeof myAudio.loop == 'boolean') {
        myAudio.loop = true;
    }
    else {
        myAudio.addEventListener('ended', function() {
            this.currentTime = 0;
            this.play();
        }, false);
    }
}

function cleanTheCardField(tagCardId) {

    if (tagCardId === "card1") {
        $("#container-first-hand-card").html("");
    }

    else if (tagCardId === "card2") {
        $("#container-second-hand-card").html("");
    }

    else if (tagCardId === "card3") {
        $("#container-third-hand-card").html("");
    }
    takeCard(hand)
    cardsOnDeck();    
}

function showWhosTurn() {
    gameState.myTurn === true ? $("#show-if-is-your-turn").text("Sua vez!") : $("#show-if-is-your-turn").text("Vez do oponente");
}

function verifyCardOnTop() {
    console.log("board "+ gameState.board)
    if((gameState.board[0] =='') && (gameState.board[1] != '')){
        $("#container-card-player2").css('zIndex',3);
    }else if ((gameState.board[0] !='') && (gameState.board[1] == '')) {
        $("#container-card-player2").css('zIndex',5);
    }
}

function cardsOnDeck() {
    let cardsOnDeck = 16 - gameState.turnNum;
    document.getElementById("cards-left").innerHTML = cardsOnDeck;
}

function noCardsOnHand(){
    console.log("entrou: "+ gameState.turnNum)
    if(gameState.turnNum == 18){
        if(gameState.scoreP1 > gameState.scoreP2){
            openModal("modal-victory");
        }else if(gameState.scoreP2 > gameState.scoreP1){
            openModal("modal-defeat");
        }
    }
}

function hideCheap() {
    if(gameState.turnNum == 15){
        $("#second-cheap").hide();
    }
    // if(turnForDeck == 0){
    //     $("#first-cheap").attr('src','./board-assets/null.png');
    // }
}
