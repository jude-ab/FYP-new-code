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
        marginTop={{ base: "45%", md: "9.5%" }}
        justifyContent="center"
        spacing={10}
        alignItems="flex-start"
        marginLeft={{ base: "10%", md: "20%" }}
      >
        <Flex
          width={{ base: "90%", md: "77%" }}
          minHeight="200px" // Example minimum height
          direction={{ base: "column", md: "row" }}
          textAlign="center"
          borderRadius="20px"
          borderWidth="1px"
          borderColor="white"
          background="rgba(255, 255, 255, 0.95)"
          shadow="md"
          alignItems="center"
          p={3}
        >
          <Image
            borderRadius="20px"
            src={moodimage}
            width={{ base: "100%", md: "70%" }} // Adjust width as needed
            maxHeight="150px" // Keep the maxHeight to limit the height
            objectFit="contain" // Ensure the image aspect ratio is maintained
            m={3}
          />
          <Button
            onClick={() => history.push('/logMood')}
            variant='ghost'
            flexGrow={1}
            _hover={{ bg: '#ebedf0' }}
            fontFamily="Work sans"
            fontSize={{ base: "md", md: "lg" }}
            marginRight={{ base: "2%", md: "11%" }}
          >
            Log Mood
          </Button>
        </Flex>

        <Flex
          width={{ base: "90%", md: "77%" }}
          minHeight="200px" // Example minimum height
          direction={{ base: "column", md: "row" }}
          textAlign="center"
          borderRadius="20px"
          borderWidth="1px"
          borderColor="white"
          background="rgba(255, 255, 255, 0.95)"
          shadow="md"
          alignItems="center"
          p={3}
        >
         <Image
            borderRadius="20px"
            src={statimage}
            width={{ base: "100%", md: "70%" }} // Adjust width as needed
            maxHeight="150px" // Keep the maxHeight to limit the height
            objectFit="contain" // Ensure the image aspect ratio is maintained
            m={3}
          />
          <Button
            onClick={() => history.push('/moodStats')}
            variant='ghost'
            flexGrow={1}
            _hover={{ bg: '#ebedf0' }}
            fontFamily="Work sans"
            marginRight={{ base: "2%", md: "11%" }}
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
