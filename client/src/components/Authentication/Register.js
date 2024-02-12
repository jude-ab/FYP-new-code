import React from "react";
import {
  VStack,
  FormControl,
  FormLabel,
  InputGroup,
  InputRightElement,
  Button,
  IconButton,
  Text
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { Input, useToast } from "@chakra-ui/react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { ChatState } from "../../Providers/ChatP";
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

const Register = () => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const toast = useToast();
  const history = useHistory();

  const [username, setUsername] = useState();
  const [password, setPassword] = useState();
  const [passwordCheck, setPasswordCheck] = useState();
  const [email, setEmail] = useState();
  const [pfp, setPfp] = useState();
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const { updateUser } = ChatState();

  const submitHandler = async () => {
    setLoading(true);
    if (!username || !password || !passwordCheck || !email) {
      toast({
        title: "Error",
        description: "Please fill all the fields",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      setLoading(false);
      return;
    }
    if (password !== passwordCheck) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    console.log(username, password, email, pfp);

    // Check if the email is valid or not
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const { data } = await axios.post(
        "/api/user",
        { username, password, email, pfp },
        config
      );
      console.log(data);
      toast({
        title: "Success",
        description: "User registered successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      updateUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setIsRegistered(true);
    } catch (error) {
      console.error(error);
      const errorMessage = error.response?.data?.message || "An error occurred";

      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isRegistered) {
      console.log("Redirecting to /chats...");
      history.push("/chats");
    }
  }, [isRegistered, history]);

  const postDetails = (pfp) => {
    setLoading(true);
    if (pfp === undefined) {
      toast({
        title: "Error",
        description: "Please upload a profile picture",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    console.log(pfp);
    if (pfp.type === "image/jpeg" || pfp.type === "image/png") {
      const data = new FormData();
      data.append("file", pfp);
      data.append("upload_preset", "chat-app");
      data.append("cloud_name", "ddoxolplz");
      fetch("https://api.cloudinary.com/v1_1/ddoxolplz/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setPfp(data.url.toString());
          setLoading(false); // set loading to false once the image is uploaded
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    } else {
      toast({
        title: "Error",
        description: "Please upload an image file",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      setLoading(false);
      return;
    }
  };

  return (
    <VStack spacing="5px">
      <FormControl id="firstName" isRequired marginLeft="74%" marginTop="0%">
        <FormLabel fontSize="sm" fontFamily="Work sans">Name</FormLabel>
        <Input
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
          bg="#f8f8ff"
          width='90%'
          size="sm"
          borderRadius="md" // Set rounded corners
        />
      </FormControl>
      <FormControl id="userEmail" isRequired  marginLeft="74%">
        <FormLabel fontSize="sm" fontFamily="Work sans">Email Address</FormLabel>
        <Input
          placeholder="Email Address"
          onChange={(e) => setEmail(e.target.value)}
          bg="#f8f8ff"
          width='90%'
          size="sm"
          borderRadius="lg" // Set rounded corners
        />
      </FormControl>
      <FormControl id="userPassword" isRequired width="90%" marginLeft="64%">
      <FormLabel fontSize="sm" fontFamily="Work sans">Password</FormLabel>
      <InputGroup>
        <Input
          type={show ? "text" : "password"}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          bg="#f8f8ff"
          size="sm"
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
            marginBottom="12%" 
            marginLeft="30%"   
          />
        </InputRightElement>
      </InputGroup>
    </FormControl>
      <FormControl id="userPassword" isRequired width="90%" marginLeft="64%">
        <FormLabel fontSize="sm" fontFamily="Work sans">Confirm Password</FormLabel>
        <InputGroup>
        <Input
          type={show ? "text" : "password"}
          placeholder="Confirm Password"
          onChange={(e) => setPasswordCheck(e.target.value)}
          bg="#f8f8ff"
          size="sm"
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
            marginBottom="12%" 
            marginLeft="30%"  
          />
        </InputRightElement>
      </InputGroup>
      </FormControl>
      <FormControl id="userPfp" marginLeft="74%">
        <FormLabel fontSize="sm" fontFamily="Work sans">Profile Picture</FormLabel>
        <Input
          type="file"
          p={0}
          accept="image/*"
          onChange={(e) => postDetails(e.target.files[0])}
          bg="#f8f8ff"    
          width='90%'
          size="sm"
          borderRadius="lg" // Set rounded corners
        />
      </FormControl>
      <Button
        width="40%"
        height={8}
        marginTop={4}
        backgroundColor="#0C301F"
        color="white"
        _hover={{ bg: "#1E4D38" }}
        onClick={submitHandler}
        isLoading={loading}
        marginLeft="63%"
        fontSize="sm"
        fontFamily="Work sans"
      >
        Sign up
      </Button>
      </VStack>
  );
};

export default Register;
