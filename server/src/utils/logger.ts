

export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  public info(message: string, data?: any): void {
    console.log(
      `[${new Date().toISOString()}] [INFO] [${this.context}] ${message}`,
      data ? JSON.stringify(data) : ''
    );
  }

  public error(message: string, error?: any): void {
    console.error(
      `[${new Date().toISOString()}] [ERROR] [${this.context}] ${message}`,
      error instanceof Error ? error.message : error || ''
    );
  }

  public warn(message: string, data?: any): void {
    console.warn(
      `[${new Date().toISOString()}] [WARN] [${this.context}] ${message}`,
      data ? JSON.stringify(data) : ''
    );
  }

  public debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(
        `[${new Date().toISOString()}] [DEBUG] [${this.context}] ${message}`,
        data ? JSON.stringify(data) : ''
      );
    }
  }
}
