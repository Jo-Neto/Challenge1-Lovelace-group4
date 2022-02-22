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

let count = -1;
function changeSoundConf() {
    count++;
    const button = document.getElementById('btn-sound');
    if(count%2 == 0) {
        button.setAttribute('src', '');
        button.setAttribute('src', './assets/music_note_white_24dp.svg');  
    } else {
        button.setAttribute('src', '');
        button.setAttribute('src', './assets/music_off_white_24dp.svg'); 
    }
}

function gameAgain() {
    closeModal("modal-defeat")
    openModal("modal-loading")

    //Procura partida
    // const url = window.location.href.slice(7, -6);
    // const port = 80;
    // const socket = new WebSocket(`ws://${url}:${port}/line`);

    // socket.addEventListener('close', (event)=>{
    //   if(event.code === 1000){
    //     //Pedir a página game-board
    //     console.log("A outra página foi chamada");
    //     closeModal('modal-loading');
    //     location.replace(`/game`);
    //   }
    // })
}