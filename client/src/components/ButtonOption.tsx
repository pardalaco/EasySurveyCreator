import { Button } from "@chakra-ui/react";
import { type ReactNode } from "react";

type Props = {
  index: number;
  children: ReactNode;
  handleClick: () => void;
};

function ButtonOption({ index, children, handleClick }: Props) {
  return (
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
      onClick={handleClick}
    >
      {children}
    </Button>
  );
}

export default ButtonOption;
