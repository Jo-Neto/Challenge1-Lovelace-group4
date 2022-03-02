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

    let obj

    try {
        obj = JSON.parse(event.data)

        if ( obj.hasOwnProperty("board") ) {
            socket.onmessage = null

            $.ajax({
                url: `/board1`,
                dataType: "script"
            });
    
            $.ajax({
            url: `/board2`,
            dataType: "script"
            });
    
            console.log(obj)
        } else {
            prepareTheGame(obj)
        }
    } catch {
        document.documentElement.innerHTML = boardDocument;
        console.log(event.data)
    }

  }
});

function prepareTheGame(data) {
        let obj = data
        console.log("console da função")
        console.log(obj)
        console.log( $("#container-first-hand-card") )
        console.log("acabou console da função")

        $("#container-first-hand-card").html(`<img id="card1" value=${obj[0]} class="cards-in-hand" src="./board-assets/${getCardImage(obj[0])}.svg" alt="">`);
        $("#container-second-hand-card").html(`<img id="card2" value=${obj[1]} class="cards-in-hand" src="./board-assets/${getCardImage(obj[1])}.svg" alt="">`);
        $("#container-third-hand-card").html(`<img id="card3" value=${obj[2]} class="cards-in-hand" src="./board-assets/${getCardImage(obj[2])}.svg" alt="">`);
}

function getCardImage(card) {

    let nameOfImageArchive;

    switch (card) {
        case "w":
            nameOfImageArchive = 'card-water';
            break;
        case "f":
            nameOfImageArchive = 'card-fire';
            break;
        case "p":
            nameOfImageArchive = 'card-plant';
            break;
        case "e":
            nameOfImageArchive = 'card-ether';
            break;
        case "v":
            nameOfImageArchive = 'card-void';
            break;
        case "d":
            nameOfImageArchive = 'card-dark-matter';
            break;
    }

    return nameOfImageArchive;
}

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