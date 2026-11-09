import {
  ColorModeButton,
  ColorModeIcon,
  DarkMode,
  LightMode,
  useColorMode,
  useColorModeValue,
} from "@/components/ui/color-mode";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../../utils";

function TestColorMode() {
  const { colorMode, setColorMode, toggleColorMode } = useColorMode();
  const value = useColorModeValue("valor claro", "valor oscuro");

  return (
    <div>
      <span data-testid="color-mode">{colorMode}</span>
      <span data-testid="mode-value">{value}</span>
      <button type="button" onClick={toggleColorMode}>
        toggle
      </button>
      <button type="button" onClick={() => setColorMode("dark")}>
        set-dark
      </button>
      <button type="button" onClick={() => setColorMode("light")}>
        set-light
      </button>
    </div>
  );
}

describe("useColorMode", () => {
  it("devuelve el color mode por defecto (light)", async () => {
    renderWithProviders(<TestColorMode />);

    expect(await screen.findByText("light")).toBeInTheDocument();
  });

  it("toggleColorMode cambia entre light y dark", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestColorMode />);

    expect(await screen.findByText("light")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "toggle" }));
    expect(await screen.findByText("dark")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "toggle" }));
    expect(await screen.findByText("light")).toBeInTheDocument();
  });

  it("setColorMode fija el modo indicado", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestColorMode />);

    await screen.findByText("light");

    await user.click(screen.getByRole("button", { name: "set-dark" }));
    expect(await screen.findByText("dark")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "set-light" }));
    expect(await screen.findByText("light")).toBeInTheDocument();
  });
});

describe("useColorModeValue", () => {
  it("devuelve el valor claro en modo light", async () => {
    renderWithProviders(<TestColorMode />);

    expect(await screen.findByText("valor claro")).toBeInTheDocument();
    expect(screen.queryByText("valor oscuro")).not.toBeInTheDocument();
  });

  it("devuelve el valor oscuro en modo dark", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestColorMode />);

    await screen.findByText("valor claro");
    await user.click(screen.getByRole("button", { name: "set-dark" }));

    expect(await screen.findByText("valor oscuro")).toBeInTheDocument();
    expect(screen.queryByText("valor claro")).not.toBeInTheDocument();
  });
});

describe("ColorModeIcon", () => {
  it("renderiza un icono SVG", async () => {
    renderWithProviders(
      <div>
        <ColorModeIcon />
      </div>
    );

    await waitFor(() => {
      const svg = document.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });
});

describe("ColorModeButton", () => {
  it("renderiza el botón de cambiar color mode", async () => {
    renderWithProviders(<ColorModeButton />);

    const button = await screen.findByLabelText("Toggle color mode");
    expect(button).toBeInTheDocument();
  });

  it("alterna el color mode al pulsarlo", async () => {
    const user = userEvent.setup();

    function Probe() {
      const { colorMode } = useColorMode();
      return (
        <div>
          <ColorModeButton />
          <span data-testid="mode">{colorMode}</span>
        </div>
      );
    }

    renderWithProviders(<Probe />);

    expect(await screen.findByText("light")).toBeInTheDocument();

    const button = await screen.findByLabelText("Toggle color mode");
    await user.click(button);

    expect(await screen.findByText("dark")).toBeInTheDocument();
  });
});

describe("LightMode y DarkMode", () => {
  it("LightMode renderiza sus children", () => {
    renderWithProviders(<LightMode>Contenido light</LightMode>);

    expect(screen.getByText("Contenido light")).toBeInTheDocument();
  });

  it("DarkMode renderiza sus children", () => {
    renderWithProviders(<DarkMode>Contenido dark</DarkMode>);

    expect(screen.getByText("Contenido dark")).toBeInTheDocument();
  });
});
