import { Box, HStack, Skeleton, Text, VStack } from "@chakra-ui/react";

export default () => {
  return (
    <Box minH="100vh" bg="gray.50" py={10} px={4}>
      <VStack gap={8} maxW="md" mx="auto" align="stretch">
        {/* Header  */}
        <HStack justify="center" gap={2}>
          <Text fontSize="2xl" fontWeight="bold" letterSpacing="tight">
            Easy Suvery Creator
          </Text>
        </HStack>

        {/* Título Skeleton */}
        <VStack gap={2} px={4}>
          <Skeleton height="28px" width="80%" borderRadius="md" />
          <Skeleton height="28px" width="60%" borderRadius="md" />
        </VStack>

        {/* Formulario / Opciones Skeleton */}
        <VStack gap={4} w="full">
          <VStack gap={3} w="full" pt={2}>
            {/* Simulamos 4 botones de opción */}
            {[1, 2, 3, 4].map((item) => (
              <Skeleton
                key={item}
                height="48px" // Mismo tamaño aproximado del Button size="lg"
                w="full"
                borderRadius="xl"
              />
            ))}
          </VStack>
        </VStack>
      </VStack>
    </Box>
  );
};
