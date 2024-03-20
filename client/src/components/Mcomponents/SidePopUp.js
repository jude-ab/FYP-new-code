import {
  Box,
  Button,
  Text,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Drawer,
  Tooltip,
} from "@chakra-ui/react";
import {
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
} from "@chakra-ui/modal";
import { BellIcon } from "@chakra-ui/icons";
import { Avatar } from "@chakra-ui/avatar";
import { ChatState } from "../../Providers/ChatP";
import { useHistory } from "react-router-dom";
import { getSenderName } from "../../utils/ChatLogic";
import NotificationBadge, { Effect } from "react-notification-badge";
import { useDisclosure } from "@chakra-ui/hooks";

const SidePopUp = () => {
  const { user, notif, setNotif, setSelectedChat, setUser } = ChatState();
  const history = useHistory();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const profileNav = () => {
    onClose(); // Close the drawer
    history.push("/profile"); // Navigate to the profile page
  };

  const logoutHandler = () => {
    localStorage.removeItem("userInfo"); // Make sure this key is the same as the one you use in `useEffect`
    setUser(null); // This should update the context's user to null
    history.push("/");
  };

  const chatNav = () => {
    onClose();
    history.push("/chats");
  };

  const libraryNav = () => {
    onClose();
    history.push("/yogaLibrary");
  };

  const HealthNav = () => { 
    onClose();
    history.push("/logHealth");
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="transparent"
        w="100%"
        p="5px 10px"
        boxShadow="0 1px 5px rgba(0, 0, 0, 0.1)"
        zIndex={20}
        top="0"
        position="fixed"
        left="0"
        right="0"
      >
        <Tooltip label="Menu" hasArrow placement="bottom-end">
           <Button
            variant="ghost"
            onClick={onOpen}
            color="black"
            // Use responsive styles for marginRight
            marginRight={{ base: "0", md: "5%", lg: "84%" }}
          >
            <i className="fa-solid fa-bars"></i>
          </Button>
        </Tooltip>
        <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
  <DrawerOverlay bg="rgba(0, 0, 0, 0.7)"/> 

  <DrawerContent borderRadius="0px 20px 20px 0px">
    {/* Remove or comment out the close button */}
    {/* <DrawerCloseButton /> */}
    <DrawerHeader
      position="relative"
      // bg="#0C301F"
      color="white"
      textAlign="center"
      fontFamily="Work sans"
      bg="rgba(12, 48, 31, 0.5)"
      borderRadius="0px 20px 0px 0px"
    >
      YogaHub
      <Box
        position="absolute"
        bottom="0"
        left="50%"
        transform="translateX(-50%)"
        height="1px"
        width="89%"
        bg="white"
      />
    </DrawerHeader>
    <DrawerBody color="white" bg="rgba(12, 48, 31, 0.5)" borderRadius="0px 0px 20px 0px">
      {user && (
      <>
          <Text
            mt={4}
            cursor="pointer"
            onClick={chatNav}
            fontFamily="Work sans"
            fontSize="xl"
          >
            Messages
          </Text>
          <Text
            mt={4}
            cursor="pointer"
            onClick={HealthNav}
            fontFamily="Work sans"
            fontSize="xl"
          >
            Log Health
          </Text>
              </>
            )}
            <Text
              mt={4}
              cursor="pointer"
              onClick={libraryNav}
              fontFamily="Work sans"
              fontSize="xl"
            >
              Poses
            </Text>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
        <Text
          fontSize="2xl"
          color="black"
          fontFamily="Work sans"
          marginLeft={{ base: "23%", md: "0" }}
        >
          YogaHub
        </Text>

        {user ? (
            <Box display="flex" alignItems="center" justifyContent="flex-end" width={{ base: "50%", md: "auto" }}>
            <Menu>
              <MenuButton p={1} mr={{ base: "2", md: "4" }}>
                <NotificationBadge count={notif.length} effect={Effect.SCALE} />
                <BellIcon fontSize="2xl" m={1} color="black"  />
              </MenuButton>
              <MenuList pl={2}>
                {!notif.length && "No New Messages"}
                {notif.map((ntf) => (
                  <MenuItem
                    key={ntf._id}
                    onClick={() => {
                      setSelectedChat(ntf.chat);
                      setNotif(notif.filter((n) => n !== ntf));
                    }}
                  >
                    {ntf.chat.isGroupChat
                      ? `New Message from ${ntf.chat.chatName}`
                      : `New Message from ${getSenderName(
                          user,
                          ntf.chat.users
                        )}`}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
            <Menu>
             <MenuButton
                as={Avatar}
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.profilePic}
                // Adjust margins responsively
                mt="4px"
                mr={{ base: "2", md: "4", lg: "50px" }}
              />
              <MenuList boxShadow="lg"
                borderRadius="10px" 
              >
                <MenuItem onClick={profileNav}>My Profile</MenuItem>
                <MenuItem onClick={logoutHandler}>Logout</MenuItem>
              </MenuList>
            </Menu>
          </Box>
        ) : null}
      </Box>
    </>
  );
};
export default SidePopUp;
