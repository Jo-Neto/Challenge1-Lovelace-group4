const cards = ['w', 'w', 'w', 'w', 'f', 'f', 'f', 'f', 'p', 'p', 'p', 'p', 'e', 'e']
let hand = []

//Sorteia uma carta do array "cards"
function randomArray(arr) {
    let num = Math.floor(Math.random() * (arr.length));
    let elem = arr.splice(num,1)[0];

    return elem;
}

function getCardImage(card) {

    let nameOfImageArchive

    switch (card) {
        case "w" : nameOfImageArchive = 'card-water';
        break;
        case "f" : nameOfImageArchive = 'card-fire';
        break;
        case "p" : nameOfImageArchive = 'card-plant';
        break;
        case "e" : nameOfImageArchive = 'card-ether';
        break;
    }

    return nameOfImageArchive
}

function cleanTheCardField(tagCardId) {

    if ( tagCardId === "card1" ) {
        $("#container-first-hand-card").html("")
        hand[0] = "empty"
    }

    else if (tagCardId === "card2") {
        $("#container-second-hand-card").html("")
        hand[1] = "empty"
    }
    
    else if (tagCardId === "card3") {
        $("#container-third-hand-card").html("")
        hand[2] = "empty"
    }
}

function takeCardFromCheap(tagCardId) {

    hand.forEach( (card, index) => {
        if ( card === "empty" ) {
            hand[index] = randomArray(cards)

            let containerEmpty

            switch (index) {
                case 0: containerEmpty = "first";
                break;

                case 1: containerEmpty = "second";
                break;

                case 2: containerEmpty = "third";
                break;
            }

            $(`#container-${containerEmpty}-hand-card`).html(`<img id=${tagCardId} value=${hand[index]} class="cards-in-hand" src="./assets/${getCardImage(hand[index])}.png" alt="">`)

            $(".cards-in-hand").draggable({
                revert: "invalid",
            })
        }
    })

    console.log(hand)
}

$(document).ready( () => {
    //Soretia 3 cartas para a mão inicial do jogador
    hand[0] = randomArray(cards)
    hand[1] = randomArray(cards)
    hand[2] = randomArray(cards)

    //Da linha 40 até 44, adiciona cada imagem de cada carta na mão conforme o array "hand", o atributo value diz qual carta que é
    $("#container-first-hand-card").html(`<img id="card1" value=${hand[0]} class="cards-in-hand" src="./assets/${getCardImage(hand[0])}.png" alt="">`)

    $("#container-second-hand-card").html(`<img id="card2" value=${hand[1]} class="cards-in-hand" src="./assets/${getCardImage(hand[1])}.png" alt="">`)

    $("#container-third-hand-card").html(`<img id="card3" value=${hand[2]} class="cards-in-hand" src="./assets/${getCardImage(hand[2])}.png" alt="">`)

    $(".cards-in-hand").draggable({
        revert: "invalid",
    })

    $("#playing-card-field").droppable({
        drop: function(event, ui) {
            console.log( ui.draggable.attr("value") ) //identifica qual é a carta
            cleanTheCardField(ui.draggable.attr("id"))
            takeCardFromCheap(ui.draggable.attr("id"))
            // $("#playing-card-field").droppable({disabled: true})
        }
    })
})