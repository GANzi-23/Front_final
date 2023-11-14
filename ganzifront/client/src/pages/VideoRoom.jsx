import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../providers/peer";
import { useSocket } from "../context/Socket";
import '../pages/VideoRoom.css';

const VideoRoomPage = () => {

  // 모델 선택 메뉴
  const [isModelMenuVisible, setIsModelMenuVisible] = useState(false);

  // 모델 목록 정의
  const models = [
      { id : 1, name: "Original"},
      { id : 2, name: "Arcane"},
      { id : 3, name: "Pixar"},
      { id : 4, name: "Disney"}
    ];
      // 메뉴 표시 토글
  const toggleModelMenu = () => {
      setIsModelMenuVisible(!isModelMenuVisible);
    };
  
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  return (
    <div>
          {/* 헤더 바 */}
          <div className="header-bar">
            <div className='logo-container'>
               <img src="/images/Ganzi1.png" alt="로고이미지"/>
            </div>
            <div className="meeting-title">Ganzi meeting</div>
            <div className="meeting-date">11월 16일, 2023 |</div>
            <div className="meeting-time">08:00 PM</div>
            <div className="user-name">Minah</div>
        </div>

      <h4>{remoteSocketId ? "" : ""}</h4>
      {/* {myStream && <button onClick={sendStreams} className="button-video">Video</button>} */}
      {remoteSocketId && <button onClick={handleCallUser} className="button-accept">Accept</button>}  
      {myStream && (
        <>
        {/* Video Player 디자인 수정 */}
          <ReactPlayer
            playing
            muted
            height="450px"
            width="1000px"
            url={myStream}
          />
        </>
      )}
      {remoteStream && (
        <>
          <ReactPlayer
            playing
            muted
            height="450px"
            width="1000px"
            url={remoteStream}
          />
        </>
      )}

      {/* 하단 바 */}
      <div className="bottom-bar">
            <img src="/images/mic.png" alt="mic" className="mic" />
            {/* <button onClick={(e) => sendStream(myStream)} className="videobutton"> */}
            {myStream && (
              <button onClick={sendStreams} className="button-video">
                <img src="/images/video.png" alt="videobutton" />
              </button>
            )}
            {/* </button> */}
            <img src="/images/chat.png" alt="chat" className="chat" />
            <button onClick={toggleModelMenu} className="plus">
                <img src="/images/plus.png" alt="plus" />
            </button>
            {isModelMenuVisible && (
                <div className="model-selection-menu">
                <h4>Choose your Avatar!</h4>
                <ul>
                    {models.map((model) => (
                        <li key={model.id}>{model.name}</li>
                    ))}
                </ul>
                </div>
            )}
            <img src="/images/end.png" alt="end" className="end" />
        </div>
        
        <div className="right-sidebar">
                <div className="participant-list">
                    <h2>참여자 목록</h2>
                    {/* <ul>
                        <li>{remoteEmailId}</li>
                    </ul> */}
                </div>
                <div className="chat-box">
                    <h2>채팅</h2>
                    <div className="chat-messages">
                    </div>
                    <input type="text" placeholder="메시지를 입력하세요" />
                    <button>Send</button>
                </div>
            </div>

    </div>
  );
};

export default VideoRoomPage;