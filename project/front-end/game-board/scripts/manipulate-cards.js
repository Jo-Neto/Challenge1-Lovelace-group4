const cards = ['w', 'w', 'w', 'w', 'f', 'f', 'f', 'f', 'p', 'p', 'p', 'p', 'e', 'e']
let hand = []

//Sorteia uma carta do array "cards"
function randomArray(arr) {
    let num = Math.floor(Math.random() * (arr.length));
    let elem = arr.splice(num,1)[0];

    hand.push(elem);

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

function takeCardFromCheap() {

}

$(document).ready( () => {
    //Soretia 3 cartas para a mão inicial do jogador
    randomArray(cards)
    randomArray(cards)
    randomArray(cards)

    //Da linha 40 até 44, adiciona cada imagem de cada carta na mão conforme o array "hand", o atributo value diz qual carta que é
    $("#container-first-hand-card").html(`<img id="card1" value="${hand[0]}" class="card cards-in-hand" src="./assets/${getCardImage(hand[0])}.png" alt="">`)

    $("#container-second-hand-card").html(`<img id="card2" value="${hand[1]}" class="card cards-in-hand" src="./assets/${getCardImage(hand[1])}.png" alt="">`)

    $("#container-third-hand-card").html(`<img id="card3" value="${hand[2]}" class="card cards-in-hand" src="./assets/${getCardImage(hand[2])}.png" alt="">`)

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