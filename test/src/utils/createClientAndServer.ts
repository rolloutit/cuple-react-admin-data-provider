import { type Client, createClient, type RecursiveApi } from "@cuple/client";
import { type Builder, createBuilder, initRpc } from "@cuple/server";
import express from "express";

export default async function createClientAndServer<T extends RecursiveApi>(
  createRoutes: (builder: Builder) => T,
  builderOptions?: Parameters<typeof createBuilder>[1],
) {
  const app = express();
  const builder = createBuilder(app, builderOptions);
  const routes = createRoutes(builder);

  initRpc(app, {
    path: "/rpc",
    routes,
  });

  const client = createClient<typeof routes>({
    path: "http://localhost:8080/rpc",
  });

  function run(cb: (client: Client<T, NonNullable<unknown>>) => Promise<void>) {
    return new Promise((resolve, reject) => {
      const server = app.listen(8080, () => {
        cb(client)
          .then((val) => {
            server.close();
            resolve(val);
          })
          .catch((e) => {
            server.close();
            reject(e);
          });
      });
    });
  }

  return {
    run,
  };
}
