import {
  GetListParams,
  QueryFunctionContext,
  GetListResult,
  GetOneParams,
  GetOneResult,
  GetManyParams,
  GetManyResult,
  GetManyReferenceParams,
  GetManyReferenceResult,
  UpdateParams,
  UpdateResult,
  UpdateManyParams,
  UpdateManyResult,
  CreateParams,
  CreateResult,
  DeleteParams,
  DeleteResult,
  DeleteManyParams,
  DeleteManyResult,
} from "react-admin";

import type * as CupleReactAdminApi from "../../ra-api";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RecordType = any;

export function createCupleReactAdminDataProvider<
  TResource extends string,
>(clientModule: {
  getList: {
    get: (
      params: CupleReactAdminApi.GetListClientParams<TResource>,
    ) => Promise<CupleReactAdminApi.GetListResult>;
  };
  getOne: {
    get: (
      params: CupleReactAdminApi.GetOneClientParams<TResource>,
    ) => Promise<CupleReactAdminApi.GetOneResult>;
  };
  getMany: {
    get: (
      params: CupleReactAdminApi.GetManyClientParams<TResource>,
    ) => Promise<CupleReactAdminApi.GetManyResult>;
  };
  update: {
    put: (
      params: CupleReactAdminApi.UpdateClientParams<TResource>,
    ) => Promise<CupleReactAdminApi.UpdateResult>;
  };
  updateMany: {
    put: (
      params: CupleReactAdminApi.UpdateManyClientParams<TResource>,
    ) => Promise<CupleReactAdminApi.UpdateManyResult>;
  };
  create: {
    post: (
      params: CupleReactAdminApi.CreateClientParams<TResource>,
    ) => Promise<CupleReactAdminApi.CreateResult>;
  };
  delete: {
    delete: (
      params: CupleReactAdminApi.DeleteClientParams<TResource>,
    ) => Promise<CupleReactAdminApi.DeleteResult>;
  };
  deleteMany: {
    delete: (
      params: CupleReactAdminApi.DeleteManyClientParams<TResource>,
    ) => Promise<CupleReactAdminApi.DeleteManyResult>;
  };
}) {
  async function getList(
    resource: string,
    params: GetListParams & QueryFunctionContext,
  ): Promise<GetListResult<RecordType>> {
    const { page, perPage } = params.pagination || { page: 1, perPage: 10 };
    const sort = params.sort;

    const rangeStart = (page - 1) * perPage;
    const rangeEnd = page * perPage - 1;

    const req = await clientModule.getList.get({
      query: {
        resource: resource as TResource,
        filter: params.filter,
        range: [rangeStart, rangeEnd],
        sort: sort ? { [sort.field]: sort.order.toLowerCase() as "asc" | "desc" } : {},
      },
    });
    if (req.result !== "success") {
      throw new Error(req.message);
    }
    return {
      data: req.items,
      total: req.total,
    };
  }

  async function getOne(
    resource: string,
    params: GetOneParams<RecordType> & QueryFunctionContext,
  ): Promise<GetOneResult<RecordType>> {
    const req = await clientModule.getOne.get({
      query: {
        resource: resource as TResource,
        id: params.id,
      },
    });
    if (req.result !== "success") {
      throw new Error(req.message);
    }
    return { data: req.item as RecordType };
  }

  async function getMany(
    resource: string,
    params: GetManyParams<RecordType> & QueryFunctionContext,
  ): Promise<GetManyResult<RecordType>> {
    const req = await clientModule.getMany.get({
      query: {
        resource: resource as TResource,
        ids: params.ids,
      },
    });
    if (req.result !== "success") {
      throw new Error(req.message);
    }
    return { data: req.items as RecordType[] };
  }

  async function getManyReference(
    resource: string,
    params: GetManyReferenceParams & QueryFunctionContext,
  ): Promise<GetManyReferenceResult<RecordType>> {
    return await getList(resource, params);
  }

  async function update(
    resource: string,
    params: UpdateParams,
  ): Promise<UpdateResult<RecordType>> {
    const req = await clientModule.update.put({
      query: { resource: resource as TResource },
      body: {
        data: params.data,
      },
    });
    if (req.result !== "success") {
      throw new Error(req.message);
    }
    return { data: req.item as RecordType };
  }

  async function updateMany(
    resource: string,
    params: UpdateManyParams<RecordType>,
  ): Promise<UpdateManyResult<RecordType>> {
    const req = await clientModule.updateMany.put({
      query: { resource: resource as TResource },
      body: {
        ids: params.ids as number[],
        changes: params.data,
      },
    });
    if (req.result !== "success") {
      throw new Error(req.message);
    }
    return { data: params.ids as number[] };
  }

  async function create(
    resource: string,
    params: CreateParams<Omit<RecordType, "id">>,
  ): Promise<CreateResult<RecordType>> {
    const req = await clientModule.create.post({
      query: { resource: resource as TResource },
      body: {
        data: params.data,
      },
    });
    if (req.result !== "success") {
      throw new Error(req.message);
    }
    return { data: req.item as RecordType };
  }

  async function delete_(
    resource: string,
    params: DeleteParams<RecordType>,
  ): Promise<DeleteResult<RecordType>> {
    const req = await clientModule.delete.delete({
      query: {
        resource: resource as TResource,
        id: params.id,
      },
    });
    if (req.result !== "success") {
      throw new Error(req.message);
    }
    return { data: req.item as RecordType };
  }

  async function deleteMany(
    resource: string,
    params: DeleteManyParams<RecordType>,
  ): Promise<DeleteManyResult<RecordType>> {
    const req = await clientModule.deleteMany.delete({
      query: {
        resource: resource as TResource,
        ids: params.ids,
      },
    });
    if (req.result !== "success") {
      throw new Error(req.message);
    }
    return { data: params.ids };
  }

  return {
    getList,
    getOne,
    getMany,
    getManyReference,
    update,
    updateMany,
    create,
    delete: delete_,
    deleteMany,
  };
}
