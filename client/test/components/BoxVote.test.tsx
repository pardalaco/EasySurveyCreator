import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import BoxVote from "../../src/components/BoxVote";
import { renderWithProviders } from "../utils";

describe("BoxVote", () => {
  it("renderiza el texto de la opción (children)", () => {
    renderWithProviders(
      <BoxVote percentage={50}>
        <span>TypeScript</span>
      </BoxVote>
    );

    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });

  it("muestra el porcentaje con el símbolo %", () => {
    renderWithProviders(
      <BoxVote percentage={75}>
        <span>JavaScript</span>
      </BoxVote>
    );

    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("muestra 0% cuando el porcentaje es 0", () => {
    renderWithProviders(
      <BoxVote percentage={0}>
        <span>Rust</span>
      </BoxVote>
    );

    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("muestra 100% cuando el porcentaje es 100", () => {
    renderWithProviders(
      <BoxVote percentage={100}>
        <span>Go</span>
      </BoxVote>
    );

    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("renderiza como botón", () => {
    renderWithProviders(
      <BoxVote percentage={40}>
        <span>Python</span>
      </BoxVote>
    );

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Python");
    expect(button).toHaveTextContent("40%");
  });

  it("renderiza múltiples barras de resultado", () => {
    renderWithProviders(
      <>
        <BoxVote percentage={60}>
          <span>Opción A</span>
        </BoxVote>
        <BoxVote percentage={40}>
          <span>Opción B</span>
        </BoxVote>
      </>
    );

    expect(screen.getByText("Opción A")).toBeInTheDocument();
    expect(screen.getByText("Opción B")).toBeInTheDocument();
    expect(screen.getByText("60%")).toBeInTheDocument();
    expect(screen.getByText("40%")).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });
});
