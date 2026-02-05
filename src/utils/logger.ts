/**
 * JSON Logger for PageIndex
 * Matches Python's JsonLogger implementation
 */

import * as fs from 'fs';
import * as path from 'path';

export interface LogEntry {
    timestamp: string;
    level: string;
    message: string | Record<string, unknown>;
    [key: string]: unknown;
}

/**
 * JSON file logger for detailed processing logs
 */
export class JsonLogger {
    private filename: string;
    private logData: LogEntry[] = [];
    private logDir: string;

    constructor(docName: string, logDir: string = './logs') {
        this.logDir = logDir;

        // Sanitize filename
        const safeName = docName.replace(/[/\\:*?"<>|]/g, '-');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        this.filename = `${safeName}_${timestamp}.json`;

        // Ensure log directory exists
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    private getFilePath(): string {
        return path.join(this.logDir, this.filename);
    }

    private log(level: string, message: string | Record<string, unknown>, extra?: Record<string, unknown>): void {
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            ...extra,
        };

        this.logData.push(entry);

        // Write to file
        try {
            fs.writeFileSync(this.getFilePath(), JSON.stringify(this.logData, null, 2));
        } catch (error) {
            console.error('Failed to write log file:', error);
        }
    }

    info(message: string | Record<string, unknown>, extra?: Record<string, unknown>): void {
        this.log('INFO', message, extra);
        if (typeof message === 'string') {
            console.log(`[INFO] ${message}`);
        } else {
            console.log('[INFO]', message);
        }
    }

    error(message: string | Record<string, unknown>, extra?: Record<string, unknown>): void {
        this.log('ERROR', message, extra);
        if (typeof message === 'string') {
            console.error(`[ERROR] ${message}`);
        } else {
            console.error('[ERROR]', message);
        }
    }

    debug(message: string | Record<string, unknown>, extra?: Record<string, unknown>): void {
        this.log('DEBUG', message, extra);
    }

    getLogPath(): string {
        return this.getFilePath();
    }
}

/**
 * Console-only logger for environments without file system access
 */
export class ConsoleLogger {
    info(message: string | Record<string, unknown>): void {
        if (typeof message === 'string') {
            console.log(`[INFO] ${message}`);
        } else {
            console.log('[INFO]', message);
        }
    }

    error(message: string | Record<string, unknown>): void {
        if (typeof message === 'string') {
            console.error(`[ERROR] ${message}`);
        } else {
            console.error('[ERROR]', message);
        }
    }

    debug(message: string | Record<string, unknown>): void {
        if (typeof message === 'string') {
            console.log(`[DEBUG] ${message}`);
        } else {
            console.log('[DEBUG]', message);
        }
    }
}

export type Logger = JsonLogger | ConsoleLogger;

/**
 * Create appropriate logger based on environment
 */
export function createLogger(docName: string, useFileLogger: boolean = true): Logger {
    if (useFileLogger && typeof window === 'undefined') {
        try {
            return new JsonLogger(docName);
        } catch {
            return new ConsoleLogger();
        }
    }
    return new ConsoleLogger();
}
