import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CreateSurvey from "../../src/pages/CreateSurvey";
import { renderWithProviders } from "../utils";
import { toaster } from "@/components/ui/toaster";

vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

vi.mock("@/components/ui/toaster", () => ({
  toaster: {
    create: vi.fn(),
  },
  Toaster: () => null,
}));

const mockedPost = vi.mocked(axios.post);
const mockedToasterCreate = vi.mocked(toaster.create);

function renderCreateSurvey() {
  const router = createMemoryRouter(
    [
      { path: "/", element: <CreateSurvey /> },
      { path: "/:idSurvey", element: <div>Survey page</div> },
    ],
    { initialEntries: ["/"] }
  );

  renderWithProviders(<RouterProvider router={router} />);

  return router;
}

describe("CreateSurvey", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedPost.mockResolvedValue({ data: { id: "abc12345" } });
  });

  describe("renderizado", () => {
    it("muestra el encabezado de la aplicación", () => {
      renderCreateSurvey();

      expect(screen.getByText("Easy Survey Creator")).toBeInTheDocument();
    });

    it("muestra los títulos principales", () => {
      renderCreateSurvey();

      expect(screen.getByText("Create your Survey.")).toBeInTheDocument();
      expect(screen.getByText("No sign up required.")).toBeInTheDocument();
    });

    it("renderiza el input de la pregunta", () => {
      renderCreateSurvey();

      expect(
        screen.getByPlaceholderText("What's your question?")
      ).toBeInTheDocument();
    });

    it("empieza con 2 opciones", () => {
      renderCreateSurvey();

      expect(screen.getByPlaceholderText("Option 1")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Option 2")).toBeInTheDocument();
      expect(screen.queryByPlaceholderText("Option 3")).not.toBeInTheDocument();
    });

    it("muestra el botón para añadir opciones", () => {
      renderCreateSurvey();

      expect(
        screen.getByRole("button", { name: "+ Add Option" })
      ).toBeInTheDocument();
    });

    it("muestra el botón de crear encuesta", () => {
      renderCreateSurvey();

      expect(
        screen.getByRole("button", { name: "Create Survey!" })
      ).toBeInTheDocument();
    });

    it("no muestra botones de borrar con solo 2 opciones", () => {
      renderCreateSurvey();

      expect(
        screen.queryByRole("button", { name: "✕" })
      ).not.toBeInTheDocument();
    });
  });

  describe("gestión de opciones", () => {
    it("añade una nueva opción al pulsar + Add Option", async () => {
      const user = userEvent.setup();
      renderCreateSurvey();

      await user.click(screen.getByRole("button", { name: "+ Add Option" }));

      expect(screen.getByPlaceholderText("Option 3")).toBeInTheDocument();
    });

    it("añade hasta un máximo de 5 opciones", async () => {
      const user = userEvent.setup();
      renderCreateSurvey();

      await user.click(screen.getByRole("button", { name: "+ Add Option" }));
      await user.click(screen.getByRole("button", { name: "+ Add Option" }));
      await user.click(screen.getByRole("button", { name: "+ Add Option" }));

      expect(screen.getByPlaceholderText("Option 5")).toBeInTheDocument();
      expect(screen.queryByPlaceholderText("Option 6")).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "+ Add Option" })
      ).not.toBeInTheDocument();
    });

    it("permite borrar una opción cuando hay más de 2", async () => {
      const user = userEvent.setup();
      renderCreateSurvey();

      await user.click(screen.getByRole("button", { name: "+ Add Option" }));
      expect(screen.getByPlaceholderText("Option 3")).toBeInTheDocument();

      const deleteButtons = screen.getAllByRole("button", { name: "✕" });
      await user.click(deleteButtons[2]);

      expect(screen.queryByPlaceholderText("Option 3")).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "✕" })
      ).not.toBeInTheDocument();
    });

    it("permite escribir en las opciones", async () => {
      const user = userEvent.setup();
      renderCreateSurvey();

      await user.type(screen.getByPlaceholderText("Option 1"), "Rust");
      await user.type(screen.getByPlaceholderText("Option 2"), "Go");

      expect(screen.getByPlaceholderText("Option 1")).toHaveValue("Rust");
      expect(screen.getByPlaceholderText("Option 2")).toHaveValue("Go");
    });
  });

  describe("validación antes de crear", () => {
    it("muestra warning si falta la pregunta y no llama a la API", async () => {
      const user = userEvent.setup();
      renderCreateSurvey();

      await user.type(screen.getByPlaceholderText("Option 1"), "Rust");
      await user.type(screen.getByPlaceholderText("Option 2"), "Go");
      await user.click(screen.getByRole("button", { name: "Create Survey!" }));

      expect(mockedToasterCreate).toHaveBeenCalledWith({
        description: "You must include a question to create the survey.",
        type: "warning",
      });
      expect(mockedPost).not.toHaveBeenCalled();
    });

    it("muestra warning si falta alguna opción y no llama a la API", async () => {
      const user = userEvent.setup();
      renderCreateSurvey();

      await user.type(
        screen.getByPlaceholderText("What's your question?"),
        "¿Cuál es tu lenguaje favorito?"
      );
      await user.click(screen.getByRole("button", { name: "Create Survey!" }));

      expect(mockedToasterCreate).toHaveBeenCalledWith({
        description:
          "You must complete the options in order to create the survey.",
        type: "warning",
      });
      expect(mockedPost).not.toHaveBeenCalled();
    });

    it("no llama a la API con pregunta y opciones vacías", async () => {
      const user = userEvent.setup();
      renderCreateSurvey();

      await user.click(screen.getByRole("button", { name: "Create Survey!" }));

      expect(mockedPost).not.toHaveBeenCalled();
    });
  });

  describe("creación de encuesta", () => {
    it("envía la encuesta válida a la API y navega al resultado", async () => {
      const user = userEvent.setup();
      const router = renderCreateSurvey();

      await user.type(
        screen.getByPlaceholderText("What's your question?"),
        "¿Cuál es tu lenguaje favorito?"
      );
      await user.type(screen.getByPlaceholderText("Option 1"), "TypeScript");
      await user.type(screen.getByPlaceholderText("Option 2"), "JavaScript");
      await user.click(screen.getByRole("button", { name: "Create Survey!" }));

      await waitFor(() => {
        expect(mockedPost).toHaveBeenCalledTimes(1);
      });

      expect(mockedPost).toHaveBeenCalledWith(
        expect.stringContaining("/survey"),
        {
          question: "¿Cuál es tu lenguaje favorito?",
          options: [{ text: "TypeScript" }, { text: "JavaScript" }],
        }
      );

      await waitFor(() => {
        expect(router.state.location.pathname).toBe("/abc12345");
      });
    });

    it("no muestra errores si la creación es correcta", async () => {
      const user = userEvent.setup();
      renderCreateSurvey();

      await user.type(
        screen.getByPlaceholderText("What's your question?"),
        "Pregunta válida"
      );
      await user.type(screen.getByPlaceholderText("Option 1"), "A");
      await user.type(screen.getByPlaceholderText("Option 2"), "B");
      await user.click(screen.getByRole("button", { name: "Create Survey!" }));

      await waitFor(() => {
        expect(mockedPost).toHaveBeenCalled();
      });

      expect(mockedToasterCreate).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: "error" })
      );
      expect(mockedToasterCreate).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: "warning" })
      );
    });

    it("incluye todas las opciones en el payload", async () => {
      const user = userEvent.setup();
      renderCreateSurvey();

      await user.type(
        screen.getByPlaceholderText("What's your question?"),
        "Pregunta"
      );
      await user.type(screen.getByPlaceholderText("Option 1"), "Op1");
      await user.type(screen.getByPlaceholderText("Option 2"), "Op2");
      await user.click(screen.getByRole("button", { name: "+ Add Option" }));
      await user.type(screen.getByPlaceholderText("Option 3"), "Op3");
      await user.click(screen.getByRole("button", { name: "Create Survey!" }));

      await waitFor(() => {
        expect(mockedPost).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            options: [{ text: "Op1" }, { text: "Op2" }, { text: "Op3" }],
          })
        );
      });
    });
  });

  describe("errores de la API", () => {
    it("muestra el mensaje de error del servidor (string)", async () => {
      const user = userEvent.setup();
      mockedPost.mockRejectedValueOnce({
        response: { data: "Survey not found" },
      });
      renderCreateSurvey();

      await user.type(
        screen.getByPlaceholderText("What's your question?"),
        "Pregunta"
      );
      await user.type(screen.getByPlaceholderText("Option 1"), "A");
      await user.type(screen.getByPlaceholderText("Option 2"), "B");
      await user.click(screen.getByRole("button", { name: "Create Survey!" }));

      await waitFor(() => {
        expect(mockedToasterCreate).toHaveBeenCalledWith({
          description: "Survey not found",
          type: "error",
        });
      });
    });

    it("muestra el message del JSON de error del servidor", async () => {
      const user = userEvent.setup();
      mockedPost.mockRejectedValueOnce({
        response: { data: { message: "Too many requests" } },
      });
      renderCreateSurvey();

      await user.type(
        screen.getByPlaceholderText("What's your question?"),
        "Pregunta"
      );
      await user.type(screen.getByPlaceholderText("Option 1"), "A");
      await user.type(screen.getByPlaceholderText("Option 2"), "B");
      await user.click(screen.getByRole("button", { name: "Create Survey!" }));

      await waitFor(() => {
        expect(mockedToasterCreate).toHaveBeenCalledWith({
          description: "Too many requests",
          type: "error",
        });
      });
    });

    it("usa el mensaje de axios como fallback", async () => {
      const user = userEvent.setup();
      mockedPost.mockRejectedValueOnce(new Error("Network Error"));
      renderCreateSurvey();

      await user.type(
        screen.getByPlaceholderText("What's your question?"),
        "Pregunta"
      );
      await user.type(screen.getByPlaceholderText("Option 1"), "A");
      await user.type(screen.getByPlaceholderText("Option 2"), "B");
      await user.click(screen.getByRole("button", { name: "Create Survey!" }));

      await waitFor(() => {
        expect(mockedToasterCreate).toHaveBeenCalledWith({
          description: "Network Error",
          type: "error",
        });
      });
    });

    it("usa un mensaje genérico si no hay información de error", async () => {
      const user = userEvent.setup();
      mockedPost.mockRejectedValueOnce({});
      renderCreateSurvey();

      await user.type(
        screen.getByPlaceholderText("What's your question?"),
        "Pregunta"
      );
      await user.type(screen.getByPlaceholderText("Option 1"), "A");
      await user.type(screen.getByPlaceholderText("Option 2"), "B");
      await user.click(screen.getByRole("button", { name: "Create Survey!" }));

      await waitFor(() => {
        expect(mockedToasterCreate).toHaveBeenCalledWith({
          description: "Error creating the survey.",
          type: "error",
        });
      });
    });

    it("no navega si la API falla", async () => {
      const user = userEvent.setup();
      mockedPost.mockRejectedValueOnce(new Error("fail"));
      const router = renderCreateSurvey();

      await user.type(
        screen.getByPlaceholderText("What's your question?"),
        "Pregunta"
      );
      await user.type(screen.getByPlaceholderText("Option 1"), "A");
      await user.type(screen.getByPlaceholderText("Option 2"), "B");
      await user.click(screen.getByRole("button", { name: "Create Survey!" }));

      await waitFor(() => {
        expect(mockedToasterCreate).toHaveBeenCalled();
      });

      expect(router.state.location.pathname).toBe("/");
    });
  });
});
