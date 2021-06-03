export interface Logger {
	trace(message: string, error?: Error): void;
	debug(message: string, error?: Error): void;
	info(message: string, error?: Error): void;
	warn(message: string, error?: Error): void;
	error(message: string, error?: Error): void;
}

export class DummyLogger implements Logger {
	trace(message: string, error?: Error): void { }
	debug(message: string, error?: Error): void { }
	info(message: string, error?: Error): void { }
	warn(message: string, error?: Error): void { }
	error(message: string, error?: Error): void { }
}

export class ConsoleLogger implements Logger {
	trace(message: string, error?: Error): void {
		console.log(`[DBG] ${message}`, error);
	}
	debug(message: string, error?: Error): void {
		console.log(`[DBG] ${message}`, error);
	}
	info(message: string, error?: Error): void {
		console.log(`[INF] ${message}`, error);
	}
	warn(message: string, error?: Error): void {
		console.warn(`[WRN] ${message}`, error);
	}
	error(message: string, error?: Error): void {
		console.error(`[ERR] ${message}`, error);
	}
}