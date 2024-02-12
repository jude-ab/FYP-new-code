import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import styled from 'styled-components';
import HealthModal from './HealthModal.js';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import '../style.css';
import { Button, Box, Image, Text, Flex, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, useDisclosure, List, ListItem } from '@chakra-ui/react';

import frustratedImg from '../../assets/images/a_frustrated.png';
import sadImg from '../../assets/images/a_sad.png';
import anxiousImg from '../../assets/images/a_anxiety.png';
import happyImg from '../../assets/images/a_happy.png';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ChartContainer = styled.div`
  // background-color: rgba(255, 255, 255, 0.9);
  background-color: white;
  border: 1px solid #e5e5e5;
  box-shadow: 0 0 0.625rem rgba(0, 0, 0, 0.1);
  padding: 20px;
  border-radius: 20px;
  max-width: 700px;
  width: 100%;
  height: 500px;
  max-height: 70%;
  margin: 20px auto;
  margin-top: 5.5%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 100px;

  @media screen and (max-width: 768px) {
    padding: 10px;
    margin-top: 13%;
  }
`;

const NavigationButton = styled.button`
  padding: 5px 10px;
  margin: 5px;
  cursor: pointer;

  @media screen and (max-width: 768px) {
    font-size: 0.8em;
    padding: 3px 8px;
    margin: 3px;
  }
`;

const LegendContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: -800px;
  margin-top: 10px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  margin-right: 10px;
`;

const LegendColor = styled.div`
  width: 15px;
  height: 15px;
  border-radius: 50%;
  margin-right: 5px;
`;

const CalendarContainer = styled.div`
  margin-right: 800px;
  margin-top: -515px;
  background-color: white;
  color: rgb(41, 38, 38);
  border-radius: 20px;
  box-shadow: 0 10px 22px rgba(112, 78, 3, 0.2);
  fontFamily: 'Work sans';
  line-height: 1.12em;
