/**
 * Compile-time checks, type-checked by `make build` and never run.
 * Each `@ts-expect-error` marks a mistake the types must keep rejecting.
 */
import { createClient, fetchCuple } from "@cuple/client";
import { createBuilder, success } from "@cuple/server";
import { createCupleReactAdminAPI } from "@ra-api/index";
import { createCupleReactAdminDataProvider } from "@ra-data-provider/index";
import express from "express";
import { z } from "zod";

const builder = createBuilder(express());
const unimplemented = async (): Promise<never> => {
  throw new Error("unimplemented");
};
const defaultHandlers = {
  getList: unimplemented,
  getOne: unimplemented,
  getMany: unimplemented,
  create: unimplemented,
  update: unimplemented,
  updateMany: unimplemented,
  delete: unimplemented,
  deleteMany: unimplemented,
};
const authedBuilder = builder
  .headersSchema(z.object({ token: z.string() }))
  .middleware(async () => ({ next: true as const, userId: 1 }));
const deniedBuilder = builder.middleware(async () => ({
  next: false as const,
  statusCode: 403 as const,
  result: "unauthorized-error" as const,
}));

// Handlers

createCupleReactAdminAPI({
  builder,
  resources: ["users", "posts"],
  defaultHandlers: {
    ...defaultHandlers,
    async create(data) {
      data.body.data.name;
      // @ts-expect-error unknown body field
      data.body.nope;
      // @ts-expect-error middleware data the builder doesn't have
      data.userId;
      return unimplemented();
    },
    // @ts-expect-error wrong success shape
    getList: async () => success({ items: "x", total: 1 }),
  },
  overrides: {
    users: {
      async getOne(data) {
        const users: "users" = data.query.resource;
        // @ts-expect-error the resource is narrowed to the override's
        const posts: "posts" = data.query.resource;
        return unimplemented();
      },
    },
    // @ts-expect-error unknown resource
    nope: {},
  },
});

createCupleReactAdminAPI({
  builder: authedBuilder,
  resources: ["users"],
  defaultHandlers: {
    ...defaultHandlers,
    async create(data) {
      const userId: number = data.userId;
      const token: string = data.headers.token;
      return unimplemented();
    },
  },
  overrides: {},
});

createCupleReactAdminAPI({
  builder,
  resources: ["users"],
  // @ts-expect-error missing default handler
  defaultHandlers: { ...defaultHandlers, getList: undefined },
  overrides: {},
});

createCupleReactAdminAPI({
  // @ts-expect-error not a builder
  builder: {},
  resources: ["users"],
  defaultHandlers,
  overrides: {},
});

// Client

const admin = createCupleReactAdminAPI({
  builder,
  resources: ["users", "posts"],
  defaultHandlers,
  overrides: {},
});
const routes = {
  admin,
  authed: createCupleReactAdminAPI({
    builder: authedBuilder,
    resources: ["users"],
    defaultHandlers,
    overrides: {},
  }),
  denied: createCupleReactAdminAPI({
    builder: deniedBuilder,
    resources: ["users"],
    defaultHandlers,
    overrides: {},
  }),
  withTenant: createCupleReactAdminAPI({
    builder: builder.querySchema(z.object({ tenant: z.string() })),
    resources: ["users"],
    defaultHandlers,
    overrides: {},
  }),
  wrongSuccess: {
    ...admin,
    getOne: builder
      .querySchema(z.object({ resource: z.string(), id: z.number() }))
      .get(async () => success({ foo: 1 })),
  },
  extraFailure: {
    ...admin,
    getOne: builder
      .querySchema(
        z.object({ resource: z.string(), id: z.union([z.number(), z.string()]) }),
      )
      .get(async () =>
        Math.random()
          ? success({ item: null })
          : { result: "gone" as const, statusCode: 410 as const, message: "Gone" },
      ),
  },
};
const client = createClient<typeof routes>({ path: "" });

async function clientCalls() {
  const { item } = await fetchCuple(client.admin.getOne.get, {
    query: { resource: "users", id: 1 },
  });
  await fetchCuple(client.admin.create.post, {
    // @ts-expect-error unknown resource
    query: { resource: "nope" },
    body: { data: {} },
  });
  // @ts-expect-error missing body
  await fetchCuple(client.admin.create.post, { query: { resource: "users" } });
  await fetchCuple(client.admin.getList.get, {
    // @ts-expect-error range of strings
    query: { resource: "users", range: ["0", "9"] },
  });
  // @ts-expect-error missing auth header
  await fetchCuple(client.authed.create.post, {
    query: { resource: "users" },
    body: { data: {} },
  });

  const response = await fetchCuple(client.denied.getOne.get, {
    query: { resource: "users", id: 1 },
  }).thenResolveAnyResponse();
  if (response.result === "success") response.item;
  if (response.result === "unauthorized-error") response.statusCode;
  if (response.result === "invalid-query") response.message;
  if (response.result === "unexpected-error") response.message;
  // @ts-expect-error not a result the endpoint returns
  if (response.result === "nonsense") response;
}

// Data provider

createCupleReactAdminDataProvider(client.admin);
createCupleReactAdminDataProvider(client.extraFailure);
createCupleReactAdminDataProvider(
  client.with({ middleware: () => ({ headers: { token: "token" } }) }).authed,
);
createCupleReactAdminDataProvider(
  client.with({ middleware: () => ({ query: { tenant: "tenant" } }) }).withTenant,
);
// @ts-expect-error the auth header must come from client.with()
createCupleReactAdminDataProvider(client.authed);
// @ts-expect-error the tenant must come from client.with()
createCupleReactAdminDataProvider(client.withTenant);
// @ts-expect-error success data the data provider can't use
createCupleReactAdminDataProvider(client.wrongSuccess);
// @ts-expect-error missing endpoints
createCupleReactAdminDataProvider({});
