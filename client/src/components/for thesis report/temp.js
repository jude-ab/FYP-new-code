import React from "react";
import { ChatState } from "../Providers/ChatP";
import {
  Box,
  Tooltip,
  Text,
  Button,
  Drawer,
  Input,
  InputGroup,
  InputRightElement,
  useToast,
} from "@chakra-ui/react";
import SidePopUp from "../components/Mcomponents/SidePopUp";
import MyChats from "../components/MyChats";
import ChatBox from "../components/ChatBox";
import { SearchIcon } from "@chakra-ui/icons";
import { useDisclosure } from "@chakra-ui/hooks";
import { useState } from "react";
import {
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
} from "@chakra-ui/modal";
import axios from "axios";
import UserList from "../components/User/UserList";
import ChatLoad from "../components/ChatLoad";

const Chat = () => {
  const { user, setSelectedChat, chats, setChats } = ChatState();
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

  //`user.username` in your conditional rendering
  return (
    <Box w="100%" h="95vh" p="10px">
      {user && <SidePopUp />}

      <Box
        display="flex"
        flexDirection={{ base: "column", md: "row" }}
        alignItems="start"
      >
        <Tooltip
          label="search for friends to chat with!"
          hasArrow
          placement="bottom"
        >
          <Button variant="ghost" onClick={onOpen}>
            <SearchIcon />
            <Text d={{ base: "none", md: "flex" }} px="4">
              Search
            </Text>
          </Button>
        </Tooltip>
        {user && <ChatBox />}
        {/* Search icon and text aligned to the left */}
      </Box>
      {user && <MyChats />}

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Start Chatting!</DrawerHeader>
          <DrawerBody>
            <Box d="flex" pb={2} alignItems="center">
              <InputGroup>
                <Input
                  placeholder="Search by Name"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  // Set the paddingRight to the width of the button
                  // so the text doesn't go under the button
                  pr="4.5rem"
                />
                <InputRightElement width="4.5rem">
                  <Button h="1.75rem" size="sm" onClick={handleSearch}>
                    Go
                  </Button>
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
    </Box>
  );
};

export default Chat;
