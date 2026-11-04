import { Toaster } from "@/components/ui/toaster";
import { Box, Button, HStack, Heading, Text, VStack } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "react-router-dom";
import { type Survey as SurveyType } from "../types/index.js";
import ErrorPage from "./ErrorPage";
import LoadingPage from "./Loading.js";

type Props = {};

function Survey({}: Props) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const params = useParams(); // Obtenemos los valores de la URL
  const idSurvey = params.idSurvey;

  const { error, data, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: () =>
      axios
        .get<SurveyType>(`${apiUrl}/survey/${idSurvey}`)
        .then((response) => response.data),
  });

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error || !data) {
    return <ErrorPage />;
  }

  const options = data.options;
  const question = data.question;

  return (
    <>
      <Box minH="100vh" bg="gray.50" py={10} px={4}>
        <VStack gap={8} maxW="md" mx="auto" align="stretch">
          {/* Header  */}
          <HStack justify="center" gap={2}>
            <Text fontSize="2xl" fontWeight="bold" letterSpacing="tight">
              Easy Suvery Creator
            </Text>
          </HStack>

          {/* Título */}
          <Heading textAlign="center" as="h1" size="lg" fontWeight="extrabold">
            {question}
          </Heading>

          {/* Formulario de la encuesta */}
          <VStack gap={4} w="full">
            {/* Opciones */}
            <VStack gap={3} w="full" pt={2}>
              {options.map((option, index) => (
                <Button
                  key={index}
                  w="full"
                  bg="white"
                  size="lg"
                  borderRadius="xl"
                  boxShadow="sm"
                  border="none"
                  _placeholder={{ color: "gray.400" }}
                  _focus={{ boxShadow: "md", border: "none" }}
                  _hover={{ backgroundColor: "gray.200" }}
                >
                  {option.text}
                </Button>
              ))}
            </VStack>
          </VStack>
        </VStack>
      </Box>
      <Toaster />
    </>
  );
}

export default Survey;
