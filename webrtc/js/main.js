import { postMessage, setOnMessage } from './signaling.js';
import { startStream, finishStream, getLocalStream } from './stream.js';
import {
  MESSAGE_TYPE,
  getPeerConnection,
  offer,
  offered,
  answered,
  addCandidate,
  hangup
} from './peerConnection.js';

const STATE = {
  INIT: 'init',
  STARTED: 'started',
  ENDED: 'ended',
};

const button = document.getElementById('button');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

let state = STATE.INIT;

setOnMessage(e => {
  if (!getLocalStream()) return;

  console.log('Received signal: ', e.data.type);
  switch (e.data.type) {
    case MESSAGE_TYPE.READY:
      if (getPeerConnection()) return;
      offer(getLocalStream(), remoteVideo);
      break;
    case MESSAGE_TYPE.OFFER:
      offered(e.data, getLocalStream(), remoteVideo);
      break;
    case MESSAGE_TYPE.ANSWER:
      answered(e.data);
      break;
    case MESSAGE_TYPE.CANDIDATE:
      addCandidate(e.data);
      break;
    case MESSAGE_TYPE.BYE:
      if (getPeerConnection()) {
        hangup();
        finishStream();
        button.disabled = true;
      }
      break;
    default:
      console.log(e);
      break;
  }
});

button.onclick = async () => {
  if (state === STATE.INIT) {
    await startStream(localVideo);
    postMessage({ type: MESSAGE_TYPE.READY });
    button.textContent = 'Hang up';
    state = STATE.STARTED;
  } else if (state === STATE.STARTED) {
    await hangup();
    finishStream();
    postMessage({ type: MESSAGE_TYPE.BYE });
    button.disabled = true;
    button.textContent = 'Ended';
    state = STATE.ENDED;
  }
};