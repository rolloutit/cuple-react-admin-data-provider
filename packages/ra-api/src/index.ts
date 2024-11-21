import { Builder } from "@cuple/server";
import { Success } from "@cuple/server/dist/responses";
import { z } from "zod";

/**
 * @params builder Please make sure the builder has an authentication attached to it
 */
function createReactAdminEndpointBuilders<
  TBuilder extends Builder<object, never, any>,
  TReactAdminResource extends string,
>(builder: TBuilder, resources: TReactAdminResource[]) {
  const crudBuilder = builder.querySchema(
    z.object({
      resource: z.enum(resources as [TReactAdminResource, ...TReactAdminResource[]]),
    }),
  );

  const getListHandler = crudBuilder.querySchema(
    z.object({
      sort: z.record(z.string(), z.enum(["asc", "desc"])).optional(),
      range: z.tuple([z.coerce.number(), z.coerce.number()]),
      filter: z.record(z.string(), z.string()),
      ids: z.array(z.coerce.number()).optional(),
    }),
  ).get;

  const getOneHandler = crudBuilder.querySchema(
    z.object({
      id: z.coerce.number(),
    }),
  ).get;

  const getManyHandler = crudBuilder.querySchema(
    z.object({
      ids: z.array(z.coerce.number()),
    }),
  ).get;

  const createHandler = crudBuilder.bodySchema(
    z.object({
      data: z.record(z.string(), z.any()),
    }),
  ).post;

  const updateHandler = crudBuilder.bodySchema(
    z.object({
      item: z.record(z.string(), z.any()),
    }),
  ).put;

  const updateManyHandler = crudBuilder.bodySchema(
    z.object({
      ids: z.array(z.number()),
      changes: z.record(z.string(), z.any()),
    }),
  ).put;

  const deleteHandler = crudBuilder.querySchema(
    z.object({
      ids: z.array(z.coerce.number()),
    }),
  ).delete;

  return {
    _resources: resources,
    crudBuilder,
    getListHandler,
    getOneHandler,
    getManyHandler,
    createHandler,
    updateHandler,
    updateManyHandler,
    deleteHandler,
  };
}

export type GetListParams<TParams, TReactAdminResource extends string> = {
  query: {
    resource: TReactAdminResource;
    sort: Record<string, "asc" | "desc">;
    range: [number, number];
    filter: Record<string, string>;
    ids?: number[];
  };
} & TParams;
export type GetOneParams<TParams, TReactAdminResource extends string> = {
  query: {
    resource: TReactAdminResource;
    id: number;
  };
} & TParams;
export type GetManyParams<TParams, TReactAdminResource extends string> = {
  query: {
    resource: TReactAdminResource;
    ids: number[];
  };
} & TParams;
export type CreateParams<TParams, TReactAdminResource extends string> = {
  query: {
    resource: TReactAdminResource;
  };
  body: {
    data: Record<string, any>;
  };
} & TParams;
export type UpdateParams<TParams, TReactAdminResource extends string> = {
  query: {
    resource: TReactAdminResource;
  };
  body: {
    data: Record<string, any>;
  };
} & TParams;
export type UpdateManyParams<TParams, TReactAdminResource extends string> = {
  query: {
    resource: TReactAdminResource;
  };
  body: {
    ids: number[];
    changes: Record<string, any>;
  };
} & TParams;
export type DeleteParams<TParams, TReactAdminResource extends string> = {
  query: {
    resource: TReactAdminResource;
    ids: number[];
  };
} & TParams;

export type GetListClientParams = GetListParams<object, string>;
export type GetOneClientParams = GetOneParams<object, string>;
export type GetManyClientParams = GetManyParams<object, string>;
export type CreateClientParams = CreateParams<object, string>;
export type UpdateClientParams = UpdateParams<object, string>;
export type UpdateManyClientParams = UpdateManyParams<object, string>;
export type DeleteClientParams = DeleteParams<object, string>;

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

export type BuilderParams<TBuilder> =
  TBuilder extends Builder<infer Params, any, any> ? Params : never;
export function createCupleReactAdminAPI<
  TBuilder extends Builder<object, never, any>,
  TResources extends string[],
