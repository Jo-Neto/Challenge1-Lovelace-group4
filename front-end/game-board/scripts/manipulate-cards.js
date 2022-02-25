$("#playing-card-field").droppable({ disabled: true });  //impossibilita o jogador de jogar até que....
const url = window.location.href.slice(7, -6);
const port = 80;
const gameSocket = new WebSocket(`ws://${url}:${port}/gamestream`); //o web socket esteja aberto na linha 32, depois linha 36

$(document).ready( () => {
    $(".btn-back-to-home").attr("href", `http://${url}:${port}`)
})

//código 1000 ou vc tá indo pro socket da partida ou acaba a partida
//Se não é sua partida, o código é 4004, e o socket fecha

let cardImageTagId; //Essa variável serve para pegar a id da imagem da carta que foi jogada, pois isso será usado em diferentes funções
let turnForDeck = 11;

let gameState = {
    gameSessionID: null,
    player: null,
    myTurn: null,
    hand: null,
    board: ['', ''],  //me, enemy
    scoreP1: 0,
    scoreP2: 0,
    turnNum: 0
}

/*
    coisas faltando:
        -- ping/pong pra saber se o server ta vivo
        -- mensagem de reconexão na pagina HOME
        -- leaderboard
        -- layout do chat, precisa ter um array pro player e pro adversario, para não haver limite de mensagens, pode haver anti-spam,
        -- tela de login e registro na home

        SUGESTÃO: fica dificil saber a carta inimiga porque o layout do board ja tem 4 cartas, acabo me confundindo
        então talvez tirar as 4 cartas fixas, ou distinguir melhor as cartas de "verdade"
*/

gameSocket.onopen = (event) => {
    playCardSound("backgroundSound");
    //console.log("GAME SOCKET OPEN, SOCKET DATA: ");
    // console.log(event);
    // console.log("=======================================");
}

