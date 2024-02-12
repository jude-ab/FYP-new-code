import React from "react";
import { Box, Avatar, Text } from "@chakra-ui/react";

const UserList = ({ user, handleFunction }) => {
  return (
    <Box
      onClick={handleFunction}
      cursor="pointer"
      bg="#E8E8E8"
      _hover={{
        bg: "#D8D8D8",
        color: "whitw",
      }}
      w="100%"
      d="flex"
      alignItems="center"
      color="black"
      px={3}
      py={2}
      mb={2}
      borderRadius="lg"
    >
      <Avatar mr={2} size="sm" name={user.name} src={user.pfp} />
      <Box>
        <Text fontSize="xs">{user.username}</Text>
      </Box>
    </Box>
  );
};

export default UserList;
