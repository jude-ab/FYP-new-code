import React from 'react';
import { Box, Button, Image, Text, VStack, Flex } from '@chakra-ui/react';
import SidePopUp from "../components/Mcomponents/SidePopUp";
import moodimage from '../assets/images/sun2.png';
import statimage from '../assets/images/mooncute.png';
// import logimage from '../assets/images/yogastat.png';
import logimage from '../assets/images/log6.jpg';
import { useHistory } from "react-router-dom";

const LogHealth = () => {
  const history = useHistory();

  const semiCircleStyleLeft = {
  overflow: 'hidden',
  borderRadius: '240px 240px 5px 5px', // Top-left and bottom-left corners are rounded
  height: '250px',
  width: '500px',
  bg:"rgba(12, 48, 31, 0.5)",
  borderWidth: '1px',
  borderColor: 'white',
  position: 'relative',
  marginLeft: '-23%',
  marginTop: '5%',
  border: '0.1px black',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.6)',
};

  const semiCircleStyleRight = {
    overflow: 'hidden',
    borderRadius: '5px 5px 240px 240px', // Top-right and bottom-right corners are rounded
    height: '250px',
    width: '500px',
    bg: 'rgba(255, 255, 255, 0.95)',
    borderColor: 'white',
    position: 'relative',
    marginLeft: '25%',
    marginTop: '-2%',
    border: '0.1px black',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.6)',
  };

  const imageSemiCircleStyleLeft = {
  position: 'absolute',
  marginLeft: '0%', // Center the image
  top: '50%',
  transform: 'translateY(-50%)',
  width: '600px', // Slightly smaller than the container
  height: '280px', // Half the width to maintain the aspect ratio
  borderRadius: '300px 300px 5px 5px', // Semi-circle shape
  objectFit: 'cover', // Cover the shape without stretching
  marginTop: '%',
};

  const imageSemiCircleStyleRight = {
    ...imageSemiCircleStyleLeft, // Spreading the same styles
    marginRight: '0%', // Center the image
    right: '0',
    borderRadius: '5px 5px 260px 260px', // Semi-circle shape on the opposite side
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
        transform="scaleX(-1)"
      />
      <SidePopUp />
      <VStack spacing={10} alignItems="center" justifyContent="center" height="100vh">
        <Button
          style={semiCircleStyleLeft}
          // bg="rgba(12, 48, 31, 0.5)"
          bg="rgba(255, 255, 255, 0.9)"
          onClick={() => history.push('/logMood')}
        >
          <Image
            style={imageSemiCircleStyleLeft}
            src={moodimage}
            alt="Mood"
          />
        </Button>
        <Text
            position="absolute"
            bottom={{ base: "81.5%", md: "83%" }}
            left={{ base: "27%", md: "35.5%" }}
            fontSize="xl"
            cursor="pointer"
            onClick={() => history.push('/logMood')}
            fontFamily="Work Sans"
            _hover={{ bg: "transparent" }}
            fontWeight={{ base: "bold", md: "500" }}
          >  
            Log Mood
          </Text>

        <Button
          style={semiCircleStyleRight}
          bg="rgba(255, 255, 255, 0.9)"
          onClick={() => history.push('/moodStats')}
        >
        <Image style={imageSemiCircleStyleRight} src={statimage} alt="Stats" />
          
        </Button>
        <Text
            position="absolute"
            bottom={{ base: "13%", md: "2%" }}
            left={{ base: "47%", md: "58.5%" }}
            fontSize="xl"
            cursor="pointer"
            onClick={() => history.push('/moodStats')}
            fontFamily="Work Sans"
            fontWeight={{ base: "bold", md: "500" }}
          >
            Mood Stats
          </Text>
    </VStack>
    </Box>
  );
};


export default LogHealth;
