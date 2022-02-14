const url = window.location.href;

const finderID = setInterval(waitingLineState, 5000);
let updaterID = null;

let GameSessionObject = {};

function waitingLineState() {
    $.ajax(`${url}line`)
        .done((resp) => {
            if (typeof resp === 'object') {
                clearInterval(finderID);
                $('#battlefield').css('display', 'flex');
                $('#state-div').text('player found');
                $('#state-div').css('background-color', 'black');
                GameSessionObject = resp;
                console.log("FOUND PAIR");
                console.log(GameSessionObject);
                console.log("=============================================================");
                if(GameSessionObject.myPos === 1) {
                    $('#state-div').css('background-color', 'green');
                    $('#state-div').text('my turn');
                } else {
                    $('#state-div').css('background-color', 'red');
                    $('#state-div').text('not my turn');
                    $('button').attr('hidden', true);
                    updaterID = setInterval(waitingAnswerState, 5000);
                }
                return true;
            }
        })
}

$('button').click(() => {
    $('button').attr('hidden', true);
    GameSessionObject.param1 = $('input').eq(0).val();
    GameSessionObject.param2 = $('input').eq(1).val();
    GameSessionObject.param3 = $('input').eq(2).val();
    $.ajax({
        url: `${url}`,
        method: "POST",
        data: JSON.stringify(GameSessionObject),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json'
    })
        .done(() => {
            console.log("done");
        }).fail (()=> { 
            console.log("fail"); 
        }).always (()=> { 
            console.log("always");
            console.log();
            console.log(GameSessionObject);
            console.log("=============================================================");
            $('#state-div').css('background-color', 'black');
            $('#state-div').text('data sent');
            updaterID = setInterval(waitingAnswerState, 5000); 
        });
});

function waitingAnswerState() {
    $.ajax(`${url}waiting?gameSessionID=${GameSessionObject.gameSessionID}`)
        .done((resp) => {
            if(typeof resp ==='object') { 
                clearInterval(updaterID);
                $('.res-line').eq(0).text(resp.param1);
                $('.res-line').eq(1).text(resp.param2);
                $('.res-line').eq(2).text(resp.param3);
                $('#state-div').text('my turn');
                $('#state-div').css('background-color', 'green');
                $('button').attr('hidden', false);
                return;
            } else if(resp === 'wrong session') {
                $('#state-div').text('wrong session');
                return
            } else if(resp === 'waiting') {
                $('#state-div').text('not my turn');
                $('#state-div').css('background-color', 'red');
                return;
            } else {
                console.log("server error, unknown message");
            }
        })
}