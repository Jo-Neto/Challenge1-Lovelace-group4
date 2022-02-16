function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.visibility = "visible";
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.visibility = "hidden";
}

function flipCard() {
    const card = document.querySelector(".flip-card .flip-card-inner");
    card.style.transform = "rotateY(180deg)";
}


/*
funçoes para teste do player 2 abaixo
*/

function showCard(element) {
    switch (element) {
        case 'f':
            $("#container-card-player2").html('<img id="card1" value="w" class="cards-in-hand" src="./assets/card-Fogo.png" alt="">')
            break;
        case 'w':
            $("#container-card-player2").html('<img id="card1" value="w" class="cards-in-hand" src="./assets/card-Agua.png" alt="">')
            break;
        case 'p':
            $("#container-card-player2").html('<img id="card1" value="w" class="cards-in-hand" src="./assets/card-Planta.png" alt="">')
            break;
        case 'e':
            $("#container-card-player2").html('<img id="card1" value="w" class="cards-in-hand" src="./assets/card-Eter.png" alt="">')
            break;

    
        default:
            break;
    }
}

