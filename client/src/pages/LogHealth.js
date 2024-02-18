import React from 'react';
import { Box, Button, Image, Center } from '@chakra-ui/react';
import SidePopUp from "../components/Mcomponents/SidePopUp";
import moodimage from '../assets/images/mood.png';
import statimage from '../assets/images/statscartoon.png';
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
      <Center>
        <Box
          width="34.2%"
          textAlign="center"
          p={3} // Adjusted padding
          borderRadius="4%"
          borderWidth="1%"
          borderColor="white"
          background="rgba(255, 255, 255, 0.9)"
          mt="10%" // Adjusted margin-top
          shadow="md"
          marginRight="5%"        
        >
          <Image src={moodimage} borderRadius="md" mb={1} objectFit="cover" />
          <Button mt={3} onClick={() => history.push('/logMood')}>
            Log Mood
          </Button>
        </Box>
         <Box
          width="35%"
          textAlign="center"
          p={3} // Adjusted padding
          borderRadius="4%"
          borderWidth="1%"
          borderColor="white"
          background="rgba(255, 255, 255, 0.9)"
          mt="10%" // Adjusted margin-top 
          shadow="md"        
        >
          <Image src={statimage} borderRadius="md" mb={4} objectFit="cover" />
          <Button  mt={1} onClick={() => history.push('/moodStats')}>
            Mood Stats
          </Button>
        </Box>
      </Center>
    </Box>
  );
};

export default LogHealth;
