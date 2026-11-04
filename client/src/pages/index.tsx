import { createBrowserRouter } from "react-router-dom";
import CreateSurvey from "./CreateSurvey";
import Survey from "./Survey";
import ErrorPage from "./ErrorPage";

const router = createBrowserRouter([
  { path: "/", element: <CreateSurvey /> }, // Primera ruta
  { path: "/:idSurvey", element: <Survey /> },
  { path: "/error", element: <ErrorPage /> },
]);

export default router;
