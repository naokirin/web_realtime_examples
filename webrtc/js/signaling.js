// シグナリングをBroadbandChannelで実装
const signaling = new BroadcastChannel('private_room');
const postMessage = (message) => {
  console.log('Send signal: ', message.type);
  signaling.postMessage(message);
}

const setOnMessage = (callback) => {
  signaling.onmessage = callback;
}

export { postMessage, setOnMessage };