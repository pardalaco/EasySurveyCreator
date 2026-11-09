import { describe, expect, expectTypeOf, it } from "vitest";
import type { Survey, SurveyOption, VoteSchema } from "../../src/types/index";

describe("types", () => {
  describe("SurveyOption", () => {
    it("tiene la forma esperada", () => {
      const option: SurveyOption = { id: 0, text: "TypeScript", votes: 3 };

      expectTypeOf(option).toEqualTypeOf<SurveyOption>();
      expect(option.id).toBe(0);
      expect(option.text).toBe("TypeScript");
      expect(option.votes).toBe(3);
    });

    it("id, text y votes son de los tipos correctos", () => {
      expectTypeOf<SurveyOption["id"]>().toEqualTypeOf<number>();
      expectTypeOf<SurveyOption["text"]>().toEqualTypeOf<string>();
      expectTypeOf<SurveyOption["votes"]>().toEqualTypeOf<number>();
    });
  });

  describe("Survey", () => {
    it("tiene la forma esperada", () => {
      const survey: Survey = {
        id: "abc12345",
        question: "¿Cuál es tu lenguaje favorito?",
        options: [{ id: 0, text: "TypeScript", votes: 0 }],
        timestamp: new Date(),
      };

      expectTypeOf(survey).toEqualTypeOf<Survey>();
      expect(survey.id).toBe("abc12345");
      expect(survey.options).toHaveLength(1);
      expect(survey.timestamp).toBeInstanceOf(Date);
    });

    it("id, question, options y timestamp son de los tipos correctos", () => {
      expectTypeOf<Survey["id"]>().toEqualTypeOf<string>();
      expectTypeOf<Survey["question"]>().toEqualTypeOf<string>();
      expectTypeOf<Survey["options"]>().toEqualTypeOf<SurveyOption[]>();
      expectTypeOf<Survey["timestamp"]>().toEqualTypeOf<Date>();
    });
  });

  describe("VoteSchema", () => {
    it("tiene la forma esperada", () => {
      const vote: VoteSchema = { optionIndex: 1 };

      expectTypeOf(vote).toEqualTypeOf<VoteSchema>();
      expect(vote.optionIndex).toBe(1);
    });

    it("optionIndex es un number", () => {
      expectTypeOf<VoteSchema["optionIndex"]>().toEqualTypeOf<number>();
    });
  });
});
