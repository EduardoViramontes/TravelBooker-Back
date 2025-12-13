export interface HealthStatus {
  status: boolean;
  timestamp: string;
  uptime: number;
  version: string;
  checks: Record<string, 'connected' | 'disconnected'>;
}

export class HealthService {
  constructor(
    private readonly checks: Record<string, () => Promise<boolean>>,
    private readonly version: string = "1.0.0"
  ) {}

  async getStatus(): Promise<HealthStatus> {
    const results: Record<string, 'connected' | 'disconnected'> = {};

    for (const key of Object.keys(this.checks)) {
      try {
        const ok = await this.checks[key]();
        results[key] = ok ? 'connected' : 'disconnected';
      } catch {
        results[key] = 'disconnected';
      }
    }

    const hasError = Object.values(results).includes('disconnected');

    return {
      status: !hasError,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: this.version,
      checks: results,
    };
  }
}
