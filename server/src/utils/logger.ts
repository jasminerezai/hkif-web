// server/src/utils/logger.ts

export class Logger {
    constructor(private context: string) {}

    info(message: string, ...args: any[]): void {
        console.info(`[${this.context}] ${message}`, ...args);
    }

    error(message: string, ...args: any[]): void {
        console.error(`[${this.context}] ${message}`, ...args);
    }
}

export const cronLogger = new Logger('cron');
