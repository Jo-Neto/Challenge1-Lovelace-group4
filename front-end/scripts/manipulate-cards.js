//Objeto recebido do front
// this.gameState = {
//     turnNum: 1,  
//     player1turn: true or false,
//     board: ['', ''],
//     scoreP1: 0,
//     scoreP2: 0
//  };

$("#playing-card-field").droppable({ disabled: true });  //impossibilita o jogador de jogar até que....
//const url = window.location.href.slice(7, -6);
//const port = 80;

$(document).ready( () => {
    $(".btn-back-to-home").attr("href", `http://${url}:${port}`)
})

let cardImageTagId; //Essa variável serve para pegar a id da imagem da carta que foi jogada, pois isso será usado em diferentes funções
let turnForDeck = 11;


let gameState = {
    myTurn: null,
    hand: null,
    board: ['', ''],  //me, enemy
    scoreP1: 0,
    scoreP2: 0,
    turnNum: 0
}

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
    console.log("GAME SOCKET OPEN, SOCKET DATA: ");
    console.log(event);
    console.log("=======================================");
}

socket.onmessage = (event) => {
    // console.log("==============================================================================================================================================================================================================================================================================================================================");
    // console.log("SERV MSG ==> "+ event.data);
    // console.log("=======================================");

    console.log(event.data)
    let obj
    //Esse trecho é pra ver se recebeu alguma string, se receber string é pq a partida acabou, as possíveis strings são "voce ganhou" e "voce perdeu"
    try {
        obj = JSON.parse(event.data)
    } catch {

        if ( event.data === "voce ganhou" ) {
            gameState.player == 1 ? $("#score-player1").text("5") : $("#score-player2").text("5");
            $("#description-modal").text("Vitória!")
            openModal("modal-general")
        } else if (event.data === "voce perdeu") {
            gameState.player == 1 ? $("#score-player2").text("5") : $("#score-player1").text("5");
            $("#description-modal").text("Derrota!")
            openModal("modal-general")
        }

        return console.log(event.data)
    }

    console.log(obj)

    //console.log("RECEIVED OBJ ==> "+ obj);
    //console.log(obj);
    //console.log(event.data);
    //console.log("=======================================");
    if (obj.msgType === 'waitingFeedback') { //só recebe board quando o outro joga
        // console.log("waitingFeedback");
        gameState.board = obj.board;
        //gameState.hand = obj.hand;
        //gameState.myTurn = obj.myTurn;
        gameState.scoreP1 = obj.scoreP1;
        gameState.scoreP2 = obj.scoreP2;
        gameState.turnNum = obj.turnNum;
        document.getElementById("score-player1").innerHTML = obj.scoreP1.toString();
        document.getElementById("score-player2").innerHTML = obj.scoreP2.toString();
        // console.log("RECEIVED DATA: ");
        // console.log(obj);
        // console.log("=======================================");
    }

    else if(obj.msgType === 'instantFeedback') { //carta comprada, recebe a nova mão logo depois de jogar...
        // console.log("AFTERPLAY RECEIVED DATA: "); //nesse momento, logo após jogar o player alter a partida e...
        // console.log(obj);                           //instantaneamente recebe o feedback do server, com as alterações que ele...
        // console.log("=======================================");//fez
        // console.log("instantFeedback");
        gameState.board = obj.board;
        //gameState.hand = obj.hand;  //recebe a nova mão com a carta comprada
        playCardSound("cardDraw");//executa o som de comprar carta
        //gameState.myTurn = obj.myTurn;  //recebe feedback de acordo com resultado do round
        gameState.scoreP1 = obj.scoreP1;
        gameState.scoreP2 = obj.scoreP2;
        gameState.turnNum = obj.turnNum;
        document.getElementById("score-player1").innerHTML = obj.scoreP1.toString();
        document.getElementById("score-player2").innerHTML = obj.scoreP2.toString();
    } else if(obj.msgType === 'reconnection') { //carta comprada, recebe a nova mão logo depois de jogar...
        // console.log("AFTERPLAY RECEIVED DATA: "); //nesse momento, logo após jogar o player alter a partida e...
        // console.log(obj);                           //instantaneamente recebe o feedback do server, com as alterações que ele...
        // console.log("=======================================");//fez
        console.log("reconnection");
        gameState.board = obj.board;
        //gameState.hand = obj.hand;  //recebe a nova mão com a carta comprada
        //gameState.myTurn = obj.myTurn;  //recebe feedback de acordo com resultado do round
        gameState.scoreP1 = obj.scoreP1;
        gameState.scoreP2 = obj.scoreP2;
        gameState.turnNum = obj.turnNum;
        //gameState.player = obj.whichPlayer;
        document.getElementById("score-player1").innerHTML = obj.scoreP1.toString();
        document.getElementById("score-player2").innerHTML = obj.scoreP2.toString();
        $("#container-first-hand-card").html(`<img id="card1" value=${gameState.hand[0]} class="cards-in-hand" src="./board-assets/${getCardImage(gameState.hand[0])}.svg" alt="">`);
        $("#container-second-hand-card").html(`<img id="card2" value=${gameState.hand[1]} class="cards-in-hand" src="./board-assets/${getCardImage(gameState.hand[1])}.svg" alt="">`);
        $("#container-third-hand-card").html(`<img id="card3" value=${gameState.hand[2]} class="cards-in-hand" src="./board-assets/${getCardImage(gameState.hand[2])}.svg" alt="">`);
    }

    else {
        // console.log("message else");
        //gameState.player = obj.whichPlayer;
        //gameState.myTurn = obj.firstToPlay;
       // gameState.hand = obj.hand;
        gameState.turnNum = 0;
        document.getElementById("score-player1").innerHTML = '0';
        document.getElementById("score-player2").innerHTML = '0';

        if( gameState.player == 1) {
            $(`#span-player1`).text("Você")
            $(`#span-player2`).text("Oponente")
        } else {
            $(`#span-player1`).text("Oponente")
            $(`#span-player2`).text("Você")
        }
        // console.log("SERV HANDSHAKE OBJECT: ");
        // console.log(obj);
        // console.log("=======================================");
        $("#container-first-hand-card").html(`<img id="card1" value=${gameState.hand[0]} class="cards-in-hand" src="./board-assets/${getCardImage(gameState.hand[0])}.svg" alt="">`);
        $("#container-second-hand-card").html(`<img id="card2" value=${gameState.hand[1]} class="cards-in-hand" src="./board-assets/${getCardImage(gameState.hand[1])}.svg" alt="">`);
        $("#container-third-hand-card").html(`<img id="card3" value=${gameState.hand[2]} class="cards-in-hand" src="./board-assets/${getCardImage(gameState.hand[2])}.svg" alt="">`);
    }

    if (gameState.myTurn) {
        $("#playing-card-field").droppable( { disabled: false } );
    }
    else {
        $("#playing-card-field").droppable( { disabled: true } );
    }
    // console.log("LOCAL GAME STATE: ");
    // console.log(gameState);
    // console.log("=======================================");

    gameStart();
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

function showEnemyCard(cardString) {

    switch (cardString) {
        case 'f':
            $("#container-card-player2").html('<img class="cards-in-hand" src="./board-assets/card-fire.svg">');
            gameState.board[1] = "f";
            playCardSound("f");
            break;
        case 'w':
            $("#container-card-player2").html('<img class="cards-in-hand" src="./board-assets/card-water.svg">');
            gameState.board[1] = "w";
            playCardSound("w");
            break;
        case 'p':
            $("#container-card-player2").html('<img class="cards-in-hand" src="./board-assets/card-plant.svg">');
            gameState.board[1] = "p";
            playCardSound("p");
            break;
        case 'e':
            $("#container-card-player2").html('<img class="cards-in-hand" src="./board-assets/card-ether.svg">');
            gameState.board[1] = "e";
            playCardSound("e");
            break;
        case 'v':
            $("#container-card-player2").html('<img class="cards-in-hand" src="./board-assets/card-void.svg">');
            gameState.board[1] = "v";
            //playCardSound("v");
            break;
        case 'd':
            $("#container-card-player2").html('<img class="cards-in-hand" src="./board-assets/card-dark-matter.svg">');
            gameState.board[1] = "d";
            //playCardSound("d");
            break;
        default:
            break;
    }
}

function verifyIfHaveTwoCardsInTheField() {
    if ( gameState.board[0] != '' && gameState.board[1] != '' ) {
        setTimeout(() => {
            cleanTheCardField(cardImageTagId);
            $("#container-card-player2").html('');
            hideCheap();
            $("#container-first-hand-card").html(`<img id="card1" value=${gameState.hand[0]} class="cards-in-hand" src="./board-assets/${getCardImage(gameState.hand[0])}.svg" alt="">`);
            $("#container-second-hand-card").html(`<img id="card2" value=${gameState.hand[1]} class="cards-in-hand" src="./board-assets/${getCardImage(gameState.hand[1])}.svg" alt="">`);
            $("#container-third-hand-card").html(`<img id="card3" value=${gameState.hand[2]} class="cards-in-hand" src="./board-assets/${getCardImage(gameState.hand[2])}.svg" alt="">`);
        }, 2000);
    }
}

setInterval(() => {
    $(".cards-in-hand").draggable({
        revert: "invalid",
    });
}, 500);

function gameStart() {

    // console.log(gameState)

    $(".cards-in-hand").draggable({
        revert: "invalid",
    });

    showWhosTurn()

    if ( gameState.board[1] != '' ) {
        showEnemyCard(gameState.board[1]);
    }

    verifyIfHaveTwoCardsInTheField()

    if (gameState.myTurn) {
        $("#show-if-is-your-myTurn").text("Sua vez!");

        $("#playing-card-field").droppable({
            drop: function (event, ui) {
                cardImageTagId = ui.draggable.attr("id");
                gameState.board[0] = ui.draggable.attr("value"); //identifica qual é a carta
                playCardSound(gameState.board[0]);
                $("#playing-card-field").droppable({ disabled: true })
                showWhosTurn();


                socketGame.send(JSON.stringify({
                    cardPlayedIndex: Number(ui.draggable.attr("id").slice(-1))
                }),
                {},
                );
                //verifyCardOnTop()
                verifyIfHaveTwoCardsInTheField()
            }
        }); //passa o myTurno para o outro player   
    }
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
        case null:
            nameOfImageArchive = 'null';
            break
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
    if(gameState.turnNum == 11){
        $("#second-cheap").hide();
    }
    // if(turnForDeck == 0){
    //     $("#first-cheap").attr('src','./board-assets/null.png');
    // }
}
