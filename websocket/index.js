const express = require('express');
const app = express();
app.use(express.static('public'));

const expressWs = require('express-ws');
expressWs(app);

const router = express.Router();
expressWs(router);

router.ws('/', (ws, req) => {
  const connectedMessage = { message: 'connected' };
  ws.send(JSON.stringify(connectedMessage));
  console.log('Connected');
  let count = 0;
  let intervalId;
  intervalId = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      const message = { message: 'update', count: count }
      ws.send(JSON.stringify(message));
      count += 1;
    } else {
      clearInterval(intervalId);
    }
  }, 2000);

  ws.on('message', msg => console.log(msg));
  ws.on('close', msg => console.log('Closed'));
});

app.use('/ws', router);
app.get('*', (req, res) => { });
app.listen(3000, () => console.log('Listening on http://localhost:3000'));

