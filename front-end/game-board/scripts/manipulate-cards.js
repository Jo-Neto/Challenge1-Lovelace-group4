$("#playing-card-field").droppable({ disabled: true });  //impossibilita o jogador de jogar até que....
const url = window.location.href.slice(7, -6);
const port = 80;
const gameSocket = new WebSocket(`ws://${url}:${port}/gamestream`); //o web socket esteja aberto na linha 32, depois linha 36

let cardImageTagId; //Essa variável serve para pegar a id da imagem da carta que foi jogada, pois isso será usado em diferentes funções

let gameState = {
    gameSessionID: null,
    player: null,
    myTurn: null,
    hand: null,
    board: ['', ''],  //me, enemy
    scoreP1: 0,
    scoreP2: 0 
}

/*
    coisas faltando:
        -- fazer a carta comprada aparecer
        -- identificador visualmente qual player eu sou e colocar nomes no lugar de "player 1" e "player 2"
        -- fazer a carta inimiga não sumir até o round terminar
        -- receber mensagem de vitoria e derrota
        -- ping/pong pra saber se o server ta vivo
        -- mensagem de reconexão na pagina HOME
        -- leaderboard
        -- layout do chat, precisa ter um array pro player e pro adversario, para não haver limite de mensagens, pode haver anti-spam,
        -- tela de login e registro na home

        SUGESTÃO: fica dificil saber a carta inimiga porque o layout do board ja tem 4 cartas, acabo me confundindo
        então talvez tirar as 4 cartas fixas, ou distinguir melhor as cartas de "verdade"
*/

gameSocket.onopen = (event) => {
    console.log("GAME SOCKET OPEN, SOCKET DATA: ");
    // console.log(event);
    // console.log("=======================================");
}

gameSocket.onmessage = (event) => {
    // console.log("==============================================================================================================================================================================================================================================================================================================================");
    // console.log("SERV MSG ==> "+ event.data);
    // console.log("=======================================");
    let obj = JSON.parse(event.data);
    if (obj.msgType === 'waitingFeedback') { //só recebe board quando o outro joga
        gameState.gameSessionID = obj.gameSessionID; //safety
        gameState.board = obj.board;
        // showEnemyCard(obj.board[1]);
        gameState.hand = obj.hand;
        gameState.myTurn = obj.myTurn;
        gameState.scoreP1 = obj.scoreP1;
        gameState.scoreP2 = obj.scoreP2;
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
        gameState.board = obj.board;
        gameState.hand = obj.newHand;  //recebe a nova mão com a carta comprada
        gameState.myTurn = obj.myTurn;  //recebe feedback de acordo com resultado do round
        gameState.scoreP1 = obj.scoreP1;
        gameState.scoreP2 = obj.scoreP2;
        document.getElementById("score-player1").innerHTML = obj.scoreP1.toString();
        document.getElementById("score-player2").innerHTML = obj.scoreP2.toString();
    }

    else {
        gameState.gameSessionID = obj.gameSessionID;
        gameState.player = obj.whichPlayer;
        gameState.myTurn = obj.firstToPlay;
        gameState.hand = obj.hand;
        document.getElementById("score-player1").innerHTML = '0';
        document.getElementById("score-player2").innerHTML = '0';
        // console.log("SERV HANDSHAKE OBJECT: ");
        // console.log(obj);
        // console.log("=======================================");
    }
    if (gameState.myTurn) {
        $("#playing-card-field").droppable( { disabled: false } );
    }
    if (!gameState.myTurn) {
        $("#playing-card-field").droppable( { disabled: true } );
    }
    console.log("LOCAL GAME STATE: ");
    console.log(gameState);
    console.log("=======================================");
    gameStart();
}

gameSocket.onclose = (event) => {
    console.log("SOCKET CLOSE ==> "+ event);
    console.log("CODE: "+ event.code);
    console.log("REASON: "+event.reason);
}

