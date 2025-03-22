import { Box, VStack, Text, Button, IconButton } from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";

function Collectibles({ onClose }) {
  return (
    <Box 
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="gray.900"
      zIndex="1000"
      p={4}
    >
      <IconButton
        icon={<CloseIcon />}
        position="absolute"
        right={4}
        top={4}
        onClick={onClose}
        variant="ghost"
        color="gray.400"
      />
      <VStack spacing={4} align="center" justify="center" h="full">
        <Text color="gray.400">No collectibles found</Text>
      </VStack>
    </Box>
  );
}

export default Collectibles;