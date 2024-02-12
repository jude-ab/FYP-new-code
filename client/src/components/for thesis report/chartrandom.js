// import React, { useState } from 'react';
// import { Line } from 'react-chartjs-2';
// import styled from 'styled-components';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend
// } from 'chart.js';

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend
// );

// const ChartContainer = styled.div`
//   background-color: #fff;
//   border: 1px solid #e5e5e5;
//   box-shadow: 0 0 0.625rem rgba(0, 0, 0, 0.1);
//   padding: 20px;
//   border-radius: 20px;
//   height: 500px;
//   width: 800px; // Set a fixed width for the chart container
//   margin: 20px auto;
// `;

// const NavigationButton = styled.button`
//   padding: 5px 10px;
//   margin: 5px;
//   cursor: pointer;
// `;

// function Chart() {
//   const daysPerWeek = 7;
//   const totalWeeks = 52;
//   const totalDays = totalWeeks * daysPerWeek;
//   const [visibleWeek, setVisibleWeek] = useState(0);

//   const generateRandomData = () => Array.from({ length: totalWeeks }, () => Math.floor(Math.random() * 100));

//   const labels = Array.from({ length: totalDays }, (_, i) => `Day ${i + 1}`);

//   const data = {
//     labels: labels.slice(visibleWeek * daysPerWeek, (visibleWeek + 1) * daysPerWeek),
//     datasets: [
//       {
//         label: 'Happy',
//         data: generateRandomData(),
//         borderColor: 'rgba(75, 192, 192, 1)',
//         borderWidth: 1,
//         fill: false,
//       },
//       {
//         label: 'Sad',
//         data: generateRandomData(),
//         borderColor: 'rgba(255, 99, 132, 1)',
//         borderWidth: 1,
//         fill: false,
//       },
//       {
//         label: 'Anxious',
//         data: generateRandomData(),
//         borderColor: 'rgba(54, 162, 235, 1)',
//         borderWidth: 1,
//         fill: false,
//       },
//       {
//         label: 'Frustrated',
//         data: generateRandomData(),
//         borderColor: 'rgba(153, 102, 255, 1)',
//         borderWidth: 1,
//         fill: false,
//       },
//     ],
//   };

//   const options = {
//     maintainAspectRatio: false,
//     scales: {
//       x: {
//         beginAtZero: true,
//         ticks: {
//           autoSkip: false, // Do not skip labels
//           maxTicksLimit: daysPerWeek, // Limit the number of ticks to 7
//         },
//       },
//         y: {
//             beginAtZero: true,
//         },
//     },
//     plugins: {
//       legend: {
//         display: true,
//         position: 'top',
//       },
//     },
//   };


//   const handlePrevWeek = () => {
//     setVisibleWeek((prevWeek) => (prevWeek > 0 ? prevWeek - 1 : prevWeek));
//   };

//   const handleNextWeek = () => {
//     setVisibleWeek((prevWeek) => (prevWeek < totalWeeks - 1 ? prevWeek + 1 : prevWeek));
//   };

// return (
//     <div>
//       <ChartContainer>
//         <Line data={data} options={options} />
//       </ChartContainer>
//       <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px', color:'grey' }}>
//         <NavigationButton onClick={handlePrevWeek} disabled={visibleWeek === 0}>
//           &lt;
//         </NavigationButton>
//         <div style={{ margin: '0 0px', fontFamily: 'monospace', color: 'grey' }}>
//           Week {visibleWeek + 1}
//         </div>
//         <NavigationButton onClick={handleNextWeek} disabled={visibleWeek === totalWeeks - 1}>
//           &gt;
//         </NavigationButton>
//       </div>
//     </div>
//   );
// }


// export default Chart;

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
  width: 800px; // Set a fixed width for the chart container
  margin: 20px auto;
`;

const NavigationButton = styled.button`
  padding: 5px 10px;
  margin: 5px;
  cursor: pointer;
