import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import styled from 'styled-components';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ChartContainer = styled.div`
  background-color: #fff;
  border: 1px solid #e5e5e5;
  box-shadow: 0 0 0.625rem rgba(0, 0, 0, 0.1);
  padding: 20px;
  border-radius: 20px;
  height: 500px;
  width: 800px;
  margin: 20px auto;
  margin-top: 70px;
`;

const NavigationButton = styled.button`
  padding: 5px 10px;
  margin: 5px;
  cursor: pointer;
`;

function Chart() {
  const daysPerWeek = 7;
  const totalWeeks = 52;
  const [visibleWeek, setVisibleWeek] = useState(0);
    
  const initialMoodsState = {
    happy: [],
    sad: [],
    anxious: [],
    frustrated: [],
  };
    
  const [moods, setMoods] = useState(initialMoodsState);
  const [recommendation, setRecommendation] = useState(null);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

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

        // Process mood entries and convert to chart data format
        const processedMoods = moodEntries.reduce((acc, entry) => {
          const mood = entry.mood;
          const date = new Date(entry.date);
          const timeDecimal = date.getHours() + date.getMinutes() / 60; // Convert time to decimal hours

          if (!acc[mood]) {
            acc[mood] = [];
          }

          acc[mood].push({
            date: entry.date,
            value: timeDecimal, // Convert time to decimal hours
          });

          return acc;
        }, {});

        setMoods({
          happy: processedMoods.happy || [],
          sad: processedMoods.sad || [],
          anxious: processedMoods.anxious || [],
          frustrated: processedMoods.frustrated || [],
        });
      } catch (error) {
        console.error("Failed to fetch moods:", error);
      }
    }
  };

  fetchMoods();
}, [userInfo]);

  // Function to generate labels for the x-axis (dates)
  const generateLabels = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(startOfWeek.getDate() - today.getDay() + 7 * visibleWeek);
    const labels = [];
    for (let i = 0; i < daysPerWeek; i++) {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + i);
      labels.push(`${day.getDate()} ${day.toLocaleString('default', { month: 'short' })}`);
    }
    return labels;
  };

    const currentWeekLabels = generateLabels();
    
    const moodValues = {
    happy: 2.95, // Highest position
    frustrated: 2,
    sad: 1,
    anxious: 0 // Lowest position
  };

   // Generate chart data with updated y-axis for moods
const data = {
  labels: currentWeekLabels,
  datasets: [
    {
      label: 'Happy',
      data: moods.happy.map(mood => {
        const date = new Date(mood.date);
        const label = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
        return currentWeekLabels.includes(label) ? { x: label, y: moodValues.happy } : null;
      }).filter(point => point !== null),
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderWidth: 1,
      fill: false,
      pointRadius: 5,
    },
    {
      label: 'Frustrated',
      data: moods.frustrated.map(mood => {
        const date = new Date(mood.date);
        const label = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
        return currentWeekLabels.includes(label) ? { x: label, y: moodValues.frustrated } : null;
      }).filter(point => point !== null),
      borderColor: 'rgba(153, 102, 255, 1)',
      backgroundColor: 'rgba(153, 102, 255, 0.2)',
      borderWidth: 1,
      fill: false,
      pointRadius: 5,
    },
    {
      label: 'Sad',
      data: moods.sad.map(mood => {
        const date = new Date(mood.date);
        const label = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
        return currentWeekLabels.includes(label) ? { x: label, y: moodValues.sad } : null;
      }).filter(point => point !== null),
      borderColor: 'rgba(54, 162, 235, 1)',
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderWidth: 1,
      fill: false,
      pointRadius: 5,
    },
    {
      label: 'Anxious',
      data: moods.anxious.map(mood => {
        const date = new Date(mood.date);
        const label = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
        return currentWeekLabels.includes(label) ? { x: label, y: moodValues.anxious } : null;
      }).filter(point => point !== null),
      borderColor: 'rgba(255, 99, 132, 1)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderWidth: 1,
      fill: false,
      pointRadius: 5,
    },
  ],
};

  const options = {
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          autoSkip: false,
        },
      },
      y: {
        type: 'linear',
        min: 0,
        max: 3, // Set max to the number of moods - 1
        ticks: {
          stepSize: 1,
          callback: function (value) {
            switch (value) {
              case 3: return 'Happy';
              case 2: return 'Frustrated';
              case 1: return 'Sad';
              case 0: return 'Anxious';
              default: return '';
            }
          },
        },
        grid: {
          display: true,
          drawBorder: true,
          drawOnChartArea: true,
          drawTicks: true,
          tickLength: 10,
          color: function (context) {
            return '#E5E5E5';
          },
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const label = tooltipItem.dataset.label || '';
            return `${label}: ${tooltipItem.formattedValue}`;
          },
        },
      },
      legend: {
        display: true,
        position: 'top',
      },
    },
  };

  const handlePrevWeek = () => {
  setVisibleWeek((prevWeek) => (prevWeek > 0 ? prevWeek - 1 : 0)); // Ensure it doesn't go below 0
};

const handleNextWeek = () => {
  setVisibleWeek((prevWeek) => (prevWeek < totalWeeks - 1 ? prevWeek + 1 : totalWeeks - 1)); // Ensure it doesn't go above the total number of weeks
};
    


   return (
    <div>
      <ChartContainer>
        <Line data={data} options={options} />
      </ChartContainer>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px', color: 'grey' }}>
        <NavigationButton onClick={handlePrevWeek} disabled={visibleWeek === 0}>
          &lt;
        </NavigationButton>
        <div style={{ margin: '0 0px', fontFamily: 'monospace', color: 'grey' }}>
          Week {visibleWeek + 1}
        </div>
        <NavigationButton onClick={handleNextWeek} disabled={visibleWeek === totalWeeks - 1}>
          &gt;
        </NavigationButton>
      </div>
    </div>
  );
}


export default Chart;
