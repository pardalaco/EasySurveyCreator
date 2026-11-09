import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import CollapsibleQRcode from "../../src/components/CollapsibleQRcode";
import { renderWithProviders } from "../utils";

describe("CollapsibleQRcode", () => {
  it("renderiza el botón para mostrar el QR", () => {
    renderWithProviders(
      <CollapsibleQRcode link="https://example.com/survey/abc" />
    );

    expect(
      screen.getByRole("button", { name: /Show QR code/i })
    ).toBeInTheDocument();
  });

  it("muestra la instrucción de escaneo al expandir", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <CollapsibleQRcode link="https://example.com/survey/abc" />
    );

    await user.click(screen.getByRole("button", { name: /Show QR code/i }));

    expect(
      await screen.findByText("Scan to access the survey")
    ).toBeInTheDocument();
  });

  it("renderiza el código QR con el link recibido", async () => {
    const user = userEvent.setup();
    const link = "https://example.com/survey/abc12345";
    const { container } = renderWithProviders(
      <CollapsibleQRcode link={link} />
    );

    await user.click(screen.getByRole("button", { name: /Show QR code/i }));

    expect(
      await screen.findByText("Scan to access the survey")
    ).toBeInTheDocument();
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renderiza un QR aunque el link esté vacío", async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<CollapsibleQRcode link="" />);

    await user.click(screen.getByRole("button", { name: /Show QR code/i }));

    expect(
      await screen.findByText("Scan to access the survey")
    ).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("permite alternar el desplegable sin errores", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CollapsibleQRcode link="https://example.com" />);

    const trigger = screen.getByRole("button", { name: /Show QR code/i });

    await user.click(trigger);
    expect(
      await screen.findByText("Scan to access the survey")
    ).toBeInTheDocument();

    await user.click(trigger);
    expect(trigger).toBeInTheDocument();
  });
});
