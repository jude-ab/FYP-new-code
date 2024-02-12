import React from 'react';
import SidePopUp from "../components/Mcomponents/SidePopUp";
import { Box } from '@chakra-ui/react';
import Chart from "../components/Chart/Chart.js";
import yogaimage from '../assets/images/white.png';

const Health = () => {
  // Retrieve user information from local storage
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  // Extract the user ID from the stored user information
  const userId = userInfo?._id;

  return (
    <Box position="relative" width="100vw" height="100vh"  overflowY="auto">
     <Box
        position="absolute"
        top={0}
        right={0}
        bottom={0}
        left={0}
        backgroundImage={`url(${yogaimage})`}
        backgroundSize="cover"
        backgroundPosition="center"
        backgroundRepeat="no-repeat"
        filter="blur(3px)" // Apply blur to just the background image
        zIndex={-1}
      />
      <SidePopUp />
      <div className="stats-con" >
        <div className="chart-con" >
          {/* Pass the userId to the Chart component */}
          <Chart userId={userId} />
        </div>
      </div>
      </Box>
  );
};

export default Health;
