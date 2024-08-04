export default function (
  remotePeerId,
  amount,
  currentUV,
  remoteUV,
  peerInstance,
  saveData,
  deductFromCaller
) {
  if (amount > 0) {
    const getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;
    getUserMedia({ video: true, audio: true }, (mediaStream) => {
      currentUV.current.srcObject = mediaStream;
      currentUV.current.play();

      const call = peerInstance.current.call(remotePeerId, mediaStream);

      call.on("stream", (remoteStream) => {
        // Show stream in some video/canvas element.
        remoteUV.current.srcObject = remoteStream;
        remoteUV.current.play();
        saveData();
        deductFromCaller();
      });
    });
  } else {
    console.log(`Enter ballance first before call`);
    alert(`Recharge first before call`);
  }
}
