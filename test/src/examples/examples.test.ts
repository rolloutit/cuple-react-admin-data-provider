import { createCupleReactAdminAPI } from "@ra-api/index";
import assert from "assert";
import { describe, it } from "mocha";
import { z } from "zod";
import createClientAndServer from "../utils/createClientAndServer";
import { success } from "@cuple/server";

describe("Example", () => {
  it("should create default handlers", async () => {
    const cs = await createClientAndServer((builder) => ({
      ...createCupleReactAdminAPI({
        builder,
        resources: ["users"],
        defaultHandlers: {
          async create(data) {
            return success({
              item: { id: 1, name: data.body.data["name"] },
            });
          },
          delete(data) {
            throw new Error("unimplemented");
          },
          getList(data) {
            throw new Error("unimplemented");
          },
          getMany(data) {
            throw new Error("unimplemented");
          },
          getOne(data) {
            throw new Error("unimplemented");
          },
          update(data) {
            throw new Error("unimplemented");
          },
          updateMany(data) {
            throw new Error("unimplemented");
          },
        },
        overrides: {},
      }),
    }));
    await cs.run(async (client) => {
      const response = await client.create.post({
        query: {
          resource: "users",
        },
        body: {
          data: {
            name: "Foo Bar",
          },
        },
      });

      if (response.result !== "success") throw new Error("response should be success");
      assert.equal((response.item as { id: number; name: string })["name"], "Foo Bar");
    });
  });

  it("should handle overrides", async () => {
    const cs = await createClientAndServer((builder) => ({
      ...createCupleReactAdminAPI({
        builder,
        resources: ["users", "posts"],
        defaultHandlers: {
          async create(data) {
            throw new Error("unimplemented");
          },
          delete(data) {
            throw new Error("unimplemented");
          },
          getList(data) {
            throw new Error("unimplemented");
          },
          getMany(data) {
            throw new Error("unimplemented");
          },
          getOne(data) {
            throw new Error("unimplemented");
          },
          update(data) {
            throw new Error("unimplemented");
          },
          updateMany(data) {
            throw new Error("unimplemented");
          },
        },
        overrides: {
          users: {
            async create(data) {
              return success({
                item: { id: 1, name: data.body.data["name"] },
              });
            },
          },
        },
      }),
    }));
    await cs.run(async (client) => {
      const response = await client.create.post({
        query: {
          resource: "users",
        },
        body: {
          data: {
            name: "Foo Bar",
          },
        },
      });

      if (response.result !== "success") throw new Error("response should be success");
      assert.equal((response.item as { id: number; name: string })["name"], "Foo Bar");

      const response2 = await client.create.post({
        query: {
          resource: "posts",
        },
        body: {
          data: {
            name: "Foo Bar",
          },
        },
      });

      assert.equal(response2.result, "unexpected-error");
    });
  });
});
