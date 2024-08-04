// src/App.js
import React, { useState, useRef, useEffect } from "react";
import Peer from "peerjs";

function App() {
  const [peer, setPeer] = useState(null);
  const [remotePeerId, setRemotePeerId] = useState("");
  const [incomingCall, setIncomingCall] = useState(null);
  const [currentCall, setCurrentCall] = useState(null); // Track the current ongoing call
  const myVideoRef = useRef(null);
  const callerVideoRef = useRef(null);
  const peerInstanceRef = useRef(null);

  useEffect(() => {
    // Initialize PeerJS
    const newPeer = new Peer({
      host: "your-peer-server-host", // Replace with your PeerServer host
      port: 9000, // Replace with your PeerServer port
      path: "/myapp", // Replace with your PeerServer path
      debug: 3,
    });

    newPeer.on("open", (id) => {
      console.log("My peer ID is: " + id);
      setPeer(newPeer);
    });

    newPeer.on("call", (call) => {
      setIncomingCall(call);
    });

    newPeer.on("error", (err) => {
      console.error("Peer error:", err);
    });

    peerInstanceRef.current = newPeer;

    return () => {
      if (newPeer) {
        newPeer.destroy();
      }
    };
  }, []);

  const startCall = async () => {
    if (remotePeerId) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        myVideoRef.current.srcObject = mediaStream;
        await myVideoRef.current.play();

        const call = peerInstanceRef.current.call(remotePeerId, mediaStream);
        setCurrentCall(call); // Set the current call

        call.on("stream", (remoteStream) => {
          callerVideoRef.current.srcObject = remoteStream;
          callerVideoRef.current.play();
        });

        call.on("close", () => {
          mediaStream.getTracks().forEach((track) => track.stop());
          setCurrentCall(null); // Clear the current call on close
        });

        call.on("error", (error) => {
          console.error("Call error:", error);
          alert("Error during the call: " + error.message);
        });
      } catch (error) {
        console.error("Failed to get local stream:", error);
        alert(
          "Could not access your camera and microphone. Please check your settings."
        );
      }
    } else {
      alert("Please enter a remote peer ID");
    }
  };

  const answerCall = async () => {
    if (incomingCall) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        myVideoRef.current.srcObject = mediaStream;
        myVideoRef.current.play();

        incomingCall.answer(mediaStream);

        incomingCall.on("stream", (remoteStream) => {
          callerVideoRef.current.srcObject = remoteStream;
          callerVideoRef.current.play();
        });

        incomingCall.on("close", () => {
          mediaStream.getTracks().forEach((track) => track.stop());
          setCurrentCall(null); // Clear the current call on close
        });

        incomingCall.on("error", (error) => {
          console.error("Call error:", error);
          alert("Error during the call: " + error.message);
        });

        setIncomingCall(null);
      } catch (error) {
        console.error("Failed to get local stream:", error);
        alert(
          "Could not access your camera and microphone. Please check your settings."
        );
      }
    }
  };

  const endCall = () => {
    if (currentCall) {
      currentCall.close(); // Close the call
      setCurrentCall(null); // Clear the current call

      // Stop all media tracks
      if (myVideoRef.current.srcObject) {
        myVideoRef.current.srcObject
          .getTracks()
          .forEach((track) => track.stop());
      }
      myVideoRef.current.srcObject = null;
      callerVideoRef.current.srcObject = null;
    }
  };

  return (
    <div className="App">
      <h1>PeerJS Video Call Example</h1>
      <div>
        <video
          ref={myVideoRef}
          autoPlay
          muted
          style={{ width: "300px", margin: "10px" }}
        />
        <video
          ref={callerVideoRef}
          autoPlay
          style={{ width: "300px", margin: "10px" }}
        />
      </div>
      <input
        type="text"
        placeholder="Enter remote peer ID"
        value={remotePeerId}
        onChange={(e) => setRemotePeerId(e.target.value)}
      />
      <button onClick={startCall}>Start Call</button>
      {incomingCall && (
        <div>
          <p>Incoming call from {incomingCall.peer}</p>
          <button onClick={answerCall}>Answer Call</button>
        </div>
      )}
      {(currentCall || incomingCall) && (
        <button onClick={endCall}>End Call</button>
      )}
    </div>
  );
}

export default App;
