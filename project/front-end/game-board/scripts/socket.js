const url = window.location.href.slice(7,-1);
document.getElementById('play-now-button').addEventListener('click', ()=>{
   const socket = new WebSocket(`ws://${url}:80/line`);
   socket.onclose((event)=>{
      const message = JSON.parse(event);
      if(event.data === 1000){
         //const socket = new WebSocket(`ws://${url}:80/gamestream`);
         closeModal('modal-loading');
      }
   })
});