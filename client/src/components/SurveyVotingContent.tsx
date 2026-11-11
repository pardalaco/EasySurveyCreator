import BoxVote from "@/components/BoxVote.js";
import ButtonOption from "@/components/ButtonOption.js";
import { type SurveyOption } from "../types/index.js";

interface SurveyVotingContentProps {
  isPending: boolean;
  hasVoted: boolean;
  options: SurveyOption[];
  votedOptions: SurveyOption[];
  totalVotes: number;
  votedOptionIndex: number | null;
  handleVote: (index: number) => void;
}

export const SurveyVotingContent: React.FC<SurveyVotingContentProps> = ({
  isPending,
  hasVoted,
  options,
  votedOptions,
  totalVotes,
  votedOptionIndex,
  handleVote,
}) => {
  if (isPending) {
    return (
      <>
        {options.map((option, index) => {
          const percentage = index === votedOptionIndex ? 100 : 0;
          return (
            <BoxVote key={index} percentage={percentage}>
              {option.text}
            </BoxVote>
          );
        })}
      </>
    );
  }

  if (hasVoted) {
    return (
      <>
        {votedOptions.map((option, index) => {
          const optionVotes = option.votes || 0;
          const percentage =
            totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;

          return (
            <BoxVote key={index} percentage={percentage}>
              {option.text}
            </BoxVote>
          );
        })}
      </>
    );
  }

  return (
    <>
      {options.map((option, index) => (
        <ButtonOption
          key={index}
          index={index}
          handleClick={() => handleVote(index)}
        >
          {option.text}
        </ButtonOption>
      ))}
    </>
  );
};