`;

function Chart() {
  const [moods, setMoods] = useState({ happy: [], sad: [], anxious: [], frustrated: [] });
  const [recommendation, setRecommendation] = useState(null);
  const [visibleWeek, setVisibleWeek] = useState(0);
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const totalWeeks = 52;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [moodsByDate, setMoodsByDate] = useState({});
  const [tooltipContent, setTooltipContent] = useState({ date: null, moods: [], position: { x: 0, y: 0 } });
  const [recommendations, setRecommendations] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

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
    onOpen();
  }

  useEffect(() => {
    const fetchMoods = async () => {
      if (userInfo && userInfo.token) {
        try {
          const response = await fetch(`/api/user/${userInfo._id}/moods`, {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
          });
          const moodEntries = await response.json();

          const processedMoodsForPieChart = moodEntries.reduce((acc, entry) => {
            const mood = entry.mood;
            if (!acc[mood]) {
              acc[mood] = [];
            }
            acc[mood].push(entry);
            return acc;
          }, { happy: [], sad: [], anxious: [], frustrated: [] });

          const processedMoodsForCalendar = moodEntries.reduce((acc, entry) => {
            const mood = entry.mood;
            const dateStr = new Date(entry.date).toDateString();
            if (!acc[dateStr]) {
              acc[dateStr] = [];
            }
            acc[dateStr].push(mood);
            return acc;
          }, {});

          setMoods(processedMoodsForPieChart);
          setMoodsByDate(processedMoodsForCalendar);
        } catch (error) {
          console.error('Failed to fetch moods:', error);
        }
      }
    };

    fetchMoods();
  }, [userInfo]);

  const moodCountsForVisibleWeek = Object.keys(moods).reduce((acc, mood) => {
    acc[mood] = moods[mood].length;
    return acc;
  }, {});

  const totalMoods = Object.values(moods).flat().length;

  const data = {
    labels: Object.keys(moodCountsForVisibleWeek),
    datasets: [
      {
        label: 'Mood Distribution',
        data: Object.values(moodCountsForVisibleWeek),
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'black',
        }
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            let label = tooltipItem.label || '';
            if (label) {
              label += ': ';
            }
            const currentValue = tooltipItem.parsed;
            const percentage = ((currentValue / totalMoods) * 100).toFixed(2);
            label += `${percentage}%`;
            return label;
          },
        },
      },
    },
  };

  const handlePrevWeek = () => {
    setVisibleWeek((prevWeek) => (prevWeek > 0 ? prevWeek - 1 : 0));
  };

  const handleNextWeek = () => {
    setVisibleWeek((prevWeek) => (prevWeek < totalWeeks - 1 ? prevWeek + 1 : totalWeeks - 1));
  };

  const handleRecommendationClick = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const userId = userInfo?._id;
      const response = await fetch('/api/health/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, weekNumber: visibleWeek })
      });
      const result = await response.json();
      setRecommendation(result);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching recommendation:', error);
    }
  };

  const handleMouseEnter = (event, dateStr, moodsForDate) => {
    const position = { x: event.clientX, y: event.clientY + window.scrollY }; // Adjust for scrolling
    // Count the occurrences of each mood
    const moodCounts = moodsForDate.reduce((acc, mood) => {
        acc[mood] = (acc[mood] || 0) + 1;
        return acc;
    }, {});

    // Calculate percentages
    const totalMoods = moodsForDate.length;
    const moodPercentages = Object.keys(moodCounts).map(mood => ({
        mood,
        percentage: ((moodCounts[mood] / totalMoods) * 100).toFixed(2)
    }));

    setTooltipContent({ date: dateStr, moods: moodPercentages, position });
};


  const handleMouseLeave = () => {
    setTooltipContent({ date: null, moods: [], position: { x: 0, y: 0 } });
  };

  const renderDayCell = ({ date }) => {
  const dateStr = date.toDateString();
  const moodsForDate = moodsByDate[dateStr] || [];

  const moodColorMap = {
    happy: 'rgba(75, 192, 192, 0.6)',
    sad: 'rgba(153, 102, 255, 0.6)',
    anxious: 'rgba(54, 162, 235, 0.6)',
    frustrated: 'rgba(255, 99, 132, 0.6)'
  };

  // Adjust the container style to align items in a row (flex-direction: row)
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row', // Change to 'row' to align items horizontally
        justifyContent: 'center', // Center the circles horizontally
        alignItems: 'center', // Center the circles vertically within the day cell
        position: 'relative',
      }}
      onMouseEnter={(event) => handleMouseEnter(event, dateStr, moodsForDate)}
      onMouseLeave={handleMouseLeave}
    >
      {moodsForDate.map((mood, index) => (
        <div
          key={index}
          style={{
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            backgroundColor: moodColorMap[mood],
            margin: '1px',
          }}
        />
      ))}
      {tooltipContent.date && tooltipContent.moods.length > 0 && (
        <div
          style={{
            position: 'fixed',
            top: `${tooltipContent.position.y}px`,
            left: `${tooltipContent.position.x}px`,
            transform: 'translate(-50%, -100%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '5px',
            borderRadius: '5px',
            zIndex: 100,
            whiteSpace: 'nowrap',
          }}
        >
          {tooltipContent.moods.map(({ mood, percentage }) => (
            <div key={mood}>{`${mood}: ${percentage}%`}</div>
          ))}
        </div>
      )}
    </div>
  );
};


  const legendItems = Object.entries(moods).map(([mood, moodEntries]) => {
    const moodColor = {
      happy: 'rgba(75, 192, 192, 0.6)',
      sad: 'rgba(153, 102, 255, 0.6)',
      anxious: 'rgba(54, 162, 235, 0.6)',
      frustrated: 'rgba(255, 99, 132, 0.6)'
    }[mood];

    return (
      <LegendItem key={mood}>
        <LegendColor style={{ backgroundColor: moodColor }}></LegendColor>
        <span style={{ color: moodColor }}>{mood}: {moodEntries.length}</span>
      </LegendItem>
    );
  });

   // Mood selection UI integrated below the calendar
  const MoodSelectionUI = () => (
    <Flex direction="column" alignItems="center" justifyContent="center" marginRight="57%" marginTop="2%" fontFamily="Work sans" fontWeight="bold">
      <Text fontSize="xl" my="4">How are you feeling today?</Text>
      <Flex direction="row" wrap="wrap" justifyContent="center">
        {/* Mood images */}
        {[{ src: happyImg, mood: "happy" }, { src: sadImg, mood: "sad" }, { src: anxiousImg, mood: "anxious" }, { src: frustratedImg, mood: "frustrated" }]
        .map(({ src, mood }) => (
          <Box key={mood} textAlign="center" m="2">
            <Image src={src} boxSize="100px" objectFit="cover" onClick={() => handleMoodClick(mood)} cursor="pointer" />
            <Text mt="1rem">{mood.charAt(0).toUpperCase() + mood.slice(1)}</Text>
          </Box>
        ))}
      </Flex>
    </Flex>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <ChartContainer>
        <Pie data={data} options={options} />
      </ChartContainer>
      <CalendarContainer>
        <Calendar
          tileContent={({ date }) => renderDayCell({ date })}
        />
      </CalendarContainer>
      <LegendContainer>
        {legendItems}
      </LegendContainer>
      <MoodSelectionUI />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '-5.5%', marginLeft: '37%' }}>
        <NavigationButton onClick={handlePrevWeek} disabled={visibleWeek === 0}>
          &lt;
        </NavigationButton>
        <span style={{ margin: '0 0px' }}>Week {visibleWeek + 1}</span>
        <NavigationButton onClick={handleNextWeek} disabled={visibleWeek === totalWeeks - 1}>
          &gt;
        </NavigationButton>
      </div>
      <Button
        _hover={{ bg: "#1E4D38" }}
        background='#0C301F'
        marginLeft='37.5%'
        marginTop='0.2%'
        color='white'
        fontFamily="Work sans"
        onClick={handleRecommendationClick}>Get Health Plan Recommendation
      </Button>
      <HealthModal
        recommendation={recommendation}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Recommended Yoga Poses</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex wrap="wrap" justify="center">
            <List spacing={3}>
              {Array.isArray(recommendations) && recommendations.map((recommendation, index) => (
                <ListItem key={index}>{recommendation}</ListItem>
              ))}
            </List>
          </Flex>
        </ModalBody>
      </ModalContent>
      </Modal>
    </div>
  );
}

export default Chart;

