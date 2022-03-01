let boardDocument = '';
let leaderDocument = '';
let homeDocument = '';

function openModalHome(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.visibility = "visible";
}

function closeModalHome(modalId) {
  let modal = document.getElementById(modalId);
  modal.style.visibility = "hidden";
}

const url = window.location.href.slice(7, -1);
const port = 80;

let socket;

document.getElementById('play-now-button').addEventListener('click', () => {

  socket = new WebSocket(`ws://${url}:${port}/`);

/*
  const playerName = 'Clasher';

  socket.onopen = event => { 
    sendName(playerName);
  }

  function sendName(playerName) {
    socket.send(JSON.stringify(playerName));
  }
*/

  socket.onmessage = (event) => {
    document.documentElement.innerHTML = boardDocument; //this will be removed
    console.log(event.data);
  }
});

fetch('/board.html').then( resp => {
  return resp.text();
}).then( boardHTML =>{
  boardDocument = boardHTML;
}).catch( err => {
  console.log(err);
});

fetch('/leader.html').then( resp => {
  return resp.text();
}).then( leaderHTML =>{
  leaderDocument = leaderHTML;
}).catch( err => {
  console.log(err);
});

fetch('/index.html').then( resp => {
  return resp.text();
}).then( homeHTML =>{
  homeDocument = homeHTML;
}).catch( err => {
  console.log(err);
});

export {socket}