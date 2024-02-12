import React, { useState } from "react";
import { Flex, Button, List, ListItem, Box } from "@chakra-ui/react";
import SidePopUp from "../components/Mcomponents/SidePopUp";

const Mood = () => {
  const [recommendations, setRecommendations] = useState([]);

  async function fetchRecommendations(data) {
    try {
      const response = await fetch("/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      setRecommendations(result);
    } catch (error) {
      console.error("error fetching recommendations:", error);
    }
  }

  async function saveUserMood(moodData) {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  if (!userInfo || !userInfo.token) {
    console.error("No user token found, user might not be logged in");
    return;
  }

  const token = userInfo.token;

  try {
    const response = await fetch("/api/user/moods", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // Include the token in the authorization header
      },
      body: JSON.stringify(moodData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      const data = await response.json();
      console.log('Mood saved:', data);
    }
  } catch (error) {
    console.error("error saving user mood:", error);
  }
}




  function handleMoodClick(mood) {
  // Retrieve user data from local storage
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  if (!userInfo) {
    console.error("No user info found, user might not be logged in");
    return;
  }

  const userId = userInfo._id; // Assuming the user's ID is stored in the _id field
  const moodData = { userId, mood };
  fetchRecommendations(moodData);
  saveUserMood(moodData);
}


  return (
    <Box position="relative" width="100vw">
      <SidePopUp />

      <Flex
        direction="column"
        alignItems="center"
        justifyContent="flex-start"
        width="100vw"
      >
        {/* Button container */}
        <Flex
          direction="row"
          mb="4rem"
          alignItems="center"
          justifyContent="center"
          width="100%"
        >
          <Button
            m="1rem"
            p="2rem"
            minWidth="150px"
            colorScheme="red"
            onClick={() => handleMoodClick("frustrated")}
          >
            Frustrated
          </Button>
          <Button
            m="1rem"
            p="2rem"
            minWidth="150px"
            colorScheme="blue"
            onClick={() => handleMoodClick("sad")}
          >
            Sad
          </Button>
          <Button
            m="1rem"
            p="2rem"
            minWidth="150px"
            colorScheme="gray"
            onClick={() => handleMoodClick("anxious")}
          >
            Anxious
          </Button>
          <Button
            m="1rem"
            p="2rem"
            minWidth="150px"
            colorScheme="yellow"
            onClick={() => handleMoodClick("happy")}
          >
            Happy
          </Button>
        </Flex>
        {/* Recommendations list */}
        <List spacing={3}>
          {recommendations.map((recommendation, index) => (
            <ListItem key={index}>{recommendation}</ListItem>
          ))}
        </List>
      </Flex>
    </Box>
  );
};

export default Mood;