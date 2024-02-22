// PoseDetailsModal.js
import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Text,
} from '@chakra-ui/react';

const PoseDetailsModal = ({ isOpen, onClose, pose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxW="2xl" maxH="80vh">
        <ModalHeader textAlign="center" fontFamily="Work sans">{pose?.AName}</ModalHeader>
        <ModalCloseButton />
        <ModalBody
            fontFamily="Work sans"
            overflowY="auto"
            css={{
                '&::-webkit-scrollbar': {
                width: '4px',
                },
                '&::-webkit-scrollbar-track': {
                width: '6px',
                },
                '&::-webkit-scrollbar-thumb': {
                background: 'gray',
                borderRadius: '24px',
                }
            }}
        >
          <Text mb={2}>Level: {pose?.Level}</Text>
          <Text mb={2}>Description: {pose?.Description}</Text>
          <Text mb={2}>Benefits: {pose?.Benefits}</Text>
          <Text mb={2}>Breathing: {pose?.Breathing}</Text>
          <Text mb={2}>Awareness: {pose?.Awareness}</Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PoseDetailsModal;
