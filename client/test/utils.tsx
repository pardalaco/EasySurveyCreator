import { Provider } from "@/components/ui/provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  render,
  type RenderOptions,
  type RenderResult,
} from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  withRouter?: boolean;
  withQueryClient?: boolean;
  initialEntries?: string[];
}

export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult {
  const {
    withRouter = false,
    withQueryClient = false,
    initialEntries = ["/"],
    ...rest
  } = options;

  const queryClient = createTestQueryClient();

  function Wrapper({ children }: { children: ReactNode }) {
    let wrapped: ReactNode = children;

    if (withRouter) {
      wrapped = (
        <MemoryRouter initialEntries={initialEntries}>{wrapped}</MemoryRouter>
      );
    }

    if (withQueryClient) {
      wrapped = (
        <QueryClientProvider client={queryClient}>
          {wrapped}
        </QueryClientProvider>
      );
    }

    wrapped = <Provider>{wrapped}</Provider>;

    return <>{wrapped}</>;
  }

  return render(ui, { wrapper: Wrapper, ...rest });
}
