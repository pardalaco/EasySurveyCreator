import { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Button,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";

export default function CreateSurvey() {
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [question, setQuestion] = useState<string>("");

  const handleAddOption = (): void => {
    if (options.length < 5) setOptions([...options, ""]);
    else {
      toaster.create({
        description: "The maximum number of options has been reached.",
        type: "warning",
      });
    }
  };

  const handleDeleteOption = (index: number): void => {
    const newOption = [...options];
    newOption.splice(index, 1);
    setOptions(newOption);
  };

  return (
    <Box minH="100vh" bg="gray.50" py={10} px={4}>
      <VStack gap={8} maxW="md" mx="auto" align="stretch">
        {/* Header / Logo */}
        <HStack justify="center" gap={2}>
          <Text fontSize="2xl" fontWeight="bold" letterSpacing="tight">
            Easy Suvery Creator
          </Text>
        </HStack>

        {/* Título */}
        <VStack gap={1} textAlign="center">
          <Heading as="h1" size="lg" fontWeight="extrabold">
            Create your Suvery.
          </Heading>
          <Heading as="h2" size="lg" fontWeight="extrabold">
            No sign up required.
          </Heading>
        </VStack>

        {/* Formulario de la encuesta */}
        <VStack gap={4} w="full">
          {/* Input de la Pregunta */}
          <Input
            placeholder="What's your question?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            bg="white"
            size="lg"
            borderRadius="xl"
            boxShadow="sm"
            border="none"
            _placeholder={{ color: "gray.400" }}
            _focus={{ boxShadow: "md", border: "none" }}
          />

          {/* Opciones */}
          <VStack gap={3} w="full" pt={2}>
            {options.map((option, index) => (
              <HStack key={index} w="full" gap={2}>
                {" "}
                <Input
                  key={index}
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...options];
                    newOptions[index] = e.target.value;
                    setOptions(newOptions);
                  }}
                  bg="white"
                  size="lg"
                  borderRadius="xl"
                  boxShadow="sm"
                  border="none"
                  _placeholder={{ color: "gray.400" }}
                  _focus={{ boxShadow: "md", border: "none" }}
                />
                {options.length > 2 && (
                  <Button
                    variant="surface"
                    colorScheme="gray"
                    size="md"
                    borderRadius="xl"
                    onClick={() => handleDeleteOption(index)}
                  >
                    ✕
                  </Button>
                )}
              </HStack>
            ))}
          </VStack>

          {/* Botón para añadir más opciones */}
          {options.length < 5 && (
            <HStack justify="flex-end" w="full">
              <Button
                color="gray.700"
                fontSize="sm"
                fontWeight="medium"
                onClick={handleAddOption}
                _hover={{ textDecoration: "none", color: "black" }}
              >
                + Add Option
              </Button>
            </HStack>
          )}

          {/* Botón Submit */}
          <Button
            w="full"
            bg="black"
            color="white"
            size="lg"
            borderRadius="xl"
            py={6}
            mt={4}
            _hover={{ bg: "gray.800" }}
            _active={{ bg: "gray.900" }}
          >
            Create Suvery!
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
}
