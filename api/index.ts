// Vercel serverless entry that wraps the TanStack Start server build.
// This file is detected by Vercel as a serverless function and receives
// every request via the rewrite rule defined in `vercel.json`.
import handler from "../dist/server/server.js";

export const config = {
  runtime: "nodejs",
};

export default async function (request: Request): Promise<Response> {
  return handler.fetch(request);
}
