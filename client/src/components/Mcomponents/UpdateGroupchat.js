import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  IconButton,
  FormControl,
  useToast,
  Box,
  Input,
  Spinner,
} from "@chakra-ui/react";
import { EditIcon, ViewIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { ChatState } from "../../Providers/ChatP";
import UserBadge from "../User/UserBadge";
import UserList from "../User/UserList";
import axios from "axios";

const UpdateGroupchat = ({ fetchAgain, setFetchAgain, fetchMessages }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatN, setGroupChatN] = useState('');
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([""]);
  const [loading, setLoading] = useState(false);
  const [loadingR, setLoadingR] = useState(false);

  const toast = useToast();

  const { selectedChat, setSelectedChat, user } = ChatState();

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      // setSearchResults([]);
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
      console.log(data);
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
      setLoading(false);
    }
  };

  const handleRename = async () => {
    if (!groupChatN) return;

    try {
      setLoadingR(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(
        "/api/chat/renamechat",
        {
          chatId: selectedChat._id,
          chatName: groupChatN,
        },
        config
      );
                 
      console.log(data._id);
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setLoadingR(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      setLoadingR(false);
    }
    setGroupChatN("");
  };

   const handleAddUser = async (userC) => {
    if (selectedChat.users.find((user) => user._id === userC._id)) {
      toast({
        title: "Error",
        description: "User already in chat",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    if (selectedChat.groupAdmin._id !== user._id) {
      toast({
        title: "Error",
        description: "You are not the admin of this group",
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
      const { data } = await axios.put(
        "/api/chat/adduser",
        {
          chatId: selectedChat._id,
          userId: userC._id,
        },
        config
      );
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      setLoading(false);
    }
    setGroupChatN("");
  };

  const handleRemoveUser = async (userC) => {
    if (selectedChat.groupAdmin._id === user._id && userC._id !== user._id) {
      toast({
        title: "Error",
        description: "You are not the admin of this group",
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

      const { data } = await axios.put(
        "/api/chat/removeuser",
        {
          chatId: selectedChat._id,
          userId: userC._id,
        },
        config
      );
      userC._id === user._id ? setSelectedChat() : setSelectedChat(data); // If admin user is removed from chat, set selectedChat to null
      setFetchAgain(!fetchAgain);
      fetchMessages();
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      setLoading(false);
    }
    setGroupChatN("");
  };

  return (
    <>
      <IconButton background = "transparent" icon={<EditIcon boxSize="45%" marginLeft="15%" marginBottom="13%"/>} d={{ base: "flex" }} incon={<ViewIcon />} onClick={onOpen}  />

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            d="flex"
            justifyContent="center"
            textAlign="center"
          >
            {selectedChat.chatName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody d="flex" flexDir="column" alignItems="center">
            <Box>
              {selectedChat.users.map((user) => (
                <UserBadge
                  key={user._id}
                  user={user}
                  handleFunction={() => handleRemoveUser(user)}
                />
              ))}
            </Box>
            <FormControl d="flex">
              <Input
                placeholder="Name"
                mb={3}
                value={groupChatN}
                onChange={(e) => setGroupChatN(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add User"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>

            {loading ? (
              <Spinner size="lg" />
            ) : (
              searchResults?.map((user) => (
                <UserList
                  key={user._id}
                  user={user}
                  handleFunction={() => handleAddUser(user)}
                />
              ))
            )}

             <Button
                variant="solid"
                colorScheme="teal"
                ml={1}
                isLoading={loadingR}
                onClick={handleRename}
                fontFamily="Work sans"
                backgroundColor="#0C301F"
                _hover={{ bg: "#1E4D38" }}
                marginLeft="0.1%"
                width="99.5%"
                marginBottom="-4%"
                marginTop="3%"
              >
                Update
              </Button>
          </ModalBody>

          <ModalFooter>
            
            <Button
              onClick={() => handleRemoveUser(user)}
              background="#800000"
              // marginLeft="1%"
              marginRight="1%"
              width="112%"
              color="white"
              fontFamily="Work sans"
            >
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupchat;
