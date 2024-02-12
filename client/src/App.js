import "./App.css";
import { Route } from "react-router-dom";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Mood from "./pages/Mood";
import YogaLibrary from "./pages/YogaLibrary";
import ChatP from "./Providers/ChatP";
import Health from "./pages/Health";
import UserProfile from "./pages/UserProfile";
import PosesByLevel from "./pages/PosesByLevel";
// import { Chart } from "chart.js";

function App() {
  return (
    <ChatP>
      <div className="App">
        <Route path="/" component={Home} exact />
        <Route path="/chats" component={Chat} />
        <Route path="/mood" component={Mood} />
        <Route path="/yogaLibrary" component={YogaLibrary} />
        <Route path="/health" component={Health} />
        <Route path="/profile" component={UserProfile} />
        <Route path="/poses/:level" component={PosesByLevel} />
      </div>
    </ChatP>
  );
}

export default App;
