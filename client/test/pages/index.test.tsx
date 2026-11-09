import { matchRoutes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import router from "../../src/pages";
import CreateSurvey from "../../src/pages/CreateSurvey";
import ErrorPage from "../../src/pages/ErrorPage";
import Survey from "../../src/pages/Survey";

describe("router", () => {
  it("define la ruta raíz / con CreateSurvey", () => {
    const matches = matchRoutes(router.routes, "/");

    expect(matches).not.toBeNull();
    expect(matches?.[0]?.route.path).toBe("/");
    expect(matches?.[0]?.route.element).toEqual(<CreateSurvey />);
  });

  it("define la ruta /:idSurvey con Survey", () => {
    const matches = matchRoutes(router.routes, "/abc12345");

    expect(matches).not.toBeNull();
    expect(matches?.[0]?.route.path).toBe("/:idSurvey");
    expect(matches?.[0]?.route.element).toEqual(<Survey />);
  });

  it("define la ruta /error con ErrorPage", () => {
    const matches = matchRoutes(router.routes, "/error");

    expect(matches).not.toBeNull();
    expect(matches?.[0]?.route.path).toBe("/error");
    expect(matches?.[0]?.route.element).toEqual(<ErrorPage />);
  });

  it("captura rutas desconocidas con ErrorPage (catch-all)", () => {
    const matches = matchRoutes(router.routes, "/ruta/que/no/existe");

    expect(matches).not.toBeNull();
    expect(matches?.[0]?.route.path).toBe("*");
    expect(matches?.[0]?.route.element).toEqual(<ErrorPage />);
  });

  it("define exactamente las 4 rutas esperadas", () => {
    const paths = router.routes.map((route) => route.path);

    expect(paths).toEqual(["/", "/:idSurvey", "/error", "*"]);
  });
});
