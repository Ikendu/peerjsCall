import { useEffect, useRef, useState } from "react";

import "./App.css";
import Peer from "peerjs";
import CallApp from "./CallApp";
import Firebase from "./Firebase";
import MainFile from "./MainFile";

function App() {
  return (
    <div className="">
      <h1 className="text-center text-xl">My Test Project</h1>
      {/* <div>
        <CallApp />
      </div> */}
      <div>
        <MainFile />
      </div>
    </div>
  );
}

export default App;
