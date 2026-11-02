import { describe, expect, it } from "vitest";
import { surveyCreatorSchema } from "../../src/schemas/survey.js";

const validSurvey = {
  question: "¿Cuál es tu lenguaje favorito?",
  options: [
    { text: "TypeScript", votes: 3 },
    { text: "JavaScript", votes: 1 },
  ],
};

describe("surveyCreatorSchema", () => {
  it("acepta una encuesta válida", () => {
    const { error, value } = surveyCreatorSchema.validate(validSurvey);
    expect(error).toBeUndefined();
    expect(value).toEqual(validSurvey);
  });

  it("acepta la encuesta sin enviar votes (se rellenan con 0)", () => {
    const { error, value } = surveyCreatorSchema.validate({
      question: "¿Prefieres té o café?",
      options: [{ text: "Té" }, { text: "Café" }],
    });

    expect(error).toBeUndefined();
    expect(value.options).toEqual([
      { text: "Té", votes: 0 },
      { text: "Café", votes: 0 },
    ]);
  });

  it("rechaza el body vacío", () => {
    const { error } = surveyCreatorSchema.validate({});
    expect(error).toBeDefined();
    expect(error?.message).toContain('"question" is required');
  });

  describe("question", () => {
    it("es obligatoria", () => {
      const { error } = surveyCreatorSchema.validate({
        ...validSurvey,
        question: undefined,
      });
      expect(error?.message).toContain('"question" is required');
    });

    it("no acepta cadena vacía", () => {
      const { error } = surveyCreatorSchema.validate({
        ...validSurvey,
        question: "",
      });
      expect(error).toBeDefined();
    });

    it("acepta hasta 255 caracteres", () => {
      const { error } = surveyCreatorSchema.validate({
        ...validSurvey,
        question: "a".repeat(255),
      });
      expect(error).toBeUndefined();
    });

    it("rechaza más de 255 caracteres", () => {
      const { error } = surveyCreatorSchema.validate({
        ...validSurvey,
        question: "a".repeat(256),
      });
      expect(error?.message).toContain("must be less than or equal to 255");
    });

    it("rechaza valores que no sean string", () => {
      const { error } = surveyCreatorSchema.validate({
        ...validSurvey,
        question: 42,
      });
      expect(error?.message).toContain('"question" must be a string');
    });
  });

  describe("options", () => {
    it("es obligatorio", () => {
      const { error } = surveyCreatorSchema.validate({ question: "pregunta" });
      expect(error?.message).toContain('"options" is required');
    });

    it("requiere un mínimo de 2 opciones", () => {
      const { error } = surveyCreatorSchema.validate({
        question: "pregunta",
        options: [{ text: "única" }],
      });
      expect(error?.message).toContain("must contain at least 2 items");
    });

    it("admite un máximo de 5 opciones", () => {
      const options = Array.from({ length: 5 }, (_, i) => ({
        text: `opción ${i}`,
      }));
      const { error } = surveyCreatorSchema.validate({
        question: "pregunta",
        options,
      });
      expect(error).toBeUndefined();

      const { error: tooMany } = surveyCreatorSchema.validate({
        question: "pregunta",
        options: [...options, { text: "extra" }],
      });
      expect(tooMany?.message).toContain(
        "must contain less than or equal to 5 items"
      );
    });

    it("no acepta un array vacío", () => {
      const { error } = surveyCreatorSchema.validate({
        question: "pregunta",
        options: [],
      });
      expect(error).toBeDefined();
    });

    it("rechaza opciones que no sean objetos", () => {
      const { error } = surveyCreatorSchema.validate({
        question: "pregunta",
        options: ["solo texto", "otro texto"],
      });
      expect(error).toBeDefined();
    });
  });

  describe("opciones individuales", () => {
    it("exige text en cada opción", () => {
      const { error } = surveyCreatorSchema.validate({
        question: "pregunta",
        options: [{ text: "ok" }, { votes: 1 }],
      });
      expect(error?.message).toContain('"options[1].text" is required');
    });

    it("no acepta text vacío", () => {
      const { error } = surveyCreatorSchema.validate({
        question: "pregunta",
        options: [{ text: "" }, { text: "ok" }],
      });
      expect(error).toBeDefined();
    });

    it("rechaza votes negativos", () => {
      const { error } = surveyCreatorSchema.validate({
        question: "pregunta",
        options: [{ text: "ok", votes: -1 }, { text: "otra" }],
      });
      expect(error?.message).toContain(
        '"options[0].votes" must be greater than or equal to 0'
      );
    });

    it("rechaza votes decimales", () => {
      const { error } = surveyCreatorSchema.validate({
        question: "pregunta",
        options: [{ text: "ok", votes: 1.5 }, { text: "otra" }],
      });
      expect(error?.message).toContain('"options[0].votes" must be an integer');
    });

    it("rechaza votes que no sean numéricos", () => {
      const { error } = surveyCreatorSchema.validate({
        question: "pregunta",
        options: [{ text: "ok", votes: "muchos" }, { text: "otra" }],
      });
      expect(error).toBeDefined();
    });
  });

  describe("id", () => {
    it("está prohibido para el cliente", () => {
      const { error } = surveyCreatorSchema.validate({
        ...validSurvey,
        id: "123",
      });
      expect(error?.message).toContain('"id" is not allowed');
    });
  });

  it("rechaza campos desconocidos", () => {
    const { error } = surveyCreatorSchema.validate({
      ...validSurvey,
      extra: true,
    });
    expect(error?.message).toContain('"extra" is not allowed');
  });

  it("acumula varios errores con abortEarly desactivado", () => {
    const { error } = surveyCreatorSchema.validate(
      { id: "1", options: [{ text: "a" }] },
      { abortEarly: false }
    );
    expect(error?.details.length).toBeGreaterThan(1);
  });
});
