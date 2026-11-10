import debug from "debug";
import Joi from "joi";

const log = debug("EasySurveyCreator");

// Esquema de validación para IPs (IPv4 e IPv6)
const ipSchema = Joi.string().ip({
  version: ["ipv4", "ipv6"],
});

export class MonitorIPs {
  private static instance: MonitorIPs;
  private conteo = new Map<string, number>();
  private maxNumIps: number;

  public constructor(maxNumIps: number = 0) {
    this.maxNumIps = maxNumIps;
    this.initResetStrategy();
  }
  public static getInstance(): MonitorIPs {
    if (!MonitorIPs.instance) {
      MonitorIPs.instance = new MonitorIPs();
    }
    return MonitorIPs.instance;
  }

  private initResetStrategy(): void {
    const isDevelopment = process.env.NODE_ENV === "development";

    if (isDevelopment) {
      const seconds = process.env.RESET_INTERVAL_SECONDS_DEV
        ? parseInt(process.env.RESET_INTERVAL_SECONDS_DEV, 10)
        : 30;

      setInterval(() => {
        this.conteo.clear();
        log(`Conteo de IPs reseteado (intervalo de ${seconds}s).`);
      }, seconds * 1000);
    } else {
      // En producción: resetea a las 12 de la noche
      this.scheduleMidnightReset();
    }
  }

  private scheduleMidnightReset(): void {
    const now = new Date();
    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      0,
      0
    );

    const msToMidnight = nextMidnight.getTime() - now.getTime();

    setTimeout(() => {
      this.conteo.clear();
      this.scheduleMidnightReset();
      log("Conteo de IPs reseteado.");
    }, msToMidnight);
  }

  public register(ip: string): number {
    const { error } = ipSchema.validate(ip);

    if (error) {
      throw new Error(`IP inválida ("${ip}"): ${error.message}`);
    }

    if (this.checkIp(ip) >= this.maxNumIps && this.maxNumIps > 0) {
      throw new Error(
        "You have reached the maximum number of surveys for today. Please try again tomorrow."
      );
    }

    const total = (this.conteo.get(ip) || 0) + 1;
    this.conteo.set(ip, total);
    return total;
  }

  public checkIp(ip: string): number {
    return this.conteo.get(ip) || 0;
  }

  public getAll(): Record<string, number> {
    return Object.fromEntries(this.conteo);
  }
}
