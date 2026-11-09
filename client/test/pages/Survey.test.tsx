import { toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Survey from "../../src/pages/Survey";
import { Provider } from "@/components/ui/provider";

const socketMock = vi.hoisted(() => ({
  on: vi.fn(),
  disconnect: vi.fn(),
  connected: true,
}));

vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

vi.mock("socket.io-client", () => ({
  io: vi.fn(() => socketMock),
}));

vi.mock("@/components/ui/toaster", () => ({
  toaster: {
    create: vi.fn(),
  },
  Toaster: () => null,
}));

const mockedGet = vi.mocked(axios.get);
const mockedPost = vi.mocked(axios.post);
const mockedToasterCreate = vi.mocked(toaster.create);

const surveyData = {
  id: "abc12345",
  question: "¿Cuál es tu lenguaje favorito?",
  timestamp: new Date().toISOString(),
  options: [
    { id: 0, text: "TypeScript", votes: 0 },
    { id: 1, text: "JavaScript", votes: 0 },
  ],
};

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function renderSurvey(initialEntry = "/abc12345") {
  const router = createMemoryRouter(
    [
      { path: "/:idSurvey", element: <Survey /> },
      { path: "/", element: <div>Home</div> },
    ],
    { initialEntries: [initialEntry] }
  );

  const result = render(
    <Provider>
      <QueryClientProvider client={createQueryClient()}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </Provider>
  );

  return { router, ...result };
}

describe("Survey", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    socketMock.on.mockClear();
    socketMock.disconnect.mockClear();
    mockedGet.mockResolvedValue({ data: surveyData });
    mockedPost.mockResolvedValue({
      data: {
        ...surveyData,
        options: [
          { id: 0, text: "TypeScript", votes: 1 },
          { id: 1, text: "JavaScript", votes: 0 },
        ],
      },
    });
  });

  describe("estado de carga", () => {
    it("muestra la página de loading mientras consulta", () => {
      mockedGet.mockReturnValue(new Promise(() => {}));
      renderSurvey();

      expect(screen.getByText("Easy Suvery Creator")).toBeInTheDocument();
    });
  });

  describe("estado de error", () => {
    it("muestra ErrorPage si la encuesta no existe", async () => {
      mockedGet.mockRejectedValueOnce({
        response: { status: 404, data: "Survey not found" },
      });
      renderSurvey();

      expect(await screen.findByText("Error 404")).toBeInTheDocument();
      expect(screen.getByText("Page Not Found")).toBeInTheDocument();
    });

    it("muestra ErrorPage si no hay datos", async () => {
      mockedGet.mockResolvedValueOnce({ data: null });
      renderSurvey();

      expect(await screen.findByText("Error 404")).toBeInTheDocument();
    });
  });

  describe("renderizado de la encuesta", () => {
    it("muestra el encabezado de la aplicación", async () => {
      renderSurvey();

      expect(
        await screen.findByText("Easy Survey Creator")
      ).toBeInTheDocument();
    });

    it("muestra la pregunta de la encuesta", async () => {
      renderSurvey();

      expect(
        await screen.findByText("¿Cuál es tu lenguaje favorito?")
      ).toBeInTheDocument();
    });

    it("muestra todas las opciones como botones de votación", async () => {
      renderSurvey();

      expect(
        await screen.findByRole("button", { name: "TypeScript" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "JavaScript" })
      ).toBeInTheDocument();
    });

    it("consulta la encuesta por el id de la ruta", async () => {
      renderSurvey("/abc12345");

      await waitFor(() => {
        expect(mockedGet).toHaveBeenCalledWith(
          expect.stringContaining("/survey/abc12345")
        );
      });
    });

    it("muestra el botón de copiar enlace", async () => {
      renderSurvey();

      expect(
        await screen.findByRole("button", { name: /Copiar enlace/i })
      ).toBeInTheDocument();
    });

    it("muestra el desplegable del código QR", async () => {
      renderSurvey();

      expect(
        await screen.findByRole("button", { name: /Show QR code/i })
      ).toBeInTheDocument();
    });
  });

  describe("votación", () => {
    it("envía el voto a la API al pulsar una opción", async () => {
      const user = userEvent.setup();
      renderSurvey();

      const option = await screen.findByRole("button", {
        name: "TypeScript",
      });
      await user.click(option);

      await waitFor(() => {
        expect(mockedPost).toHaveBeenCalledWith(
          expect.stringContaining("/survey/abc12345/vote"),
          { optionIndex: 0 }
        );
      });
    });

    it("muestra los resultados porcentuales tras votar", async () => {
      const user = userEvent.setup();
      renderSurvey();

      const option = await screen.findByRole("button", {
        name: "TypeScript",
      });
      await user.click(option);

      expect(await screen.findByText("100%")).toBeInTheDocument();
      expect(await screen.findByText("0%")).toBeInTheDocument();
    });

    it("ya no muestra botones de votación tras votar", async () => {
      const user = userEvent.setup();
      renderSurvey();

      const option = await screen.findByRole("button", {
        name: "TypeScript",
      });
      await user.click(option);

      await waitFor(() => {
        expect(screen.getByText("100%")).toBeInTheDocument();
      });

      expect(
        screen.queryByRole("button", { name: "JavaScript" })
      ).not.toBeInTheDocument();
    });

    it("muestra un toast de error si el voto falla", async () => {
      const user = userEvent.setup();
      mockedPost.mockRejectedValueOnce({
        response: { data: "No existe la encuesta" },
      });
      renderSurvey();

      const option = await screen.findByRole("button", {
        name: "TypeScript",
      });
      await user.click(option);

      await waitFor(() => {
        expect(mockedToasterCreate).toHaveBeenCalledWith({
          description: "No existe la encuesta",
          type: "error",
        });
      });
    });

    it("usa mensaje genérico si el error no trae datos", async () => {
      const user = userEvent.setup();
      mockedPost.mockRejectedValueOnce(new Error("fail"));
      renderSurvey();

      const option = await screen.findByRole("button", {
        name: "TypeScript",
      });
      await user.click(option);

      await waitFor(() => {
        expect(mockedToasterCreate).toHaveBeenCalledWith({
          description: "Ocurrió un error al enviar tu voto.",
          type: "error",
        });
      });
    });

    it("muestra el mensaje .message del body si existe", async () => {
      const user = userEvent.setup();
      mockedPost.mockRejectedValueOnce({
        response: { data: { message: "Límite alcanzado" } },
      });
      renderSurvey();

      const option = await screen.findByRole("button", {
        name: "TypeScript",
      });
      await user.click(option);

      await waitFor(() => {
        expect(mockedToasterCreate).toHaveBeenCalledWith({
          description: "Límite alcanzado",
          type: "error",
        });
      });
    });
  });

  describe("socket.io", () => {
    it("no conecta el socket antes de votar", async () => {
      renderSurvey();

      await screen.findByRole("button", { name: "TypeScript" });
      await waitFor(() => {
        expect(mockedGet).toHaveBeenCalled();
      });

      expect(socketMock.on).not.toHaveBeenCalled();
    });

    it("conecta el socket y escucha update-vote-{id} tras votar", async () => {
      const user = userEvent.setup();
      renderSurvey();

      const option = await screen.findByRole("button", {
        name: "TypeScript",
      });
      await user.click(option);

      await waitFor(() => {
        expect(socketMock.on).toHaveBeenCalledWith(
          "update-vote-abc12345",
          expect.any(Function)
        );
      });
    });

    it("actualiza los porcentajes cuando llega un evento del socket", async () => {
      const user = userEvent.setup();
      renderSurvey();

      const option = await screen.findByRole("button", {
        name: "TypeScript",
      });
      await user.click(option);

      await waitFor(() => {
        expect(socketMock.on).toHaveBeenCalled();
      });

      const handler = socketMock.on.mock.calls.find(
        (call) => call[0] === "update-vote-abc12345"
      )?.[1];

      expect(handler).toBeTypeOf("function");

      handler?.({
        ...surveyData,
        options: [
          { id: 0, text: "TypeScript", votes: 1 },
          { id: 1, text: "JavaScript", votes: 3 },
        ],
      });

      expect(await screen.findByText("25%")).toBeInTheDocument();
      expect(await screen.findByText("75%")).toBeInTheDocument();
    });

    it("desconecta el socket al desmontar", async () => {
      const user = userEvent.setup();
      const { unmount } = renderSurvey();

      const option = await screen.findByRole("button", {
        name: "TypeScript",
      });
      await user.click(option);

      await waitFor(() => {
        expect(socketMock.on).toHaveBeenCalled();
      });

      unmount();

      expect(socketMock.disconnect).toHaveBeenCalled();
    });
  });

  describe("copiar enlace", () => {
    it("copia la URL al portapapeles y muestra confirmación", async () => {
      const user = userEvent.setup();
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText },
        configurable: true,
      });

      renderSurvey();

      const button = await screen.findByRole("button", {
        name: /Copiar enlace/i,
      });
      await user.click(button);

      await waitFor(() => {
        expect(writeText).toHaveBeenCalledWith(expect.any(String));
      });

      expect(await screen.findByText("¡Enlace copiado!")).toBeInTheDocument();
    });

    it("programa el reinicio del texto a los 2 segundos", async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText },
        configurable: true,
      });

      const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");

      try {
        renderSurvey();

        const button = await screen.findByRole("button", {
          name: /Copiar enlace/i,
        });
        await user.click(button);

        await waitFor(() => {
          expect(writeText).toHaveBeenCalled();
        });

        expect(await screen.findByText("¡Enlace copiado!")).toBeInTheDocument();

        await waitFor(() => {
          expect(setTimeoutSpy).toHaveBeenCalledWith(
            expect.any(Function),
            2000
          );
        });
      } finally {
        setTimeoutSpy.mockRestore();
      }
    });

    it("muestra mensaje de error si el portapapeles falla", async () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const user = userEvent.setup();
      const writeText = vi.fn().mockImplementation(async () => {
        throw new Error("clipboard denied");
      });
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText },
        configurable: true,
      });

      renderSurvey();

      const button = await screen.findByRole("button", {
        name: /Copiar enlace/i,
      });
      await user.click(button);

      await waitFor(() => {
        expect(writeText).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith(
          "Error al copiar al portapapeles",
          expect.any(Error)
        );
      });

      expect(
        screen.getByRole("button", { name: /Copiar enlace/i })
      ).toBeInTheDocument();
      expect(screen.queryByText("¡Enlace copiado!")).not.toBeInTheDocument();
    });
  });
});
