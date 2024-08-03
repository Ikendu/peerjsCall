import { useEffect, useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Peer from "peerjs";

function App() {
  const [peerId, setPeerId] = useState(null);
  const remoteVideoRef = useRef(null);

  //useEffect works like componentDidMount
  useEffect(() => {
    let peer = new Peer();
    console.log(peer);
    peer.on(`open`, (id) => {
      setPeerId(id);
    });

    //Answer the call

    peer.on("call", function (call) {
      let getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia;

      getUserMedia(
        { video: true, audio: true },
        function (stream) {
          call.answer(stream); // Answer the call with an A/V stream.

          call.on("stream", function (remoteStream) {
            // Show stream in some video/canvas element.
          });
        },
        function (err) {
          console.log("Failed to get local stream", err);
        }
      );
    });
  }, []);

  // for making calls
  const call = (remotePeerId) => {
    const getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;
    getUserMedia(
      { video: true, audio: true },
      function (mediaStream) {
        var call = peer.call(remotePeerId, mediaStream);
        call.on("stream", function (remoteStream) {
          // Show stream in some video/canvas element.
          remoteVideoRef.current.srcObject = remoteStream;
        });
      }
      // function (err) {
      //   console.log("Failed to get local stream", err);
      // }
    );
  };

  return (
    <div>
      <h3>My Id is {peerId}</h3>
      <div>Peer Connections</div>
      <div>
        <video />
      </div>
      <div>
        <video ref={remoteVideoRef} />
      </div>
    </div>
  );
}

export default App;
