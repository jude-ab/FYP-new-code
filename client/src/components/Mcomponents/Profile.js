import { ViewIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  IconButton,
  Text,
  Image,
  Flex,
} from "@chakra-ui/react";

const Profile = ({ user, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  console.log(user); // Add this to check if the user prop is passed correctly

 return (
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <IconButton d={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} background="transparent" marginLeft="3%" marginTop="-0.2%"/>
      )}
      <Modal height="50%" onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent maxH="600px" overflowY="auto">
          <ModalHeader
            fontSize="25px"
            fontFamily="Work sans"
            d="flex"
            justifyContent="center"
            textAlign="center"
            marginTop="5%"
          >
            {user.username}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            d="flex"
            flexDir="column"
            alignItems="center"
            justifyContent="space-between"
          >
            <Flex justify="center" align="center">
              <Image
                borderRadius="full"
                boxSize="150px"
                src={user.profilePic}
                alt={user.username}
              />
            </Flex>
            <Text
              fontSize={{ base: "20px", md: "18px" }}
              fontFamily="Work sans"
              textAlign="center"
              marginTop="5%"
            >
              Email: {user.email}
            </Text>
           {/* Conditional rendering for about section */}
           {user.dob && (
            <Text
              fontSize={{ base: "20px", md: "18px" }}
              fontFamily="Work sans"
              textAlign="center"
              marginTop="5%"
            >
              Date of Birth: {new Date(user.dob).toLocaleDateString()}
            </Text>
          )}
            {user.about && (
              <Text
                fontSize={{ base: "20px", md: "18px" }}
                fontFamily="Work sans"
                textAlign="center"
                marginTop="5%"
                marginBottom="3%"
              >
               About: {user.about}
              </Text>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Profile;
