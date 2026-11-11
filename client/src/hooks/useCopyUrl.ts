import { useState } from "react";

export function useCopyUrl(shareUrl: string) {
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

  return { hasCopied, handleCopy };
}
