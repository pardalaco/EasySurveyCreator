import { Box } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import type { ReactNode } from "react";

// Animación CSS para rellenar la barra progresivamente
const fillAnimation = (targetPercentage: number) => keyframes`
  from { width: 0%; }
  to { width: ${targetPercentage}%; }
`;

type Props = {
  percentage: number;
  children: ReactNode;
};

function BoxVote({ percentage, children }: Props) {
  return (
    <Box
      as="button"
      w="full"
      h="50px"
      bg="white"
      borderRadius="xl"
      boxShadow="sm"
      position="relative"
      overflow="hidden"
      cursor="pointer"
      transition="all 0.1s"
      _hover={{ boxShadow: "md" }}
      _active={{ transform: "scale(0.99)" }}
      textAlign="left"
    >
      {/* Capa de fondo coloreada que se anima según el porcentaje */}
      <Box
        position="absolute"
        top={0}
        left={0}
        bottom={0}
        bg="black"
        borderRadius="inherit"
        animation={`${fillAnimation(percentage)} .5s cubic-bezier(0.4, 0, 0.2, 1) forwards`}
      />

      {/* Contenido (children) colocado por encima de la barra de progreso */}
      <Box
        position="relative"
        zIndex={1}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={4}
        h="full"
        color="white"
        css={{ mixBlendMode: "difference" }} // Invierte el color inteligentemente según el fondo
      >
        <Box display="flex" alignItems="center">
          {children}
        </Box>

        <span>{percentage}%</span>
      </Box>
    </Box>
  );
}

export default BoxVote;
