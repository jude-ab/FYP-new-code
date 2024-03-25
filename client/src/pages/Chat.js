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
        overflow="hidden"
        mt={{ base: "50px", md: "0" }}
      >
        <Box
          backgroundImage={`url(${backgroundImage})`}
          backgroundSize="cover"
          backgroundPosition="center"
          backgroundRepeat="no-repeat"
          filter="blur(3px)"
          w="100%"
          h="100%"
          position="fixed" 
          zIndex="-1"
        />
        <Box
          d={{ base: "block", md: "flex" }} 
          justifyContent="space-between"
          h="100%"
          overflowY="auto"
          pt={{ base: "60px", md: "0px" }} 
          
        >
          {user && <MyChats fetchAgain={fetchAgain} />}
          {user && <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />}
        </Box>
      </Box>
    </>
  );
};

export default Chat;
