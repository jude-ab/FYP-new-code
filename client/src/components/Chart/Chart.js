import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import styled from 'styled-components';
import HealthModal from './HealthModal.js';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Button, Box, Flex } from '@chakra-ui/react';
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
import {
  useDisclosure,
  Text,
} from "@chakra-ui/react";
import yogaimage from '../../assets/images/white.png';
import SidePopUp from "../../components/Mcomponents/SidePopUp";

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

function Chart() {
  const [recommendation, setRecommendation] = useState(null);
  const [visibleWeek, setVisibleWeek] = useState(0);
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const totalWeeks = 52;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [moodsByDate, setMoodsByDate] = useState({});
  const [tooltipContent, setTooltipContent] = useState({ date: null, moods: [], position: { x: 0, y: 0 } });
  const [moods, setMoods] = useState({ happy: [], sad: [], anxious: [], frustrated: [] });
  const [selectedDate, setSelectedDate] = useState(null);
  const [displayDate, setDisplayDate] = useState('');

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // JavaScript months are 0-indexed

  const [isPieChartVisible, setIsPieChartVisible] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from(new Array(10), (val, index) => currentYear - index); // Last 10 years
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

 const getDefaultChartData = () => {
    // Get today's date in the format YYYY-MM-DD
    const todayDate = new Date().toISOString().split('T')[0];

    // Check if there are mood entries for today
    if (moodsByDate[todayDate]) {
      // Calculate the percentage of each mood for today
      const totalMoodsToday = moodsByDate[todayDate].length;
      const defaultData = Object.keys(moods).map(mood => {
        const moodCount = moodsByDate[todayDate].filter(entry => entry === mood).length;
        return Math.round((moodCount / totalMoodsToday) * 100);
      });
      return defaultData;
    } else {
      // If there are no mood entries for today, return default values (0 for all moods)
      return [0, 0, 0, 0];
    }
  };

  const [chartData, setChartData] = useState({
    labels: ['Happy', 'Sad', 'Anxious', 'Frustrated'],
    datasets: [{
      label: 'Mood Distribution',
      data: getDefaultChartData(),
      backgroundColor: [
        'rgba(125, 204, 35, 0.6)',
        'rgba(52, 152, 219, 0.6)',
        'rgba(231, 76, 60, 0.6)',
        'rgba(243, 156, 18, 0.6)',
      ],
      borderColor: [
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 99, 132, 1)',
      ],
      borderWidth: 1,
    }],
  });
  

  useEffect(() => {
    const fetchMoods = async () => {
  if (userInfo && userInfo.token) {
    try {
      const response = await fetch(`/api/user/${userInfo._id}/moods`, {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch mood entries');
      }
      const moodEntries = await response.json();
      console.log('Fetched mood entries:', moodEntries); // Log fetched mood entries
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

      console.log('Processed moods for pie chart:', processedMoodsForPieChart); // Log processed moods for pie chart
      console.log('Processed moods for calendar:', processedMoodsForCalendar); // Log processed moods for calendar

      setMoods(processedMoodsForPieChart);
      setMoodsByDate(processedMoodsForCalendar);
    } catch (error) {
      console.error('Error fetching moods:', error); // Log any errors that occur
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
          'rgba(125, 204, 35, 0.6)',
          'rgba(52, 152, 219, 0.6)',
          'rgba(231, 76, 60, 0.6)',
          'rgba(243, 156, 18, 0.6)',
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

  // const handlePrevWeek = () => {
  //   setVisibleWeek((prevWeek) => (prevWeek > 0 ? prevWeek - 1 : 0));
  // };

  // const handleNextWeek = () => {
  //   setVisibleWeek((prevWeek) => (prevWeek < totalWeeks - 1 ? prevWeek + 1 : totalWeeks - 1));
  // };

 const handleRecommendationClick = async () => {
    try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const userId = userInfo?._id;
        const response = await fetch('/api/health/recommend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, weekNumber: visibleWeek })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setRecommendation(data);
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
    happy: 'rgba(125, 204, 35, 0.6)',
    sad: 'rgba(52, 152, 219, 0.6)',
    anxious: 'rgba(231, 76, 60, 0.6)',
    frustrated: 'rgba(243, 156, 18, 0.6)'
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

  const updateChartData = (dateStr) => {
  // Assuming `moods` contains all mood entries
  const filteredMoods = Object.keys(moods).reduce((acc, mood) => {
    // Filter entries for the selected date
    const count = moods[mood].filter(entry => new Date(entry.date).toISOString().split('T')[0] === dateStr).length;
    if (count > 0) acc.push(count);
    else acc.push(0); // Push 0 if no entries for a mood
    console.log(chartData); // Check the new chart data before setting the state
    return acc;
  }, []);
       
    console.log(filteredMoods); // Check filtered moods count

  // Now update the chart data with these filtered moods
  setChartData(prevData => ({
    ...prevData,
    datasets: [{
      ...prevData.datasets[0],
      data: filteredMoods,
    }],
  }));
};

  const handleDayClick = (value) => {
  const dateStr = value.toISOString().split('T')[0]; // Get the date as YYYY-MM-DD
  setSelectedDate(dateStr);
  setDisplayDate(value.toLocaleDateString()); // Format date for display
  updateChartData(dateStr); // Function to update chart data based on the selected date
  
  // Set the visibility of the pie chart to true when a day is clicked
  setIsPieChartVisible(true);
};

// Function to update chart data based on month and year
const updateChartDataForMonth = () => {
  // Create a new dataset array for the chart
  const newData = Object.keys(moods).map(moodCategory => {
    // Filter entries for each mood category based on selectedYear and selectedMonth
    const filteredEntries = moods[moodCategory].filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getFullYear() === selectedYear && entryDate.getMonth() + 1 === selectedMonth;
    });
    return filteredEntries.length; // Return the count of filtered entries for this category
  });

  // Update the chart data state
  const newChartData = {
    ...chartData, // Spread existing chartData to maintain other settings
    datasets: [{
      ...chartData.datasets[0], // Maintain dataset properties like backgroundColor
      data: newData, // Set new data
    }],
  };

  setChartData(newChartData);
};



  return (
  <div style={{ fontFamily:"Work sans" ,position: 'relative', height: '100vh',  overflowY:"auto"}}>
    {/* Background image */}
    <Box 
      position="fixed"
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
    
    {/* SidePopUp component */}
    <SidePopUp />

   
       {/* Calendar */}
      <Box marginTop={{ base: "20%", md: "7.5%" }} // Adjusted margin for mobile    
      > 
     <Calendar
        onClickDay={(value) => handleDayClick(value)}  
        tileContent={({ date }) => renderDayCell({ date })}
        className="calendar-position"
      />
    </Box>
   
       <Box>
         {/* Text for current mood stats */}
      <Text fontFamily="Work sans" fontWeight="bold" fontSize="120%"
        marginLeft={{ base: "18%", md: "58%" }} // Adjusted marginLeft for mobile
        marginTop={{ base: "65%", md: "-24%" }} // Adjusted marginTop for mobile
      >
      Your Current Mood Stats for: {displayDate}
        </Text>
      </Box>
      
    {/* Pie chart */}
      <Box
        marginLeft={{ base: "1%", md: "47%" }} // Adjusted marginLeft for mobile
        backgroundColor="white"
        border="1px solid #e5e5e5"
        boxShadow="0 0 0.625rem rgba(0, 0, 0, 0.1)"
        borderRadius="20px"
        padding="1%"
        height={{ base: "35%", md: "60%" }}
        marginTop={{ base: "8%", md: "1%" }}  
        fontFamily="Work sans"  
        marginRight={{ base: "0", md: "2%" }} // Adjusted marginRight for mobile
        
        > 
          <Pie data={chartData} options={options} />
          
        {!isPieChartVisible && (
        <Text
          fontFamily="Work sans"
          fontSize="lg"
          textAlign="center" 
          marginTop={{ base: "-40%", md: "-30%" }} // Adjusted marginTop for mobile
          marginLeft={{ base: "0", md: "1%" }} // Adjusted marginLeft for mobile

        >
          Click on a day/month to view your stats
        </Text>
        )}
        </Box>
    
      <Box display='flex' alignItems='center' marginBottom='1%'
        marginTop={{ base: "10%", md: "1.5%" }}
        width={{ base: "230%", md: "20%" }}
        marginLeft={{ base: "36%", md: "67%" }} // Adjusted marginLeft for mobile
      > 
        <Flex direction={{ base: "column", md: "row" }} align="center" justify="center" borderRadius="10px">
      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
        width={{ base: "100%", md: "45%" }} // Adjusted width for responsiveness
        padding="2" // Added padding to improve visual appearance
        margin={{ base: "20%", md: "0 1%" }} // Adjusted margin for responsiveness
        fontFamily="Work sans"
        borderRadius="5px"
      >
        {years.map(year => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>
      <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          width={{ base: "100%", md: "45%" }} // Adjusted width for responsiveness
          padding="2" // Added padding to improve visual appearance
          margin={{ base: "20%", md: "0 1%" }} // Adjusted margin for responsiveness
          borderRadius="5px"
          fontFamily="Work sans"
          marginBottom={{ base: "20%", md: "0" }} // Adjusted marginBottom for mobile  
          marginTop={{ base: "20%", md: "0" }} // Adjusted marginTop for mobile
          marginLeft="5%"
          >
          {monthNames.map((name, index) => (
            <option key={index} value={index + 1}>{name}</option> // Display month names, store 1-based month number
          ))}
          </select>  
          </Flex>
          </Box>
      <Button
        onClick={updateChartDataForMonth}
        backgroundColor="#0C301F"
        color='white' // Text color
        fontFamily="Work sans"
        fontSize={{ base: '90%', md: '90%' }} // Responsive font size
        height={{ base: '40px', md: '30px' }} // Responsive height
        width={{ base: '35%', md: '11%' }} // Responsive width
        _hover={{ bg: '#1E4D38' }} // Adjust hover background color
        borderRadius='5px'
        ml={{ base: '32%', md: '67%' }} // Responsive marginLeft, shorthand for marginLeft
        cursor='pointer'
        mt={{ base: '5%', md: '0.1%' }} // Adjust marginTop for mobile
      >
        Update Chart
      </Button>
          
      {/* Get Health Plan Recommendation button */}
    <Box>
    <Button
      _hover={{ bg: "#1E4D38" }}
      backgroundColor="#0C301F"
      marginLeft='60.5%'
      marginTop={{ base: "200%", md: "1%" }}
      color='white'
      onClick={handleRecommendationClick}
      fontFamily="Work sans"
      width={{ base: "60%", md: "20%" }} // Adjusted width
      fontSize={{ base: '80%', md: '90%' }} // Responsive font size
      ml={{ base: '20%', md: '62.5%' }} // Responsive marginLeft, shorthand for marginLeft
    >
      Get Health Plan Recommendation
      </Button>
    </Box>

    {/* Text explaining health plan */}
    <Box
        marginLeft={{ base: "5%", md: "4%" }}
        width={{ base: "90%", md: "40%" }} // Adjusted width for mobile
        background= "rgba(255, 255, 255, 0.85)"
        padding= "30px"
        paddingTop= "5px"
        borderRadius= "20px"
        boxShadow="0px 4px 6px rgba(0, 0, 0, 0.1)"
        marginTop={{ base: "-200%", md: "-19%" }} // Adjusted margin for mobile    
        marginBottom={{ base: "1%", md: "1%" }} // Adjusted marginBottom for mobile
    >
      <Text fontFamily="Work sans" fontWeight="bold" fontSize="sm" marginTop="5%">
        A thoughtfully designed health plan is essential to preserving happiness and general wellbeing.
        It includes a number of components that all play a major role in promoting mental and emotional stability, including food, exercise, supplements, and—most importantly—yoga.
        A nutrient-dense, well-balanced diet not only powers the body but also nourishes the intellect, promoting energy and clarity.
        Supplements help maintain healthy brain function, fill up nutritional shortages, and improve mood control.
        Frequent exercise releases neurotransmitters called endorphins, which reduce stress and increase feelings of pleasure and happiness.
        But yoga distinguishes itself as a comprehensive approach that combines breathing exercises, meditation, and physical postures to develop awareness, lower cortisol levels, and encourage relaxation.
        Its capacity to connect mind, body, and spirit is what gives it its transformational power.
        It has significant positive effects on mental health, such as lowered stress levels, happier moods, and increased emotional fortitude.
        People can proactively cultivate their mental and emotional well-being and live a more vibrant and fulfilling life by adopting these comprehensive health plan pillars.
        Find out here what health plan is recommended for you now based on your current mood stats!
      </Text>
    </Box>

    {/* HealthModal component */}
    <HealthModal
      recommendation={recommendation}
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
    />
  </div>
);

}

export default Chart;