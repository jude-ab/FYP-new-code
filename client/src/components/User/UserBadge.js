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
      variant='outline'
      fontSize={12}
      colorScheme="#0C301F"
      color="black"
      cursor="pointer"
      flexDirection="row"
      d="flex"
      onClick={handleFunction}
    >
      {user.username}
      <CloseIcon marginLeft="2%" boxSize="2.5%"/>
    </Box>
  );
};

export default UserBadge;
