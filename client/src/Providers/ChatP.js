import { createContext, useContext, useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import React from "react";

const ChatContext = createContext();

const ChatP = ({ children }) => {
  const [user, setUser] = useState(null); // Initialize state with null
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]); //populate chats with chats from db
  const [notif, setNotif] = useState([]);

  const history = useHistory();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo")); // Ensure the key matches what you set
    setUser(userInfo);

    if (!userInfo) {
      // Redirect synchronously if possible, or ensure history is available
      history.push("/");
    }
  }, [history]); // Dependency array

  const updateUser = (newUserData) => {
    localStorage.setItem("userInfo", JSON.stringify(newUserData)); // Save to localStorage
    setUser(newUserData); // Update context state
  };

  return (
    <ChatContext.Provider
      value={{
        user,
        setUser,
        updateUser,
        selectedChat,
        setSelectedChat,
        chats,
        setChats,
        notif,
        setNotif,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatP;
