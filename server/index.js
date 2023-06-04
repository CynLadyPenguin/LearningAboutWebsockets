//the server/index.js file
// import WebSocket from 'ws';
import { WebSocketServer } from 'ws';
//establish a server
const server = new WebSocketServer({ port: 8080 });

//a Map can help you keep track of the clients
// const clients = new Map();

//now create a 'connection'
server.on('connection', ws => {
/*
when the client connects we want to give them a unique id so
we can find them in the clients Map. feel free to create a
unique id in any fashion you prefer
*/

//the listener will be looking for the 'message' event
  ws.on('message', message => {
    console.log(`Message received => ${message}`)
  })
  //and will reply with:
  ws.send(`Sunday! Sunday! Bring me a raincoat! We're connected`);

  /*
    in the event of a closed connection, we'll delete the client from the Map
    if you decide not to delete the client, their id's can be used for future 
    connections
  */
  ws.on('close', () => {
    clients.delete(id);
  })
})

//make sure to handle errors so you know when something goes wrong
server.on('error', function (error) {
  console.log('WebSocket error: ', error);
});
