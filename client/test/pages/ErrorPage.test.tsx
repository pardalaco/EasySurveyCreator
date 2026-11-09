import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ErrorPage from "../../src/pages/ErrorPage";
import { renderWithProviders } from "../utils";

function renderErrorPage(props: React.ComponentProps<typeof ErrorPage> = {}) {
  return renderWithProviders(<ErrorPage {...props} />, { withRouter: true });
}

describe("ErrorPage", () => {
  describe("por defecto (404)", () => {
    it("muestra el código de error 404", () => {
      renderErrorPage();

      expect(screen.getByText("Error 404")).toBeInTheDocument();
    });

    it("muestra el título Page Not Found", () => {
      renderErrorPage();

      expect(screen.getByText("Page Not Found")).toBeInTheDocument();
    });

    it("muestra la descripción por defecto del 404", () => {
      renderErrorPage();

      expect(
        screen.getByText(
          "Oops! The survey or page you are looking for doesn't exist or has been moved."
        )
      ).toBeInTheDocument();
    });

    it("muestra el encabezado de la aplicación", () => {
      renderErrorPage();

      expect(screen.getByText("Easy Survey Creator")).toBeInTheDocument();
    });

    it("muestra el mensaje de ayuda y el botón de volver", () => {
      renderErrorPage();

      expect(
        screen.getByText(
          "Double check the URL or return back to create a new survey."
        )
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /Back to Home/i })
      ).toBeInTheDocument();
    });
  });

  describe("códigos de error conocidos", () => {
    const cases: Array<{
      code: string | number;
      title: string;
      description: string;
    }> = [
      {
        code: "400",
        title: "Bad Request",
        description:
          "The request could not be processed due to invalid syntax or parameters.",
      },
      {
        code: "401",
        title: "Unauthorized",
        description: "You need to authenticate or sign in to access this page.",
      },
      {
        code: "403",
        title: "Access Forbidden",
        description:
          "You do not have the necessary permissions to view this resource.",
      },
      {
        code: "404",
        title: "Page Not Found",
        description:
          "Oops! The survey or page you are looking for doesn't exist or has been moved.",
      },
      {
        code: "500",
        title: "Internal Server Error",
        description:
          "Something went wrong on our servers. Please try again later.",
      },
      {
        code: 400,
        title: "Bad Request",
        description:
          "The request could not be processed due to invalid syntax or parameters.",
      },
      {
        code: "999",
        title: "Unexpected Error",
        description:
          "An unexpected error occurred. Please try again or return home.",
      },
      {
        code: 500,
        title: "Internal Server Error",
        description:
          "Something went wrong on our servers. Please try again later.",
      },
    ];

    for (const { code, title, description } of cases) {
      it(`muestra los textos correctos para el error ${code}`, () => {
        renderErrorPage({ error: code });

        expect(screen.getByText(`Error ${code}`)).toBeInTheDocument();
        expect(screen.getByText(title)).toBeInTheDocument();
        expect(screen.getByText(description)).toBeInTheDocument();
      });
    }
  });

  describe("props personalizadas", () => {
    it("title personalizado sobreescribe el automático", () => {
      renderErrorPage({ error: "404", title: "Título custom" });

      expect(screen.getByText("Título custom")).toBeInTheDocument();
      expect(screen.queryByText("Page Not Found")).not.toBeInTheDocument();
    });

    it("message personalizado sobreescribe la descripción automática", () => {
      renderErrorPage({ error: "500", message: "Mensaje custom" });

      expect(screen.getByText("Mensaje custom")).toBeInTheDocument();
      expect(
        screen.queryByText(
          "Something went wrong on our servers. Please try again later."
        )
      ).not.toBeInTheDocument();
    });

    it("muestra el código de error pasado en la prop", () => {
      renderErrorPage({ error: 503 });

      expect(screen.getByText("Error 503")).toBeInTheDocument();
    });
  });

  describe("navegación", () => {
    it("el enlace Back to Home está presente", () => {
      renderErrorPage();

      const link = screen.getByRole("link", { name: /Back to Home/i });

      expect(link).toBeInTheDocument();
      expect(link).toHaveTextContent("Back to Home");
    });
  });
});
