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
  Text
} from '@chakra-ui/react';

function HealthPlanModal({ recommendation, isOpen, onClose, onOpenFeedback }) {
  console.log("Received recommendation in HealthPlanModal:", recommendation);
  console.log("Details:", recommendation?.details);
  // Define the desired order of the table rows
  const orderedKeys = [
    'Exercise Type',
    'Duration',
    'Meal Plan',
    'Supplements'
  ];
  
  const keysToExclude = ['cluster', 'Duration_mins', '_id'];
  
 const tableRows = recommendation && recommendation.details 
  ? orderedKeys
    .filter(key => Object.keys(recommendation.details).includes(key)) // Filter keys to ensure they exist in recommendation.details
    .filter(key => !keysToExclude.includes(key)) // Exclude keys specified in keysToExclude
    .map(key => (
      <Tr key={key}>
        <Td>{key.replace(/([A-Z])/g, ' $1').trim()}</Td> {/* Optional: Add space before capital letters for better readability */}
        <Td>{recommendation.details[key]}</Td>
      </Tr>
    ))
  : null;



  // Modify the onClose prop to not only close the modal but also to open the feedback modal
  const handleClose = () => {
    onClose(); // Close the HealthPlanModal
    onOpenFeedback(); // Open the FeedbackModal
  };

return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
    <ModalContent
      fontFamily="Work sans"
      borderRadius="50px"
      boxShadow="0 2px 10px rgba(0, 0, 0, 0.5)"
    >
        <ModalHeader textAlign="center"> Here is your recommended health plan. </ModalHeader>
        <ModalCloseButton />
      <ModalBody  >
        <Text
          fontSize="lg"
          textAlign="center"
          mb={4}
        >
           You've been feeling mostly {recommendation.mostCommonMood} this past week.
        </Text>
          {recommendation && recommendation.details ? (
            <Table  variant="simple">
              <Thead>
                <Tr >
                  <Th>To Do</Th>
                  <Th>Details</Th>
                </Tr>
              </Thead>
              <Tbody >
                {tableRows}
              </Tbody>
            </Table>
          ) : (
            <Text>No details available for this recommendation.</Text>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default HealthPlanModal;