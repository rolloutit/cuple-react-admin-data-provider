import { Builder } from "@cuple/server";
import { BuiltEndpoint } from "@cuple/server/dist/builder";
import { Success } from "@cuple/server/dist/responses";
import { z } from "zod";

const getListSchema = z.object({
  sort: z.record(z.string(), z.enum(["asc", "desc"])).optional(),
  range: z.tuple([z.coerce.number(), z.coerce.number()]),
  filter: z.record(z.string(), z.string()).optional(),
  ids: z.array(z.coerce.number()).optional(),
});
const getOneSchema = z.object({
  id: z.coerce.number(),
});
const getManySchema = z.object({
  ids: z.array(z.coerce.number()),
});
const createSchema = z.object({
  data: z.record(z.string(), z.any()),
});
const updateSchema = z.object({
  data: z.record(z.string(), z.any()),
});
const updateManySchema = z.object({
  ids: z.array(z.number()),
  changes: z.record(z.string(), z.any()),
});
const deleteSchema = z.object({
  id: z.coerce.number(),
});
const deleteManySchema = z.object({
  ids: z.array(z.coerce.number()),
});

const METHODS = {
  getList: "get",
  getOne: "get",
  getMany: "get",
  create: "post",
  update: "put",
  updateMany: "put",
  delete: "delete",
  deleteMany: "delete",
} as const;

/**
 * @params builder Please make sure the builder has an authentication attached to it
 */
function createReactAdminEndpointBuilders(builder: unknown, resources: string[]) {
  if (!(builder instanceof Builder))
    throw new Error("builder is not instance of Builder");

  const crudBuilder = builder.querySchema(
    z.object({
      resource: z.enum(resources as [string, ...string[]]),
    }),
  );

  return {
    _resources: resources,
    crudBuilder,
    getList: crudBuilder.querySchema(getListSchema)[METHODS["getList"]],
    getOne: crudBuilder.querySchema(getOneSchema)[METHODS["getOne"]],
    getMany: crudBuilder.querySchema(getManySchema)[METHODS["getMany"]],
    create: crudBuilder.bodySchema(createSchema)[METHODS["create"]],
    update: crudBuilder.bodySchema(updateSchema)[METHODS["update"]],
    updateMany: crudBuilder.bodySchema(updateManySchema)[METHODS["updateMany"]],
    delete: crudBuilder.querySchema(deleteSchema)[METHODS["delete"]],
    deleteMany: crudBuilder.querySchema(deleteManySchema)[METHODS["deleteMany"]],
  };
}

export type GetListParams<TParams, TReactAdminResource extends string> = TParams & {
  query: {
    resource: TReactAdminResource;
  } & z.infer<typeof getListSchema>;
};
export type GetOneParams<TParams, TReactAdminResource extends string> = TParams & {
  query: {
    resource: TReactAdminResource;
  } & z.infer<typeof getOneSchema>;
};
export type GetManyParams<TParams, TReactAdminResource extends string> = TParams & {
  query: {
    resource: TReactAdminResource;
  } & z.infer<typeof getManySchema>;
};
export type CreateParams<TParams, TReactAdminResource extends string> = TParams & {
  query: {
    resource: TReactAdminResource;
  };
  body: z.infer<typeof createSchema>;
};
export type UpdateParams<TParams, TReactAdminResource extends string> = TParams & {
  query: {
    resource: TReactAdminResource;
  };
  body: z.infer<typeof updateSchema>;
};
export type UpdateManyParams<TParams, TReactAdminResource extends string> = TParams & {
  query: {
    resource: TReactAdminResource;
  };
  body: z.infer<typeof updateManySchema>;
};
export type DeleteParams<TParams, TReactAdminResource extends string> = TParams & {
  query: {
    resource: TReactAdminResource;
  } & z.infer<typeof deleteSchema>;
};
export type DeleteManyParams<TParams, TReactAdminResource extends string> = TParams & {
  query: {
    resource: TReactAdminResource;
  } & z.infer<typeof deleteManySchema>;
};

type Params<TParams, TReactAdminResource extends string> = {
  getList: GetListParams<TParams, TReactAdminResource>;
  getOne: GetOneParams<TParams, TReactAdminResource>;
  getMany: GetManyParams<TParams, TReactAdminResource>;
  create: CreateParams<TParams, TReactAdminResource>;
  update: UpdateParams<TParams, TReactAdminResource>;
  updateMany: UpdateManyParams<TParams, TReactAdminResource>;
  delete: DeleteParams<TParams, TReactAdminResource>;
  deleteMany: DeleteManyParams<TParams, TReactAdminResource>;
};

export type GetListClientParams<TResource extends string> = GetListParams<
  object,
  TResource