`;

function Chart() {
  const daysPerWeek = 7;
  const totalWeeks = 52;
  const totalDays = totalWeeks * daysPerWeek;
  const [visibleWeek, setVisibleWeek] = useState(0);

  const [moods, setMoods] = useState({
    happy: [],
    sad: [],
    anxious: [],
    frustrated: [],
  });
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
          const data = await response.json();

          // Transform the mood data into a format suitable for the chart
          const moodsData = data.reduce(
            (acc, moodEntry) => {
              const mood = moodEntry.mood;
              const date = new Date(moodEntry.date);
              const weekNumber = Math.floor(date.getDay() / daysPerWeek);

              acc[mood][weekNumber] = (acc[mood][weekNumber] || 0) + 1;
              return acc;
            },
            { happy: [], sad: [], anxious: [], frustrated: [] }
          );

          setMoods(moodsData);
        } catch (error) {
          console.error("Failed to fetch moods:", error);
        }
      }
    };
      
    fetchMoods();
  }, [userInfo]); 

  const labels = Array.from({ length: totalDays }, (_, i) => `Day ${i + 1}`);

const data = {
  labels: labels.slice(visibleWeek * daysPerWeek, (visibleWeek + 1) * daysPerWeek),
  datasets: [
    {
      label: 'Happy',
      data: moods.happy.slice(visibleWeek * daysPerWeek, (visibleWeek + 1) * daysPerWeek).map(() => 4), // Happy always at 4
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
      fill: false,
      pointRadius: 5, // Makes points visible
    },
    {
      label: 'Sad',
      data: moods.sad.slice(visibleWeek * daysPerWeek, (visibleWeek + 1) * daysPerWeek).map(() => 3), // Sad always at 3
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1,
      fill: false,
      pointRadius: 5,
    },
    {
      label: 'Anxious',
      data: moods.anxious.slice(visibleWeek * daysPerWeek, (visibleWeek + 1) * daysPerWeek).map(() => 1), // Anxious always at 1
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
      fill: false,
      pointRadius: 5,
    },
    {
      label: 'Frustrated',
      data: moods.frustrated.slice(visibleWeek * daysPerWeek, (visibleWeek + 1) * daysPerWeek).map(() => 2), // Frustrated always at 2
      borderColor: 'rgba(153, 102, 255, 1)',
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
        maxTicksLimit: daysPerWeek,
      },
    },
    y: {
      beginAtZero: false,
      ticks: {
        stepSize: 1,
        min: 1,
        max: 4,
      },
    },
  },
  plugins: {
    legend: {
      display: true,
      position: 'top',
    },
  },
};
    
    const handlePrevWeek = () => {
    setVisibleWeek((prevWeek) => (prevWeek > 0 ? prevWeek - 1 : prevWeek));
  };

  const handleNextWeek = () => {
    setVisibleWeek((prevWeek) => (prevWeek < totalWeeks - 1 ? prevWeek + 1 : prevWeek));
  };


return (
    <div>
      <ChartContainer>
        <Line data={data} options={options} />
      </ChartContainer>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px', color:'grey' }}>
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







import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2'; // Import the Line component
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
  width: 800px; // Set a fixed width for the chart container
  margin: 20px auto;
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
  
  const [moods, setMoods] = useState({
    happy: [],
    sad: [],
    anxious: [],
    frustrated: [],
  });
  
  // You can load userInfo from localStorage on component mount
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  
  useEffect(() => {
    // Inside your fetchMoods function

  useEffect(() => {
    const fetchMoods = async () => {
      if (userInfo && userInfo.token) {
        try {
          const response = await fetch(`/api/user/${userInfo._id}/moods`, {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
          });
          const data = await response.json();

          // Transform the mood data into a format suitable for the chart
          const moodsData = data.reduce(
            (acc, moodEntry) => {
              const mood = moodEntry.mood;
              const date = new Date(moodEntry.date);
              const weekNumber = Math.floor(date.getDay() / daysPerWeek);

              acc[mood][weekNumber] = (acc[mood][weekNumber] || 0) + 1;
              return acc;
            },
            { happy: [], sad: [], anxious: [], frustrated: [] }
          );

          setMoods(moodsData);
        } catch (error) {
          console.error("Failed to fetch moods:", error);
        }
      }
    };
      
    fetchMoods();
  }, [userInfo]); 


  // This function generates the labels for the x-axis, accounting for the current date and the month.
  const generateLabels = () => {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const labels = [];
    for (let i = 0; i < daysPerWeek; i++) {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + i);
      labels.push(`${day.getDate()} ${day.toLocaleString('default', { month: 'short' })}`);
    }
    return labels;
  };
    
  const currentWeekLabels = generateLabels();

  const data = {
    labels: currentWeekLabels,
    datasets: [
      // Define your datasets here
      {
        label: 'Happy',
        data: moods.happy.map(mood => {
          const moodDate = new Date(mood.date);
          const labelIndex = currentWeekLabels.findIndex(label => 
            label.startsWith(`${moodDate.getDate()} ${moodDate.toLocaleString('default', { month: 'short' })}`)
          );
          return { x: currentWeekLabels[labelIndex], y: mood.value }; // mood.value should be the y-axis value you want to plot
        }),
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        fill: false,
        pointRadius: 5,
      },
      {
        label: 'Sad',
        data: moods.sad.map(mood => {
          const moodDate = new Date(mood.date);
          const labelIndex = currentWeekLabels.findIndex(label => 
            label.startsWith(`${moodDate.getDate()} ${moodDate.toLocaleString('default', { month: 'short' })}`)
          );
          return { x: currentWeekLabels[labelIndex], y: mood.value }; // mood.value should be the y-axis value you want to plot
        }),
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        fill: false,
        pointRadius: 5,
      },
      {
        label: 'Anxious',
        data: moods.anxious.map(mood => {
          const moodDate = new Date(mood.date);
          const labelIndex = currentWeekLabels.findIndex(label => 
            label.startsWith(`${moodDate.getDate()} ${moodDate.toLocaleString('default', { month: 'short' })}`)
          );
          return { x: currentWeekLabels[labelIndex], y: mood.value }; // mood.value should be the y-axis value you want to plot
        }),
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        fill: false,
        pointRadius: 5,
      },
      {
        label: 'Frustrated',
        data: moods.frustrated.map(mood => {
          const moodDate = new Date(mood.date);
          const labelIndex = currentWeekLabels.findIndex(label => 
            label.startsWith(`${moodDate.getDate()} ${moodDate.toLocaleString('default', { month: 'short' })}`)
          );
          return { x: currentWeekLabels[labelIndex], y: mood.value }; // mood.value should be the y-axis value you want to plot
        }),
        borderColor: 'rgba(153, 102, 255, 1)',
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
          maxTicksLimit: daysPerWeek,
        },
      },
      y: {
        type: 'linear', // Use a linear scale
        min: 0, // Start at 00:00
        max: 24, // End at 24:00 (midnight)
        ticks: {
          stepSize: 2, // Set the step size to 2 to create 2-hour intervals
          callback: function(value, index, values) {
            // Format the labels to display as time in HH:MM format
            let hours = value.toString();
            if (hours === '24') {
              // Replace '24' with '00' to indicate midnight
              hours = '00';
            } else if (hours.length === 1) {
              // Add leading zero if necessary
              hours = '0' + hours;
            }
            return hours + ':00';
          }
        },
        grid: {
          display: true,
          drawBorder: true,
          drawOnChartArea: true,
          drawTicks: true,
          tickLength: 10,
          // Ensure grid lines are displayed at 2-hour intervals
          color: function(context) {
            if (context.tick.value % 2 === 0) {
              return '#E5E5E5'; // Color for grid lines at 2-hour intervals
            } else {
              return 'transparent'; // Transparent for non 2-hour interval grid lines
            }
          }
        }
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(tooltipItem) {
            const label = tooltipItem.dataset.label || '';
            const dataPoint = tooltipItem.dataset.data[tooltipItem.dataIndex];
            if (!dataPoint) {
              return `${label}: No data`;
            }
            const hours = Math.floor(dataPoint.y);
            const minutes = Math.round((dataPoint.y - hours) * 60);
            const formattedHours = hours.toString().padStart(2, '0');
            const formattedMinutes = minutes.toString().padStart(2, '0');
            return `${label}: ${formattedHours}:${formattedMinutes}`;
          }
        }
      },
      legend: {
        display: true,
        position: 'top',
      },
    },
  };

  const handlePrevWeek = () => {
    console.log("Previous week clicked");
    setVisibleWeek((prevWeek) => (prevWeek > 0 ? prevWeek - 1 : prevWeek));
  };

  const handleNextWeek = () => {
    console.log("Next week clicked");
    setVisibleWeek((prevWeek) => (prevWeek < totalWeeks - 1 ? prevWeek + 1 : prevWeek));
  };

  return (
    <div>
      <ChartContainer>
        <Line data={data} options={options} />
      </ChartContainer>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px', color:'grey' }}>
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
