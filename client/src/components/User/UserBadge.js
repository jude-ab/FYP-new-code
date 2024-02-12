import React from "react";
import { Box } from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";

const UserBadge = ({ user, handleFunction }) => {
  return (
    <Box
      px={2}
      py={1}
      borderRadius="lg"
      width="fit-content"
      m={1}
      mb={2}
      variant="solid"
      fontSize={12}
      backgroundColor="teal"
      color="white"
      cursor="pointer"
      onClick={handleFunction}
    >
      {user.username}
      <CloseIcon />
    </Box>
  );
};

export default UserBadge;
