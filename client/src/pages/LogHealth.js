import React from 'react';
import { Box, Button, Image, Center, VStack, Flex } from '@chakra-ui/react';
import SidePopUp from "../components/Mcomponents/SidePopUp";
import moodimage from '../assets/images/dalle.png';
import statimage from '../assets/images/dallestats.png';
import logimage from '../assets/images/yogastat.png';
import { useHistory } from "react-router-dom";

const LogHealth = () => {
  const history = useHistory();

  const semiCircleStyleLeft = {
  overflow: 'hidden',
  borderRadius: '240px 240px 0 0px', // Top-left and bottom-left corners are rounded
  height: '250px',
  width: '500px',
  bg:"rgba(12, 48, 31, 0.5)",
  borderWidth: '1px',
  borderColor: 'white',
  position: 'relative',
  marginLeft: '-23%',
  marginTop: '5%',
  border: '0.1px black',
};

  const semiCircleStyleRight = {
    overflow: 'hidden',
    borderRadius: '0 0 240px 240px', // Top-right and bottom-right corners are rounded
    height: '250px',
    width: '500px',
    bg: 'rgba(255, 255, 255, 0.95)',
    borderWidth: '1px',
    borderColor: 'white',
    position: 'relative',
    marginLeft: '25%',
    marginTop: '-2%',
    border: '0.1px black',
  };

  const imageSemiCircleStyleLeft = {
  position: 'absolute',
    // left: '0',
  marginLeft: '10%', // Center the image
  top: '50%',
  transform: 'translateY(-50%)',
  width: '400px', // Slightly smaller than the container
  height: '195px', // Half the width to maintain the aspect ratio
  borderRadius: '300px 300px 0 0', // Semi-circle shape
  objectFit: 'cover', // Cover the shape without stretching
  border: '8px solid white', // Optional, adds a border to separate image from the background
  marginTop: '-1%',
};

  const imageSemiCircleStyleRight = {
    ...imageSemiCircleStyleLeft, // Spreading the same styles
    marginRight: '10%', // Center the image
    right: '0',
    borderRadius: '0 0 260px 260px', // Semi-circle shape on the opposite side
    marginTop: '1%',
  };


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
        filter="blur(3px)"
        zIndex={-1}
      />
      <SidePopUp />
      <VStack spacing={10} alignItems="center" justifyContent="center" height="100vh">
        <Box
          style={semiCircleStyleLeft}
          bg="rgba(12, 48, 31, 0.5)"
        >
          <Image
            style={imageSemiCircleStyleLeft}
            src={moodimage}
            alt="Mood"
          />
          <Button
            marginLeft={{ base: "0", md: "40%" }}
            marginTop={{ base: "0", md: "42.5%" }}
            onClick={() => history.push('/logMood')}
            background="transparent"
            fontFamily="Work Sans"
          >  
            Log Mood
          </Button>
      </Box>

        <Box
          style={semiCircleStyleRight}
          bg="rgba(12, 48, 31, 0.5)"
        >
        <Image style={imageSemiCircleStyleRight} src={statimage} alt="Stats" />
          <Button
            onClick={() => history.push('/moodStats')}
            background="transparent"
            marginLeft={{ base: "0", md: "38%" }}
            fontFamily="Work Sans"
          >
            Mood Stats
          </Button>
      </Box>
    </VStack>
    </Box>
  );
};


export default LogHealth;
