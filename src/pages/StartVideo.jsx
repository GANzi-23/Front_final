import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/Socket";
import '../pages/StartVideo.css';

const StartVideopage = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  const socket = useSocket();
  const navigate = useNavigate();

  const setMeetingLink = useCallback((link) => {
    console.log("Meeting link set:", link);
  }, []);


  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("room:join", { email, room });
    },
    [email, room, socket]
  );

  // const handleJoinRoom = useCallback(
  //   (data) => {
  //     const { email, room } = data;
  //     navigate(`/room/${room}`);
  //   },
  //   [navigate]
  // );

  const handleJoinRoom = useCallback(
    (data) => {
      const { email, room } = data;
      navigate(`/room/${room}`);
      setMeetingLink(room); // meetingtitle
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
    <div>
      {/* 로고 */}
      <div className='logo-container'>
        <img src="/images/Ganzi1.png" alt="로고이미지"/>
      </div>

      {/* 서비스 소개글 */}
      <div className='Introduce-container'>
          <img src="/images/introduce1.png" alt="소개1이미지"/>
          <img src="/images/introduce2.png" alt="소개2이미지"/>
          <img src="/images/introduce3.png" alt="소개3이미지"/>
      </div>

      {/* 회의 정보 입력 */}
      <div className="input-container">
        <form onSubmit={handleSubmitForm}>
          <label htmlFor="email"></label>
          <input
            type="text"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='+ 사용자 이메일 입력'
          />
          <br />
          <label htmlFor="room"></label>
          <input
            type="text"
            id="room"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder='+ 회의 링크 입력'
          />
        <br />
        <button>참여</button>
      </form>
    </div>
  </div> 
  );
};

export default StartVideopage;