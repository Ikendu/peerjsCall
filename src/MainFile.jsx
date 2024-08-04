// src/App.js
import React, { useState, useRef, useEffect } from "react";
import Peer from "peerjs";
import { child, get, onValue, push, ref, set } from "firebase/database";
import database from "./configuration";

function MainFile() {
  const [peer, setPeer] = useState(null);
  const [remotePeerId, setRemotePeerId] = useState("");
  const [incomingCall, setIncomingCall] = useState(null);
  const [currentCall, setCurrentCall] = useState(null);
  const myVideoRef = useRef(null);
  const callerVideoRef = useRef(null);
  const peerInstanceRef = useRef(null);
  const [userName, setUserName] = useState(``);
  const [agentUser, setAgentUser] = useState(``);
  const [totalAmount, setTotalAmount] = useState(``);
  const [remainingAmount, setRemainingAmount] = useState(``);
  const [showBalance, setShowBalance] = useState(false);
  const [callAnswered, setCallAnswered] = useState(false);
  const [totalGain, setTotalGain] = useState(0);
  const [data, setData] = useState({});

  useEffect(() => {
    // Initialize PeerJS
    const userInput = prompt(`Enter a short name to use as an ID`);
    setUserName(userInput);
    if (userInput) {
      const newPeer = new Peer(userInput);

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
    }
  }, []);

  const startCall = async () => {
    if (remotePeerId && totalAmount > 0) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        myVideoRef.current.srcObject = mediaStream;
        myVideoRef.current.play();

        const call = peerInstanceRef.current.call(remotePeerId, mediaStream);
        setCurrentCall(call);

        call.on("stream", (remoteStream) => {
          callerVideoRef.current.srcObject = remoteStream;
          callerVideoRef.current.play();

          deductFromCaller(true);
        });

        call.on("close", () => {
          mediaStream.getTracks().forEach((track) => track.stop());
          setCurrentCall(null);
        });

        call.on("error", (error) => {
          console.error("Call error:", error);
        });
      } catch (error) {
        console.error("Failed to get local stream:", error);
      }
    } else {
      alert("Please enter a remote peer ID and Recharge for call");
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
        setCallAnswered(true);

        incomingCall.on("stream", (remoteStream) => {
          callerVideoRef.current.srcObject = remoteStream;
          callerVideoRef.current.play();
        });

        incomingCall.on("close", () => {
          mediaStream.getTracks().forEach((track) => track.stop());
          setCurrentCall(null);
        });

        incomingCall.on("error", (error) => {
          console.error("Call error:", error);
        });

        setIncomingCall(null);
      } catch (error) {
        console.error("Failed to get local stream:", error);
      }
    }
  };

  // For ending calls
  const endCall = () => {
    deductFromCaller(false);
    if (currentCall) {
      currentCall.close(); // Close the call
      setCurrentCall(null); // Clear the current call
      setCallAnswered(false);

      // Stop all media tracks
      if (myVideoRef.current.srcObject) {
        myVideoRef.current.srcObject
          .getTracks()
          .forEach((track) => track.stop());
      }
      myVideoRef.current.srcObject = null;
      callerVideoRef.current.srcObject = null;

      // SEND BILL TO DATABASE FOR CALCULATION
      const postDataRef = ref(database, `amountGain`);
      const newPostRef = push(postDataRef);
      set(newPostRef, {
        gain: totalGain,
        timestamp: Date.now(),
      })
        .then(() => {
          console.log(`Data posted successfully`, newPostRef?.key);
          // window.location.reload();
        })
        .catch((e) => {
          console.error(`Error posting data`, e);
        });
    }
  };

  const agentEndCall = () => {
    myVideoRef.current.srcObject = null;
    callerVideoRef.current.srcObject = null;
    console.log(`Call ended`);
    setCallAnswered(false);
    handleGetData();
  };

  // get the gained amount from database
  const handleGetData = () => {
    const dataRef = ref(database, `amountGain`);
    // Use child to navigate to the specific ID
    get(dataRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          setData(snapshot.val());
          console.log("Data retrieved successfully:", snapshot.val());
        } else {
          console.log("No data available for this ID.");
        }
      })
      .catch((error) => {
        console.error("Error retrieving data:", error);
      });
  };

  useEffect(() => {
    const gains = Object.values(data)[Object.keys(data).length - 1];
    console.log(gains?.gain);
    setAgentUser(gains?.gain);
  }, [data]);

  // HANDLE CALL BILLING

  const deductFromCaller = (value) => {
    if (value) {
      const timerId = setInterval(() => {
        setTotalAmount((value) => value - 1);
        setTotalGain((value) => value + 1);
      }, 3000);
      return () => clearInterval(timerId);
    } else {
      setRemainingAmount(totalAmount);
      setShowBalance(true);
      return;
    }
  };

  return (
    <div className="w-[100%] flex content-center justify-center ">
      <div className="w-[600px] bg-slate-200 text-center ">
        <h1>Video Call App</h1>

        <h3 className="font-bold m-5">My Id: {userName}</h3>
        <p>share your ID with friends to connect and chat with them </p>
        <div className=" bg-slate-500 text-white p-3">Peer Connections</div>
        <p className="text-blue-800 font-bold">Note:</p>

        <p className="italic text-blue-800 font-bold">
          You have to recharge and get recievers ID before proceeding with
          calls. <br />
          Thank you.
        </p>

        <div>
          {remotePeerId ? (
            <div>
              <p> Ballance: {!showBalance ? totalAmount : remainingAmount}</p>
            </div>
          ) : (
            <div>
              <p> Balance: {agentUser}</p>
              {/* <input
                readOnly
                value={totalAmount}
                className="py-2 rounded-full"
              /> */}
              {/* <p className=" text-xs">End call to see your balance</p> */}
            </div>
          )}
        </div>
        <div className="m-5">
          <label>Enter any amount to Recharge before Call.</label>
          <input
            type="text"
            placeholder="Enter Amount here"
            value={!showBalance ? totalAmount : remainingAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            className="w-[80%] p-2 rounded-lg mx-5 my-1 text-center"
          />
        </div>

        <input
          type="text"
          placeholder="Enter remote peer ID"
          value={remotePeerId}
          onChange={(e) => setRemotePeerId(e.target.value)}
          className=" p-3 w-[70%] my-10"
        />
        <button onClick={startCall} className="bg-blue-600 p-3 px-5 text-white">
          Start Call
        </button>
        {incomingCall && (
          <div>
            <p>Incoming call from {incomingCall.peer}</p>
            <button
              onClick={answerCall}
              className="bg-green-600 rounded-full p-3 px-5 text-white"
            >
              Answer Call
            </button>
          </div>
        )}
        {callAnswered && (
          <div>
            <button
              className="bg-red-600 rounded-full p-3 px-5 text-white"
              onClick={agentEndCall}
            >
              End Call
            </button>
            <p className=" italic text-blue-800">
              As an agent you will only see your balance at the end of the call
            </p>
          </div>
        )}

        {(currentCall || incomingCall) && (
          <button
            className="bg-red-600 rounded-full p-3 px-5 text-white"
            onClick={endCall}
          >
            End Call
          </button>
        )}
        <div className="relative">
          <video
            ref={myVideoRef}
            autoPlay
            muted
            style={{
              width: "200px",
              margin: "10px",
              position: "absolute",
              right: 0,
            }}
            className="rounded-2xl"
          />
          <video
            ref={callerVideoRef}
            autoPlay
            style={{ width: "97%", margin: "10px" }}
            className="rounded-2xl"
          />
        </div>
      </div>
    </div>
  );
}

export default MainFile;
