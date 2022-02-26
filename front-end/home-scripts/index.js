let boardDocument = '';
let leaderDocument = ' ';
let homeDocument = '';

fetch('/board').then( resp => {
  return resp.text();
}).then( boardHTML =>{
  boardDocument = boardHTML;
}).catch( err => {
  console.log(err);
});

fetch('/leader').then( resp => {
  return resp.text();
}).then( leaderHTML =>{
  leaderDocument = leaderHTML;
}).catch( err => {
  console.log(err);
});

const url = window.location.href.slice(7, -1);
const port = 80;

let socket = null;

document.getElementById('play-now-button').addEventListener('click', () => {
  socket = new WebSocket(`ws://${url}:${port}/line`);
  

  const playerName = 'myName';

  function sendName() {
    socket.send(JSON.stringify(playerName));
  }
  
  socket.onopen = (event) => {
    sendName();
  }

  socket.onmessage = (event) => {
    console.log("onmessage fired");
    console.log(JSON.parse(event.data));
    console.log(event.data);
  }


  socket.addEventListener('close', (event) => {
    if (event.code === 1000 || event.code === 4000) {
      //Pedir a página game-board
      console.log("A outra página foi chamada");
      closeModal('modal-loading');
      location.replace(`/game`);
    }
  })
});

fetch('/').then( resp => {
  return resp.text();
}).then( homeHTML =>{
  homeDocument = homeHTML;
}).catch( err => {
  console.log(err);
});