>(options: {
  builder: TBuilder;
  resources: TResources;
  defaultHandlers: {
    getList: (
      data: GetListParams<BuilderParams<TBuilder>, TResources[number]>,
    ) => Promise<GetListResult>;
    getOne: (
      data: GetOneParams<BuilderParams<TBuilder>, TResources[number]>,
    ) => Promise<GetOneResult>;
    getMany: (
      data: GetManyParams<BuilderParams<TBuilder>, TResources[number]>,
    ) => Promise<GetManyResult>;
    create: (
      data: CreateParams<BuilderParams<TBuilder>, TResources[number]>,
    ) => Promise<CreateResult>;
    update: (
      data: UpdateParams<BuilderParams<TBuilder>, TResources[number]>,
    ) => Promise<UpdateResult>;
    updateMany: (
      data: UpdateManyParams<BuilderParams<TBuilder>, TResources[number]>,
    ) => Promise<UpdateManyResult>;
    delete: (
      data: DeleteParams<BuilderParams<TBuilder>, TResources[number]>,
    ) => Promise<DeleteResult>;
  };
  overrides: {
    [Key in TResources[number]]?: {
      getList?: (
        data: GetListParams<BuilderParams<TBuilder>, TResources[number]>,
      ) => Promise<GetListResult>;
      getOne?: (
        data: GetOneParams<BuilderParams<TBuilder>, TResources[number]>,
      ) => Promise<GetOneResult>;
      getMany?: (
        data: GetManyParams<BuilderParams<TBuilder>, TResources[number]>,
      ) => Promise<GetManyResult>;
      create?: (
        data: CreateParams<BuilderParams<TBuilder>, TResources[number]>,
      ) => Promise<CreateResult>;
      update?: (
        data: UpdateParams<BuilderParams<TBuilder>, TResources[number]>,
      ) => Promise<UpdateResult>;
      updateMany?: (
        data: UpdateManyParams<BuilderParams<TBuilder>, TResources[number]>,
      ) => Promise<UpdateManyResult>;
      delete?: (
        data: DeleteParams<BuilderParams<TBuilder>, TResources[number]>,
      ) => Promise<DeleteResult>;
    };
  };
}) {
  const reactAdmin = createReactAdminEndpointBuilders(options.builder, options.resources);
  const overrides = options.overrides;
  return {
    getList: reactAdmin.getListHandler(async ({ data }) => {
      const res = data.query.resource as keyof typeof overrides;
      const resOverrides = overrides?.[res];
      const handler = resOverrides?.getList || options.defaultHandlers.getList;
      return await handler(data as any);
    }),
    getOne: reactAdmin.getOneHandler(async ({ data }) => {
      const res = data.query.resource as keyof typeof overrides;
      const resOverrides = overrides?.[res];
      const handler = resOverrides?.getOne || options.defaultHandlers.getOne;
      return await handler(data as any);
    }),
    getMany: reactAdmin.getManyHandler(async ({ data }) => {
      const res = data.query.resource as keyof typeof overrides;
      const resOverrides = overrides?.[res];
      const handler = resOverrides?.getMany || options.defaultHandlers.getMany;
      return await handler(data as any);
    }),
    create: reactAdmin.createHandler(async ({ data }) => {
      const res = data.query.resource as keyof typeof overrides;
      const resOverrides = overrides?.[res];
      const handler = resOverrides?.create || options.defaultHandlers.create;
      return await handler(data as any);
    }),
    update: reactAdmin.updateHandler(async ({ data }) => {
      const res = data.query.resource as keyof typeof overrides;
      const resOverrides = overrides?.[res];
      const handler = resOverrides?.update || options.defaultHandlers.update;
      return await handler(data as any);
    }),
    updateMany: reactAdmin.updateManyHandler(async ({ data }) => {
      const res = data.query.resource as keyof typeof overrides;
      const resOverrides = overrides?.[res];
      const handler = resOverrides?.updateMany || options.defaultHandlers.updateMany;
      return await handler(data as any);
    }),
    delete: reactAdmin.deleteHandler(async ({ data }) => {
      const res = data.query.resource as keyof typeof overrides;
      const resOverrides = overrides?.[res];
      const handler = resOverrides?.delete || options.defaultHandlers.delete;
      return await handler(data as any);
    }),
  };
}
