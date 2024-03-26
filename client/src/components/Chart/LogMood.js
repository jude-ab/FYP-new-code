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
  HStack,
  IconButton,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import frustratedImg from '../../assets/images/lightning.png';
import sadImg from '../../assets/images/rain (4).png';
import anxiousImg from '../../assets/images/hurricane.png';
import happyImg from '../../assets/images/sun (2).png';
import { useState, useEffect } from 'react';
import backgroundImage from '../../assets/images/log.png';
import SidePopUp from "../Mcomponents/SidePopUp";
import { DeleteIcon } from "@chakra-ui/icons";

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
    
  const [todaysMoods, setTodaysMoods] = useState([]);

  const storedUserInfo = localStorage.getItem("userInfo");
  const userInfo = storedUserInfo ? JSON.parse(storedUserInfo) : null;
    
  // Fetch recommendations based on the user's mood
  async function fetchRecommendations(moodData) {
    try {
      const response = await fetch("/recommend", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moods: moodData.mood }),
      });
      const result = await response.json();
      setRecommendationsM(result); 
      onMoodModalOpen(); 
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  }

  // Save the user's mood to the database       
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
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(moodData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      const data = await response.json();
      console.log('Mood saved:', data);
      
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

// const handleMoreInfo = async (poseId) => {
//   console.log('Clicked poseId:', poseId);
//   try {
//     const response = await fetch(`http://localhost:4000/api/yoga/poses/${poseId}`);
//     if (!response.ok) {
//       throw new Error('Network response was not ok');
//     }
//     const poseDetails = await response.json();
//     console.log('Pose details:', poseDetails); // Ensure this logs expected details
//     setSelectedPose(poseDetails);
//     onPoseDetailsOpen(); // Ensure this is being called
//   } catch (error) {
//     console.error('Error fetching pose details:', error);
//   }
// };

     async function fetchYogaPoses() {
  try {
    const response = await fetch('https://yogahub-python-c7c68bb19801.herokuapp.com/api/yoga/poses'); 
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
  
const renderPoseDetailsAccordion = (pose) => (
  <Accordion allowToggle>
    <AccordionItem>
      <h2>
        <AccordionButton>
          <Box flex="1" textAlign="left">
            More Information
          </Box>
          <AccordionIcon />
        </AccordionButton>
      </h2>
      <AccordionPanel pb={5}>
        {pose?.Description && <Text mb={2}>Description: {pose.Description}</Text>}
        {pose?.Benefits && <Text mb={2}>Benefits: {pose.Benefits}</Text>}
        {pose?.Breathing && <Text mb={2}>Breathing: {pose.Breathing}</Text>}
        {pose?.ImagePath && (
          <Image src={`http://localhost:4001/${pose.ImagePath}`} alt={pose.AName} />
        )}
      </AccordionPanel>
    </AccordionItem>
  </Accordion>
);


    return (
  <Box position="relative" width="100vw" height="100vh" overflowY="auto" mt="50px">
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      backgroundImage={`url(${backgroundImage})`}
      backgroundSize="cover"
      backgroundPosition="center"
      backgroundRepeat="no-repeat"
      filter="blur(3px)"
      zIndex="-1"
    />
    <SidePopUp />
        <VStack
         
          spacing="12px" paddingTop="100px" alignItems="center" marginLeft={{ base: "2%", md: "0.5%" }} marginTop={{ base: "-20%", md: "-5%" }} >
      <Text fontFamily="Work sans" fontSize="2xl" fontWeight="bold" textAlign="center" paddingX="2">
        How are you feeling today?
      </Text>
      <Text fontSize="xl" fontFamily="Work sans" color="black" textAlign="center">
        Based on how you're feeling, you can get yoga recommendations. We will also keep track of your mood and recommend health plans tailored just for you!
      </Text>
      <Text fontSize="xl" fontFamily="Work sans" color="black" textAlign="center">
        Just click on the mood you're feeling right now.
      </Text>
      <Text fontSize="xl" fontFamily="Work sans" color="black" textAlign="center">
        Check Mood Stats to see how you've been feeling over time and to get health plan recommendations.
      </Text>
      <Flex
            wrap="wrap" // Allow items to wrap in smaller screens
            justify="center" // Center items horizontally
            align="center" // Center items vertically
            fontWeight="bold"
            marginTop={{ base: "4%", md: "1%" }}         
>
  {[{ src: happyImg, mood: "happy" }, { src: sadImg, mood: "sad" }, { src: anxiousImg, mood: "anxious" }, { src: frustratedImg, mood: "frustrated" }]
    .map(({ src, mood }) => (
      <Flex
        key={mood}
        direction="column" // Stack items vertically
        align="center" // Center items horizontally
        m="2" // Margin for spacing between items
        textAlign="center"
      >
        <Image
          src={src}
          boxSize={["70px", "90px", "100px"]} // Responsive sizes
          objectFit="cover"
          cursor="pointer"
          onClick={() => handleMoodClick(mood)}
        />
        <Text
          fontFamily="Work sans"
          mt="1rem"
          fontSize={["sm", "md"]} // Responsive font size
        >
          {mood.charAt(0).toUpperCase() + mood.slice(1)}
        </Text>
        <Button
          fontFamily="Work sans"
          borderRadius="13px"
          onClick={() => handleGetRecommendations(mood)}
          size="sm" // Smaller button size for all screens, adjust as needed
          mt="2"
          _hover={{ bg: "#1E4D38" }}
          backgroundColor="#0C301F"
          color='white'
          width="full" // Button width to match the flex container width
        >
          Get Recommendations
        </Button>
      </Flex>
    ))}
</Flex>

    </VStack>
        <Box background="rgba(255, 255, 255, 0.7)" width="60%" padding={4} boxShadow="lg" borderRadius="15px" marginLeft={{ base: "20%", md: "20%" }} marginBottom={{ base: "18%", md: "5%" }}  marginTop="3%">
      <VStack>
        {todaysMoods.length > 0 ? (
          todaysMoods.map((mood) => (
            <HStack key={mood._id} width="full" justifyContent="space-between">
              <Text>{mood.mood}</Text>
              <IconButton
                aria-label="Delete Mood"
                icon={<DeleteIcon />}
                onClick={() => deleteMood(mood._id)}
                background="transparent"
              />
            </HStack>
          ))
        ) : (
          <Text>No moods logged for today.</Text>
        )}
      </VStack>
    </Box>
    <Modal isOpen={isMoodModalOpen} onClose={onMoodModalClose}>
      <ModalOverlay />
      <ModalContent maxW="4xl">
        <ModalHeader fontFamily="Work sans" textAlign="center">Your Yoga Recommendations</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <SimpleGrid columns={[1, 2]} spacing={5}>
            {paginatedPoses.map((poseName, index) => {
              const pose = yogaPoses.find(p => p.AName === poseName);
              if (!pose) return null;
              return (
                <Box key={index} p={5} shadow="md" borderWidth="1px" borderRadius="md" position="relative" rounded="md" height="100%">
                  <VStack spacing={4} align="stretch" height="100%">
                    <Text fontFamily="Work sans" fontWeight="bold">{pose?.AName}</Text>
                    <Text fontFamily="Work sans" noOfLines={1}>Level: {pose?.Level}</Text>
                    <Spacer />
                    {renderPoseDetailsAccordion(pose)}
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
  </Box>
);



}

export default LogMood
