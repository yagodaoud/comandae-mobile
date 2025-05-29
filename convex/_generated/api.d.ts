/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as bitcoin from "../bitcoin.js";
import type * as configurations from "../configurations.js";
import type * as dishes from "../dishes.js";
import type * as http from "../http.js";
import type * as menu from "../menu.js";
import type * as pix from "../pix.js";
import type * as products from "../products.js";
import type * as slips from "../slips.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  bitcoin: typeof bitcoin;
  configurations: typeof configurations;
  dishes: typeof dishes;
  http: typeof http;
  menu: typeof menu;
  pix: typeof pix;
  products: typeof products;
  slips: typeof slips;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
