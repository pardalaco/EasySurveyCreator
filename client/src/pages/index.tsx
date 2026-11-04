import { createBrowserRouter } from "react-router-dom";
import CreateSurvey from "./CreateSurvey";

const router = createBrowserRouter([
  { path: "/", element: <CreateSurvey /> }, // Primera ruta
]);

export default router;
