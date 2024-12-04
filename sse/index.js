const express = require('express');
const app = express();

app.use(express.static('public'));

app.get('/listen', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  });

  res.write(`data: { "message": "connected" }\n\n`);

  let count = 0;
  const intervalId = setInterval(() => {
    count += 1;
    const message = { message: 'update', count: count };
    res.write(`data: ${JSON.stringify(message)}\n\n`);
  }, 2000);

  req.on('close', () => {
    clearInterval(intervalId);
    res.end();
  });
});

app.listen(3000, () => console.log('Listening on http://localhost:3000'));

