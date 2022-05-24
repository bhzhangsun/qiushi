import App from './src/app'

App.instance().run()

// const svr = app.listen(3000);

// const httpServer = createServer(app.callback());

// const io = new Server(httpServer, {
//   path: '/crd/socket.io/',
//   cors: { origin: '*' }
// });

// io.of('/crd/test').on('open', socket => {
//   socket.emit('hello test http', 1, '2', { 3: Buffer.from([4]) });
// });

// io.on('connection', socket => {
//   // send a message to the client
//   socket.emit('hello-server', 1, '2', { 3: Buffer.from([4]) });

//   let counter = 0;
//   // receive a message from the client
//   const reply = (...args: any) => {
//     console.log('server:', args);
//     socket.emit('server-exchange', 'counter', counter, { 7: Uint8Array.from([8]) });
//     // ...
//   };
//   socket.on('hello-client', reply);
//   socket.on('client-exchange', reply);
// });

// httpServer.listen(3000);
