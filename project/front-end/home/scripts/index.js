function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.visibility = "visible";
}

function closeModal(modalId) {
    let modal = document.getElementById(modalId);
    modal.style.visibility = "hidden";
}

const url = window.location.href.slice(7,-1);
const port = 80;

document.getElementById('play-now-button').addEventListener('click', ()=>{
   const socket = new WebSocket(`ws://${url}:${port}/line`);

    socket.addEventListener('close', (event)=>{
      if(event.code === 1000){
        //Pedir a página game-board
        console.log("A outra página foi chamada");
        closeModal('modal-loading');
        location.replace(`/game`);
      }
   })
})