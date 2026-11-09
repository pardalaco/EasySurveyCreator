import { Tooltip } from "@/components/ui/tooltip";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../../utils";

function renderTooltip(
  props: Partial<React.ComponentProps<typeof Tooltip>> = {},
  trigger: React.ReactNode = <button type="button">Hover me</button>
) {
  return renderWithProviders(
    <Tooltip content="Tooltip content" {...props}>
      {trigger}
    </Tooltip>
  );
}

describe("Tooltip", () => {
  it("renderiza el trigger", () => {
    renderTooltip();

    expect(
      screen.getByRole("button", { name: "Hover me" })
    ).toBeInTheDocument();
  });

  it("muestra el contenido al hacer hover", async () => {
    const user = userEvent.setup();
    renderTooltip();

    await user.hover(screen.getByRole("button", { name: "Hover me" }));

    expect(await screen.findByText("Tooltip content")).toBeInTheDocument();
  });

  it("muestra el contenido al enfocar el trigger", async () => {
    const user = userEvent.setup();
    renderTooltip();

    await user.tab();

    expect(await screen.findByText("Tooltip content")).toBeInTheDocument();
  });

  it("oculta el contenido al salir del hover", async () => {
    const user = userEvent.setup();
    renderTooltip();

    const trigger = screen.getByRole("button", { name: "Hover me" });
    await user.hover(trigger);
    expect(await screen.findByText("Tooltip content")).toBeInTheDocument();

    await user.unhover(trigger);

    await waitFor(() => {
      expect(trigger).toHaveAttribute("data-state", "closed");
    });
  });

  it("con disabled solo renderiza los children sin tooltip", () => {
    renderTooltip({ disabled: true });

    expect(
      screen.getByRole("button", { name: "Hover me" })
    ).toBeInTheDocument();
    expect(screen.queryByText("Tooltip content")).not.toBeInTheDocument();
  });

  it("con showArrow muestra el tooltip", async () => {
    const user = userEvent.setup();
    renderTooltip({ showArrow: true });

    await user.hover(screen.getByRole("button", { name: "Hover me" }));

    expect(await screen.findByText("Tooltip content")).toBeInTheDocument();
  });

  it("renderiza children custom como trigger", async () => {
    const user = userEvent.setup();
    renderTooltip({}, <a href="#test">Enlace trigger</a>);

    const trigger = screen.getByRole("link", { name: "Enlace trigger" });
    await user.hover(trigger);

    expect(await screen.findByText("Tooltip content")).toBeInTheDocument();
  });

  it("muestra un contenido complejo", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Tooltip
        content={
          <span>
            <strong>Importante</strong> — lee esto
          </span>
        }
      >
        <button type="button">Hover</button>
      </Tooltip>
    );

    await user.hover(screen.getByRole("button", { name: "Hover" }));

    expect(await screen.findByText("Importante")).toBeInTheDocument();
    expect(await screen.findByText(/lee esto/)).toBeInTheDocument();
  });
});
