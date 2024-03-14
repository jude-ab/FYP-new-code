import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalCloseButton,
  Button
} from '@chakra-ui/react';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';

function FeedbackModal({ isOpen, onClose, onFeedback, healthPlanId }) {
  // Handler for like and dislike actions
  const handleFeedback = (type) => {
    onFeedback(type, healthPlanId);
    onClose(); // Close the modal after feedback
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent fontFamily="Work sans" >
      <ModalHeader
            fontSize={{ base: "1.1rem", md: "1.2rem" }}
            textAlign={{ base: "center", md: "center" }}      
              >Did the recommended health plan satisfy you?</ModalHeader>
        <ModalCloseButton /> 
        <ModalFooter>
          <Button
            leftIcon={<FaThumbsUp />}
            colorScheme="green"
            onClick={() => handleFeedback('like')}
            marginRight={{ base: "10%", md: "10%" }}
          >
            Like
          </Button>
          <Button
            leftIcon={<FaThumbsDown />}
            colorScheme="red"
            onClick={() => handleFeedback('dislike')}
            marginRight={{ base: "15%", md: "20%" }}          
          >
            Dislike
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default FeedbackModal;