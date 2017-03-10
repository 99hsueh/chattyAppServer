const express = require('express');
const SocketServer = require('ws');

// Set the port to 3001
const PORT = 3001;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new SocketServer.Server({ server });
const uuid = require('node-uuid');
// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
const usersOnline = {type: "displayUsers"};
const numOfClients = ["default"];

wss.on('connection', function connection(ws) {
  console.log('client connected');
  numOfClients.push(wss.clients);
  usersOnline.content = `${numOfClients.length - 1} users online`
  console.log(usersOnline.content);
  wss.clients.forEach(function msgEach(client) {
    if (client.readyState === SocketServer.OPEN) {
      client.send(JSON.stringify(usersOnline));
      console.log("send to client display # of user");
    }
  });


  //push client connections to clients array
  //if clients connect or disconnect, broadcast change to all users
  ws.on('message', function incoming(messageJson) {
    let message = JSON.parse(messageJson);
    if (message.type === "postMessage"){
      message.type = "incomingMessage"
      message.id = uuid.v1();
      wss.clients.forEach(function msgEach(client) {
        if (client.readyState === SocketServer.OPEN) {
          client.send(JSON.stringify(message));
          console.log("send to client message", message);
        }
      });
    }
    if (message.type === "postNotification") {
      message.type = "incomingNotification"
      message.id = uuid.v1();
      wss.clients.forEach(function notifyEach(client) {
        if (client.readyState === SocketServer.OPEN) {
          client.send(JSON.stringify(message));
          console.log("send to client notification", message);
        }
      });
    }
  });
  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => {
    console.log('Client disconnected');
    numOfClients.pop();
    usersOnline.content = `${numOfClients.length - 1} users online`
    console.log(usersOnline.content);
    wss.clients.forEach(function msgEach(client) {
    if (client.readyState === SocketServer.OPEN) {
      client.send(JSON.stringify(usersOnline));
      console.log("send to client display # of user", usersOnline);
    }
  });
  });
});


