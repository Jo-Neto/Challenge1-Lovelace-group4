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
      if(event.code === 1000 ){
        closeModal('modal-loading');
        location.replace(`/game`);
      }

      else if(event.code === 4000) {
        $("#modal-loading").hmtl(`<h3>Reconectando</h3>
        <img src="./assets/loading.gif">`)

        setTimeout( () => {
            closeModal('modal-loading');
            location.replace(`/game`);
        }, 1000)
      }

      else if(event.code === 4100) {
        closeModal('modal-loading')
        openModal("modal-timeout")
      }
    })
})