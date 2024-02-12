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
      const { data } = await axios.put('/api/user/profile', editFields, config);
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

  return (
    <Box position="relative" width="100vw">
      <SidePopUp />
      <Flex align="center" justifyContent="center" pt={10}>
        <VStack spacing={5} width="full" maxW="500px">
          <Avatar size="2xl" name={userProfile ? userProfile.username : user ? user.username : ''} src={userProfile ? userProfile.pfp : user ? user.pfp : ''} />
          <FormControl id="username">
            <FormLabel>Name</FormLabel>
            <Input
              name="username"
              value={editFields.username}
              onChange={handleChange}
              isReadOnly={!editMode}
            />
          </FormControl>
          <FormControl id="email">
            <FormLabel>Email</FormLabel>
            <Input
              name="email"
              value={editFields.email}
              onChange={handleChange}
              isReadOnly={!editMode}
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
            />
          </FormControl>
          <FormControl id="about">
            <FormLabel>About Yourself</FormLabel>
            <Textarea
              name="about"
              value={editFields.about}
              onChange={handleChange}
              isReadOnly={!editMode}
            />
          </FormControl>
          <Button
            bg={editMode ? "#0C301F" : "#0C301F"} // Set the button's background color
            color="white" // Set the text color to white for better contrast
            _hover={{
                bg: editMode ? "#1E4D38" : "#1E4D38" // Darken the color on hover
            }}
            onClick={editMode ? handleSaveChanges : toggleEditMode}
            >
            {editMode ? "Save Changes" : "Edit Profile"}
           </Button>

        </VStack>
      </Flex>
    </Box>
  );
}

export default UserProfile;