gameSocket.onmessage = (event) => {
    // console.log("==============================================================================================================================================================================================================================================================================================================================");
    // console.log("SERV MSG ==> "+ event.data);
    // console.log("=======================================");

    let obj
    //Esse trecho é pra ver se recebeu alguma string, se receber string é pq a partida acabou, as possíveis strings são "voce ganhou" e "voce perdeu"
    try {
        obj = JSON.parse(event.data)
    } catch {

        if ( event.data === "voce ganhou" ) {
            gameState.player == 1 ? $("#score-player1").text("5") : $("#score-player2").text("5");
            openModal("modal-victory")
        } else if (event.data === "voce perdeu") {
            gameState.player == 1 ? $("#score-player2").text("5") : $("#score-player1").text("5");
            openModal("modal-defeat")
        }

        return console.log(event.data)
    }

    //console.log("RECEIVED OBJ ==> "+ obj);
    //console.log(obj);
    //console.log(event.data);
    //console.log("=======================================");
    if (obj.msgType === 'waitingFeedback') { //só recebe board quando o outro joga
        // console.log("waitingFeedback");
        gameState.gameSessionID = obj.gameSessionID; //safety
        gameState.board = obj.board;
        gameState.hand = obj.hand;
        gameState.myTurn = obj.myTurn;
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
        gameState.hand = obj.newHand;  //recebe a nova mão com a carta comprada
        playCardSound("cardDraw");//executa o som de comprar carta
        gameState.myTurn = obj.myTurn;  //recebe feedback de acordo com resultado do round
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
        gameState.gameSessionID = obj.gameSessionID; 
        gameState.board = obj.board;
        gameState.hand = obj.hand;  //recebe a nova mão com a carta comprada
        gameState.myTurn = obj.myTurn;  //recebe feedback de acordo com resultado do round
        gameState.scoreP1 = obj.scoreP1;
        gameState.scoreP2 = obj.scoreP2;
        gameState.turnNum = obj.turnNum;
        gameState.player = obj.whichPlayer;
        document.getElementById("score-player1").innerHTML = obj.scoreP1.toString();
        document.getElementById("score-player2").innerHTML = obj.scoreP2.toString();
        $("#container-first-hand-card").html(`<img id="card1" value=${gameState.hand[0]} class="cards-in-hand" src="./assets/${getCardImage(gameState.hand[0])}.svg" alt="">`);
        $("#container-second-hand-card").html(`<img id="card2" value=${gameState.hand[1]} class="cards-in-hand" src="./assets/${getCardImage(gameState.hand[1])}.svg" alt="">`);
        $("#container-third-hand-card").html(`<img id="card3" value=${gameState.hand[2]} class="cards-in-hand" src="./assets/${getCardImage(gameState.hand[2])}.svg" alt="">`);
    }

    else {
        // console.log("message else");
        gameState.gameSessionID = obj.gameSessionID;
        gameState.player = obj.whichPlayer;
        gameState.myTurn = obj.firstToPlay;
        gameState.hand = obj.hand;
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
        $("#container-first-hand-card").html(`<img id="card1" value=${gameState.hand[0]} class="cards-in-hand" src="./assets/${getCardImage(gameState.hand[0])}.svg" alt="">`);
        $("#container-second-hand-card").html(`<img id="card2" value=${gameState.hand[1]} class="cards-in-hand" src="./assets/${getCardImage(gameState.hand[1])}.svg" alt="">`);
        $("#container-third-hand-card").html(`<img id="card3" value=${gameState.hand[2]} class="cards-in-hand" src="./assets/${getCardImage(gameState.hand[2])}.svg" alt="">`);
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

gameSocket.onclose = (event) => {
    console.log("SOCKET CLOSE: ");
    console.log(event);
    console.log("CLOSE CODE: " + event.code);
    console.log("CLOSE REASON: " + event.reason);

    if ( event.code === 4000 || event.code === 4200 ) {
        console.log("O oponente desconectou")
        openModal("modal-disconnected")
    } else if ( event.code === 4008 ) {
        console.log("O oponente trapaceou")
        openModal("modal-opponent-cheat")
    } else if ( event.code === 4004 ) {
        console.log("Você não esta em nenhuma partida")
        openModal("modal-no-match")
    } else if ( event.code === 1008 ) {
        console.log("Você trapaceou")
        openModal("modal-cheat")
    }
}

function showEnemyCard(cardString) {

    switch (cardString) {
        case 'f':
            $("#container-card-player2").html('<img class="cards-in-hand" src="./assets/card-fire.svg">');
            gameState.board[1] = "f";
            playCardSound("f");
            break;
        case 'w':
            $("#container-card-player2").html('<img class="cards-in-hand" src="./assets/card-water.svg">');
            gameState.board[1] = "w";
            playCardSound("w");
            break;
        case 'p':
            $("#container-card-player2").html('<img class="cards-in-hand" src="./assets/card-plant.svg">');
            gameState.board[1] = "p";
            playCardSound("p");
            break;
        case 'e':
            $("#container-card-player2").html('<img class="card cards-in-hand" src="./assets/card-ether.svg">');
            gameState.board[1] = "e";
            playCardSound("e");
            break;
        default:
            break;
    }
    

}

function verifyCardOnTop() {

    if((gameState.board[0] == '') && (gameState.board[1] =='')){
        
    }else if((gameState.board[0] != '') && (gameState.board[1] !='')){
        //turnForDeck --;                
    }else if((gameState.board[0] =='') && (gameState.board[1] != '')){
        $("#container-card-player2").css('zIndex',5);
    }else if ((gameState.board[0] !='') && (gameState.board[1] == '')) {
        $("#container-card-player2").css('zIndex',3);
    }
}

function noCardsOnHand(){
    if(turnForDeck < 7) {//mudar para -3 quando certo
        if(gameState.scoreP1 > gameState.scoreP2) {
            openModal("modal-victory");
        }else if(gameState.scoreP2 > gameState.scoreP1){
            openModal("modal-defeat");
        }else{
            // openModal("modal-draw");
        }
    }
}

function verifyIfHaveTwoCardsInTheField() {
    if ( gameState.board[0] != '' && gameState.board[1] != '' ) {
        setTimeout(() => {
            cleanTheCardField(cardImageTagId);
            $("#container-card-player2").html('');
            hideCheap();
            $("#container-first-hand-card").html(`<img id="card1" value=${gameState.hand[0]} class="cards-in-hand" src="./assets/${getCardImage(gameState.hand[0])}.svg" alt="">`);
            $("#container-second-hand-card").html(`<img id="card2" value=${gameState.hand[1]} class="cards-in-hand" src="./assets/${getCardImage(gameState.hand[1])}.svg" alt="">`);
            $("#container-third-hand-card").html(`<img id="card3" value=${gameState.hand[2]} class="cards-in-hand" src="./assets/${getCardImage(gameState.hand[2])}.svg" alt="">`);
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

                gameSocket.send(JSON.stringify({
                    gameSessionID: gameState.gameSessionID,
                    cardPlayed: ui.draggable.attr('value'),
                    cardPlayedIndex: Number(ui.draggable.attr("id").slice(-1))
                }),
                {},
                );
                verifyCardOnTop()
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
        case null:
            nameOfImageArchive = 'null';
            break

    }

    return nameOfImageArchive;
}

let nameOfSoundArchive;

function playCardSound(card) {

    switch (card) {
        case "w": nameOfSoundArchive = new Audio('assets/sounds/waterCardSound.mp3');
            nameOfSoundArchive.play();
            break;
        case "f": nameOfSoundArchive = new Audio('assets/sounds/fireCardSound.mp3');
            nameOfSoundArchive.play();
            nameOfSoundArchive.volume = 0.15;
            break;
        case "p": nameOfSoundArchive = new Audio('assets/sounds/plantCardSound.mp3');
            nameOfSoundArchive.play();
            break;
        case "e": nameOfSoundArchive = new Audio('assets/sounds/etherCardSound.mp3');
            nameOfSoundArchive.play();
            break;
        case "cardDraw": nameOfSoundArchive = new Audio('assets/sounds/cardDrawSound.mp3');
            nameOfSoundArchive.play();
            break;
        case "roundWinner": nameOfSoundArchive = new Audio('assets/sounds/winnerRound.mp3');
            nameOfSoundArchive.play();
            break;
        case "roundLoser": nameOfSoundArchive = new Audio('assets/sounds/roundLoser.mp3');
            nameOfSoundArchive.play();
        case "backgroundSound": nameOfSoundArchive = new Audio('assets/sounds/backgroundSound.mp3');
            nameOfSoundArchive.loop = true;
            nameOfSoundArchive.volume = 0.08;
            nameOfSoundArchive.play();
            break;
    }
}

let count = -1;
function changeSoundConf() {
    count++;
    const button = document.getElementById('btn-sound');
    if(count%2 == 0) {
        button.setAttribute('src', '');
        button.setAttribute('src', './assets/music_off_white_24dp.svg');
        nameOfSoundArchive.pause();
    } else {
        button.setAttribute('src', '');
        button.setAttribute('src', './assets/music_note_white_24dp.svg');
        nameOfSoundArchive.play();
    }
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

function hideCheap() {
    if(turnForDeck == 0){
        $("#second-cheap").hide();
    }
    // if(turnForDeck == 0){
    //     $("#first-cheap").attr('src','./assets/null.png');
    // }
}
