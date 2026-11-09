import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ButtonOption from "../../src/components/ButtonOption";
import { renderWithProviders } from "../utils";

describe("ButtonOption", () => {
  it("renderiza el texto de la opción", () => {
    renderWithProviders(
      <ButtonOption index={0} handleClick={() => {}}>
        TypeScript
      </ButtonOption>
    );

    expect(
      screen.getByRole("button", { name: "TypeScript" })
    ).toBeInTheDocument();
  });

  it("invoca handleClick al pulsarlo", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    renderWithProviders(
      <ButtonOption index={1} handleClick={handleClick}>
        JavaScript
      </ButtonOption>
    );

    await user.click(screen.getByRole("button", { name: "JavaScript" }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("no invoca handleClick más de una vez por clic", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    renderWithProviders(
      <ButtonOption index={0} handleClick={handleClick}>
        Go
      </ButtonOption>
    );

    const button = screen.getByRole("button", { name: "Go" });
    await user.click(button);
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it("renderiza múltiples opciones con sus índices", () => {
    renderWithProviders(
      <>
        <ButtonOption index={0} handleClick={() => {}}>
          Opción 1
        </ButtonOption>
        <ButtonOption index={1} handleClick={() => {}}>
          Opción 2
        </ButtonOption>
        <ButtonOption index={2} handleClick={() => {}}>
          Opción 3
        </ButtonOption>
      </>
    );

    expect(screen.getAllByRole("button")).toHaveLength(3);
    expect(screen.getByText("Opción 1")).toBeInTheDocument();
    expect(screen.getByText("Opción 2")).toBeInTheDocument();
    expect(screen.getByText("Opción 3")).toBeInTheDocument();
  });

  it("renderiza children complejos", () => {
    renderWithProviders(
      <ButtonOption index={0} handleClick={() => {}}>
        <span data-testid="custom-child">Contenido custom</span>
      </ButtonOption>
    );

    expect(screen.getByTestId("custom-child")).toBeInTheDocument();
  });
});
