import { useParams } from "react-router-dom";

type Props = {};

function Survey({}: Props) {
  const params = useParams(); // Obtenemos los valores de la URL
  const idSurvey = params.idSurvey;

  return (
    <>
      <h1>Hola mundo</h1>
      <div>{idSurvey}</div>
    </>
  );
}

export default Survey;