>;
export type GetOneClientParams<TResource extends string> = GetOneParams<
  object,
  TResource
>;
export type GetManyClientParams<TResource extends string> = GetManyParams<
  object,
  TResource
>;
export type CreateClientParams<TResource extends string> = CreateParams<
  object,
  TResource
>;
export type UpdateClientParams<TResource extends string> = UpdateParams<
  object,
  TResource
>;
export type UpdateManyClientParams<TResource extends string> = UpdateManyParams<
  object,
  TResource
>;
export type DeleteClientParams<TResource extends string> = DeleteParams<
  object,
  TResource
>;
export type DeleteManyClientParams<TResource extends string> = DeleteManyParams<
  object,
  TResource
>;

export type Item = { id: number | string };
export type GetListResult =
  | Success<{ items: Item[]; total: number }>
  | { result: "error"; message: string };
export type GetOneResult =
  | Success<{ item: Item | null }>
  | { result: "error"; message: string };
export type GetManyResult =
  | Success<{ items: Item[] }>
  | { result: "error"; message: string };
export type CreateResult =
  | Success<{ item: Item | null }>
  | { result: "error"; message: string };
export type UpdateResult =
  | Success<{ item: Item | null }>
  | { result: "error"; message: string };
export type UpdateManyResult = Success<object> | { result: "error"; message: string };
export type DeleteResult =
  | Success<{ item: Item | null }>
  | { result: "error"; message: string };
export type DeleteManyResult = Success<object> | { result: "error"; message: string };

type Result = {
  getList: GetListResult;
  getOne: GetOneResult;
  getMany: GetManyResult;
  create: CreateResult;
  update: UpdateResult;
  updateMany: UpdateManyResult;
  delete: DeleteResult;
  deleteMany: DeleteManyResult;
};

type Handlers<TData extends object, TResource extends string> = {
  getList: (data: GetListParams<TData, TResource>) => Promise<GetListResult>;
  getOne: (data: GetOneParams<TData, TResource>) => Promise<GetOneResult>;
  getMany: (data: GetManyParams<TData, TResource>) => Promise<GetManyResult>;
  create: (data: CreateParams<TData, TResource>) => Promise<CreateResult>;
  update: (data: UpdateParams<TData, TResource>) => Promise<UpdateResult>;
  updateMany: (data: UpdateManyParams<TData, TResource>) => Promise<UpdateManyResult>;
  delete: (data: DeleteParams<TData, TResource>) => Promise<DeleteResult>;
  deleteMany: (data: DeleteManyParams<TData, TResource>) => Promise<DeleteManyResult>;
};

export function createCupleReactAdminAPI<
  TData extends object,
  TResource extends string,
>(options: {
  builder: Builder<TData, any, any>;
  resources: TResource[];
  defaultHandlers: Handlers<TData, TResource>;
  overrides: {
    [Key in TResource]?: Partial<Handlers<TData, Key>>;
  };
}) {
  const reactAdmin = createReactAdminEndpointBuilders(options.builder, options.resources);
  return {
    getList: createEndpoint<TData, TResource, "getList">(reactAdmin, options, "getList"),
    getOne: createEndpoint<TData, TResource, "getOne">(reactAdmin, options, "getOne"),
    getMany: createEndpoint<TData, TResource, "getMany">(reactAdmin, options, "getMany"),
    create: createEndpoint<TData, TResource, "create">(reactAdmin, options, "create"),
    update: createEndpoint<TData, TResource, "update">(reactAdmin, options, "update"),
    updateMany: createEndpoint<TData, TResource, "updateMany">(
      reactAdmin,
      options,
      "updateMany",
    ),
    delete: createEndpoint<TData, TResource, "delete">(reactAdmin, options, "delete"),
    deleteMany: createEndpoint<TData, TResource, "deleteMany">(
      reactAdmin,
      options,
      "deleteMany",
    ),
  };
}
function createEndpoint<
  TData extends object,
  TResource extends string,
  THandlerName extends keyof Result,
>(
  reactAdmin: ReturnType<typeof createReactAdminEndpointBuilders>,
  options: {
    defaultHandlers: Handlers<TData, TResource>;
    overrides: {
      [Key in TResource]?: Partial<Handlers<TData, Key>>;
    };
  },
  handlerName: THandlerName,
) {
  return reactAdmin[handlerName](async ({ data }) => {
    const res = data.query.resource as keyof typeof options.overrides;
    const resOverrides = options.overrides?.[res];
    const handler = resOverrides?.[handlerName] || options.defaultHandlers[handlerName];
    return await handler(data as any);
  }) as unknown as BuiltEndpoint<
    Params<TData, TResource>[typeof handlerName],
    Result[typeof handlerName],
    (typeof METHODS)[typeof handlerName]
  >;
}
