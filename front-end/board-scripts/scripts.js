function openModal(modalId) {
    const container = document.getElementById('container-modais');
    container.style.visibility = "visible";

    $('body').css('overflowY', "hidden");

    $('.modal-div').css('visibility', 'hidden');

    const modal = document.getElementById(modalId);
    modal.style.visibility = "visible";
}

function closeModal(modalId) {
    const container = document.getElementById('container-modais');
    container.style.visibility = "hidden";

    $('body').css('overflowY', "visible");

    const modal = document.getElementById(modalId);
    modal.style.visibility = "hidden";
}

function openMenu(modalId) {
    $('body').css('overflowY', "hidden");

    $('.modal-div').css('visibility', 'hidden');
    
    const modal = document.getElementById(modalId);
    modal.style.visibility = "visible";
}

function flipCard() {
    const card = document.querySelector(".flip-card .flip-card-inner");
    card.style.transform = "rotateY(180deg)";
}