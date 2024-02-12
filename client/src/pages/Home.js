import React, { useEffect,  useState } from 'react';
import {
  Box,
  Text,
  Tabs,
  Tab,
  TabPanels,
  TabPanel,
  TabList,
  Flex,
} from '@chakra-ui/react';
import Login from '../components/Authentication/Login';
import Register from '../components/Authentication/Register';
import { useHistory } from 'react-router-dom';
import backgroundImage from '../assets/images/yogaposes.png';
import SidePopUp from "../components/Mcomponents/SidePopUp";

const Home = () => {
  const history = useHistory();
  const [tabIndex, setTabIndex] = useState(0);

  const [isRightAlignedTitle, setIsRightAlignedTitle] = useState(false);

  useEffect(() => {
    const user_info = JSON.parse(localStorage.getItem('user_info'));
    if (user_info) {
      history.push('/chats');
    }
  }, [history]);

  // Function to update the tab index
  const handleTabsChange = (index) => {
    setTabIndex(index);
  };


  return (
   
    <Flex direction={{ base: 'column', md: 'row' }} align="center" justify="start" height="100%" >
     <Box
        position="absolute"
        width="100vw"
        left="0"
        top="0"
        right="0"
        bottom="0"
        backgroundImage={`url(${backgroundImage})`}
        backgroundSize="cover"
        backgroundPosition="center"
        backgroundRepeat="no-repeat"
        zIndex="-10"
          sx={{
            _after: {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              // Create a diagonal gradient from bottom left (transparent) to top right (opaque)
              bgGradient: 'linear(to top right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.25))',
              zIndex: '-1',
            },
        }}
      />
      <SidePopUp isHomePage={true} />
      <Flex
        direction="column"
        p={{ base: 4, md: 8 }} // Adjust padding based on screen size
        alignItems={{ base: 'center', md: 'start' }}
        width={{ base: 'full', md: '100%' }} // Adjust the width as needed
        maxWidth="2xl" // You can set a maximum width as needed
        zIndex="10"
         marginLeft={{ md: '80%' }} // Adjust the margin to move the container to the right
         m={{ base: 4, md: 8 }}
      >
        {/* Display "Create New Account" for the Sign up tab */}
        <Text
          fontSize="4xl"
          fontFamily="Work sans"
          color="black"
          mb={4}
          marginLeft="19%"
          width="100%"
          font="bold"
          marginTop={tabIndex === 0 ? "30%" : "15%"} // Change marginTop conditionally
        >
            {tabIndex === 0 ? 'Welcome to YogaHub' : 'Create New Account'}
        </Text>
        <Tabs onChange={handleTabsChange} isFitted width="85%">
          <TabList mb={4} color="black" marginLeft="28%" colorScheme="white" width="100%" marginBottom="3%">
            <Tab _selected={{ color: "#0C301F", borderColor: "#0C301F" }}>Login</Tab>
            <Tab _selected={{ color: "#0C301F", borderColor: "#0C301F" }}>Sign up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel p={4}>
              <Login />
            </TabPanel>
            <TabPanel p={4}>
              <Register />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Flex>
      </Flex>

  );
};

export default Home;