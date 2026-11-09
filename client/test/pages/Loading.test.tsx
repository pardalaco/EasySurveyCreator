import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LoadingPage from "../../src/pages/Loading";
import { renderWithProviders } from "../utils";

describe("LoadingPage", () => {
  it("renderiza el encabezado de la aplicación", () => {
    renderWithProviders(<LoadingPage />);

    expect(screen.getByText("Easy Suvery Creator")).toBeInTheDocument();
  });

  it("renderiza la estructura de esqueleto de carga", () => {
    const { container } = renderWithProviders(<LoadingPage />);

    const skeletons = container.querySelectorAll(".chakra-skeleton");
    expect(skeletons.length).toBeGreaterThanOrEqual(4);
  });

  it("simula el formulario con al menos 6 skeleton", () => {
    const { container } = renderWithProviders(<LoadingPage />);

    const skeletons = container.querySelectorAll(".chakra-skeleton");
    expect(skeletons.length).toBeGreaterThanOrEqual(6);
  });

  it("no muestra contenido de encuesta real", () => {
    renderWithProviders(<LoadingPage />);

    expect(screen.queryByText("Create your Survey.")).not.toBeInTheDocument();
    expect(screen.queryByText("Create Survey!")).not.toBeInTheDocument();
  });
});
