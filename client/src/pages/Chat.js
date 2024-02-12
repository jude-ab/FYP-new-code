import React from "react";
import { useState } from "react";
import { Box } from "@chakra-ui/react";
import SidePopUp from "../components/Mcomponents/SidePopUp";
import MyChats from "../components/MyChats";
import ChatBox from "../components/ChatBox";
import { ChatState } from "../Providers/ChatP";
import backgroundImage from '../assets/images/yoga1.png';

const Chat = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user } = ChatState();

  return (
    <>
      {user && <SidePopUp />}
      <Box
        w="100vw"
        h="100vh"
        p="0"
        m="0"
        overflow="hidden" // Ensure that the outer Box doesn't allow content to overflow
      >
        <Box
          backgroundImage={`url(${backgroundImage})`}
          backgroundSize="cover"
          backgroundPosition="center"
          backgroundRepeat="no-repeat"
          filter="blur(3px)" // Apply blur to just the background image
          w="100%"
          h="100%"
          position="fixed"
          zIndex="-1" // Ensure the background image stays behind the content
        />
        <Box
          d="flex"
          justifyContent="space-between"
          h="100%"
          overflowY="auto" // Enable vertical scrolling for the inner Box
        >
          {user && <MyChats fetchAgain={fetchAgain} />}
          {user && <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />}
        </Box>
      </Box>
    </>
  );
};

export default Chat;
