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

  socket.onmessage = (event) => {
    document.documentElement.innerHTML = boardDocument;
    $.ajax({
      url: `/script2`,
      dataType: "script"
    });
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