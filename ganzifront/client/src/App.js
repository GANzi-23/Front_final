import { Routes, Route } from "react-router-dom";
import "./App.css";
import StartVideopage from "./pages/StartVideo";
import VideoRoomPage from "./pages/VideoRoom";
import Account from "./pages/Account"; 
import Login from "./pages/Login";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/account" element={<Account />} /> 
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<StartVideopage />} />
        <Route path="/room/:roomId" element={<VideoRoomPage />} />
      </Routes>     
    </div>
  );
}

export default App;
