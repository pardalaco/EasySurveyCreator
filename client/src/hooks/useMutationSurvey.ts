import { toaster } from "@/components/ui/toaster";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import {
  type SurveyOption,
  type Survey as SurveyType,
} from "../types/index.js";

export function useMutationSurvey(
  apiUrl: string,
  idSurvey: string | undefined,
  setVotedOptions: React.Dispatch<React.SetStateAction<SurveyOption[]>>,
  setTotalVotes: React.Dispatch<React.SetStateAction<number>>
) {
  const [hasVoted, setHasVoted] = useState(false);

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

  return { hasVoted, mutate, isPending };
}
