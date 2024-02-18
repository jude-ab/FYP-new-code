import React from 'react'
import {
  Flex,
  Box,
  Text,
  Image,
  Modal,
  ModalContent,
  ModalOverlay,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  SimpleGrid,
  VStack,
  Spacer,
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import frustratedImg from '../../assets/images/o_frustrated.png';
import sadImg from '../../assets/images/ou_sad.png';
import anxiousImg from '../../assets/images/o_anxious.png';
import happyImg from '../../assets/images/o_happy.png';
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import backgroundImage from '../../assets/images/yoga1.png';
import SidePopUp from "../Mcomponents/SidePopUp";

const CustomModalBody = styled(ModalBody)`
  max-height: 400px;
  overflow-y: auto;
`;

const LogMood = () => {

  const [recommendationsM, setRecommendationsM] = useState([]);
  const { isOpen: isMoodModalOpen, onOpen: onMoodModalOpen, onClose: onMoodModalClose } = useDisclosure();

  const posesPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedPoses, setPaginatedPoses] = useState([]);
  const totalPages = Math.ceil(recommendationsM.length / posesPerPage);
  const [selectedPose, setSelectedPose] = useState(null);
  const { isOpen: isPoseDetailsOpen, onOpen: onPoseDetailsOpen, onClose: onPoseDetailsClose } = useDisclosure();
  const [yogaPoses, setYogaPoses] = useState([]);

  const [scrollBehavior, setScrollBehavior] = React.useState('inside')
    
  async function fetchRecommendations(moodData) {
    try {
      const response = await fetch("/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moods: moodData.mood }),
      });
      const result = await response.json();
      setRecommendationsM(result); // Update the state with the received recommendations.
      onMoodModalOpen(); // Open the modal to display recommendations.
    } catch (error) {
      console.error("Error fetching recommendations:", error);
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
  
    const moodData = { userId: userInfo._id, mood };
    fetchRecommendations(moodData);
    saveUserMood(moodData);
  }

 useEffect(() => {
  const startIndex = (currentPage - 1) * posesPerPage;
  const endIndex = startIndex + posesPerPage;
  setPaginatedPoses(recommendationsM.slice(startIndex, endIndex));
}, [currentPage, recommendationsM, posesPerPage]);

const handleMoreInfo = async (poseId) => {
  console.log('Clicked poseId:', poseId);
  try {
    // Use the new endpoint for fetching by ID
    const response = await fetch(`http://localhost:4000/api/yoga/poses/${poseId}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const poseDetails = await response.json();
    setSelectedPose(poseDetails);
    onPoseDetailsOpen();
  } catch (error) {
    console.error('Error fetching pose details:', error);
  }
};
    
     async function fetchYogaPoses() {
  try {
    const response = await fetch('http://localhost:4000/api/yoga/poses'); 
    if (!response.ok) {
      throw new Error('Failed to fetch yoga poses');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching yoga poses:', error);
    return [];
  }
  }
  
   // Fetch yoga poses when the component mounts
  useEffect(() => {
  // Fetch yoga poses when the component mounts
  async function fetchData() {
    const fetchedYogaPoses = await fetchYogaPoses();
    console.log(fetchedYogaPoses); // Log to inspect the data structure
    setYogaPoses(fetchedYogaPoses);
  }

  fetchData();
  }, []);
    
const handlePrevPage = () => {
  setCurrentPage((prev) => Math.max(prev - 1, 1));
};

const handleNextPage = () => {
  setCurrentPage((prev) => Math.min(prev + 1, totalPages));
};
    
    return (
    <Box height="100vh" overflowY="auto">
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
     <Flex direction="column" alignItems="center" width="100%" justifyContent="center" marginRight="57%" marginTop="1%" fontFamily="Work sans" fontWeight="bold">
        <Text fontSize="xl" my="4">How are you feeling today?</Text>
        <Flex direction="row" wrap="wrap" justifyContent="center" width="90%">
        {[{ src: happyImg, mood: "happy" }, { src: sadImg, mood: "sad" }, { src: anxiousImg, mood: "anxious" }, { src: frustratedImg, mood: "frustrated" }]
          .map(({ src, mood }) => (
            <Box key={mood} textAlign="center" mx="1rem" my="0.5rem">
              <Image src={src} boxSize="100px" objectFit="cover" onClick={() => handleMoodClick(mood)} cursor="pointer" />
              <Text mt="1rem">{mood.charAt(0).toUpperCase() + mood.slice(1)}</Text>
            </Box>
          ))}
      </Flex>
    </Flex>
      <Modal isOpen={isMoodModalOpen} onClose={onMoodModalClose} size="4xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontFamily="Work sans" textAlign="center">Your Yoga Recommendations</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
         <SimpleGrid columns={[1, 2]} spacing={5}>
          {paginatedPoses.map((poseName, index) => {
            const pose = yogaPoses.find(p => p.AName === poseName); // Find the pose object by name
            if (!pose) return null; // Add a check to ensure pose is defined
            return (
              <Box key={index} p={5} shadow="md" borderWidth="1px" borderRadius="md" position="relative" rounded="md" height="100%">
                <VStack spacing={4} align="stretch" height="100%">
                  <Text fontFamily="Work sans" fontWeight="bold">{pose?.AName}</Text>
                  <Text fontFamily="Work sans" noOfLines={1}>Level: {pose?.Level}</Text>
                  <Spacer /> {/* This pushes the button to the bottom */}
                  <Button
                    size="sm"
                    onClick={() => handleMoreInfo(pose?._id)}
                    backgroundColor="#0C301F"
                    color="white"
                    _hover={{ backgroundColor: "#1E4D38" }}
                    fontFamily="Work sans"
                  >
                    More Information
                  </Button>
                </VStack>
              </Box>
            );
          })}
        </SimpleGrid>
          <Flex justify="space-between" mt={4}>
        <Button bg="transparent" onClick={handlePrevPage} isDisabled={currentPage === 1}>
          &lt; 
        </Button>
        <Text>{`Page ${currentPage} of ${totalPages}`}</Text>
        <Button bg="transparent" onClick={handleNextPage} isDisabled={currentPage === totalPages}>
          &gt;
        </Button>
      </Flex> 
    </ModalBody>
  </ModalContent>
  </Modal>
  <Modal isOpen={isPoseDetailsOpen} onClose={onPoseDetailsClose} size="lg" isCentered scrollBehavior={scrollBehavior}>
  <ModalOverlay />
  <ModalContent>
    <ModalHeader textAlign="center" fontFamily="Work sans">{selectedPose?.AName}</ModalHeader>
    <ModalCloseButton />
    <CustomModalBody fontFamily="Work sans">
    <Text mb={2}>Level: {selectedPose?.Level}</Text>
    <Text mb={2}>Description: {selectedPose?.Description}</Text>
    <Text mb={2}>Benefits: {selectedPose?.Benefits}</Text>
    <Text mb={2}>Breathing: {selectedPose?.Breathing}</Text>
    <Text mb={2}>Awareness: {selectedPose?.Awareness}</Text>
    </CustomModalBody>
  </ModalContent>
</Modal> 
</Box>
  );
}

export default LogMood