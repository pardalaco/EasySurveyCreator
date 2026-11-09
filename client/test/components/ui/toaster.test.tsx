import { Toaster, toaster } from "@/components/ui/toaster";
import { act, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../../utils";

describe("Toaster", () => {
  it("renderiza sin toasts inicialmente", () => {
    const { container } = renderWithProviders(<Toaster />);

    expect(container).toBeInTheDocument();
    expect(screen.queryByText("Toast de prueba")).not.toBeInTheDocument();
  });

  it("muestra un toast con description al llamar a toaster.create", async () => {
    renderWithProviders(<Toaster />);

    act(() => {
      toaster.create({
        description: "Toast de prueba",
        type: "success",
      });
    });

    expect(await screen.findByText("Toast de prueba")).toBeInTheDocument();
  });

  it("muestra un toast con title y description", async () => {
    renderWithProviders(<Toaster />);

    act(() => {
      toaster.create({
        title: "Título del toast",
        description: "Descripción del toast",
        type: "warning",
      });
    });

    expect(await screen.findByText("Título del toast")).toBeInTheDocument();
    expect(
      await screen.findByText("Descripción del toast")
    ).toBeInTheDocument();
  });

  it("muestra múltiples toasts", async () => {
    renderWithProviders(<Toaster />);

    act(() => {
      toaster.create({ description: "Primer toast", type: "success" });
      toaster.create({ description: "Segundo toast", type: "error" });
    });

    expect(await screen.findByText("Primer toast")).toBeInTheDocument();
    expect(await screen.findByText("Segundo toast")).toBeInTheDocument();
  });

  it("muestra toasts de tipo error", async () => {
    renderWithProviders(<Toaster />);

    act(() => {
      toaster.create({
        description: "Error creating the survey.",
        type: "error",
      });
    });

    expect(
      await screen.findByText("Error creating the survey.")
    ).toBeInTheDocument();
  });

  it("permite interactuar con un toast sin errores", async () => {
    renderWithProviders(<Toaster />);

    act(() => {
      toaster.create({ description: "Toast interactivo", type: "info" });
    });

    expect(await screen.findByText("Toast interactivo")).toBeInTheDocument();
  });
});
