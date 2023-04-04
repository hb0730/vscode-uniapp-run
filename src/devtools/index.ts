import { ChildProcess } from "child_process";
import { DebugRuntime } from "../debugger/debugRuntime";

/**
 * 所支持的平台
 */
export enum SupportPlatform{
  weixin='mp-weixin',
  alipay='mp-alipay',
  baidu="mp-baidu",
  toutiao="mp-toutiao",
  lark="mp-lark",
  qq="mp-qq"
}
/**
 * 相关配置
 */
export class Config {
  /**
   * 开发者工具安装路径
   */
  devToolsPath: string;
  /**
   * 各工具不同相关配置
   */
  [key: string]: string;
}
/**
 * 开发者工具
 */
export abstract class OpenDevTools {
  private _config: Config;
  constructor(config: Config) {
    this._config = config;
  }
  abstract exec(projectPath: string,runtime?:DebugRuntime): void;

  public getProperties(key: string): string {
    return this._config[key];
  }

  public get devToolsPath() {
    return this._config.devToolsPath;
  }
}
