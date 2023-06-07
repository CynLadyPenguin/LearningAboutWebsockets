import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server);

const PORT = 3000;

app.use(express.static('public'));

let waitingPlayer = null;

io.on('connection', (socket) => {
    if(waitingPlayer){
        //start game
        new Game(waitingPlayer, socket);
        waitingPlayer = null;
    }
    else{
        waitingPlayer = socket;
        socket.emit('message', 'Waiting for opponent...');
    }

    socket.on('restart', () => {
        socket.broadcast.emit('restart');
    });

    socket.on('move', (index) => {
        socket.broadcast.emit('move', index);
    });

    socket.on('disconnect', () => {
        if(waitingPlayer == socket)
            waitingPlayer = null;
    });
});

class Game {
  constructor(p1, p2) {
      this._players = [p1, p2];
      this._turns = ['X', 'O'];

      this._players.forEach((player, index) => {
          player.emit('message', 'You are ' + this._turns[index]);
      });

      this._players[0].on('move', (index) => {
          this._players.forEach(player => {
              player.emit('move', {symbol: 'X', index: index});
          });
      });

      this._players[1].on('move', (index) => {
          this._players.forEach(player => {
              player.emit('move', {symbol: 'O', index: index});
          });
      });
  }
}


server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});




