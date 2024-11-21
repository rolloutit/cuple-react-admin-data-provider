# Cuple - React Admin - Data Provider


**Simplify integration between your `react-admin` frontend and `cuple`-based backend.**  
This library removes the complexity of wiring up a `react-admin` data provider, enabling you to focus on building features.


## React-admin Frontend Setup

`npm install cuple-react-admin-data-provider`

```ts
// Step 1. Create your cuple client as you would do normally
import { createClient } from "@cuple/client";
import { Routes } from "../../backend/src/index";
import { CONFIG } from "./config";
export const client = createClient<Routes>({
  path: "/api/rpc",
});

// Step 2. Create the data provider
export const dataProvider = createCupleReactAdminDataProvider(client.someModuleName);
```

## Backend Integration

`npm install cuple-react-admin-api`

```ts
// Step 1. Create the api module
const adminModule = createCupleReactAdminAPI({
  builder,
  resources: ["users", "posts"],
  defaultHandlers: {
    async create(data) {
      // You can use resource name from data.query.resource
      // You can use the data from data.body.data
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
});

// Step 2. Use the module as you would do normally:

const routes = {
  someModuleName: adminModule,
  /* ... */
};

initRpc(app, {
  path: "/api/rpc",
  routes,
});
```

## Key Features
 - Seamless Integration: Plug your react-admin frontend into your cuple backend with minimal effort.
 - Customizable: Override resource handlers for tailored behavior.
 - Type-Safe: Leverages cuple's type system for a robust and reliable integration.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.
