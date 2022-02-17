const url = 'http://localhost/p1/reqpath';

$('button').click(() => {
    $('button').attr('hidden', true);
    $('input').attr('hidden', true);
    $('#res-field-sent').text($("input").val());
    $('#state-div').css('background-color', 'red');
    $('#state-div').text('enemy turn');
    $.ajax({
        url: `${url}`,
        method: "POST",
        data: JSON.stringify({
            num: $("input").val()
        }),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json'
    })
        .done(() => {
            console.log("valor enviado");
        })
        .fail(() => {
            console.log("request failed");
        });
    $("input").val(0);
    standbyState();
})

function standbyState() {
    $.ajax(`${url}`)
        .done((resp) => {
            if (resp !== 'not your turn') {
                $('button').attr('hidden', false);
                $('input').attr('hidden', false);
                $('#state-div').css('background-color', 'green');
                $('#state-div').text('your turn');
                clearTimeout(updaterID);
                $('#res-field-rec').text(resp);
                return true;
            }
        })
    let updaterID = setTimeout(standbyState, 200);
}