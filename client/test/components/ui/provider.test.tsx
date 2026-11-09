import { Provider } from "@/components/ui/provider";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("Provider", () => {
  it("renderiza a sus children", () => {
    render(
      <Provider>
        <div>Hola desde el Provider</div>
      </Provider>
    );

    expect(screen.getByText("Hola desde el Provider")).toBeInTheDocument();
  });

  it("renderiza múltiples children", () => {
    render(
      <Provider>
        <span>Uno</span>
        <span>Dos</span>
        <span>Tres</span>
      </Provider>
    );

    expect(screen.getByText("Uno")).toBeInTheDocument();
    expect(screen.getByText("Dos")).toBeInTheDocument();
    expect(screen.getByText("Tres")).toBeInTheDocument();
  });

  it("permite componentes anidados con interactividad", () => {
    render(
      <Provider>
        <button type="button">Botón dentro del Provider</button>
      </Provider>
    );

    expect(
      screen.getByRole("button", { name: "Botón dentro del Provider" })
    ).toBeInTheDocument();
  });
});
