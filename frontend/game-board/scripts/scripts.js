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

