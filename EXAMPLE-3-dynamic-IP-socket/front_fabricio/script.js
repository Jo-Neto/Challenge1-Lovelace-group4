url = window.location.href.slice(7, -1);

const reducer = (total, element) => {
   total += `<p>${element}</p>`;
   return total;
}
$(document).ready(() => {
   let id;
   $("#enviar").on('click', () => {
      if ($("#nome").val() !== "") {
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

$('input').eq(1).on('click', sendSock);
$('input').eq(2).on('click', closeSock);

const socket = new WebSocket(`ws://${url}:80/line`);

function closeSock() {
   socket.close();
}

function sendSock() {
   socket.send($('input').eq(0).val());
}

socket.onmessage = (event) => {
   console.log(event.data);
};








////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*

o socket tem 4 estados: aberto, fechado, abrindo, fechando
cada um tem seu código:    1   ,   3   ,    0    ,    2
vc acessa esse código usando "socket.readyState"

quando voce cria o objeto socket, a conexão ja é automaticamente estabelecida e o
evento "onopen" é disparado, assim:    */

const socket = new WebSocket(`ws://localhost:80/line`);  //abre o socket e conecta
// percebe que "socket" agora é um objeto "websocket", e quando voce cria ele,
//o evento "on open" é disparado       



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+--------------------------------------------------------------------+
//|                         EVENTOS DO OBJETO                          |
//+--------------------------------------------------------------------+
socket.onopen( callbackFunction() );  //roda quanto o objeto abre/conecta
socket.onopen = () => { 
   console.log("socket opened") 
};


socket.onmessage( callbackFunction(data, isBinary) ); //(obj, bool)
socket.onmessage = (event) => {  //roda quando o objeto recebe uma messagem do server
   console.log("received message from socket");  //conteudo da mensagem
   console.log(event.data);  //conteudo da mensagem
};

socket.onclose( callbackFunction( code , reason) ); //(num, string)
socket.onclose((event) => {  //roda quando o objeto desconecta
   console.log('closing socket: ');
   console.log('close code: ' + event.code);  //código do mótivo de fechamento <<<<<<<< vamos precisar usar isso aqui
   console.log('close reason: ' + event.reason); //string representando o motivo do fechamento
});

socket.onerror( callbackFunction(event) ) //(error)
socket.onerror( (event) => {  //roda quando da erro, sei la, nunca vi, nunca testei
   console.log('error code:' + event.code );
})

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+
//|                    PROPERTIES DO OBJETO                          |
//+------------------------------------------------------------------+
const socket = new WebSocket(`ws://${url}:80/line`);  //abre o socket e conecta

socket.url //endereço do socket, talvez vamos precisar usar

socket.readyState // 0=CONNECTING  ---- 1=OPEN ------ 2=CLOSING -------- 3=CLOSED
//percebe que é uma linha do tempo, 0 > 1 > 2 > 3.....conectando > conectado > desconectando > desconectado



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+------------------------------------------------------------------+
//|                        MÉTODOS DO OBJETO                         |
//+------------------------------------------------------------------+
socket.close();   //fecha o socket

socket.destroy(); //?????????
socket.terminate(); //mesma coisa que socket.destroy(); ?????????

socket.send(data) //envia dados
socket.send(arg1, arg2, arg3) //aceita 3 argumentos....



socket.send(  //provavelmente não precisa mecher nisso aqui, mas.....
   
   data, //argumento 1, os dados a serem enviados, quaisquer tipos, enviem um objeto em formato de string PLZ
   
   {  //argumento 2 é um objeto, com 4 propriedades   
      binary: bool, //se os dados serão enviados em formato binario, default = automatico
      /////////
      compress: bool, //se os dados serao comprimidos antes de serem enviados, default = provavelmente true
      /////////
      fin: bool,  //coloca "false" se voces tiverem que fragmentar o "data" em dois, ou seja, se "data" não couber em uma mensagem só, default = true
      //////////
      mask: bool  //não meche, sempre true, default = true
   },
   
   callbackFunction() //argumento 3 é função chamada quando "data" é escrita, se der error, 
                      //a callback é chamada usando o erro como argumento 1
) 

//doc:  https://github.com/websockets/ws/blob/master/doc/ws.md