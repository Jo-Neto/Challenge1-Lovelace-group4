url = window.location.href.slice(7,-1);

const reducer = (total,element)=>{
   total += `<p>${element}</p>`;
   return total;
}
$(document).ready(()=>{
   let id;
   $("#enviar").on('click', ()=>{
      if ($("#nome").val() !== ""){
         id = $("#nome").val();
         console.log(id);
         const msg = {
            type: "message",
            id: id,
            text: "Entrou",
            date: Date.now()
         };
         $("#login").remove();
         $("main").append('<div class= "chatBox" id="chatBox"></div>');
         $("main").append('<input type="text" id="texto" />');
         $("main").append('<input type="button" value="enviar" id="msg" />');
      }
   });
});

const socket = new WebSocket(`ws://${url}:80/line`);

socket.onopen = (event)=>{
   console.log("socket open");
};

socket.onmessage = (event)=>{
   console.log(event.data);
};

socket.onclose = (event)=>{
   console.log("socket closed");
};

function printMsg() {
   console.log("on open fired on front")
}

/*

setInterval(() => {
   chat();
}, 10000)

function chat() {
   socketChat.send('chat message sent');
}

socketChat.onmessage = (event)=>{
   console.log("message received from chat");
   console.log(event.data);
};*/