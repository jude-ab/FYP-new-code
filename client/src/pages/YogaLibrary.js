import React from "react";
import {
  Box, Image, Button,
  Text, VStack,
} from "@chakra-ui/react";
import SidePopUp from "../components/Mcomponents/SidePopUp";
import backgroundImage from '../assets/images/yoga1.png';
import { useHistory } from "react-router-dom";
import beginnerimage from '../assets/images/beginneraes.png';
import intermediateImage from '../assets/images/intermediate.png';
import advancedImage from '../assets/images/advance.png';

const YogaLibrary = () => {
  const history = useHistory();

  const navigateToPoses = (level) => {
    history.push(`/poses/${level}`);
  };

  return (
    <Box height="100vh" overflowY="auto">
      <Box position="relative" width="100vw">
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
        <VStack
          spacing={8} // Adjust the space between boxes
          align="center"
          justify="center"
          mt="10"
        >
          {/* Box for Beginner level */}
          <Box
            width="45%" // Adjust the width as necessary
            textAlign="center"
            p={5}
            borderRadius="sm"
            borderWidth="1%"
            borderColor="white"
            backgroundColor="white"
            marginTop="2%"
            marginLeft="-45%"
          > 
            <Image src={beginnerimage} borderRadius="md" mb={4} objectFit="cover" />
            <Box height="60px" backgroundColor="white" />
            <Button
              onClick={() => navigateToPoses('beginner')}
              colorScheme="#0C301F"
              marginTop={{ base: "-11%", md: "-8%" }} // Responsive marginTop
              variant='outline'
              width={{ base: "80%", md: "auto" }} // Responsive width
              _hover={{ bg: '#ebedf0' }}
              fontFamily="Work sans"
            >
              Beginner Poses
            </Button>
          </Box>
          {/* Box for Intermediate level */}
          <Box
            width="45%" // Adjust the width as necessary
            textAlign="center"
            p={5}
            borderRadius="md"
            borderWidth="1px"
            borderColor="white"
            backgroundColor="white"
            marginTop="-2.4%"
            marginRight="-45%"
          >
            <Image src={intermediateImage} borderRadius="md" mb={4} objectFit="cover" />
            <Box height="40px" backgroundColor="white" /> {/* Adjusted height */}
            <Button
              onClick={() => navigateToPoses('intermediate')}
              colorScheme="#0C301F"
              marginTop={{ base: "-3%", md: "-5%" }} // Responsive marginTop
              variant='outline'
              width={{ base: "80%", md: "auto" }} // Responsive width
              _hover={{ bg: '#ebedf0' }}
              fontFamily="Work sans"
            >
              Intermediate Poses
            </Button>
          </Box>
          {/* Box for Advanced level */}
          <Box
            width="45%" // Adjust the width as necessary
            textAlign="center"
            p={5}
            borderRadius="md"
            borderWidth="1px"
            borderColor="white"
            backgroundColor="white"
            marginTop="-2.4%"
            marginLeft="-44.5%"
          >
            <Image src={advancedImage} borderRadius="md" mb={4} objectFit="cover" />
            <Box height="40px" backgroundColor="white" /> {/* Adjusted height */}
            <Button
              onClick={() => navigateToPoses('advanced')}
              colorScheme="#0C301F"
              marginTop={{ base: "-3%", md: "-5%" }} // Responsive marginTop
              variant='outline'
              width={{ base: "80%", md: "auto" }} // Responsive width
              _hover={{ bg: '#ebedf0' }}
              fontFamily="Work sans"
            >
              Advanced Poses
            </Button>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};

export default YogaLibrary;
