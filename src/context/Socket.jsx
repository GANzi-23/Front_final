import React, { createContext, useMemo, useContext } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

// export const SocketProvider = (props) => {
//   const socket = useMemo(() => io("localhost:8000"), []);

  export const SocketProvider = (props) => {
    const socket = useMemo(() => io('http://3.35.87.10:8000', {
      path: "/ws/socket.io"
    }), []); 

  return (
    <SocketContext.Provider value={socket}>
      {props.children}
    </SocketContext.Provider>
  );
};