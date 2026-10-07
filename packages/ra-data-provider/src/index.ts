import {
  type ClientEndpointRef,
  type ClientProps,
  type CupleSuccess,
  type FetchCupleArgs,
  fetchCuple,
} from "@cuple/client";
import type {
  CreateResult,
  DataProvider,
  DeleteResult,
  GetListResult,
  GetManyResult,
  GetOneResult,
  UpdateResult,
} from "react-admin";

/** react-admin passes any resource name, the server checks it against its resources. */
type Resource = any;
type Id = number | string;
type Item = { id: Id };
type Success<T> = { result: "success"; statusCode: 200 } & T;

type Endpoint<TInput, TSuccess> = {
  tInput: TInput;
  tOutput: Success<TSuccess>;
  tMethod: any;
  clientProps: ClientProps;
};

/** The endpoints of `createCupleReactAdminAPI`, as the data provider calls them. */
type Endpoints = {
  getList: {
    get: Endpoint<
      {
        query: {
          resource: Resource;
          range: [number, number];
          sort?: Record<string, "asc" | "desc">;
          filter?: Record<string, unknown>;
          ids?: Id[];
        };
      },
      { items: Item[]; total: number }
    >;
  };
  getOne: {
    get: Endpoint<{ query: { resource: Resource; id: Id } }, { item: Item | null }>;
  };
  getMany: {
    get: Endpoint<{ query: { resource: Resource; ids: Id[] } }, { items: Item[] }>;
  };
  create: {
    post: Endpoint<
      { query: { resource: Resource }; body: { data: Record<string, any> } },
      { item: Item | null }
    >;
  };
  update: {
    put: Endpoint<
      { query: { resource: Resource }; body: { data: Record<string, any> } },
      { item: Item | null }
    >;
  };
  updateMany: {
    put: Endpoint<
      {
        query: { resource: Resource };
        body: { ids: Id[]; changes: Record<string, any> };
      },
      object
    >;
  };
  delete: {
    delete: Endpoint<{ query: { resource: Resource; id: Id } }, { item: Item | null }>;
  };
  deleteMany: { delete: Endpoint<{ query: { resource: Resource; ids: Id[] } }, object> };
};

type ClientModule = {
  [Key in keyof Endpoints]: { [Method in keyof Endpoints[Key]]: ClientEndpointRef };
};

/**
 * Cuple's own check: the client endpoint is callable with the data provider's input
 * (e.g. its headers come from `client.with()`), and it succeeds with the expected data.
 */
type Callable<
  TEndpoint extends ClientEndpointRef,
  TExpected extends ClientEndpointRef,
> = [TExpected["tInput"], CupleSuccess<TEndpoint>] extends [
  FetchCupleArgs<TEndpoint>[0],
  CupleSuccess<TExpected>,
]
  ? TEndpoint
  : never;

type CallableClientModule<T extends ClientModule> = {
  getList: { get: Callable<T["getList"]["get"], Endpoints["getList"]["get"]> };
  getOne: { get: Callable<T["getOne"]["get"], Endpoints["getOne"]["get"]> };
  getMany: { get: Callable<T["getMany"]["get"], Endpoints["getMany"]["get"]> };
  create: { post: Callable<T["create"]["post"], Endpoints["create"]["post"]> };
  update: { put: Callable<T["update"]["put"], Endpoints["update"]["put"]> };
  updateMany: { put: Callable<T["updateMany"]["put"], Endpoints["updateMany"]["put"]> };
  delete: { delete: Callable<T["delete"]["delete"], Endpoints["delete"]["delete"]> };
  deleteMany: {
    delete: Callable<T["deleteMany"]["delete"], Endpoints["deleteMany"]["delete"]>;
  };
};

export function createCupleReactAdminDataProvider<TClientModule extends ClientModule>(
  clientModule: TClientModule & CallableClientModule<TClientModule>,
) {
  const api = clientModule as unknown as Endpoints;

  const getList = (async (resource, params): Promise<GetListResult> => {
    const { page, perPage } = params.pagination ?? { page: 1, perPage: 10 };
    const { sort, filter } = params;
    const { items, total } = await fetchCuple(api.getList.get, {
      query: {
        resource,
        filter,
        range: [(page - 1) * perPage, page * perPage - 1],
        sort: sort ? { [sort.field]: sort.order.toLowerCase() as "asc" | "desc" } : {},
      },
    });
    return { data: items, total };
  }) satisfies DataProvider["getList"];

  return {
    getList,
    async getOne(resource, params): Promise<GetOneResult> {
      const { item } = await fetchCuple(api.getOne.get, {
        query: { resource, id: params.id },
      });
      return { data: item };
    },
    async getMany(resource, params): Promise<GetManyResult> {
      const { items } = await fetchCuple(api.getMany.get, {
        query: { resource, ids: params.ids },
      });
      return { data: items };
    },
    getManyReference: getList,
    async create(resource, params): Promise<CreateResult> {
      const { item } = await fetchCuple(api.create.post, {
        query: { resource },
        body: { data: params.data },
      });
      return { data: item };
    },
    async update(resource, params): Promise<UpdateResult> {
      const { item } = await fetchCuple(api.update.put, {
        query: { resource },
        body: { data: params.data },
      });
      return { data: item };
    },
    async updateMany(resource, params) {
      await fetchCuple(api.updateMany.put, {
        query: { resource },
        body: { ids: params.ids, changes: params.data },
      });
      return { data: params.ids };
    },
    async delete(resource, params): Promise<DeleteResult> {
      const { item } = await fetchCuple(api.delete.delete, {
        query: { resource, id: params.id },
      });
      return { data: item };
    },
    async deleteMany(resource, params) {
      await fetchCuple(api.deleteMany.delete, {
        query: { resource, ids: params.ids },
      });
      return { data: params.ids };
    },
  } satisfies DataProvider;
}