function showEnemyCard(cardString) {
    switch (cardString) {
        case 'f':
            $("#container-card-player2").html('<img class="cards-in-hand" src="./assets/card-fire.png" alt="">');
            gameState.board[1] = "f";
            break;
        case 'w':
            $("#container-card-player2").html('<img class="cards-in-hand" src="./assets/card-water.png" alt="">');
            gameState.board[1] = "w";
            break;
        case 'p':
            $("#container-card-player2").html('<img class="cards-in-hand" src="./assets/card-plant.png" alt="">');
            gameState.board[1] = "p";
            break;
        case 'e':
            $("#container-card-player2").html('<img class="cards-in-hand" src="./assets/card-ether.png" alt="">');
            gameState.board[1] = "e";
            break;
        default:
            break;
    }
}

function gameStart() {

    if ( gameState.board[1] != '' ) {
        showEnemyCard(gameState.board[1]);
    }

    $("#container-first-hand-card").html(`<img id="card1" value=${gameState.hand[0]} class="cards-in-hand" src="./assets/${getCardImage(gameState.hand[0])}.png" alt="">`);
    $("#container-second-hand-card").html(`<img id="card2" value=${gameState.hand[1]} class="cards-in-hand" src="./assets/${getCardImage(gameState.hand[1])}.png" alt="">`);
    $("#container-third-hand-card").html(`<img id="card3" value=${gameState.hand[2]} class="cards-in-hand" src="./assets/${getCardImage(gameState.hand[2])}.png" alt="">`);

    if (gameState.myTurn) {
        $("#show-if-is-your-myTurn").text("É sua vez de jogar!");

        $(".cards-in-hand").draggable({
            revert: "invalid",
        });

        $("#playing-card-field").droppable({
            drop: function (event, ui) {
                cardImageTagId = ui.draggable.attr("id");
                gameState.board[0] = ui.draggable.attr("value"); //identifica qual é a carta
                gameState.myTurn = false;
                $("#playing-card-field").droppable({ disabled: true })
                showWhosmyTurn();

                gameSocket.send(JSON.stringify({
                    gameSessionID: gameState.gameSessionID,
                    cardPlayed: ui.draggable.attr('value'),
                    cardPlayedIndex: Number(ui.draggable.attr("id").slice(-1))
                }),
                {},
                // callbackFunction(ui.draggable.attr('value'))
                );
            }
        }); //passa o myTurno para o outro player   
    }

    //     if ( gameState.board[0] != '' && gameState.board[1] != '') {
    //         setTimeout(() => {
    //         cleanTheCardField(cardImageTagId);
    //         $("#container-card-player2").html('');
    //         takeCardFromDeck(cardImageTagId);
    //     }, 2000);
    // }
}

function callbackFunction(value) {
    console.log(gameState)
    // takeCardFromDeck(value)
}

/*
//Sorteia uma carta do array "cards"
function randomArray(arr) {
    let num = Math.floor(Math.random() * (arr.length));
    let elem = arr.splice(num,1)[0];

    return elem;
}*/

function getCardImage(card) {

    let nameOfImageArchive;

    switch (card) {
        case "w": nameOfImageArchive = 'card-water';
            break;
        case "f": nameOfImageArchive = 'card-fire';
            break;
        case "p": nameOfImageArchive = 'card-plant';
            break;
        case "e": nameOfImageArchive = 'card-ether';
            break;
    }

    return nameOfImageArchive;
}

function cleanTheCardField(tagCardId) {

    if (tagCardId === "card1") {
        $("#container-first-hand-card").html("");
        //gameState.hand[0] = "empty";
    }

    else if (tagCardId === "card2") {
        $("#container-second-hand-card").html("");
        //gameState.hand[1] = "empty";
    }

    else if (tagCardId === "card3") {
        $("#container-third-hand-card").html("");
        //gameState.hand[2] = "empty";
    }
}

// function takeCardFromDeck(tagCardId) {

//     gameState.hand.forEach((card, index) => {
//         if (card === "empty") {

