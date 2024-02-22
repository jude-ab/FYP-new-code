import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';

function HealthPlanModal({ recommendation, isOpen, onClose }) {
  // Define the desired order of the table rows
  const orderedKeys = [
    'Exercise Type',
    'Duration',
    'Meal Plan',
    'Supplements'
  ];
  
  const keysToExclude = ['cluster', 'Duration_mins'];

  // Function to create table rows from recommendation object in the specified order
  const createTableRows = (recommendation) => {
    if (!recommendation) {
      return []; // If there's no recommendation, return an empty array
    }
    
    return orderedKeys
      .filter((key) => !keysToExclude.includes(key) && recommendation[key]) // Ensure the key is not excluded and exists in recommendation
      .map((key) => (
        <Tr key={key}>
          <Td>{key}</Td>
          <Td>{recommendation[key]}</Td>
        </Tr>
      ));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Your Recommended Health Plan</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>To Do</Th>
                <Th>Detail</Th>
              </Tr>
            </Thead>
            <Tbody>{createTableRows(recommendation)}</Tbody>
          </Table>
        </ModalBody>
        <ModalFooter>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default HealthPlanModal;