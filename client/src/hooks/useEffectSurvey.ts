import { useEffect } from "react";
import { Socket, io } from "socket.io-client";
import {
  type SurveyOption,
  type Survey as SurveyType,
} from "../types/index.js";

export const useEffectSurvey = (
  apiUrl: string,
  idSurvey: string | undefined,
  hasVoted: boolean,
  setVotedOptions: React.Dispatch<React.SetStateAction<SurveyOption[]>>,
  setTotalVotes: React.Dispatch<React.SetStateAction<number>>
) => {
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
};
