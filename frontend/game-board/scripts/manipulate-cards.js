const cards = ['w', 'w', 'w', 'w', 'f', 'f', 'f', 'f', 'p', 'p', 'p', 'p', 'e', 'e']

$(document).ready( () => {
    $("#container-first-hand-card").html('<img id="card1" value="w" class="cards-in-hand" src="./assets/card-Agua.png" alt="">')

    $("#container-second-hand-card").html('<img id="card2" value="w" class="cards-in-hand" src="./assets/card-Agua.png" alt="">')

    $("#container-third-hand-card").html('<img id="card3" value="w" class="cards-in-hand" src="./assets/card-Agua.png" alt="">')

    $(".cards-in-hand").draggable({
        revert: "invalid",
    })

    $("#playing-card-field").droppable({
        drop: function(event, ui) {
            console.log( ui.draggable.attr("value") )
            $("#playing-card-field").droppable({disabled: true})
        }
    })
})