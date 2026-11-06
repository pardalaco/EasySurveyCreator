import BoxVote from "@/components/BoxVote.js";
import CollapseQrCode from "@/components/collapsibleQRcode.js";
import { Toaster, toaster } from "@/components/ui/toaster";
import { Box, Button, HStack, Heading, Text, VStack } from "@chakra-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { LuCheck, LuCopy } from "react-icons/lu";
import { useParams } from "react-router-dom";
import { Socket, io } from "socket.io-client";
import ButtonOption from "@/components/ButtonOption.js";
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

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000); // Vuelve al estado original a los 2 segundos
    } catch (err) {
      console.error("Error al copiar al portapapeles", err);
    }
  };
  const [votedOptions, setVotedOptions] = useState<SurveyOption[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [totalVotes, setTotalVotes] = useState(0);
  const [votedOptionIndex, setVotedOptionIndex] = useState(-1);

  const { error, data, isLoading } = useQuery({
    queryKey: ["survey", idSurvey],
    queryFn: () =>
      axios
        .get<SurveyType>(`${apiUrl}/survey/${idSurvey}`)
        .then((response) => response.data),
  });

  // Efecto para conectar al socket SOLO cuando el usuario ya ha votado
  useEffect(() => {
    if (!hasVoted || !idSurvey) return;

    const socket: Socket = io(apiUrl);

    const eventoNombre = `update-vote-${idSurvey}`;

    socket.on(eventoNombre, (surveyActualizada: SurveyType) => {
      const options = surveyActualizada.options;
      setVotedOptions(options);

      const sumVotes = options.reduce(
        (acc, option) => acc + (option.votes || 0),
        0
      );
      setTotalVotes(sumVotes);
    });

    // Limpieza: desconectar el socket si el componente se desmonta
    return () => {
      socket.disconnect();
    };
  }, [hasVoted, idSurvey]);

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

  const renderVotingContent = () => {
    if (isPending) {
      return options.map((option, index) => {
        const percentage = index === votedOptionIndex ? 100 : 0;

        return (
          <BoxVote key={index} percentage={percentage}>
            {option.text}
          </BoxVote>
        );
      });
    }

    if (hasVoted) {
      return votedOptions.map((option, index) => {
        const optionVotes = option.votes || 0;
        const percentage =
          totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;

        return (
          <BoxVote key={index} percentage={percentage}>
            {option.text}
          </BoxVote>
        );
      });
    }

    return options.map((option, index) => (
      <ButtonOption
        key={index}
        index={index}
        handleClick={() => handleVote(index)}
      >
        {option.text}
      </ButtonOption>
    ));
  };

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
            {renderVotingContent()}
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
