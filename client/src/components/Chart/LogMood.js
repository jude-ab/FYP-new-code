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
  HStack
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
    
  const [todaysMoods, setTodaysMoods] = useState([]);

  const storedUserInfo = localStorage.getItem("userInfo");
  const userInfo = storedUserInfo ? JSON.parse(storedUserInfo) : null;
    
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
      // After successfully saving the mood, fetch today's moods again to update the table
      fetchTodaysMoods();
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

  // Save the mood
  saveUserMood(moodData);
}

function handleGetRecommendations(mood) {
  // Fetch recommendations based on the mood
  const moodData = { mood };
  fetchRecommendations(moodData);
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
    
const fetchTodaysMoods = async () => {
  const today = new Date().toISOString().split('T')[0];
  const response = await fetch(`/api/user/${userInfo._id}/moods?date=${today}`, {
    headers: {
      "Authorization": `Bearer ${userInfo.token}`,
    },
  });

  if (response.ok) {
    const moodsFromApi = await response.json();
    console.log('Moods from API:', moodsFromApi); // Check what's coming from the API

    const todaysMoodsFromApi = moodsFromApi.filter(mood => {
      const moodDate = new Date(mood.date).toISOString().split('T')[0];
      return moodDate === today;
    });

    console.log('Today\'s moods:', todaysMoodsFromApi); // Check the filtered moods
    setTodaysMoods(todaysMoodsFromApi);
  } else {
    console.error('Failed to fetch today\'s moods');
  }
};
    
    useEffect(() => {
  fetchTodaysMoods();
}, []); // Empty dependency array means this effect runs only once after the initial render

    
const deleteMood = async (moodId) => {
  console.log(`Deleting mood with ID: ${moodId}`); 
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  if (!userInfo || !userInfo.token) {
    console.error("No user token found, user might not be logged in");
    return;
  }

  try {
    const response = await fetch(`/api/user/moods/${moodId}`, {
      method: 'DELETE',
      headers: {
        "Authorization": `Bearer ${userInfo.token}`, // Include the token in the authorization header
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to delete mood:', errorData.message);
      alert(`Error deleting mood: ${errorData.message}`); // Display error message to the user
      return;
    }

    // Remove the mood from the state if deletion was successful
    setTodaysMoods(currentMoods => currentMoods.filter(mood => mood._id !== moodId));
  } catch (error) {
    console.error('Error deleting mood:', error);
    alert('Error deleting mood. Please try again.'); // Fallback error message
  }
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
        filter="blur(3px)"
        zIndex={-1}
      />
      <Flex marginTop="4%"justifyContent="center" alignItems="center" flexDirection="column">
        <SidePopUp />
        <Text fontSize="3xl" my="4" fontFamily="Work sans" fontWeight="bold" textAlign="center">
          How are you feeling today?
        </Text>
         <Text fontSize="xl"  fontFamily="Work sans" fontWeight="bold" textAlign="center">
          Based on how you're currently feeling, we will keep track of your mood and recommend yoga poses tailored just for you! 
        </Text>          
        <Text fontSize="xl"  fontFamily="Work sans" fontWeight="bold" textAlign="center">
            Check Mood Stats to see how you've been feeling over time, and to get health plan recommendations.
        </Text>        
        <Flex
            direction="row" // Stack children vertically
            align="center" // Center children horizontally
            justify="center" // Center children vertically
            height="100vh" // Full viewport height
            width="100vw" // Full viewport width
            position="relative" // For absolutely positioned children
            marginTop="-17%"
            marginLeft="9%"        
        >
         {[{ src: happyImg, mood: "happy" }, { src: sadImg, mood: "sad" }, { src: anxiousImg, mood: "anxious" }, { src: frustratedImg, mood: "frustrated" }]
    .map(({ src, mood }) => (
      <Box key={mood} textAlign="center" mx="1rem" my="0.5rem">
        <Image src={src} boxSize="100px" objectFit="cover" cursor="pointer" onClick={() => handleMoodClick(mood)} />
        <Text fontFamily="Work sans" mt="1rem">{mood.charAt(0).toUpperCase() + mood.slice(1)}</Text>
         <Button
            fontFamily="Work sans"
            borderRadius="13px"
            onClick={() => handleGetRecommendations(mood)} 
            marginLeft="-45%"
            marginTop="-20%"
        >
            Get Recommendations
        </Button>   
        </Box>
        
        ))}
                
        </Flex>
        </Flex>
        <Box background="rgba(255, 255, 255, 0.7)" width="50%" padding={4} boxShadow="lg" borderRadius="15px" marginLeft="25%" marginBottom="3%" marginTop="-15%">
        <VStack>
            {todaysMoods.length > 0 ? (
            todaysMoods.map((mood) => (
                <HStack key={mood._id} width="full" justifyContent="space-between">
                <Text>{mood.mood}</Text>
                <Button onClick={() => deleteMood(mood._id)}>Delete</Button>
                </HStack>
            ))
            ) : (
            <Text>No moods logged for today.</Text>
            )}
        </VStack>
        </Box>
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
