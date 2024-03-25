import React from "react";
import { ChatState } from "../Providers/ChatP";
import { Box } from "@chakra-ui/react";
import SingleChat from "./SingleChat";

const ChatBox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = ChatState();

  return (
  <Box
      display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      flexDirection="column"
      width={{ base: "100%", md: "67%" }}
      alignItems="center"
      padding={3}
      bg="rgba(255, 255, 255, 0.9)"
      borderRadius="lg"
      borderWidth="1px"
      height={{ base: "85vh", md: "88vh" }}
      // min-height={{ base: "70vh", md: "88vh" }}
      // overflowY={{ base: "scroll", md: "auto" }}
      position="absolute"
      top={{ base: "85px", md: "66px" }}
      // transform="translateY(-55%)"
      marginLeft={{ base: "0", md: "31%" }}
      boxShadow="0 2px 10px rgba(0, 0, 0, 0.5)"
      marginBottom={{ base: "40%", md: "0%" }}
  >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  );
};

export default ChatBox;
