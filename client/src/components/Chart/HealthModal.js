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

  // Function to create table rows from recommendation object in the specified order
  // const tableRows = recommendation && recommendation.details ? Object.keys(recommendation.details).map((key) =>  {
  //    console.log("recommendation exists?", !!recommendation);
  // console.log("recommendation.details exists?", !!recommendation?.details);

  // if (recommendation?.details) {
  //     console.log("Accessing a specific detail:", recommendation.details['Exercise Type']);

  //   return [];
  // }

  // console.log("Processing recommendation details:", recommendation.details);
  //   return orderedKeys
  //   .filter(key => !keysToExclude.includes(key) && recommendation.details[key]) // Check inside recommendation.details
  //   .map(key => (
  //     <Tr key={key}>
  //       <Td>{key}</Td>
  //       <Td>{recommendation.details[key]}</Td>
  //     </Tr>
  //   ));
  // };
  
 const tableRows = recommendation && recommendation.details 
    ? Object.keys(recommendation.details)
      .filter(key => !keysToExclude.includes(key)) // Exclude specific keys
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
      <ModalContent>
        <ModalHeader>Your Recommended Health Plan</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {recommendation && recommendation.details ? (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Aspect</Th>
                  <Th>Details</Th>
                </Tr>
              </Thead>
              <Tbody>
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