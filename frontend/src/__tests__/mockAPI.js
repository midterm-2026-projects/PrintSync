import { beforeAll, afterEach, afterAll } from "vitest";
import server from "./sample-backend/server";

beforeAll(() =>{
  server.listen();
});

afterEach(() =>{
  server.resetHandlers();
});

afterAll(() =>{
  server.close();
});

