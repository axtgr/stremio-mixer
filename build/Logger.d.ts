import { Chalk } from 'chalk';
interface Scope {
    color: Chalk;
    method: 'log' | 'error';
    minLevel: number;
}
declare const SCOPES: {
    [K: string]: Scope;
};
declare class Logger {
    private level;
    constructor(options?: {
        level: number;
    });
    log(scopeName: keyof typeof SCOPES, label: string, ...message: any[]): void;
}
export { Logger as default, Scope, SCOPES };
