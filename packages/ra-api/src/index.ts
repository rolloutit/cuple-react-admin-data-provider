import type { Builder } from "@cuple/server";
import type { Success } from "@cuple/server/dist/responses";
import { z } from "zod";

const idSchema = z.union([z.coerce.number<number>(), z.string()]);
const getListSchema = z.object({
  sort: z.record(z.string(), z.enum(["asc", "desc"])).optional(),
  range: z.tuple([z.coerce.number<number>(), z.coerce.number<number>()]),
  filter: z.record(z.string(), z.unknown()).optional(),
  ids: z.array(idSchema).optional(),
});
const getOneSchema = z.object({
  id: idSchema,
});
const getManySchema = z.object({
  ids: z.array(idSchema),
});
const createSchema = z.object({
  data: z.record(z.string(), z.any()),
});
const updateSchema = z.object({
  data: z.record(z.string(), z.any()),
});
const updateManySchema = z.object({
  ids: z.array(idSchema),
  changes: z.record(z.string(), z.any()),
});
const deleteSchema = z.object({
  id: idSchema,
});
const deleteManySchema = z.object({
  ids: z.array(idSchema),
});

type Query<TData, TResource extends string, TQuery = object> = TData & {
  query: { resource: TResource } & TQuery;
};
type QueryAndBody<TData, TResource extends string, TBody> = Query<TData, TResource> & {
  body: TBody;
};

export type GetListParams<TData, TResource extends string> = Query<
  TData,
  TResource,
  z.infer<typeof getListSchema>
>;
export type GetOneParams<TData, TResource extends string> = Query<
  TData,
  TResource,
  z.infer<typeof getOneSchema>
>;
export type GetManyParams<TData, TResource extends string> = Query<
  TData,
  TResource,
  z.infer<typeof getManySchema>
>;
export type CreateParams<TData, TResource extends string> = QueryAndBody<
  TData,
  TResource,
  z.infer<typeof createSchema>
>;
export type UpdateParams<TData, TResource extends string> = QueryAndBody<
  TData,
  TResource,
  z.infer<typeof updateSchema>
>;
export type UpdateManyParams<TData, TResource extends string> = QueryAndBody<
  TData,
  TResource,
  z.infer<typeof updateManySchema>
>;
export type DeleteParams<TData, TResource extends string> = Query<
  TData,
  TResource,
  z.infer<typeof deleteSchema>
>;
export type DeleteManyParams<TData, TResource extends string> = Query<
  TData,
  TResource,
  z.infer<typeof deleteManySchema>
>;

export type Params<TData, TResource extends string> = {
  getList: GetListParams<TData, TResource>;
  getOne: GetOneParams<TData, TResource>;
  getMany: GetManyParams<TData, TResource>;
  create: CreateParams<TData, TResource>;
  update: UpdateParams<TData, TResource>;
  updateMany: UpdateManyParams<TData, TResource>;
  delete: DeleteParams<TData, TResource>;
  deleteMany: DeleteManyParams<TData, TResource>;
};

export type Item = { id: number | string };
type Failure = { result: "error"; message: string };
export type GetListResult = Success<{ items: Item[]; total: number }> | Failure;
export type GetOneResult = Success<{ item: Item | null }> | Failure;
export type GetManyResult = Success<{ items: Item[] }> | Failure;
export type CreateResult = Success<{ item: Item | null }> | Failure;
export type UpdateResult = Success<{ item: Item | null }> | Failure;
export type UpdateManyResult = Success<object> | Failure;
export type DeleteResult = Success<{ item: Item | null }> | Failure;
export type DeleteManyResult = Success<object> | Failure;

export type Result = {
  getList: GetListResult;
  getOne: GetOneResult;
  getMany: GetManyResult;
  create: CreateResult;
  update: UpdateResult;
  updateMany: UpdateManyResult;
  delete: DeleteResult;
  deleteMany: DeleteManyResult;
};

export type Handlers<TData, TResource extends string> = {
  getList: (data: GetListParams<TData, TResource>) => Promise<GetListResult>;
  getOne: (data: GetOneParams<TData, TResource>) => Promise<GetOneResult>;
  getMany: (data: GetManyParams<TData, TResource>) => Promise<GetManyResult>;
  create: (data: CreateParams<TData, TResource>) => Promise<CreateResult>;
  update: (data: UpdateParams<TData, TResource>) => Promise<UpdateResult>;
  updateMany: (data: UpdateManyParams<TData, TResource>) => Promise<UpdateManyResult>;
  delete: (data: DeleteParams<TData, TResource>) => Promise<DeleteResult>;
  deleteMany: (data: DeleteManyParams<TData, TResource>) => Promise<DeleteManyResult>;
};

/** Same as cuple's (unexported) `AnyBuilderParams`. */
type AnyBuilderParams = {
  tMeta: object;
  tInput: object;
  tData: object;
  tResponses: any;
  tMethod: "get" | "post" | "put" | "patch" | "delete";
  tDependencyData: any;
};

/**
 * @param options.builder Please make sure the builder has an authentication attached to it
 */
export function createCupleReactAdminAPI<
  TParams extends AnyBuilderParams,
  TResource extends string,
>(options: {
  builder: Builder<TParams>;
  resources: TResource[];
  defaultHandlers: Handlers<TParams["tData"], TResource>;
  overrides: {
    [Key in TResource]?: Partial<Handlers<TParams["tData"], Key>>;
  };
}) {
  const handlers = (resource: TResource) => ({
    ...options.defaultHandlers,
    ...options.overrides[resource],
  });
  const crud = options.builder.querySchema(
    z.object({ resource: z.enum(options.resources) }),
  );

  return {
    getList: crud
      .querySchema(getListSchema)
      .get(({ data }) => handlers(data.query.resource).getList(data)),
    getOne: crud
      .querySchema(getOneSchema)
      .get(({ data }) => handlers(data.query.resource).getOne(data)),
    getMany: crud
      .querySchema(getManySchema)
      .get(({ data }) => handlers(data.query.resource).getMany(data)),
    create: crud
      .bodySchema(createSchema)
      .post(({ data }) => handlers(data.query.resource).create(data)),
    update: crud
      .bodySchema(updateSchema)
      .put(({ data }) => handlers(data.query.resource).update(data)),
    updateMany: crud
      .bodySchema(updateManySchema)
      .put(({ data }) => handlers(data.query.resource).updateMany(data)),
    delete: crud
      .querySchema(deleteSchema)
      .delete(({ data }) => handlers(data.query.resource).delete(data)),
    deleteMany: crud
      .querySchema(deleteManySchema)
      .delete(({ data }) => handlers(data.query.resource).deleteMany(data)),
  };
}
