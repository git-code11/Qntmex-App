
import {
  VStack,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  Image,
  useColorMode
} from "@chakra-ui/react";
import { getCoinbaseWalletProvider, getMetaMaskProvider } from "./providers";

export default function SelectWalletModal({
  isOpen,
  closeModal,
  connectWithProvider
}) {
  const { colorMode } = useColorMode();
  
  return (
    <Modal isOpen={isOpen} onClose={closeModal} isCentered>
      <ModalOverlay />
      <ModalContent
        w="90%"
        maxW="400px"
        bg={colorMode === "dark" ? "gray.800" : "white"}
      >
        <ModalHeader>Connect Wallet</ModalHeader>
        <ModalCloseButton />
        <ModalBody paddingBottom="1.5rem">
          <VStack spacing={4}>
            <Button
              variant="outline"
              onClick={() => {
                connectWithProvider(getCoinbaseWalletProvider());
                closeModal();
              }}
              w="100%"
              h="60px"
              borderRadius="xl"
            >
              <HStack w="100%" justifyContent="center">
                <Image
                  src="/cbw.png"
                  alt="Coinbase Wallet Logo"
                  width={30}
                  height={30}
                  borderRadius="3px"
                />
                <Text fontSize="lg">Coinbase Wallet</Text>
              </HStack>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                connectWithProvider(getMetaMaskProvider());
                closeModal();
              }}
              w="100%"
              h="60px"
              borderRadius="xl"
            >
              <HStack w="100%" justifyContent="center">
                <Image
                  src="/mm.png"
                  alt="MetaMask Logo"
                  width={30}
                  height={30}
                  borderRadius="3px"
                />
                <Text fontSize="lg">MetaMask</Text>
              </HStack>
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
