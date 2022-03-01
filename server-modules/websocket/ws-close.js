const dcSockArr = [];  //store disconnected players keys

function wsClose(ws) { //connection was closed
    console.log("wsClose: ws address: " + ws._socket.remoteAddress + " closed");
    ws.isAlive = false;
    ws.terminate(); //safety
}

module.exports = {
    close: wsClose
}