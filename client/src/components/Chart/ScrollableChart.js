import React from "react";
import {
  Box,
} from "@chakra-ui/react";
import Chart from "./Chart";

const ScrollableChart = () => {
  return (
    <Box height="100vh" overflowY="auto">
      <Chart />
    </Box>
  );
};

export default ScrollableChart;
