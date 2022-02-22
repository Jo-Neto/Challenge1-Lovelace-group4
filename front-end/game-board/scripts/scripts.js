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

function gameAgain() {
    closeModal("modal-defeat")
    openModal("modal-loading")

    //Procura partida
    const url = window.location.href.slice(7, -6);
    const port = 80;
    const socket = new WebSocket(`ws://${url}:${port}/line`);

    socket.addEventListener('close', (event)=>{
      if(event.code === 1000){
        //Pedir a página game-board
        console.log("A outra página foi chamada");
        closeModal('modal-loading');
        location.replace(`/game`);
      }
    })
}