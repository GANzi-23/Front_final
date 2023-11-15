import React, {useEffect, useState} from "react";
import { useSocket } from "../context/Socket";
import  '../pages/Chat.css'
const Chat = () => {
    const socket = useSocket();
    const [chats, setchats] = useState([]);
    const [message, setMessage] = useState("");

    const addChatMessage = (data) => {
            const {email, msg} = data;
            console.log(data);
            setchats(chats.concat(email + " : " + msg));
    }
    const sendMessage = () => {
        console.log(message);
        socket.emit('new-message', message);
        setMessage('');
    }
    const onChange = (e) =>{
        setMessage(e.target.value);
      }

    useEffect(() => {
        socket.on("new-message", addChatMessage);

        return () => {
            socket.off("new-message", addChatMessage)
        }
    })
    return(

        <div className="chat-box">
                <h2>채팅</h2>
                <div className="chat-messages">
                        {chats.map((val, index) => {
                        return (<div key={index} className="chat-messge-item">{val}</div>);
                        })}
                </div>
                    <input 
                    type="text"
                    onChange={onChange}
                    value={message}
                    placeholder="메시지를 입력하세요" 
                    onKeyDown={(e)=>{
                        if (e.key === 'Enter')
                        sendMessage();
                }}/>
                    <button onClick={sendMessage}>Send</button>
                </div>
    )
    

}
export default Chat;