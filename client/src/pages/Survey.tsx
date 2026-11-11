import CollapseQrCode from "@/components/CollapsibleQRcode.js";
import { SurveyVotingContent } from "@/components/SurveyVotingContent.js";
import { Toaster } from "@/components/ui/toaster";
import { useCopyUrl } from "@/hooks/useCopyUrl.js";
import { useEffectSurvey } from "@/hooks/useEffectSurvey.js";
import { useMutationSurvey } from "@/hooks/useMutationSurvey.js";
import { useVotedOptions } from "@/hooks/useVotedOptions.js";
import { Box, Button, HStack, Heading, Text, VStack } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { LuCheck, LuCopy } from "react-icons/lu";
import { useParams } from "react-router-dom";
import { type Survey as SurveyType } from "../types/index.js";
import ErrorPage from "./ErrorPage";
import LoadingPage from "./Loading.js";

type Props = {};

function Survey({}: Props) {
  // Obtenemos los datos de los params
  const apiUrl = import.meta.env.VITE_API_URL;
  const params = useParams();
  const idSurvey = params.idSurvey;

  // Obtenemos los datos de la encuesta
  const { error, data, isLoading } = useQuery({
    queryKey: ["survey", idSurvey],
    queryFn: () =>
      axios
        .get<SurveyType>(`${apiUrl}/survey/${idSurvey}`)
        .then((response) => response.data),
  });

  // Copiar url
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const { hasCopied, handleCopy } = useCopyUrl(shareUrl);

  // Opción seleccionada
  const [votedOptionIndex, setVotedOptionIndex] = useState(-1);

  // hooks
  const { votedOptions, setVotedOptions, totalVotes, setTotalVotes } =
    useVotedOptions();

  const { hasVoted, mutate, isPending } = useMutationSurvey(
    apiUrl,
    idSurvey,
    setVotedOptions,
    setTotalVotes
  );

  // Efecto para conectar al socket SOLO cuando el usuario ya ha votado
  useEffectSurvey(apiUrl, idSurvey, hasVoted, setVotedOptions, setTotalVotes);

  const handleVote = (optionIndex: number) => {
    setVotedOptionIndex(optionIndex);
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
            <SurveyVotingContent
              isPending={isPending}
              hasVoted={hasVoted}
              options={options}
              votedOptions={votedOptions}
              totalVotes={totalVotes}
              votedOptionIndex={votedOptionIndex}
              handleVote={handleVote}
            />
          </VStack>

          {/* Link copiar al portapapeles */}
          <Button
            onClick={handleCopy}
            bg="black"
            color="white"
            _hover={{ bg: "gray.800" }}
            width="full"
            mt={10}
          >
            {hasCopied ? <LuCheck /> : <LuCopy />}
            {hasCopied ? "¡Enlace copiado!" : "Copiar enlace de la encuesta"}
          </Button>

          {/* Desplegable con código QR */}
          <CollapseQrCode link={shareUrl} />
        </VStack>
      </Box>
      <Toaster />
    </>
  );
}

export default Survey;
