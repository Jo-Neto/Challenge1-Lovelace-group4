function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.visibility = "visible";
}

function closeModal(modalId) {
    let modal = document.getElementById(modalId);
    modal.style.visibility = "hidden";
}

const url = window.location.href.slice(7,-1);

document.getElementById('play-now-button').addEventListener('click', ()=>{
   const socket = new WebSocket(`ws://${url}:80/line`);

   socket.onclose((event)=>{
      const message = JSON.parse(event);

      if(message.data === 1000){
        //Pedir a página game-board
        //const socket = new WebSocket(`ws://${url}:80/gamestream`);
        closeModal('modal-loading');
      }
   })
})