const EventEmitter = require('events');

class Sales extends EventEmitter {
  constructor() {
    super();
  }
}

const myEmitter = new Sales();
myEmitter.on('newSale', () => console.log('New sale!'));
myEmitter.on('newSale', () => console.log('Customer name: Hao'));
myEmitter.on('newSale', stock =>
  console.log(`There are now ${stock} items left in stock.`)
);

myEmitter.emit('newSale', 9);

////////////////////////////////////////////////////////////////////
const http = require('http');
const server = http.createServer();
server.on('request', (req, res) => {
  console.log('Request received!', req.url);
  res.end('Request received!');
});
server.on('request', (req, res) => {
  console.log('Another request!!');
});
server.on('close', (req, res) => {
  console.log('Sever closed!!!');
});
server.listen(8000, '127.0.0.1', () => console.log('Waiting for requests...'));
