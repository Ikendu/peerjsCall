import { useCallback, useEffect, useRef, useState } from "react";

import "./App.css";
import Peer from "peerjs";
import { child, get, onValue, push, ref, set } from "firebase/database";
import database from "./configuration";
import makeCalls from "./resourse/makeCalls";
import answerCall from "./resourse/answerCall";

function CallApp() {
  const [peer, setPeer] = useState(``);
  const [incomingCall, setIncomingCall] = useState(``);
  const [localStream, setLocalStream] = useState(``);
  const currentUserVideoRef = useRef(null); // to hold current video stream
  const remoteVideoRef = useRef(null); //  to hold remote video stream

  const [peerId, setPeerId] = useState(``); // to store the user Id
  const [remoteIdValue, setRemoteIdValue] = useState(``); // to store the remote id
  const [amount, setAmount] = useState(0);
  const [gain, setGain] = useState(0);
  const [userName, setUserName] = useState(``);
  const [data, setData] = useState({});
  const [stopInterval, setStopInterval] = useState(false);
  const [agent, setAgent] = useState(0);

  const peerInstance = useRef(null);

  //useEffect works like componentDidMount

  useEffect(() => {
    const userInput = prompt(`Enter Short name for ID`);
    setUserName(userInput);

    if (userInput) {
      let newPeer = new Peer(userInput);

      setPeer(newPeer);

      newPeer.on(`open`, (call) => {
        setPeerId(call);
        setIncomingCall(call);
      });

      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          setLocalStream(stream);
          currentUserVideoRef.current.srcObject = stream;
        })
        .catch((e) => console.log(`Failed to load`, e));

      peerInstance.current = newPeer;

      // return () => {
      //   if (peer) peer.destry();
      // };

      answerCall(peerInstance, currentUserVideoRef, remoteVideoRef);
    }
  }, []);

  const handleAcceptCall = () => {
    if (incomingCall && localStream) {
      incomingCall.answer(localStream);
      incomingCall.on(`stream`, (remoteStream) => {
        remoteVideoRef.current.srcObject = remoteStream;
      });

      setIncomingCall(null);
    }
  };

  const deductFromCaller = () => {
    const timerId = setInterval(() => {
      setAmount((value) => value - 1);
      setGain((value) => value + 1);
    }, 3000);
    return () => clearInterval(timerId);
  };

  const saveData = () => {
    const postDataRef = ref(database, `amountPost`);
    const newPostRef = push(postDataRef);
    if (userName && amount && remoteIdValue) {
      set(newPostRef, {
        userName,
        amount,
        remoteIdValue,
        timestamp: Date.now(),
      })
        .then(() => {
          console.log(`Data posted successfully`);
        })
        .catch((e) => {
          console.error(`Error posting data`, e);
        });
    }
  };

  const handleEndCall = async () => {
    if (remoteIdValue) {
      const postDataRef = ref(database, `amountGain`);
      const newPostRef = push(postDataRef);
      set(newPostRef, {
        userName,
        gain,
        remoteIdValue,
        timestamp: Date.now(),
      })
        .then(() => {
          console.log(`Data posted successfully`, newPostRef?.key);
          window.location.reload();
        })
        .catch((e) => {
          console.error(`Error posting data`, e);
        });
    } else {
      console.log(`Call ended`);
      handleGetData();

      //   window.location.reload();
    }
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

  //   console.log(`DATA`, Object.values(data)[Object.keys(data).length - 1]);

  useEffect(() => {
    const gains = Object.values(data)[Object.keys(data).length - 1];
    console.log(gains?.gain);
    setAgent(gains?.gain);
  }, [data]);

  return (
    <div className="w-[100%] flex content-center justify-center ">
      <div className="w-[600px] bg-slate-200 text-center ">
        <h3 className="font-bold m-5">My Id: {peerId}</h3>
        <p>share your ID with friends to connect and chat with them </p>
        <div className=" bg-slate-500 text-white p-3">Peer Connections</div>
        <p className="text-blue-800 font-bold">Note:</p>

        <p className="italic text-blue-800 font-bold">
          You have to recharge and get recievers ID before proceeding with
          calls. <br />
          Thank you.
        </p>
        <div className="m-5">
          <label>Enter any amount to Recharge before Call.</label>
          <input
            type="number"
            placeholder="Enter Amount here"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-[80%] p-2 rounded-lg mx-5 my-1 text-center"
          />
        </div>
        <input
          type="text"
          value={userName}
          placeholder="Enter Your name"
          onChange={(e) => setUserName(e.target.value)}
          className="w-[80%] p-2 rounded-lg m-5"
        />

        {remoteIdValue ? (
          <div>
            <p>Caller Ballance: </p>
          </div>
        ) : (
          <div>
            <p>Agent Balance: {agent}</p>
            <input readOnly value={amount} className="py-2" />
            {/* <p className=" text-xs">End call to see your balance</p> */}
          </div>
        )}

        <input
          type="text"
          value={remoteIdValue}
          placeholder="Enter your friends ID to connect with them"
          onChange={(e) => setRemoteIdValue(e.target.value)}
          className="w-[80%] p-2 rounded-lg m-5"
        />

        <br />
        <div className="flex justify-center">
          <button
            onClick={() =>
              makeCalls(
                remoteIdValue,
                amount,
                currentUserVideoRef,
                remoteVideoRef,
                peerInstance,
                saveData,
                deductFromCaller,
                stopInterval
              )
            }
            className=" bg-blue-700 p-3 px-6 text-white"
          >
            Call
          </button>
          {` `}

          <button onClick={handleAcceptCall} className=" bg-green-600 p-3 px-6">
            Answer
          </button>
          {` `}
          <button
            onClick={handleEndCall}
            className="bg-red-700 p-3 px-6 text-white"
          >
            End Call
          </button>
        </div>
        <div>
          <p className="font-bold mt-10">My Cam</p>
          <video ref={currentUserVideoRef} autoPlay />
        </div>
        <div>
          <p className="font-bold mt-10">Remote Cam</p>
          <video ref={remoteVideoRef} autoPlay />
        </div>
      </div>
    </div>
  );
}

export default CallApp;
