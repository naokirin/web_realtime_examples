import { postMessage } from "./signaling.js";

const MESSAGE_TYPE = {
  READY: 'ready',
  OFFER: 'offer',
  ANSWER: 'answer',
  CANDIDATE: 'candidate',
  BYE: 'bye',
};

let peerConnection;

const getPeerConnection = () => peerConnection;

const createPeerConnection = (localStream, remoteVideo) => {
  peerConnection = new RTCPeerConnection();
  peerConnection.onicecandidate = e => {
    const message = {
      type: MESSAGE_TYPE.CANDIDATE,
      candidate: null,
    }
    if (e.candidate) {
      message.candidate = e.candidate.candidate;
      message.sdpMid = e.candidate.sdpMid;
      message.sdpMLineIndex = e.candidate.sdpMLineIndex;
    }
    postMessage(message);
  };
  peerConnection.ontrack = e => remoteVideo.srcObject = e.streams[0];
  localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
};

const offer = async (localStream, remoteVideo) => {
  await createPeerConnection(localStream, remoteVideo);
  const offer = await peerConnection.createOffer();
  postMessage({ type: MESSAGE_TYPE.OFFER, sdp: offer.sdp });
  await peerConnection.setLocalDescription(offer);
};

const offered = async (offer, localStream, remoteVideo) => {
  if (peerConnection) return;

  await createPeerConnection(localStream, remoteVideo);
  await peerConnection.setRemoteDescription(offer);
  const answer = await peerConnection.createAnswer();
  postMessage({ type: MESSAGE_TYPE.ANSWER, sdp: answer.sdp });
  await peerConnection.setLocalDescription(answer);
};

const answered = async (answer) => {
  if (!peerConnection) return;
  await peerConnection.setRemoteDescription(answer);
};

const addCandidate = async (candidate) => {
  if (!peerConnection) {
    return;
  } else if (!candidate.candidate) {
    await peerConnection.addIceCandidate(null);
  } else {
    await peerConnection.addIceCandidate(candidate);
  }
};

const hangup = async () => {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
};

export { MESSAGE_TYPE, getPeerConnection, offer, offered, answered, addCandidate, hangup };