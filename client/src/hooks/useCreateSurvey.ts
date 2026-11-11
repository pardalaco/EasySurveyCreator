import { toaster } from "@/components/ui/toaster";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const useCreateSurvey = () => {
  const navegate = useNavigate();

  const createSurvey = async (
    question: string,
    options: string[]
  ): Promise<void> => {
    if (question === "") {
      toaster.create({
        description: "You must include a question to create the survey.",
        type: "warning",
      });
      return;
    }
    if (options.some((o) => o === "")) {
      toaster.create({
        description:
          "You must complete the options in order to create the survey.",
        type: "warning",
      });
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL;

      const payload = {
        question: question,
        options: options.map((o) => ({
          text: o,
        })),
      };

      const response = await axios.post(`${apiUrl}/survey`, payload);

      navegate(`/${response.data.id}`);
    } catch (error: any) {
      const data = error.response?.data;

      let errorMessage = "Error creating the survey.";

      if (typeof data === "string") {
        errorMessage = data; // Si el servidor devuelve texto plano o HTML
      } else if (data?.message) {
        errorMessage = data.message; // Si el servidor devuelve un JSON tipo { message: "..." }
      } else if (error.message) {
        errorMessage = error.message; // Fallback al mensaje de Axios
      }

      toaster.create({
        description: errorMessage,
        type: "error",
      });
    }
  };

  return { createSurvey };
};
