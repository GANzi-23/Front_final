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
      { id : 1, name: "original"},
      { id : 2, name: "arcane"},
      { id : 3, name: "pixar"},
      { id : 4, name: "disney"}
    ];

  // 메뉴 표시 토글
  const toggleModelMenu = () => {
      setIsModelMenuVisible(!isModelMenuVisible);
    };

  // ML 모델 사용 코드
  const [capturedImage, setCapturedImage] = useState(null);
  const [videoStream, setVideoStream] = useState(null);
  const [processedImage, setProccessedImage] = useState(null);
  const [selectedModel, setSelectModel] = useState("Original");
  
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


  useEffect(() => {
    const startVideoStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setVideoStream(stream);
  
        const videoElement = document.createElement('video');
        videoElement.srcObject = stream;
        videoElement.play();
  
        const captureInterval = setInterval(() => handleCaptureImage(videoElement), 100);
  
        return () => {
          clearInterval(captureInterval);
        };
      } catch (error) {
        console.error(error);
      }
    };
  
    if (socket) {
      startVideoStream();
    }
  
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [socket]);
  
  const handleCaptureImage = (videoElement) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 720;
    canvas.height = 480;
  
    // 이제 videoElement를 drawImage 함수에 전달
    ctx.drawImage(videoElement, 0, 0, 720, 480);
  
    const rawData = canvas.toDataURL("image/jpeg", 0.5);
  
    // 서버로 이미지 전송
    socket.emit('image', { rawData });
  };

  const handleModelChange = useCallback((model) => {
    setSelectModel(model);
    socket.emit('image-model', { model });
  }, [socket])

  useEffect(() => {
    if (socket) {
      socket.on("processed_image", (image) => {
        console.log("Received processed image:", image);
        setProccessedImage(image);
      });

      return () => {
        socket.off("processed_image");
      };
    }
  }, [socket]);


  // socket.on("processed_image", function (image) {
  //   photo.setAttribute("src", image);
  // });
  

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

      {/* 캡쳐된 이미지를 화면에 표시 */}
      {capturedImage && (
        <img src={`data:image/jpeg;base64,${capturedImage}`} alt="Captured" />
      )}
      <div>
        {/* 받아온 image 표시 */}
        {processedImage && <img src={processedImage} alt="Processed Image" />}
      </div>

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
                  <li
                    key={model.id}
                    className={model.name === selectedModel ? 'selected' : ''}
                    onClick={() => handleModelChange(model.name)}
                  >
                    {model.name}
                  </li>
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