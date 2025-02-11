import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  SimpleGrid,
  IconButton,
  Flex,
  Text,
  Button,
  VStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Input,
  InputGroup,
  InputLeftElement
} from "@chakra-ui/react";
import { ChevronRightIcon, ChevronLeftIcon } from '@chakra-ui/icons';
import SidePopUp from "../components/Mcomponents/SidePopUp";
import backgroundImage from '../assets/images/bylevel.jpg';
import { SearchIcon } from "@chakra-ui/icons";

const PosesByLevel = ({ match }) => {
  const [poses, setPoses] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedPose, setSelectedPose] = useState(null);
  const [searchedWord, setSearchedWord] = useState("");

  const level = match.params.level; // Get the level from the URL parameters
  console.log("Level:", level);

  const posesPerPage = 12; // Set the number of poses per page

  // const history = useHistory();

  useEffect(() => {
    const fetchPoses = async () => {
      try {
        const response = await axios.get(
          `https://yogahub-nodebackend-587807f134e2.herokuapp.com/api/yoga/poses?level=${(level)}`
        );
        console.log("API response:", response.data);
        setPoses(response.data);
        setTotalPages(Math.ceil(response.data.length / posesPerPage));
      } catch (e) {
        setError(e.message);
        console.log(e);
      }
    };

    fetchPoses();
  }, [level, currentPage, posesPerPage]); 

  if (error) {
    return <Box>Error: {error}</Box>;
  }

  const handleSearchChange = (event) => {
    setSearchedWord(event.target.value);
  };

  const displayedPoses = searchedWord.trim()
    ? poses.filter((pose) =>
        pose.AName.toLowerCase().includes(searchedWord.toLowerCase())
      )
    : poses;

  const handleMoreInfo = (pose) => {
    setSelectedPose(pose);
    onOpen(); // Open the modal when clicking on "More Information"
  };

    return (
    <Box position="relative" width="100vw">
      <Box
        position="absolute"
        top={0}
        right={0}
        bottom={0}
        left={0}
        backgroundImage={`linear-gradient(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.4)), url(${backgroundImage})`} // Set the background image with transparency
        backgroundSize="cover"
        backgroundPosition="center"
        backgroundRepeat="no-repeat"
        zIndex={-1}
        filter="blur(5px)"
        />
        <SidePopUp />
        <InputGroup marginTop={{ base: "19%", md: "5%" }}
          width={{ base: "80%", md: "21.5%" }}
          background="rgba(255, 255, 255, 0.5)"
          borderRadius="10px"
          boxShadow="0 2px 10px rgba(0, 0, 0, 0.2)"
          marginLeft={{ base: "10%", md: "2.6%" }}
          marginBottom={{ base: "-20%", md: "-5%" }}
        >
        <InputLeftElement
          pointerEvents="none"
          children={<SearchIcon color="gray.300"
          borderRadius="10px"    
            />}
        />
        <Input
          placeholder="Search for a pose"
          value={searchedWord}
          onChange={handleSearchChange}
          borderRadius="10px"   
          fontFamily="Work sans"  
        />
      </InputGroup>
      <Box maxH="calc(100vh - 50px)" overflowY="auto" mt="75px">
        <SimpleGrid columns={[1, 2, 4]} spacing={10} m={9} >
          {displayedPoses
            .slice((currentPage - 1) * posesPerPage, currentPage * posesPerPage)
            .map((pose) => (
                <Box
                  key={pose._id}
                  p={5}
                  shadow="md"
                  borderWidth="1px"
                  position="relative"
                  rounded="md"
                  backgroundImage={`linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.9))`}
                  boxShadow="0 2px 10px rgba(0, 0, 0, 0.35)"
                  borderRadius="15px"
                >
                  <VStack spacing={4} align="stretch">
                    <Text fontFamily="Work sans" fontWeight="bold" fontSize="1xl" noOfLines={1}>
                      {pose.AName}
                    </Text>
                    <Text fontFamily="Work sans" noOfLines={1}>Level: {pose.Level}</Text>
                    <Button
                      size="sm"
                      onClick={() => handleMoreInfo(pose)}
                      backgroundColor="#0C301F"
                      color="white"
                      _hover={{ backgroundColor: "#1E4D38" }}
                      mt="auto" // Push the button to the bottom of the VStack
                      fontFamily="Work sans"
                    >
                      More Information
                    </Button>
                  </VStack>
                </Box>
              ))}
        </SimpleGrid>
        <Flex fontFamily="Work sans" align="center" justify="center" my={6} marginBottom={{base: "18%", md: "5%"}}  >
          <IconButton
            icon={<ChevronLeftIcon />}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            isDisabled={currentPage === 1}
            aria-label="Previous page"
            mr={4}
            background="transparent"
          />
          <Text>{currentPage}</Text>
          <IconButton
            icon={<ChevronRightIcon />}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            isDisabled={currentPage === totalPages}
            aria-label="Next page"
            ml={4}
            background="transparent"            
          />
        </Flex>
        {/* modal for displaying yoga pose details */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay  />
          <ModalContent borderRadius="25px" boxShadow="0 2px 10px rgba(0, 0, 0, 0.5)">
            <ModalHeader textAlign="center" fontFamily="Work sans">{selectedPose?.AName}</ModalHeader>
            <ModalCloseButton />
            <ModalBody fontFamily="Work sans">
              <Text mb={2}>Level: {selectedPose?.Level}</Text>
              <Text mb={2}>Description: {selectedPose?.Description}</Text>
              <Text mb={2}>Benefits: {selectedPose?.Benefits}</Text>
              <Text mb={2}>Breathing: {selectedPose?.Breathing}</Text>
              <Text mb={2}>Awareness: {selectedPose?.awareness}</Text>
              {selectedPose?.ImagePath && (
                  <img src={`https://yogahub-frontend-46cb8ca421ea.herokuapp.com/${selectedPose.ImagePath}`} alt={selectedPose.AName} style={{ width: '100%', marginTop: '10px' }} />
              )}
          </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    </Box>
  );
};

export default PosesByLevel;
