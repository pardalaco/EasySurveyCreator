import { useState } from "react";
import { type SurveyOption } from "../types/index.js";

export function useVotedOptions() {
  const [votedOptions, setVotedOptions] = useState<SurveyOption[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);

  return { votedOptions, setVotedOptions, totalVotes, setTotalVotes };
}
