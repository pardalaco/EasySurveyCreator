import { Box, Button, Collapsible, Text, VStack } from "@chakra-ui/react";
import { QRCodeSVG } from "qrcode.react";
import { LuChevronDown, LuQrCode } from "react-icons/lu";

type Props = {
  link: string;
};

function CollapsibleQRcode({ link }: Props) {
  return (
    <Collapsible.Root width="full">
      <Collapsible.Trigger asChild>
        <Button
          variant="outline"
          bg="black"
          color="white"
          width="full"
          justifyContent="space-between"
        >
          <Box display="flex" alignItems="center" gap={2}>
            <LuQrCode />
            <Text as="span" lineHeight="normal">
              Show QR code
            </Text>
          </Box>{" "}
          <LuChevronDown />
        </Button>
      </Collapsible.Trigger>

      <Collapsible.Content>
        <VStack
          mt={3}
          p={4}
          bg="white"
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius="md"
          align="center"
        >
          <QRCodeSVG value={link || ""} size={180} />
          <Text fontSize="xs" color="gray.500" mt={2}>
            Scan to access the survey
          </Text>
        </VStack>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

export default collapsibleQRcode;
