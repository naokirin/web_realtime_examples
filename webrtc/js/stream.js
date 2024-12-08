let localStream;

const startStream = async (localVideo) => {
  localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
  localVideo.srcObject = localStream;
};

const finishStream = () => {
  localStream.getTracks().forEach(track => track.stop());
  localStream = null;
};

const getLocalStream = () => localStream;

export { startStream, finishStream, getLocalStream };