//             let containerEmpty;

//             switch (index) {
//                 case 0: containerEmpty = "first";
//                     break;

//                 case 1: containerEmpty = "second";
//                     break;

//                 case 2: containerEmpty = "third";
//                     break;
//             }

//             $(`#container-${containerEmpty}-hand-card`).html(`<img id=${tagCardId} value=${gameState.hand[index]} class="cards-in-hand" src="./assets/${getCardImage(gameState.hand[index])}.png" alt="">`);

//             $(".cards-in-hand").draggable({
//                 revert: "invalid",
//             });
//         }
//     });
// }

function showWhosmyTurn() {
    gameState.myTurn === true ? $("#show-if-is-your-myTurn").text("É sua vez de jogar!") : $("#show-if-is-your-myTurn").text("É a vez do oponente");
}

/*
function gameLogic() {

    if (gameState.myTurn === true) {
        document.getElementById("container-card-player2").style.zIndex = 4;
    }
    if (gameState.myTurn === false) {
        document.getElementById("container-card-player2").style.zIndex = 2;
    }


    if (gameState.howManyCardsInThePlayingField == 2) {

        if (gameState.board[0] == 'e' && gameState.board[1] != 'e') {
            gameState.myTurn = true;
        }
        if (gameState.board[1] == 'e' && gameState.board[0] != 'e') {
            gameState.myTurn = false;
        }
        if (gameState.board[0] == 'w' && gameState.board[1] == 'f') {
            gameState.myTurn = true;
        }
        if (gameState.board[0] == 'w' && gameState.board[1] == 'p') {
            gameState.myTurn = false;
        }
        if (gameState.board[0] == 'f' && gameState.board[1] == 'w') {
            gameState.myTurn = false;
        }
        if (gameState.board[0] == 'f' && gameState.board[1] == 'p') {
            gameState.myTurn = true;
        }
        if (gameState.board[0] == 'p' && gameState.board[1] == 'w') {
            gameState.myTurn = true;
        }
        if (gameState.board[0] == 'p' && gameState.board[1] == 'f') {
            gameState.myTurn = false;
        }

        howManyCardsInThePlayingField = 0;
        document.getElementById("score-player1").innerHTML = gameState.score1;
        document.getElementById("score-player2").innerHTML = gameState.score2;

        setTimeout(() => {
            cleanTheCardField(cardImageTagId);
            $("#container-card-player2").html('');
            takeCardFromDeck(cardImageTagId);
        }, 2000);

        showWhosmyTurn();

        if (gameState.score1 == 5) {
            alert("player 1 wins");
        }
        if (gameState.score2 == 5) {
            alert("player 2 wins");
        }
    }
}

/*
funçoes para teste do player 2 abaixo
*/

//Socket onmessage vai chamar showCard()
//Obs: tem q mexer na showCard()
/*
function showCard(element) {
    if (myTurn == 2) {
        switch (element) {
            case 'f':
                $("#container-card-player2").html('<img id="card1" value="w" class="cards-in-hand" src="./assets/card-fire.png" alt="">');
                gameState.board[1] = "f";
                break;
            case 'w':
                $("#container-card-player2").html('<img id="card1" value="w" class="cards-in-hand" src="./assets/card-water.png" alt="">');
                gameState.board[1] = "w";
                break;
            case 'p':
                $("#container-card-player2").html('<img id="card1" value="w" class="cards-in-hand" src="./assets/card-plant.png" alt="">');
                gameState.board[1] = "p";
                break;
            case 'e':
                $("#container-card-player2").html('<img id="card1" value="w" class="cards-in-hand" src="./assets/card-ether.png" alt="">');
                gameState.board[1] = "e";
                break;

            default:
                break;
        }
        $("#playing-card-field").droppable({ disabled: false });
        howManyCardsInThePlayingField++;
        myTurn = 1; //passa o myTurno para o player 1
        showWhosmyTurn(myTurn);

        gameLogic();
    }
}*/
