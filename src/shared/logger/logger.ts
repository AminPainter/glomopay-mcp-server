type TLogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<TLogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

// LOG_LEVEL env toggles verbosity; defaults to 'info'. Set LOG_LEVEL=debug for step-level tracing.
const configuredLevel = (process.env.LOG_LEVEL as TLogLevel) || 'info';
const threshold = LEVEL_ORDER[configuredLevel] ?? LEVEL_ORDER.info;

/**
 * Current timestamp in IST (Asia/Kolkata), ISO-like for log correlation.
 */
function istTimestamp(): string {
  return new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Kolkata' }) + ' IST';
}

/**
 * Structured, level-aware logger. Writes to stderr only — stdout is reserved for the
 * MCP protocol. Never pass secrets/tokens/PII in `meta`; callers are responsible for
 * redaction (see auth pass-through — the bearer secret must never be logged).
 */
export const logger = {
  debug: (scope: string, message: string, meta?: Record<string, unknown>) => log('debug', scope, message, meta),
  info: (scope: string, message: string, meta?: Record<string, unknown>) => log('info', scope, message, meta),
  warn: (scope: string, message: string, meta?: Record<string, unknown>) => log('warn', scope, message, meta),
  error: (scope: string, message: string, meta?: Record<string, unknown>) => log('error', scope, message, meta),
};

function log(level: TLogLevel, scope: string, message: string, meta?: Record<string, unknown>) {
  if (LEVEL_ORDER[level] < threshold) return;
  const suffix = meta && Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
  console.error(`[${istTimestamp()}] [${level.toUpperCase()}] [${scope}] ${message}${suffix}`);
}
