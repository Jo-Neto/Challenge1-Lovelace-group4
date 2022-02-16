url = window.location.href.slice(7);

const reducer = (total,element)=>{
   total += `<p>${element}</p>`;
   return total;
}
$(document).ready(()=>{
   const socket = new WebSocket(`ws://${url}`);
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
         socket.send(JSON.stringify(msg));
         $("#login").remove();
         $("main").append('<div class= "chatBox" id="chatBox"></div>');
         $("main").append('<input type="text" id="texto" />');
         $("main").append('<input type="button" value="enviar" id="msg" />');
         $("#msg").on("click", ()=>{
            const msg = {
               id  : id,
               type: "message",
               text: $("#texto").val(),
               date: Date.now()
            }
            socket.send(JSON.stringify(msg));
         });
         socket.onmessage = (event)=>{
            const msg = JSON.parse(event.data);
            const texto = msg.reduce(reducer);
            console.log(texto);
            $("#chatBox").html(texto);
         };
      }
   });
});