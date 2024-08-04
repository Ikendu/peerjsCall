import { useCallback, useEffect, useRef, useState } from "react";

import "./App.css";
import Peer from "peerjs";
import { push, ref, set } from "firebase/database";
import database from "./configuration";
import makeCalls from "./resourse/makeCalls";
import answerCall from "./resourse/answerCall";

function CallApp() {
  const [peerId, setPeerId] = useState(``); // to store the user Id
  const [remoteIdValue, setRemoteIdValue] = useState(``); // to store the remote id
  const [amount, setAmount] = useState(0);
  const [gain, setGain] = useState(0);
  const [userName, setUserName] = useState(``);

  const currentUserVideoRef = useRef(null); // to hold current video stream
  const remoteVideoRef = useRef(null); // to hold remote video stream
  const peerInstance = useRef(null);

  //useEffect works like componentDidMount
  useEffect(() => {
    let peer = new Peer(); // the first call to RTC connection using peerjs
    console.log(peer);
    peer.on(`open`, (id) => {
      setPeerId(id);
    });

    //Answer the call
    answerCall(peer, currentUserVideoRef, remoteVideoRef);

    peerInstance.current = peer;
  }, []);

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
          //   setUserName(``);
          //   setAmount(``);
          //   setRemoteId(``);
        })
        .catch((e) => {
          console.error(`Error posting data`, e);
        });
    }
  };

  const handleEndCall = () => {
    console.log(gain);
    saveData();
    window.location.reload();
  };

  return (
    <div className="w-[100%] flex content-center justify-center ">
      <div className="w-[600px] bg-slate-200 text-center ">
        <h3 className="font-bold m-5">My Id is {peerId}</h3>
        <div className=" bg-slate-500">Peer Connections</div>
        <div className="m-5">
          <label>Enter amount to Recharge your connection</label>
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

        <p>Your Ballance: {amount}</p>

        <input
          type="text"
          value={remoteIdValue}
          placeholder="Enter remote id to call"
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
                deductFromCaller
              )
            }
            className=" bg-blue-700 p-3 px-6"
          >
            Call
          </button>
          {` `}

          {/* <button onClick={handleAnswerCall} className=" bg-green-600 p-3 px-6">
            Answer
          </button> */}
          {` `}
          <button onClick={handleEndCall} className="bg-red-700 p-3 px-6">
            End Call
          </button>
        </div>
        <div>
          <p className="font-bold mt-10">My Cam</p>
          <video ref={currentUserVideoRef} />
        </div>
        <div>
          <p className="font-bold mt-10">Remote Cam</p>
          <video ref={remoteVideoRef} />
        </div>
      </div>
    </div>
  );
}

export default CallApp;
