import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import pkg from 'lodash';
const { shuffle } = pkg;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const playingCards = [
  { value: 2, image: '2.png' },
  { value: 3, image: '3.png' },
  { value: 4, image: '4.png' },
  { value: 5, image: '5.png' },
  { value: 6, image: '6.png' },
  { value: 7, image: '7.png' },
  { value: 8, image: '8.png' },
  { value: 9, image: '9.png' },
  { value: 10, image: '10.png' },
  { value: 11, image: 'J.png' },
  { value: 12, image: 'Q.png' },
  { value: 13, image: 'K.png' },
  { value: 14, image: 'A.png' }
];

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
  console.log('A user connected.');

  let room = null;
  let cards = [];

  socket.on('startGame', () => {
    // Create a room for the game
    room = generateRoomId();
    socket.join(room);

    // Deal 13 random cards to the user
    cards = dealCards(13);

    // Send the cards to the user
    socket.emit('cardsUpdated', { cards });
  });

  socket.on('playCard', ({ card }) => {
    // Broadcast the played card to the room
    socket.to(room).emit('cardPlayed', { card });

    // Check if all players have played their cards
    const roomClients = io.sockets.adapter.rooms.get(room);
    if (roomClients.size === 2) {
      // Get the opponent's card
      const opponentSocket = getOpponentSocket(room, socket.id);
      const opponentCard = opponentSocket.card;

      // Determine the winner
      let checkmark = false;
      if (card.value > opponentCard.value) {
        checkmark = true;
      }

      // Broadcast the result to both players
      io.to(room).emit('cardPlayed', { card, otherCard: opponentCard });
      io.to(room).emit('gameResult', {
        message: checkmark ? 'You Won!' : 'You Lost!',
        checkmark
      });

      // Reset the game state
      room = null;
      cards = [];
      opponentSocket.card = null;
    } else {
      // Save the played card for the player
      socket.card = card;
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected.');

    // Clean up game state if the user disconnects during a game
    if (room) {
      const opponentSocket = getOpponentSocket(room, socket.id);
      if (opponentSocket) {
        opponentSocket.card = null;
        opponentSocket.emit('gameResult', {
          message: 'Opponent Disconnected!',
          checkmark: false
        });
      }
    }
  });
});

// Utility function to generate a random room ID
const generateRoomId = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let roomId = '';
  for (let i = 0; i < 6; i++) {
    roomId += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return roomId;
};

// Utility function to deal random cards to the user
const dealCards = (count) => {
  const shuffledCards = shuffle(playingCards);
  return shuffledCards.slice(0, count);
};

// Utility function to get the opponent's socket in a room
const getOpponentSocket = (room, currentSocketId) => {
  const roomClients = io.sockets.adapter.rooms.get(room);
  for (let clientId of roomClients) {
    if (clientId !== currentSocketId) {
      return io.sockets.sockets.get(clientId);
    }
  }
  return null;
};

// Start the server
const port = 3000;
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});


