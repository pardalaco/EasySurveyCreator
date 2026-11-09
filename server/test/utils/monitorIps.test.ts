import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MonitorIPs } from "../../src/utils/monitorIps.js";

function resetSingleton(): void {
  (MonitorIPs as unknown as { instance: MonitorIPs | undefined }).instance =
    undefined;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubEnv("NODE_ENV", "test");
  vi.spyOn(console, "log").mockImplementation(() => {});
  resetSingleton();
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  resetSingleton();
});

describe("MonitorIPs", () => {
  describe("register", () => {
    it("acepta una IP IPv4 válida y devuelve 1 en el primer registro", () => {
      const monitor = new MonitorIPs(5);
      expect(monitor.register("192.168.1.10")).toBe(1);
    });

    it("acepta IPs IPv6 válidas", () => {
      const monitor = new MonitorIPs(5);
      expect(monitor.register("::1")).toBe(1);
      expect(monitor.register("2001:db8:85a3::8a2e:370:7334")).toBe(1);
    });

    it("incrementa el conteo en cada registro de la misma IP", () => {
      const monitor = new MonitorIPs(5);
      expect(monitor.register("10.0.0.1")).toBe(1);
      expect(monitor.register("10.0.0.1")).toBe(2);
      expect(monitor.register("10.0.0.1")).toBe(3);
    });

    it("cuenta cada IP de forma independiente", () => {
      const monitor = new MonitorIPs(5);
      monitor.register("10.0.0.1");
      monitor.register("10.0.0.1");
      monitor.register("10.0.0.2");
      expect(monitor.checkIp("10.0.0.1")).toBe(2);
      expect(monitor.checkIp("10.0.0.2")).toBe(1);
    });

    it("lanza error con IP inválida", () => {
      const monitor = new MonitorIPs(5);
      expect(() => monitor.register("no-es-ip")).toThrow(/IP inválida/);
      expect(() => monitor.register("999.999.999.999")).toThrow(/IP inválida/);
      expect(() => monitor.register("")).toThrow(/IP inválida/);
      expect(() => monitor.register("1.2.3")).toThrow(/IP inválida/);
    });

    it("incluye la IP inválida en el mensaje de error", () => {
      const monitor = new MonitorIPs(5);
      expect(() => monitor.register("no-es-ip")).toThrow(
        'IP inválida ("no-es-ip")'
      );
    });

    it("no incrementa el conteo cuando la IP es inválida", () => {
      const monitor = new MonitorIPs(5);
      expect(() => monitor.register("no-es-ip")).toThrow();
      expect(monitor.checkIp("no-es-ip")).toBe(0);
    });

    it("lanza error al superar el máximo de registros permitidos", () => {
      const monitor = new MonitorIPs(3);
      monitor.register("1.1.1.1");
      monitor.register("1.1.1.1");
      monitor.register("1.1.1.1");
      expect(() => monitor.register("1.1.1.1")).toThrow(
        "You have reached the maximum number of surveys for today. Please try again tomorrow."
      );
    });

    it("no incrementa el conteo cuando se supera el máximo", () => {
      const monitor = new MonitorIPs(1);
      monitor.register("1.1.1.1");
      expect(() => monitor.register("1.1.1.1")).toThrow();
      expect(monitor.checkIp("1.1.1.1")).toBe(1);
    });

    it("aplica el límite de forma independiente por IP", () => {
      const monitor = new MonitorIPs(2);
      monitor.register("1.1.1.1");
      monitor.register("1.1.1.1");
      expect(() => monitor.register("1.1.1.1")).toThrow();
      expect(monitor.register("2.2.2.2")).toBe(1);
      expect(monitor.register("2.2.2.2")).toBe(2);
    });

    it("permite registros ilimitados cuando maxNumIps es 0", () => {
      const monitor = new MonitorIPs(0);
      for (let i = 0; i < 100; i++) {
        expect(monitor.register("1.1.1.1")).toBe(i + 1);
      }
    });
  });

  describe("checkIp", () => {
    it("devuelve 0 para una IP desconocida", () => {
      const monitor = new MonitorIPs(5);
      expect(monitor.checkIp("8.8.8.8")).toBe(0);
    });

    it("devuelve el conteo registrado para una IP conocida", () => {
      const monitor = new MonitorIPs(5);
      monitor.register("8.8.8.8");
      monitor.register("8.8.8.8");
      expect(monitor.checkIp("8.8.8.8")).toBe(2);
    });
  });

  describe("getAll", () => {
    it("devuelve un objeto vacío inicialmente", () => {
      const monitor = new MonitorIPs(5);
      expect(monitor.getAll()).toEqual({});
    });

    it("refleja los conteos de todas las IPs registradas", () => {
      const monitor = new MonitorIPs(5);
      monitor.register("1.1.1.1");
      monitor.register("1.1.1.1");
      monitor.register("2.2.2.2");
      expect(monitor.getAll()).toEqual({ "1.1.1.1": 2, "2.2.2.2": 1 });
    });

    it("devuelve una copia que no afecta el estado interno", () => {
      const monitor = new MonitorIPs(5);
      monitor.register("1.1.1.1");
      const all = monitor.getAll();
      all["1.1.1.1"] = 99;
      expect(monitor.checkIp("1.1.1.1")).toBe(1);
    });
  });

  describe("getInstance", () => {
    it("devuelve siempre la misma instancia", () => {
      const a = MonitorIPs.getInstance();
      const b = MonitorIPs.getInstance();
      expect(a).toBe(b);
    });

    it("usa maxNumIps 0 (ilimitado) por defecto", () => {
      const monitor = MonitorIPs.getInstance();
      expect((monitor as unknown as { maxNumIps: number }).maxNumIps).toBe(0);
    });

    it("comparte el conteo entre llamadas", () => {
      MonitorIPs.getInstance().register("1.1.1.1");
      expect(MonitorIPs.getInstance().checkIp("1.1.1.1")).toBe(1);
    });
  });

  describe("reset en desarrollo", () => {
    it("usa RESET_INTERVAL_SECONDS_DEV como intervalo", () => {
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("RESET_INTERVAL_SECONDS_DEV", "10");
      const monitor = new MonitorIPs(5);
      monitor.register("1.1.1.1");
      vi.advanceTimersByTime(10_000);
      expect(monitor.checkIp("1.1.1.1")).toBe(0);
      expect(console.log).toHaveBeenCalledWith(
        "[DEV] Conteo de IPs reseteado (intervalo de 10s)."
      );
    });

    it("usa 30 segundos por defecto si no hay env definida", () => {
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("RESET_INTERVAL_SECONDS_DEV", undefined);
      const monitor = new MonitorIPs(5);
      monitor.register("1.1.1.1");
      vi.advanceTimersByTime(29_000);
      expect(monitor.checkIp("1.1.1.1")).toBe(1);
      vi.advanceTimersByTime(1_000);
      expect(monitor.checkIp("1.1.1.1")).toBe(0);
      expect(console.log).toHaveBeenCalledWith(
        "[DEV] Conteo de IPs reseteado (intervalo de 30s)."
      );
    });

    it("no limpia antes de que se cumpla el intervalo", () => {
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("RESET_INTERVAL_SECONDS_DEV", "10");
      const monitor = new MonitorIPs(5);
      monitor.register("1.1.1.1");
      vi.advanceTimersByTime(9_999);
      expect(monitor.checkIp("1.1.1.1")).toBe(1);
    });
  });

  describe("reset en producción (medianoche)", () => {
    it("limpia el conteo a medianoche y registra el evento", () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.setSystemTime(new Date("2026-11-09T23:30:00"));
      const monitor = new MonitorIPs(5);
      monitor.register("8.8.8.8");
      vi.advanceTimersByTime(30 * 60 * 1000);
      expect(monitor.checkIp("8.8.8.8")).toBe(0);
      expect(console.log).toHaveBeenCalledWith("Conteo de IPs reseteado.");
    });

    it("programa el siguiente reset para la medianoche siguiente", () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.setSystemTime(new Date("2026-11-09T23:30:00"));
      const monitor = new MonitorIPs(5);
      monitor.register("8.8.8.8");
      vi.advanceTimersByTime(30 * 60 * 1000);
      monitor.register("8.8.8.8");
      vi.advanceTimersByTime(24 * 60 * 60 * 1000);
      expect(monitor.checkIp("8.8.8.8")).toBe(0);
    });

    it("no limpia antes de llegar a medianoche", () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.setSystemTime(new Date("2026-11-09T23:30:00"));
      const monitor = new MonitorIPs(5);
      monitor.register("8.8.8.8");
      vi.advanceTimersByTime(29 * 60 * 1000);
      expect(monitor.checkIp("8.8.8.8")).toBe(1);
    });
  });
});
