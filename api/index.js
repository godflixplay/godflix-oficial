import { createServer } from 'node:http';
import handler from '../dist/server/server.js';

export default async function(req, res) {
  return handler.fetch(req, {
    env: process.env
  });
}
