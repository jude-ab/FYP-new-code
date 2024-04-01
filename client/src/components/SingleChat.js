import React, { useState, useEffect } from "react";
import Lottie from "react-lottie";
import animationData from "../assets/animation/typing.json"; // Import the JSON data for the typing animation
import axios from "axios";
import io from "socket.io-client";
import { Box, Text, IconButton, useToast, Spinner, FormControl, Input, InputGroup, InputRightElement } from "@chakra-ui/react";
import { ArrowBackIcon, ChevronRightIcon } from "@chakra-ui/icons"; 
import { ChatState } from "../Providers/ChatP";
import { getSenderName, getFullSender } from "../utils/ChatLogic";
import UpdateGroupchat from "./Mcomponents/UpdateGroupchat";
import ScrollChat from "./ScrollChat";
import "../App.css";
import Profile from "./Mcomponents/Profile";

const END_POINT = `https://yogahub-nodebackend-587807f134e2.herokuapp.com`;
var socket, selectedChatC;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState("");
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typing, setTyping] = useState(false);
  const toast = useToast();
  const { user, selectedChat, setSelectedChat, notif, setNotif } = ChatState();

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      setLoading(true);
      const { data } = await axios.get(`https://yogahub-nodebackend-587807f134e2.herokuapp.com/api/messages/${selectedChat._id}`, config);
      setMessages(data);
      setLoading(false);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch messages.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const sendMessage = async () => {
    if (newMessage) {
      socket.emit("end typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post("https://yogahub-nodebackend-587807f134e2.herokuapp.com/api/messages", { content: newMessage, chatId: selectedChat }, config);
        socket.emit("newmessage", data);
        setMessages([...messages, data]);
      } catch (error) {
        console.error("Failed to send message: ", error.response);
        toast({
          title: "Error",
          description: "Failed to send message.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  useEffect(() => {
    socket = io(END_POINT);
    socket.emit("joinroom", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("end typing", () => setIsTyping(false));
  }, []);

  useEffect(() => {
    fetchMessages();
    selectedChatC = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message recieved", (newRMessage) => {
      if (!selectedChatC || selectedChatC._id !== newRMessage.chat._id) {
        if (!notif.includes(newRMessage)) {
          setNotif([newRMessage, ...notif]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newRMessage]);
      }
    });
  });

  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!socketConnected) return;
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let typingTime = new Date().getTime();
    var timer = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - typingTime;
      if (timeDiff >= timer && typing) {
        socket.emit("end typing", selectedChat._id);
        setTyping(false);
      }
    }, timer);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text color="black" fontSize={{ base: "xl", md: "120%" }} pb={3} px={2} w="100%" fontFamily="Work sans" d="flex" justifyContent={{ base: "space-between" }} alignItems="center">
            <IconButton
              d={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />} onClick={() => setSelectedChat(null)}
              margiTop="-0.3%" marginRight="2%"
              background="transparent"
              color="black" />
            {messages && (!selectedChat.isGroupChat ? (
              <>
                {getSenderName(user, selectedChat.users)}
                <Profile user={getFullSender(user, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupchat fetchMessages={fetchMessages} fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
              </>
            ))}
          </Text>
          <Box d="flex" flexDir="column" justifyContent="space-between" p={3} background="transparent" w="100%" h="100%" borderRadius="lg" overflowY="scroll" >
            {loading ? (
              <Spinner size="xl" w={20} h={20} alignSelf="center" margin="auto" />
            ) : (
              <Box className="messages" d="flex" overflowY="auto" sx={{ paddingBottom: "1rem", height: "calc(100% - 50px)" }}>
                <ScrollChat messages={messages} />
              </Box>
            )}
            <FormControl id="first-name" isRequired bottom="1.5" position="relative">
              <Box display="flex" alignItems="flex-end">
                {isTyping && (
                   <Lottie
                    options={{ animationData: animationData }}
                    width={90}
                    height={90}
                    isStopped={false}
                    isPaused={false}
                    style={{ marginLeft: "-3.2%", position: "absolute", bottom: "20%" }} 
                  />
                )}
                <InputGroup width="100%">
                  <Input
                    marginTop={{ base: "5%", md: "2.5%" }}
                    variant="filled"
                    bg="#F0F0F0"
                    placeholder="Enter a message..."
                    value={newMessage}
                    onChange={typingHandler}
                    boxShadow="0 2px 10px rgba(0, 0, 0, 0.3)"
                  />
                  <InputRightElement>
                    <IconButton
                      icon={<ChevronRightIcon />}
                      marginTop={{ base: "116%", md: "116%" }}
                      onClick={sendMessage}
                      mr={5} background="#A3B3A7"
                      width={{ base: "10%", md: "3%" }}
                      height="60%" />
                  </InputRightElement>
                </InputGroup>
              </Box>
            </FormControl>
          </Box>
        </>
      ) : (
        <Box>
          <Text marginTop="20%" textAlign="center" fontSize={{ base: "xl", md: "2xl" }} pb={3} fontFamily="Work sans">
            Start chatting with your friends!
          </Text>
        </Box>
      )}
    </>
  );
};
export default SingleChat;