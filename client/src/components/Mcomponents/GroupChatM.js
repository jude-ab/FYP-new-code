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
  FormControl,
  Input,
  Box,
} from "@chakra-ui/react";
import { useState } from "react";
import { useToast } from "@chakra-ui/react";
import { ChatState } from "../../Providers/ChatP";
import axios from "axios";
import UserList from "../User/UserList";
import UserBadge from "../User/UserBadge";
import { set } from "mongoose";
import { useEffect } from "react";

const GroupChatM = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const toast = useToast();

  const { chats, user, setChats } = ChatState();
  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      return setSearchResults([]);
    }
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`https://yogahub-nodebackend-587807f134e2.herokuapp.com/api/user?search=${search}`, config);
      //console.log(data);
      setSearchResults(data);
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
    }
  };

  const handleSubmit = async () => {
    if (!groupChatName || selectedUsers.length === 0) {
      toast({
        title: "Error",
        description: "Please fill out all fields",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        "https://yogahub-nodebackend-587807f134e2.herokuapp.com/api/chat/groupchat",
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );
      setChats([data, ...chats]); //add new chat to chats to the top
      onClose();
      toast({
        title: "Success",
        description: "Group chat created",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const handleGroupChat = (userAdd) => {
    if (selectedUsers.includes(userAdd)) {
      toast({
        title: "Error",
        description: "User already added",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setSelectedUsers([...selectedUsers, userAdd]); //add user to selected users
  };

  const handleDelete = (userDelete) => {
    setSelectedUsers(
      selectedUsers.filter((selected) => selected._id !== userDelete._id)
    );
  };

  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent borderRadius="18px"
      boxShadow="0 2px 10px rgba(0, 0, 0, 0.5)">
          <ModalHeader
            fontSize={{ base: "1.5rem", md: "2rem" }}
            d="flex"
            justifyContent="center"
            fontFamily="Work sans"
            textAlign="center"
          >
            Create Group Chat
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody fontFamily="Work sans" d="flex" flexDir="column" alignItems="center">
            <FormControl>
              <Input
                placeholder="Name"
                mb={3}
                onChange={(e) => setGroupChatName(e.target.value)}
                fontFamily="Work sans"
              />
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add Users"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
                fontFamily="Work sans"
              />
            </FormControl>
            <Box fontFamily="Work sans" w="100%" d="flex" flexWrap="wrap" justifyContent="center">
              {selectedUsers.map((user) => (
                <UserBadge
                  key={user._id}
                  user={user}
                  handleFunction={() => handleDelete(user)}
                />
              ))}
            </Box>
            {loading ? (
              <div>loading</div>
            ) : (
              searchResults
                ?.slice(0, 5)
                .map((user) => (
                  <UserList
                    key={user._id}
                    user={user}
                    handleFunction={() => handleGroupChat(user)}
                  />
                ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button width="100%" colorScheme="blue" onClick={handleSubmit} fontFamily="Work sans" backgroundColor="#0C301F"  _hover={{ bg: "#1E4D38" }}>
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatM;
