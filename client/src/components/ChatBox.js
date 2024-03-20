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
      w={{ base: "100%", md: "65%" }} // Set the width to 100% on smaller screens and 65% on medium screens and up
      borderRadius="lg"
      borderWidth="1px"
      background="rgba(255, 255, 255, 0.9)" // Adjust background color and transparency as needed
      zIndex={-1}
      marginTop={{ base: "1%", md: "-41.8%" }} // Adjust margin top for smaller screens
      height={{ base: "95%", md: "88%" }} // Set the height to 100% on smaller screens and 88% on medium screens and up
      marginLeft={{ base: "0", md: "33%" }} // Add left margin on medium screens and up
      backgroundSize="cover"
      backgroundPosition="center"
      backgroundRepeat="no-repeat"
      boxShadow="0 2px 10px rgba(0, 0, 0, 0.5)"
      marginBottom={{ base: "22%", md: "0%" }} // Adjust margin bottom as needed
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  );
};

export default ChatBox;
