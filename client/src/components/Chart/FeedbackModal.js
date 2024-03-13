// New component file for feedback modal
import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, Button } from '@chakra-ui/react';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';

function FeedbackModal({ isOpen, onClose, onFeedback, healthPlanId }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>How did you like the health plan?</ModalHeader>
        <ModalFooter>
        <Button leftIcon={<FaThumbsUp />} colorScheme="green" onClick={() => onFeedback('like', healthPlanId)}>
            Like
            </Button>
            <Button leftIcon={<FaThumbsDown />} colorScheme="red" onClick={() => onFeedback('dislike', healthPlanId)}>
                Dislike
        </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default FeedbackModal;
