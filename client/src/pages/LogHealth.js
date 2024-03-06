import React from 'react';
import { Box, Button, Image, Center, VStack, Flex } from '@chakra-ui/react';
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
        filter="blur(3px)"
        zIndex={-1}
      />
      <SidePopUp />
      <VStack
        marginTop={{ base: "15%", md: "15%" }} // Adjust based on the size of the SidePopUp
        justifyContent="center" // Center items vertically (useful if the content is shorter than 100vh)
        spacing={4} alignItems="flex-start">
        <Flex
          width={{ base: "90%", md: "60%" }}
          direction={{ base: "column", md: "row" }}
          textAlign="center"
          borderRadius="20px"
          borderWidth="1px"
          borderColor="white"
          background="rgba(255, 255, 255, 0.95)"
          shadow="md"
          alignItems="center"
          maxHeight="250px"
          p={3}
        >
          <Image borderRadius="20px" maxHeight="230px" src={moodimage} width={{ base: "70%", md: "50%" }} />
          <Button
            onClick={() => history.push('/logMood')}
            colorScheme="teal"
            variant='ghost'
            size="md"
            flexGrow={1}
            _hover={{ bg: '#ebedf0' }}
            fontFamily="Work sans"
            fontSize={{ base: "md", md: "lg" }}
          >
            Log Mood
          </Button>
        </Flex>
        
        <Flex
          width={{ base: "90%", md: "60%" }}
          direction={{ base: "column", md: "row" }}
          textAlign="center"
          borderRadius="20px"
          borderWidth="1px"
          borderColor="white"
          background="rgba(255, 255, 255, 0.95)"
          shadow="md"
          alignItems="center"
          maxHeight="250px"
          p={3}
        >
          <Image borderRadius="20px" maxHeight="230px" src={statimage} width={{ base: "70%", md: "50%" }} />
          <Button
            onClick={() => history.push('/moodStats')}
            colorScheme="teal"
            variant='ghost'
            size="md"
            flexGrow={1}
            _hover={{ bg: '#ebedf0' }}
            fontFamily="Work sans"
            fontSize={{ base: "md", md: "lg" }}
          >
            Mood Stats
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
};

export default LogHealth;
