import * as vscode from "vscode";
import { UnappRunConfig } from "./core/uniapp";

/**
 * 获取uniapp run配置
 * @returns  .
 */
export function getUniappConfig(): UnappRunConfig | undefined {
  const config = vscode.workspace.getConfiguration("uniapp-run");
  const HBuilderPath = config.get("HBuilderX");
  if (!HBuilderPath) {
    return undefined;
  }
  return {
    HBuilderPath: HBuilderPath as string,
    WxDevToolPath: config.get("wxDevtool"),
  };
}


/**
 * 获取运行时参数
 * @returns  .
 */
export function getRuntimeArgs(){

}