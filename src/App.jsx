import { useEffect, useRef, useState } from "react";

import "./App.css";
import Peer from "peerjs";
import CallApp from "./CallApp";
import Firebase from "./Firebase";

function App() {
  return (
    <div className="">
      <h1 className="text-center">My Test Project</h1>
      <div>
        <CallApp />
      </div>
      {/* <div>
        <Firebase />
      </div> */}
    </div>
  );
}

export default App;
