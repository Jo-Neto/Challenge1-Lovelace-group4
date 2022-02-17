const reqExp = require('express');
const expApp = reqExp();
const port = 80;

expApp.use(reqExp.json());
expApp.use('/p1', reqExp.static('static_front/player1'));
expApp.use('/p2', reqExp.static('static_front/player2'));

let servLocked = false;
let isP1Turn = true;

let p1LastAnswer = null;
let p2LastAnswer = null;

expApp.route('/p1/reqpath')
    .get((req, res) => {
        if (isP1Turn && !servLocked) //receive
            res.send(p2LastAnswer);
        else //deny
            res.send("not your turn");
    })
    .post((req, res) => {
        if (isP1Turn && !servLocked) { //play 
            servLocked = true;
            p1LastAnswer = req.body.num;
            servLocked = false;
            isP1Turn = false;
        }
        else //deny
            res.send("not your turn");
    })

expApp.route('/p2/reqpath')
    .get((req, res) => {
        if (!isP1Turn && !servLocked) //receive
            res.send(p1LastAnswer);
        else //deny
            res.send("not your turn");
    })
    .post((req, res) => {
        if (!isP1Turn && !servLocked) { //play
            servLocked = true;
            p2LastAnswer = req.body.num;
            servLocked = false;
            isP1Turn = true;
        }
        else //deny
            res.send("not your turn");
    })

expApp.listen(port, () => { console.log(`app listening on localhost:${port}`); });