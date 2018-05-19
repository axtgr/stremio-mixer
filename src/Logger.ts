import chalk, { Chalk } from 'chalk'

interface Scope {
  color: Chalk
  method: 'log' | 'error'
  minLevel: number
}

const SCOPES: { [K: string]: Scope } = {
  error: {
    color: chalk.red,
    method: 'error',
    minLevel: 1,
  },
  info: {
    color: chalk.cyan,
    method: 'log',
    minLevel: 2,
  },
  debug: {
    color: chalk.green,
    method: 'log',
    minLevel: 3,
  },
}

class Logger {
  private level: number = 0

  constructor(options?: { level: number }) {
    if (options) {
      this.level = options.level
    }
  }

  log(scopeName: keyof typeof SCOPES, label: string, ...message: any[]): void {
    let { color, method, minLevel } = SCOPES[scopeName]

    if (this.level < minLevel) {
      return
    }

    let date = new Date()
    let timestamp = chalk.gray(
      `[${date.toLocaleDateString()} ${date.toLocaleTimeString()}]`
    )

    // tslint:disable-next-line:no-console
    console[method](timestamp, color(label), ...message)
  }
}

export { Logger as default, Scope, SCOPES }
