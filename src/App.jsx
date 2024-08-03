import { useEffect, useRef, useState } from "react";

import "./App.css";
import Peer from "peerjs";

function App() {
  const [peerId, setPeerId] = useState(``);
  const [remoteIdValue, setRemoteIdValue] = useState(``);

  const remoteVideoRef = useRef(null);
  const currentUserVideoRef = useRef(null);
  const peerInstance = useRef(null);

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
            currentUserVideoRef.current.srcObject = currentUserVideoRef;
            currentUserVideoRef.current.play;
          });
        },
        function (err) {
          console.log("Failed to get local stream", err);
        }
      );
    });

    peerInstance.current = peer;
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
        var call = peerInstance.current.call(remotePeerId, mediaStream);
        call.on("stream", function (remoteStream) {
          // Show stream in some video/canvas element.
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play();
        });
      }
      // function (err) {
      //   console.log("Failed to get local stream", err);
      // }
    );
  };

  return (
    <div className="">
      <h3>My Id is {peerId}</h3>
      <div className=" bg-slate-500">Peer Connections</div>
      <input
        type="text"
        value={remoteIdValue}
        onChange={(e) => setRemoteIdValue(e.target.value)}
      />
      <button onClick={call(remoteIdValue)} className=" bg-blue-700 p-3 px-6">
        Call
      </button>

      <button className=" bg-green-600 p-3 px-6">Answer</button>
      <button className=" bg-blue-700 p-3 px-6">Reject</button>

      <button className=" bg-green-600 p-3 px-6">Answer</button>
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
