import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("main (entry point)", () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = '<div id="root"></div>';
    window.history.pushState({}, "", "/");
  });

  it("arranca la aplicación y renderiza la página de creación", async () => {
    await import("../src/main");

    await waitFor(() => {
      expect(screen.getByText("Easy Survey Creator")).toBeInTheDocument();
    });

    expect(screen.getByText("Create your Survey.")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create Survey!" })
    ).toBeInTheDocument();
  });

  it("monta el router con la ruta raíz", async () => {
    await import("../src/main");

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("What's your question?")
      ).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText("Option 1")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Option 2")).toBeInTheDocument();
  });

  it("renderiza el Provider de Chakra y el QueryClientProvider", async () => {
    await import("../src/main");

    await waitFor(() => {
      expect(screen.getByText("Easy Survey Creator")).toBeInTheDocument();
    });

    // El árbol completo está montado dentro del #root
    const root = document.getElementById("root");
    expect(root).not.toBeNull();
    expect(root?.textContent).toContain("Create your Survey.");
  });
});
