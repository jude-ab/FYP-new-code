import React from "react";
import { ChatState } from "../Providers/ChatP";
import { Box } from "@chakra-ui/react";
import SingleChat from "./SingleChat";

const ChatBox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = ChatState();

  return (
    <Box
      d={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      alignItems="center"
      flexDir="column"
      bg="white"
      p={3}
      w={{ base: "100%", md: "65%" }} // This sets the width to 50% on medium screens and up
      borderRadius="lg"
      borderWidth="1px"
      // background="rgba(12, 48, 31, 0.95)"
      background="rgba(255, 255, 255, 0.9)"
      // background="#A3B3A7"
      // background="rgba(163, 179, 167, 0.85)" // 50% transparent
      backgroundSize="cover"
      backgroundPosition="center"
      backgroundRepeat="no-repeat"
      zIndex={-1}
      marginLeft="32.5%"
      marginTop="-41.5%"
      height="88%"
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  );
};

export default ChatBox;
