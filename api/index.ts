import handler from "../dist/server/server.js";

export default async function (request: Request): Promise<Response> {
  return handler.fetch(request);
}
