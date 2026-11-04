import { createBrowserRouter } from "react-router-dom";
import CreateSurvey from "./CreateSurvey";
import Survey from "./Survey";

const router = createBrowserRouter([
  { path: "/", element: <CreateSurvey /> }, // Primera ruta
  { path: "/:idSurvey", element: <Survey /> },
]);

export default router;
