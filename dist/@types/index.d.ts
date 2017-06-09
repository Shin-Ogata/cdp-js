/*!
 * cdp.d.ts 
 * This file is generated by the CDP package build process.
 *
 * Date: 2017-05-19T14:44:47+0900
 */
/// <reference path="cdp.d.ts" />
/// <reference path="patch.d.ts" />
export * from "cdp/core";
import * as Framework from "cdp/framework";
import * as Tools from "cdp/tools";
import * as UI from "cdp/ui";
export { Framework, Tools, UI };
export const initialize: typeof CDP.Framework.initialize;
export const isInitialized: typeof CDP.Framework.isInitialized;
export const waitForInitialize: typeof CDP.Framework.waitForInitialize;
