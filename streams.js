const fs = require('fs');
const server = require('http').createServer();

// req is a readable stream
// res is a writable stream
server.on('request', (req, res) => {
  // Solution #1
  // fs.readFile('test-file.txt', (err, data) => {
  //   if (err) console.log(err);
  //   res.end(data);
  // });

  // Solution #2 - Streams
  // create a readable stream that can be read piece by piece
  // when there is a new piece of data that we con consumed, readable streams emits data event
  //  that we can listen to. On this event, we can send the piece of data to the client thru the
  //  writable stream (res)
  // PROBLEM: backpressure -> when response can't send data as fast as it is receiving it from the file
  // const readable = fs.createReadStream('test-file.txt');
  // readable.on('data', chunk => res.write(chunk));
  // readable.on('end', () => res.end());
  // readable.on('error', err => {
  //   console.log(err);
  //   res.statusCode = 500;
  //   res.end('File not ofund!');
  // });

  // Solution #3
  // pipe(): available on all readable strems
  // pipe() the OUTPUT of readable stream directly to the INPUT of the writeable stream
  //    => resolve back-pressure problem
  // Syntax: readableStream.pipe(writeableStream)
  const readable = fs.createReadStream('test-file.txt');
  readable.pipe(res);
});

server.listen(8000, '127.0.0.1', () =>
  console.log('Listening on port 8000...')
);
