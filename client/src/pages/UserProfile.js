import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Flex,
  VStack,
  Input,
  Button,
  FormControl,
  FormLabel,
  Avatar,
  useToast,
  Textarea
} from '@chakra-ui/react';
import { useHistory } from 'react-router-dom';
import SidePopUp from "../components/Mcomponents/SidePopUp";
import { ChatState } from "../Providers/ChatP";
import logimage from '../assets/images/cshape.png';

function UserProfile() {
  const [userProfile, setUserProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editFields, setEditFields] = useState({
    username: '',
    email: '',
    dob: '',
    about: ''
  });
  const { user } = ChatState();
  const history = useHistory();
  const toast = useToast();

  // Fetch user profile
  const fetchUserProfile = async () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) {
      history.push('/login'); // Redirect to login if no userInfo
      return;
    }

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    try {
      const { data } = await axios.get('/api/user/profile', config);
      setUserProfile(data);
      setEditFields({
        username: data.username || '',
        email: data.email || '',
        dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '', // Convert date to YYYY-MM-DD format
        about: data.about || '',
      });
    } catch (error) {
      console.error('Failed to fetch user profile', error);
      toast({
        title: "Error fetching profile",
        description: error.response?.data?.message || "An unexpected error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      if (error.response && error.response.status === 401) {
        history.push('/login');
      }
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [history]);

  const handleSaveChanges = async () => {
    if (!editMode) return;

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) return;

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

   try {
      // Include the profile picture URL in the payload if it's been changed
      const payload = { ...editFields };
      if (editFields.profilePic) {
        payload.profilePic = editFields.profilePic;
      }

      // Send the PUT request to the backend with the user's updated information
      const { data } = await axios.put('/api/user/profile', payload, config);
      setUserProfile(data);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      localStorage.setItem('userInfo', JSON.stringify({ ...userInfo, ...data }));
      setEditMode(false);
    } catch (error) {
      console.error('Failed to update user profile', error);
      toast({
        title: "Error updating profile",
        description: error.response?.data?.message || "An unexpected error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditFields(prev => ({ ...prev, [name]: value }));
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  if (!userProfile && !user) {
    return <Box>Loading...</Box>;
  }
  
  const handleProfilePicChange = (e) => {
  if (e.target.files && e.target.files[0]) {
    const imageFile = e.target.files[0];
    uploadProfilePicture(imageFile);
  }
};

  const uploadProfilePicture = (imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('upload_preset', 'chat-app'); // Replace with your preset
  formData.append('cloud_name', 'ddoxolplz'); // Replace with your cloud name

  axios.post('https://api.cloudinary.com/v1_1/ddoxolplz/image/upload', formData)
    .then((response) => {
      const imageUrl = response.data.url;
      setEditFields(prevFields => ({ ...prevFields, profilePic: imageUrl }));
    })
    .catch((error) => {
      console.error('Error uploading image:', error);
      toast({
        title: "Error uploading image",
        description: "Unable to upload image. Please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    });
};

  
  return (
    <Box position="relative" width="100vw" height="100vh" overflowY="auto">
      <Box
        position="fixed"
        top={0}
        right={0}
        bottom={0}
        left={0}
        backgroundImage={`url(${logimage})`}
        backgroundSize="cover"
        backgroundPosition="center"
        backgroundRepeat="no-repeat"
        filter="blur(3px)" // Apply blur to just the background image
        zIndex={-1}
        transform="scaleX(-1)"
      />
      <SidePopUp />
      <Flex align="center" justifyContent="center" pt={10}
        marginTop={{ base: "20%", md: "2%" }} // Adjust marginTop as necessary
      >
        <VStack spacing={5} width="full" maxW="500px">
          <Avatar
            size="2xl"
            name={userProfile ? userProfile.username : user ? user.username : ''}
            src={editMode ? editFields.profilePic : (userProfile ? userProfile.profilePic : user ? user.profilePic : '')}
          />
          {editMode && (
          <FormControl id="profilePic">
            <FormLabel textAlign="center"> Edit Profile Picture</FormLabel>
            <Input
              type="file"
              accept="image/*"
              onChange={handleProfilePicChange}
              bg="transparent"
              width="49%"  
              marginLeft="23%"  
            />
          </FormControl>
        )}
          <FormControl id="username">
            <FormLabel>Name</FormLabel>
            <Input
              name="username"
              value={editFields.username}
              onChange={handleChange}
              isReadOnly={!editMode}
              bg="white"
              boxShadow="0 2px 10px rgba(0, 0, 0, 0.5)"
            />
          </FormControl>
          <FormControl id="email">
            <FormLabel>Email</FormLabel>
            <Input
              name="email"
              value={editFields.email}
              onChange={handleChange}
              isReadOnly={!editMode}
              bg="white"
              boxShadow="0 2px 10px rgba(0, 0, 0, 0.5)"
            />
          </FormControl>
          <FormControl id="dob">
            <FormLabel>Date of Birth</FormLabel>
            <Input
              type="date"
              name="dob"
              value={editFields.dob}
              onChange={handleChange}
              isReadOnly={!editMode}
              bg="white"
              boxShadow="0 2px 10px rgba(0, 0, 0, 0.5)"
            />
          </FormControl>
          <FormControl id="about">
            <FormLabel>About Yourself</FormLabel>
            <Textarea
              name="about"
              value={editFields.about}
              onChange={handleChange}
              isReadOnly={!editMode}
              bg="white"
              boxShadow="0 2px 10px rgba(0, 0, 0, 0.5)"
            />
          </FormControl>
          <Button
            bg={editMode ? "#0C301F" : "#0C301F"} // Set the button's background color
            color="white" // Set the text color to white for better contrast
            _hover={{
                bg: editMode ? "#1E4D38" : "#1E4D38" // Darken the color on hover
            }}
            onClick={editMode ? handleSaveChanges : toggleEditMode}
            boxShadow="0 2px 10px rgba(0, 0, 0, 0.5)"
            >
            {editMode ? "Save Changes" : "Edit Profile"}
            
           </Button>

        </VStack>
      </Flex>
    </Box>
  );
}

export default UserProfile;

