import { Provider } from "@/components/ui/provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "bootstrap/dist/css/bootstrap.min.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./pages/";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <Provider>
    <StrictMode>
      {/* Query Client Provider: Necesario para @tanstack/react-query */}
      <QueryClientProvider client={queryClient}>
        {/* Router: Sirve para navegar entre las diferentes páginas de la aplicación */}
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>
  </Provider>
);
