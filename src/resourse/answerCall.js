export default function (peer, currentUserVideoRef, remoteVideoRef) {
  peer.current.on("call", function (call) {
    let getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;
    getUserMedia({ video: true, audio: true }, function (stream) {
      currentUserVideoRef.current.srcObject = stream;
      currentUserVideoRef.current.play();
      call.answer(stream); // Answer the call with an A/V stream.
      call.on("stream", function (remoteStream) {
        // Show stream in some video/canvas element.
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.play();
      });
    });
  });
  // return true;
}
