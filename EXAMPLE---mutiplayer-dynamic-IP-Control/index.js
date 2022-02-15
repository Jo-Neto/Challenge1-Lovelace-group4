const reqExp = require('express');
const expApp = reqExp();
const port = 80;

expApp.use(reqExp.json());
expApp.use('/', reqExp.static('static_front'));

let hasPlayerWaiting = false;
let waitingIP = '';
let playerMatchNow = false;

let GameSessionArray = [];  //Arr to store sessions
let currSessionID = 0;  //next session ID

//==========GAMESESSION OBJECT saves session data, players data, and server-side data about the session================================================================================================

const handCardNum = 3; //currently unused
const deckCardNum = 14;

class GameSession {
    constructor() {
        this.dataPublicPlayer1 = {  //player 1 info, player 1 and server only, this is also the first object sent to player 1
            gameSessionID: Number(currSessionID),
            whichPlayer: 1,
            firstToPlay: null,
            initialDeck: []
        };
        this.dataPublicPlayer2 = {   //player 2 info, player 2 and server only, this is also the first object sent to player 2
            gameSessionID: Number(currSessionID),
            whichPlayer: 2,
            firstToPlay: null,
            initialDeck: []
        };
        this.serverSide = {  //info about the session, server only
            gameSessionID: Number(currSessionID), //just for safety
            player1turn: null,
            passTurn = null,
            tradedObject: { //this object will be sent and received, player-server communication
                whichCardPlayed: '',
                enemyQuit = false,
                enemyGaveUp = false
            },
            field: { //game field
            },
            player1: {  //server side only, data about player 1
                ip: null
            },
            player2: {  //server side only, data about player 2
                ip: null
            }
        };
    }
    /*
    agua = a, 4un
    fogo = f, 4un
    planta = p, 4un
    eter = e 2un
    */
    shuffle() {
        //shuffle before sending deck, deck = 10 cartas;
        //GameSession.dataPublicPlayer = shuffled deck, before sending;
        this.dataPublicPlayer1.initialDeck = [];
        this.dataPublicPlayer2.initialDeck = [];
        deckCardNum;
    }
    randFirstToPlay(){
        //randomize which player plays first, 
        this.dataPublicPlayer1.firstToPlay = null;
        this.dataPublicPlayer2.firstToPlay = null;
    }
}

//==========WAITING LINE CONTROL==================================================================================================================================================

//todo: playerMatch timeout && clear waiting IP && clear waiting boolean && clear game session and then... 
//(go next session and store current session ID as failed session OR rewind session ID)

expApp.get('/line', (req, res) => { //when there's waiting players, get requests will keep being received
                                                                                                                            console.log("req.ip = " + req.ip);
                                                                                                                            console.log("waiting IP =" + waitingIP);
                                                                                                                            console.log("hasPlayerWaiting =" + hasPlayerWaiting);
                                                                                                                            console.log("playerMatchNow =" + playerMatchNow);
    if (playerMatchNow) {//match is ready, waiiting for p1 request ////// this needs a timeout fix, otherwise p2 can wait forever
                                                                                                                            console.log("case 1" + req.ip + "<<<<<<<<<<<<<<<<<<<<<<<<");
        if (req.ip === waitingIP) { //player 1 request
            GameSessionArray[currSessionID].serverSide.player1.ip = req.ip;  //store player 1 ip
            res.json(GameSessionArray[currSessionID++].dataPublicPlayer1);   //Game session sent to both players, currSessionID++ so server goes to next session
            waitingIP = ''; //free waiting ip
            hasPlayerWaiting = false;  //clear waiting line
            playerMatchNow = false;   //clear match ready boolean
                                                                                                                            console.log("case 1 inner" + req.ip + "<<<<<<<<<<<<<<<<<<<<<<<<");
                                                                                                                            console.log("PLAYER 1 FOUND, NEW GAME SESSION DONE, DATA BELOW:");
                                                                                                                            console.log("================================================================================================");
                                                                                                                            console.log(GameSessionArray[(currSessionID-1)]);
                                                                                                                            console.log("================================================================================================");
        } else {
            res.send("erro no servidor");
                                                                                                                            console.log("erro de logica, case 1 else");
        }
    } else if (hasPlayerWaiting) { //there's a player waiting
        if (req.ip !== waitingIP && !playerMatchNow) { //request is not p1 && match is not ready
            GameSessionArray[currSessionID] = new GameSession;  //create new game session
            GameSessionArray[currSessionID].serverSide.player2.ip = req.ip;  //store the request IP
            res.json(GameSessionArray[currSessionID].dataPublicPlayer2);  //send session game session to P2, p2 front should stop sending reqs
            playerMatchNow = true;  //match is ready
                                                                                                                            console.log("case 2 inner" + req.ip + "<<<<<<<<<<<<<<<<<<<<<<<<");                                                                                                               
                                                                                                                            console.log("NEW GAME SESSION CREATED, DATA BELOW, PLAYER 2 ONLY");
                                                                                                                            console.log("================================================================================================");
                                                                                                                            console.log(GameSessionArray[currSessionID]);
                                                                                                                            console.log("================================================================================================");
        } else { //there's a player waiting, but the request is not from p1, or match is ready
            if(req.ip !== waitingIP) {  //random player request???
                                                                                                                            console.log("case 2 else, if" + req.ip + "<<<<<<<<<<<<<<<<<<<<<<<<");
                res.send("waiting other player");
            }
            else { //p2 request
                                                                                                                            console.log("case 2 else, else" + req.ip + "<<<<<<<<<<<<<<<<<<<<<<<<");
                res.send("wait other players");
            }
        }
    } else {   //no player waiting && no player to be matched, this is the last check for performance
                                                                                                                            console.log("case 3" + req.ip + "<<<<<<<<<<<<<<<<<<<<<<<<");
        hasPlayerWaiting = true;  //now there's a waiting player...
        waitingIP = req.ip;   //with this IP, this is player 1, first to request
        res.send("you are on waiting line");
    }
                                                                                                                            console.log("=========================================END GET '/line'========================================");
})

