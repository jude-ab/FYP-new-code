import React, { useState } from "react";
import { List, ListItem, Flex, Box, Text, Image, Modal, ModalContent, ModalOverlay, ModalHeader, useDisclosure, ModalCloseButton, ModalBody } from "@chakra-ui/react";
import SidePopUp from "../components/Mcomponents/SidePopUp";
// Import images
import frustratedImg from "../assets/images/frustrated.png";
import sadImg from "../assets/images/sad.png";
import anxiousImg from "../assets/images/anxiety.png";
import happyImg from "../assets/images/happy.png";
import backgroundImage from '../assets/images/yoga1.png';

const Mood = () => {
  const [recommendations, setRecommendations] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

   async function fetchRecommendations(data) {
    try {
      const response = await fetch("/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      setRecommendations(result);
    } catch (error) {
      console.error("error fetching recommendations:", error);
    }
  }

  async function saveUserMood(moodData) {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  if (!userInfo || !userInfo.token) {
    console.error("No user token found, user might not be logged in");
    return;
  }

  const token = userInfo.token;

  try {
    const response = await fetch("/api/user/moods", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // Include the token in the authorization header
      },
      body: JSON.stringify(moodData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      const data = await response.json();
      console.log('Mood saved:', data);
    }
  } catch (error) {
    console.error("error saving user mood:", error);
  }
}

  function handleMoodClick(mood) {
    // Retrieve user data from local storage
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (!userInfo) {
      console.error("No user info found, user might not be logged in");
      return;
    }

    const userId = userInfo._id; // Assuming the user's ID is stored in the _id field
    const moodData = { userId, mood };
    fetchRecommendations(moodData);
    saveUserMood(moodData);
    onOpen();
  }

  return (
    <Box position="relative" width="100vw" height="100vh">
      <Box
        position="absolute"
        top={0}
        right={0}
        bottom={0}
        left={0}
        backgroundImage={`url(${backgroundImage})`}
        backgroundSize="cover"
        backgroundPosition="center"
        backgroundRepeat="no-repeat"
        filter="blur(3px)" // Apply blur to just the background image
        zIndex={-1}
      />
      <SidePopUp />
      <Flex
        direction="column"
        alignItems="center"
        justifyContent="flex-start"
        width="100vw"
        pt="2rem"
      >
        <Text as='b' fontSize="4xl" mb="2rem" mt="8rem">How Are You Feeling Today ...</Text>
        {/* Button container */}
        <Flex
          direction="row"
          mb="4rem"
          alignItems="center"
          justifyContent="center"
          width="100%"
        >
          <Flex
            direction="row"
            alignItems="center"
            justifyContent="center"
            wrap="wrap"
          >
            <Box textAlign="center" mx="2rem" my="1rem">
              <Image
                src={frustratedImg}
                boxSize="100px"
                objectFit="cover"
                onClick={() => handleMoodClick("frustrated")}
                cursor="pointer"
              />
              <Text mt="1rem">Frustrated</Text>
            </Box>
            <Box textAlign="center" mx="2rem" my="1rem">
              <Image
                src={sadImg}
                boxSize="100px"
                objectFit="cover"
                onClick={() => handleMoodClick("sad")}
                cursor="pointer"
              />
              <Text mt="1rem">Sad</Text>
            </Box>
            <Box textAlign="center" mx="2rem" my="1rem">
              <Image
                src={anxiousImg}
                boxSize="100px"
                objectFit="cover"
                onClick={() => handleMoodClick("anxious")}
                cursor="pointer"
              />
              <Text mt="1rem">Anxious</Text>
            </Box>
            <Box textAlign="center" mx="2rem" my="1rem">
              <Image
                src={happyImg}
                boxSize="100px"
                objectFit="cover"
                onClick={() => handleMoodClick("happy")}
                cursor="pointer"
              />
              <Text mt="1rem">Happy</Text>
            </Box>
          </Flex>
        </Flex>
      </Flex>
      <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered>
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>Recommended Yoga Poses</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      <Flex wrap="wrap" justify="center">
      <List spacing={3}>
              {recommendations.map((recommendation, index) => (
                <ListItem key={index}>{recommendation}</ListItem>
              ))}
            </List>
      </Flex>
    </ModalBody>
  </ModalContent>
  </Modal>
  </Box>
  );
};

export default Mood;