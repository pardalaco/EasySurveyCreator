import { Toaster } from "@/components/ui/toaster";
import useOptions from "@/hooks/useOptions";
import {
  Box,
  Button,
  HStack,
  Heading,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { useCreateSurvey } from "@/hooks/useCreateSurvey";

export default function CreateSurvey() {
  const { options, setOptions, addOption, removeOption } = useOptions();

  const [question, setQuestion] = useState<string>("");

  // Llamas al hook y desestructuras la función
  const { createSurvey } = useCreateSurvey();
  const handleCreateSuvery = async () => {
    await createSurvey(question, options);
  };

  return (
    <>
      <Box minH="100vh" bg="gray.50" py={10} px={4}>
        <VStack gap={8} maxW="md" mx="auto" align="stretch">
          {/* Header / Logo */}
          <HStack justify="center" gap={2}>
            <Text fontSize="2xl" fontWeight="bold" letterSpacing="tight">
              Easy Survey Creator
            </Text>
          </HStack>

          {/* Título */}
          <VStack gap={1} textAlign="center">
            <Heading as="h1" size="lg" fontWeight="extrabold">
              Create your Survey.
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
                      onClick={() => removeOption(index)}
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
                  variant={"ghost"}
                  color="gray.700"
                  fontSize="sm"
                  borderRadius="xl"
                  fontWeight="medium"
                  onClick={addOption}
                  _hover={{ textDecoration: "none", color: "white" }}
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
              onClick={handleCreateSuvery}
            >
              Create Survey!
            </Button>
          </VStack>
        </VStack>
      </Box>
      <Toaster />
    </>
  );
}
