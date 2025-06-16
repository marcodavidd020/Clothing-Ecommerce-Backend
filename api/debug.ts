// Type definitions for Vercel request/response (avoiding dependency)
interface VercelRequest {
  method?: string;
  url?: string;
  headers: Record<string, string | string[]>;
  body?: unknown;
}

interface VercelResponse {
  status(code: number): VercelResponse;
  setHeader(name: string, value: string): void;
  json(object: unknown): void;
  end(): void;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const debug = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    headers: req.headers,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
    },
    filesystem: {
      cwd: process.cwd(),
      files: [] as string[],
      hasApi: false,
      hasDist: false,
      hasSrc: false,
      error: null as string | null,
    },
  };

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs');
    debug.filesystem.files = fs.readdirSync('.') as string[];
    debug.filesystem.hasApi = fs.existsSync('./api') as boolean;
    debug.filesystem.hasDist = fs.existsSync('./dist') as boolean;
    debug.filesystem.hasSrc = fs.existsSync('./src') as boolean;
  } catch (error) {
    debug.filesystem.error = error instanceof Error ? error.message : 'Unknown filesystem error';
  }

  res.json(debug);
}
