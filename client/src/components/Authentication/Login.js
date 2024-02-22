import React from "react";
import {
  VStack,
  FormControl,
  FormLabel,
  InputGroup,
  InputRightElement,
  Button,
  IconButton
} from "@chakra-ui/react";
import { useState } from "react";
import { ChakraProvider, Input, useToast } from "@chakra-ui/react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { ChatState } from "../../Providers/ChatP";
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

const Login = () => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();
  const [loading, setLoading] = useState(false);

  const toast = useToast();
  const history = useHistory();
  const { setUser } = ChatState();

  const submitHandler = async () => {
    setLoading(true);
    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please enter all fields",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const { data } = await axios.post(
        "/api/user/login",
        { username, password },
        config
      );
      toast({
        title: "Success",
        description: "Logged in successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      history.push("/yogaLibrary");
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid credentials",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      setLoading(false);
    }
  };


  return (
    <ChakraProvider>
      <VStack spacing="5px">
        <FormControl id="firstName" isRequired  marginLeft="70%">
          <FormLabel fontSize="sm" fontFamily="Work sans">Name</FormLabel>
          <Input
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
            bg="white"
            width='90%'
            size="sm"
            borderRadius="lg" // Set rounded corners
          />
        </FormControl>
         <FormControl id="userPassword" isRequired width='100%' marginLeft="70%">
          <FormLabel fontSize="sm" fontFamily="Work sans">Password</FormLabel>
          <InputGroup size="sm">
            <Input
              type={show ? "text" : "password"}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              bg="white"
              width='90%'
              borderRadius="lg" // Set rounded corners
            />
            <InputRightElement width="3.5rem">
              <IconButton
                icon={show ? <ViewOffIcon /> : <ViewIcon />}
                h="1.75rem"
                size="sm"
                onClick={handleClick}
                aria-label={show ? "Hide password" : "Show password"}
                variant="unstyled" // Removes the background and border styling
                marginBottom="5%"  
                marginRight="60%"
              />
            </InputRightElement>
          </InputGroup>
        </FormControl>
        <Button
          marginTop={4}
          backgroundColor="#0C301F"
          color="white"
          _hover={{ bg: "#1E4D38" }}
          onClick={submitHandler}
          isLoading={loading}
          width='40%'
          marginLeft="63%"
          fontSize="sm"
          fontFamily="Work sans"
          height={8}
        >
          Sign in
        </Button>
      </VStack>
    </ChakraProvider>
  );
};

export default Login;