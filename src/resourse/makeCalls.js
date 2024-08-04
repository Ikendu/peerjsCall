export default async function (
  remotePeerId,
  amount,
  currentUV,
  remoteUV,
  peerInstance,
  saveData,
  deductFromCaller
) {
  if (amount > 0) {
    try {
      // Use modern API to get user media
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // Play local video stream
      currentUV.current.srcObject = mediaStream;
      currentUV.current.play();

      // Initiate a call to the remote peer
      const call = peerInstance.current.call(remotePeerId, mediaStream);
      console.log(`Call initiated with ${remotePeerId}`, call);

      // Handle remote stream
      call.on("stream", (remoteStream) => {
        // Play the remote stream in the remote video element
        remoteUV.current.srcObject = remoteStream;
        remoteUV.current.play();

        // Save call data and deduct balance
        saveData();
        deductFromCaller();
      });

      // Handle call close event
      call.on("close", () => {
        // Stop all media tracks
        mediaStream.getTracks().forEach((track) => track.stop());
        console.log("Call ended and media streams stopped.");
      });

      // Handle errors during the call
      call.on("error", (error) => {
        console.error("Error during the call:", error);
        alert("Error during the call: " + error.message);
      });
    } catch (error) {
      console.error("Failed to get media stream:", error);
      alert(
        "Could not access your camera and microphone. Please check your settings."
      );
    }
  } else {
    console.log(`Enter balance first before calling`);
    alert(`Recharge first before calling`);
  }
}
