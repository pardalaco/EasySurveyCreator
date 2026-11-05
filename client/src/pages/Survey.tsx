import BoxVote from "@/components/BoxVote.js";
import { Toaster, toaster } from "@/components/ui/toaster";
import { Box, HStack, Heading, Text, VStack } from "@chakra-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { useParams } from "react-router-dom";
import ButtonOption from "../components/ButtonOption.js";
import {
  type SurveyOption,
  type Survey as SurveyType,
} from "../types/index.js";
import ErrorPage from "./ErrorPage";
import LoadingPage from "./Loading.js";

type Props = {};

function Survey({}: Props) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const params = useParams();
  const idSurvey = params.idSurvey;

  const [votedOptions, setVotedOptions] = useState<SurveyOption[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [totalVotes, setTotalVotes] = useState(0);

  const { error, data, isLoading } = useQuery({
    queryKey: ["survey", idSurvey],
    queryFn: () =>
      axios
        .get<SurveyType>(`${apiUrl}/survey/${idSurvey}`)
        .then((response) => response.data),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (optionIndex: number) =>
      axios
        .post<SurveyType>(`${apiUrl}/survey/${idSurvey}/vote`, {
          optionIndex: optionIndex,
        })
        .then((response) => response.data),
    onSuccess: (data) => {
      const options = data.options;
      setVotedOptions(options);

      const sumVotes = options.reduce(
        (acc, option) => acc + (option.votes || 0),
        0
      );
      setTotalVotes(sumVotes);

      setHasVoted(true);
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data ||
        "Ocurrió un error al enviar tu voto.";

      toaster.create({
        description: errorMessage,
        type: "error",
      });
    },
  });

  const handleVote = (optionIndex: number) => {
    mutate(optionIndex);
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error || !data) {
    return <ErrorPage />;
  }

  const question = data.question;
  const options = data.options;

  return (
    <>
      <Box minH="100vh" bg="gray.50" py={10} px={4}>
        <VStack gap={8} maxW="md" mx="auto" align="stretch">
          {/* Header  */}
          <HStack justify="center" gap={2}>
            <Text fontSize="2xl" fontWeight="bold" letterSpacing="tight">
              Easy Survey Creator
            </Text>
          </HStack>

          {/* Título */}
          <Heading textAlign="center" as="h1" size="lg" fontWeight="extrabold">
            {question}
          </Heading>

          {/* Formulario de la encuesta */}
          <VStack gap={4} w="full">
            <VStack gap={3} w="full" pt={2}>
              {isPending && <Text>Enviando voto...</Text>}

              {hasVoted
                ? votedOptions.map((option, index) => {
                    const optionVotes = option.votes || 0;

                    const percentage =
                      totalVotes > 0
                        ? Math.round((optionVotes / totalVotes) * 100)
                        : 0;

                    return (
                      <BoxVote key={index} percentage={percentage}>
                        {option.text}
                      </BoxVote>
                    );
                  })
                : options.map((option, index) => (
                    <ButtonOption
                      key={index}
                      index={index}
                      handleClick={() => handleVote(index)}
                    >
                      {option.text}
                    </ButtonOption>
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
