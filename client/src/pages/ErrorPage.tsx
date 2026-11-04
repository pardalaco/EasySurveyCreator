import {
  Box,
  Button,
  HStack,
  Heading,
  Icon,
  Text,
  VStack,
} from "@chakra-ui/react";
import { BsExclamationTriangle } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom"; // O 'next/link' según tu enrutador

interface ErrorPageProps {
  error?: string | number;
  title?: string;
  message?: string;
}

export default function ErrorPage({
  error = "404",
  title,
  message,
}: ErrorPageProps) {
  const navegate = useNavigate();

  // Diccionario inteligente para textos automáticos según el código de error común
  const getErrorDetails = (code: string | number) => {
    switch (String(code)) {
      case "400":
        return {
          title: "Bad Request",
          description:
            "The request could not be processed due to invalid syntax or parameters.",
        };
      case "401":
        return {
          title: "Unauthorized",
          description:
            "You need to authenticate or sign in to access this page.",
        };
      case "403":
        return {
          title: "Access Forbidden",
          description:
            "You do not have the necessary permissions to view this resource.",
        };
      case "404":
        return {
          title: "Page Not Found",
          description:
            "Oops! The survey or page you are looking for doesn't exist or has been moved.",
        };
      case "500":
        return {
          title: "Internal Server Error",
          description:
            "Something went wrong on our servers. Please try again later.",
        };
      default:
        return {
          title: "Unexpected Error",
          description:
            "An unexpected error occurred. Please try again or return home.",
        };
    }
  };

  const errorDetails = getErrorDetails(error);
  const displayTitle = title || errorDetails.title;
  const displayMessage = message || errorDetails.description;

  return (
    <Box
      className="min-vh-100 d-flex align-items-center justify-content-center py-5 px-3"
      bg="gray.50"
    >
      <VStack gap={8} maxW="md" className="w-100 text-center">
        {/* Header / Logo idéntico al creador de encuestas */}
        <HStack justify="center" gap={2}>
          <Text fontSize="2xl" fontWeight="bold" letterSpacing="tight">
            Easy Survey Creator
          </Text>
        </HStack>

        {/* Bloque Ilustrativo / Número de Error Dinámico */}
        <VStack gap={2}>
          <Text
            fontSize="7xl"
            fontWeight="black"
            lineHeight="1"
            color="black"
            letterSpacing="tighter"
          >
            Error {error}
          </Text>
          <Heading as="h1" size="lg" fontWeight="extrabold" color="gray.800">
            {displayTitle}
          </Heading>
          <Text color="gray.500" fontSize="md" className="mt-2">
            {displayMessage}
          </Text>
        </VStack>

        {/* Tarjeta decorativa al estilo de la app */}
        <Box
          w="full"
          p={6}
          bg="white"
          borderRadius="xl"
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.100"
          className="d-flex align-items-center gap-3 text-start"
        >
          <Box bg="gray.100" p={3} borderRadius="lg" color="gray.600">
            <Icon as={BsExclamationTriangle} boxSize={5} />
          </Box>
          <Text fontSize="sm" color="gray.600">
            Double check the URL or return back to create a new survey.
          </Text>
        </Box>

        {/* Botón de acción principal */}
        <Button
          as={Link}
          w="full"

          bg="black"
          color="white"
          size="lg"
          borderRadius="xl"
          py={6}
          _hover={{ bg: "gray.800", textDecoration: "none" }}
          _active={{ bg: "gray.900" }}
          className="shadow-sm"
          onClick={() => navegate("/")}
        >
          Back to Home
        </Button>
      </VStack>
    </Box>
  );
}