//==========GAME DATA EXCHANGE AND SESSION CONTROL=========================================================================================================================================

expApp.post('/', (req, res) => {  //todo: in case of gameSession undefined, or gameSessionID undefined/NaN/String... etc
    
    let index = req.body.gameSessionID;  //performance????, readability nonetheless

    if (!((req.ip === GameSessionArray[index].serverSide.player1.ip) || (req.ip === GameSessionArray[index].serverSide.player2.ip))) {  
        //wrong session, player IP does not belong to received gameSessionID
        res.send("wrong session");                                                                                                                    
                                                                                                                            console.log("post request ip-session unmatch");
                                                                                                                            console.log("ip="+req.ip);
                                                                                                                            console.log("game session object:  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
    }


    if (req.ip === GameSessionArray[index].serverSide.player1.ip) {//player 1 request
                                                                                                                            console.log("p1 post request"+req.ip);
        if (!GameSessionArray[index].serverSide.player1turn) { //not player 1 turn
            res.send("not your turn");
                                                                                                                            console.log("not p1 turn");
        } else if(Object.keys(GameSessionArray[index].serverSide.tradedObject).length === 0){
            //player 1 turn, and object is empty
            GameSessionArray[index].serverSide.tradedObject = req.body; //receive object from p1
            res.send("object sent");
                                                                                                                            console.log("p1 turn");
        } else {  //player 1 turn, but p1 already sent object
            res.send("message already sent");
                                                                                                                            console.log("p1 turn, but message already sent");
        }
    } else if (req.ip === GameSessionArray[index].serverSide.player2.ip) {//player 2 request
                                                                                                                            console.log("p2 post request"+req.ip);
        if (GameSessionArray[index].serverSide.player1turn) {//but p1 turn, not p2 turn
            res.send("not your turn");
                                                                                                                            console.log("not p2 turn");
        } else if(Object.keys(GameSessionArray[index].serverSide.tradedObject).length === 0){
            //player 2 turn, and object is empty
            GameSessionArray[index].serverSide.tradedObject = req.body; //receive object from p2
            res.send("object sent");
                                                                                                                            console.log("p2 turn");
        } else {  //player 2 turn, but p2 already sent object
            res.send("message already sent");
                                                                                                                            console.log("p2 turn, but message already sent");
        }
    } else { //erro de logica, a request não devia ter chego aqui
        res.send("server logical error");
                                                                                                                            console.log("logical error on POST '/' check");
    }
                                                                                                                            console.log("=========================================END POST '/'========================================");
})

//==========RECEIVING END CONTROL===================================================================================================================================================================================================

//todo: in case of gameSession undefined
expApp.get('/waiting', (req, res) => { //is my turn, what's the other player play? has the other player played? 
                                                                                                                            console.log("get 'waiting' ip="+req.ip);
    let index = Number(req.query.gameSessionID);  //performance improvement, only one cast instead of several
    
    if (!((req.ip === GameSessionArray[index].serverSide.player1.ip) || (req.ip === GameSessionArray[index].serverSide.player2.ip))) {
        //sessao errada, IP não faz parte dessa partida
        res.send("wrong session");
                                                                                                                            console.log("get request ip-session unmatch");
    }
    
    if (Object.keys(GameSessionArray[index].serverSide.tradedObject).length !== 0) {
        //there's a play waiting to be sent                                                                                                                 
                                                                                                                            console.log("message will be sent");
        if (!GameSessionArray[index].serverSide.player1turn && req.ip === GameSessionArray[index].serverSide.player1.ip) { 
            //player 1 waiting && player 1 request
            GameSessionArray[index].serverSide.player1turn = true;  //p1 received object, now p1 can play
            res.json(GameSessionArray[index].serverSide.tradedObject);  //send the object
            GameSessionArray[index].serverSide.tradedObject = {};  //clear object
                                                                                                                            console.log("sent to p1"+req.ip);
        } else if (GameSessionArray[index].serverSide.player1turn && req.ip === GameSessionArray[index].serverSide.player2.ip) { 
            //player 2 waiting && player 2 request 
            GameSessionArray[index].serverSide.player1turn = false;  //p2 received object, now p2 can play
            res.json(GameSessionArray[index].serverSide.tradedObject); //send the object
            GameSessionArray[index].serverSide.tradedObject = {};  //clear object
                                                                                                                            console.log("sent to p2"+req.ip);
        } else
            res.send("waiting");
    } else {  //the player hasn't played yet, i.e tradedObject = {}
        res.send("waiting");
    }
                                                                                                                            console.log("=========================================END GET '/waiting'========================================");
})

//==========================================================================================================================================================

expApp.listen(port, () => { console.log(`app listening on localhost:${port}`); });