import React, { useState, useEffect, useRef } from 'react';

//create functional component using React with hooks
const Chat = () => {
//allow for one message and an array of messages
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
//create your socket using a reference to last the lifetime of the component
  const socket = useRef(null);

//useEffect will trigger on mount
  useEffect(() => {
    //creating a new Websocket at the address
    socket.current = new WebSocket('wss://localhost:8080');
    
    //when a message is received
    socket.current.onmessage = (event) => {
      const messageData = event.data;
      //add it to the array of messages
      setMessages((prevMessages) => [...prevMessages, messageData]);
    };
    
    //when the connection closes
    socket.current.onclose = () => {
      console.log('Connection closed!');
    };

    //cleanup functionality
    return () => {
      socket.current.close();
    };
  }, []);

  const handleNewMessageChange = (event) => {
    setNewMessage(event.target.value);
  };

  const handleSendMessage = () => {
    socket.current.send(newMessage);
    setNewMessage('');
  };

  return (
    <div>
      <h2>Chat</h2>
      {messages.map((message, index) => (
        <div key={index}>{message}</div>
      ))}
      <input
        type='text'
        value={newMessage}
        onChange={handleNewMessageChange}
        placeholder='Write your message...'
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
};

export default Chat;