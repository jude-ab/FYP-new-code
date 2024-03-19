import React from "react";
import { ChatState } from "../Providers/ChatP";
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Stack,
  Drawer,
  Input,
  InputGroup,
  InputRightElement,
  Tooltip,
  Text,
  useToast,
  IconButton,
} from "@chakra-ui/react";
import axios from "axios";
import { AddIcon, SearchIcon } from "@chakra-ui/icons";
import ChatLoad from "../components/ChatLoad";
import { getSenderName } from "../utils/ChatLogic";
import GroupChatM from "./Mcomponents/GroupChatM";
import {
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
} from "@chakra-ui/modal";
import UserList from "./User/UserList";
import Chatload from "./ChatLoad";
import { useDisclosure } from "@chakra-ui/hooks";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState(); // Initialize state with null
  const { selectedChat, setSelectedChat, chats, setChats, user } = ChatState();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingchat, setLoadingchat] = useState(false);

  const toast = useToast();

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please enter a valid name",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      //get users from db
      const { data } = await axios.get(`/api/user?search=${search}`, config);

      setLoading(false);
      setSearchResults(data);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoading(true);

      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post("/api/chat", { userId }, config);
      if (!chats.find((chat) => chat._id === data._id))
        setChats([...chats, data]); //add new chat to chats
      setLoadingchat(true);
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  // const [chats, setChats] = useState([]); //populate chats with chats from db
  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/chat`, config);

      setChats(data);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
  }, [fetchAgain]);

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDirection="column"
      width={{ base: "100%", md: "30%" }}
      alignItems="center"
      padding={3}
      bg="rgba(255, 255, 255, 0.9)"
      borderRadius="lg"
      borderWidth="1px"
      height={{ base: "auto", md: "88vh" }} // Adjust height responsively
      marginTop={{ base: "1rem", md: "5%" }}
      marginLeft={{ base: "0", md: "2%" }}
      boxShadow="0 2px 10px rgba(0, 0, 0, 0.5)"
    >
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay bg="transparent" />
        <DrawerContent borderRadius="0px 20px 20px 0px">
          {/* Remove the DrawerCloseButton component */}
          <DrawerHeader
            borderBottomWidth="1px"
            fontFamily="Work sans"
            position="relative"
            textAlign="center"
            borderRadius="0px 20px 0px 0px"
            bg="rgba(12, 48, 31, 0.5)"
            showCloseButton={false}
          >
            Start Chatting
          </DrawerHeader>
          <DrawerBody
            color="white"
            bg="rgba(12, 48, 31, 0.5)"
            borderRadius="0px 0px 20px 0px"
          >
            <Box d="flex" pb={2} alignItems="center">
              <InputGroup marginTop="5%">
                <Input
                  placeholder="Search by Name"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  pr="4.5rem"
                  bg="white"
                  height="30px"
                  color="black"
                  fontFamily="Work sans"
                />
                <InputRightElement width="4.5rem">
                  <IconButton
                    icon={<SearchIcon boxSize="45%" marginLeft="90%" marginBottom="24%" />}
                    background="transparent"
                    h="1.75rem"
                    size="sm"
                    onClick={handleSearch}
                  />
                </InputRightElement>
              </InputGroup>
            </Box>
            {loading ? (
              <ChatLoad />
            ) : (
              searchResults?.map((user) => (
                <UserList
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
       <Box
        width="100%"
        display="flex"
        flexDirection="column"
        alignItems="center"
        marginBottom="4" // Add some space between this section and the list below
      >
          <Tooltip label="Search for friends to chat with!" hasArrow placement="bottom-end">
            <Button onClick={onOpen} variant="outline" width="full" justifyContent="start">
            <SearchIcon w={3} h={5} marginRight="2" />
            <Text fontSize={{ base: "sm", md: "15px" }} fontFamily="Work sans">
              Search
            </Text>
          </Button>
        </Tooltip>
        <Text
          fontSize={{ base: "25px", md: "28px" }}
          fontFamily="Work sans"
          textAlign="center"
          marginTop="2" // Ensures space between the search bar and "Inbox" text
          marginLeft="-79%"
        >
          Inbox
        </Text>
        <GroupChatM>
          <Button
          d="flex"
          alignItems="center"
          fontSize={{ base: "sm", md: "sm" }}
          rightIcon={<AddIcon />}
          variant="ghost"
          marginTop="-145%" // Adjusted for visual consistency
          marginLeft="330%"  
        >
            {/* Create New Group Chat */}
          </Button>
        </GroupChatM>
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        width="100%"
        overflowY="scroll" // Ensure scrollability
        bg="#f5f5f5"
        borderRadius="lg"
        padding={1}
        marginTop="0rem" // Adjust marginTop for consistency
        background="transparent"
      >
        {chats ? (
          <Stack overflowY="scroll">
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                color={selectedChat === chat ? "white" : "black"}
                bg={selectedChat === chat ? " #A3B3A7" : "white"}
                borderRadius="lg"
                px={3}
                py={2}
                key={chat._id}
              >
                <Text>
                  {!chat.isGroupChat
                    ? getSenderName(loggedUser, chat.users)
                    : chat.chatName}
                </Text>
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoad />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
