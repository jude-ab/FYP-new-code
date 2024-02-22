import React from 'react';
import { Box, Button, Image, Center, VStack } from '@chakra-ui/react';
import SidePopUp from "../components/Mcomponents/SidePopUp";
import moodimage from '../assets/images/mh4.png';
import statimage from '../assets/images/s9.png';
import logimage from '../assets/images/yogastat.png';
import { useHistory } from "react-router-dom";

const LogHealth = () => {

  const history = useHistory();

  return (
    <Box position="relative" width="100vw" height="100vh" overflowY="auto">
      <Box
        position="absolute"
        top={0}
        right={0}
        bottom={0}
        left={0}
        backgroundImage={`url(${logimage})`}
        backgroundSize="cover"
        backgroundPosition="center"
        backgroundRepeat="no-repeat"
        filter="blur(3px)" // Apply blur to just the background image
        zIndex={-1}
      />
      <SidePopUp />
      <VStack marginTop="7%" marginLeft="3%" >
       <Box
        width="60%"
        textAlign="center"
        borderRadius="20px"
        borderWidth="1%"
        borderColor="white"
        background="rgba(255, 255, 255, 0.95)"
        shadow="md"
        marginRight="5%"
        display="flex"
        flexDirection="row" // Align items horizontally
        alignItems="center" // Center items vertically
        maxHeight="250px"
        >
        <Image borderRadius="20px" maxHeight="230px" src={moodimage} m={2} width="70%" />
        <Button
            colorScheme="#0C301F"
            variant='ghost'
            width={{ base: "300px", md: "350px" }} // Responsive width
            _hover={{ bg: '#ebedf0' }}
            fontFamily="Work sans"
            ml={3} // Add left margin to separate the image and the button
            fontSize="15px" 
            height={{ base: "400px", md: "200px" }}
            marginLeft="3%" 
            onClick={() => history.push('/logMood')}    
        >
            Log Mood
        </Button>
        </Box>
        <Box
        width="60%"
        textAlign="center"
        borderRadius="20px"
        borderWidth="1%"
        borderColor="white"
        background="rgba(255, 255, 255, 0.95)"
        shadow="md"
        display="flex"
        flexDirection="row" // Align items horizontally
        alignItems="center" // Center items vertically
        maxHeight="250px"
        marginRight="5%"
        mt="2.5%" // Add top margin to separate the two boxes
        >
        <Image borderRadius="20px" maxHeight="230px" src={statimage} m={2} width="100%"/>
        <Center>        
        <Button
            onClick={() => history.push('/moodStats')}
            colorScheme="#0C301F"
            variant='ghost'
            width={{ base: "300px", md: "350px" }} // Responsive width
            _hover={{ bg: '#ebedf0' }}
            fontFamily="Work sans"
            ml={3} // Add left margin to separate the image and the button
            fontSize="15px" 
            height={{ base: "400px", md: "200px" }}
            marginLeft="3%"          
        >
            Mood Stats
        </Button>
        </Center>
        </Box>
      </VStack>
    </Box>
  );
};

export default LogHealth;
