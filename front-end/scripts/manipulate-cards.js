//OBjeto recebido do front
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

//let cardImageTagId; //Essa variável serve para pegar a id da imagem da carta que foi jogada, pois isso será usado em diferentes funções

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
    console.log("Outro script")
    console.log(event.data)
    // let obj
    // //Esse trecho é pra ver se recebeu alguma string, se receber string é pq a partida acabou, as possíveis strings são "voce ganhou" e "voce perdeu"
    // try {
    //     obj = JSON.parse(event.data)
    // } catch {

    //     if ( event.data === "voce ganhou" ) {
    //         gameState.player == 1 ? $("#score-player1").text("5") : $("#score-player2").text("5");
    //         $("#description-modal").text("Vitória!")
    //         openModal("modal-general")
    //     } else if (event.data === "voce perdeu") {
    //         gameState.player == 1 ? $("#score-player2").text("5") : $("#score-player1").text("5");
    //         $("#description-modal").text("Derrota!")
    //         openModal("modal-general")
    //     }

    //     return console.log(event.data)
    // }


    // $("#container-first-hand-card").html(`<img id="card1" value=${gameState.hand[0]} class="cards-in-hand" src="./board-assets/${getCardImage(gameState.hand[0])}.svg" alt="">`);
    // $("#container-second-hand-card").html(`<img id="card2" value=${gameState.hand[1]} class="cards-in-hand" src="./board-assets/${getCardImage(gameState.hand[1])}.svg" alt="">`);
    // $("#container-third-hand-card").html(`<img id="card3" value=${gameState.hand[2]} class="cards-in-hand" src="./board-assets/${getCardImage(gameState.hand[2])}.svg" alt="">`);

    // if (gameState.myTurn) {
    //     $("#playing-card-field").droppable( { disabled: false } );
    // }
    // else {
    //     $("#playing-card-field").droppable( { disabled: true } );
    // }
    // // console.log("LOCAL GAME STATE: ");
    // // console.log(gameState);
    // // console.log("=======================================");

    // gameStart();
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
            //cleanTheCardField(cardImageTagId);
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
                //cardImageTagId = ui.draggable.attr("id");
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


function playCardSound(card) {

    let waterSound = new Audio('board-assets/sounds/waterCardSound.mp3');
    let fireSound = new Audio('board-assets/sounds/fireCardSound.mp3');
    let plantSound = new Audio('board-assets/sounds/plantCardSound.mp3');
    let etherSound = new Audio('board-assets/sounds/etherCardSound.mp3');

    let winnerSound = new Audio('board-assets/sounds/winnerRound.mp3');
    let loserSound = new Audio('board-assets/sounds/roundLoser.mp3');

    let cardDrawSound = new Audio('board-assets/sounds/cardDrawSound.mp3');
    let backgroundMusic = new Audio('board-assets/sounds/backgroundSound.mp3');

    switch (card) {
        case "w":
            waterSound.play();
            break;
        case "f": 
            fireSound.play();
            fireSound.volume = 0.15;
            break;
        case "p": 
            plantSound.play();
            break;
        case "e":
            etherSound.play();
            break;
        case "cardDraw":
            cardDrawSound.play();
            break;
        case "roundWinner":
            winnerSound.play();
            break;
        case "roundLoser":
            loserSound.play();
        case "backgroundSound":
            backgroundMusic.loop = true;
            backgroundMusic.volume = 0.08;
            backgroundMusic.play();
            break;
    }
}

//let count = -1;
function changeSoundConf() {
    count++;
    const button = document.getElementById('btn-sound');
    if(count%2 == 0) {
        button.setAttribute('src', '');
        button.setAttribute('src', './board-assets/music_off_white_24dp.svg');
        waterSound.src = "";
        fireSound.src = "";
        plantSound.src = "";
        etherSound.src = "";
        cardDrawSound.src = "";
        backgroundMusic.src = "";
    } else {
        button.setAttribute('src', '');
        button.setAttribute('src', './board-assets/music_note_white_24dp.svg');
        waterSound.src = 'board-assets/sounds/waterCardSound.mp3';
        fireSound.src = 'board-assets/sounds/fireCardSound.mp3';
        plantSound.src = 'board-assets/sounds/plantCardSound.mp3';
        etherSound.src = 'board-assets/sounds/etherCardSound.mp3';
        cardDrawSound.src = 'board-assets/sounds/cardDrawSound.mp3';
        backgroundMusic.src = 'board-assets/sounds/backgroundSound.mp3';
        backgroundMusic.play();
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
