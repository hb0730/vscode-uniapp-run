import path = require("path");

export interface UnappRunConfig {
  /**
   * HBuilderX的路径
   */
  HBuilderPath: string;
  /**
   * 微信开发者工具的路径
   */
  WxDevToolPath?: string;
}

export interface runtimeArgs {
  /**
   * 工作目录
   */
  workPath: string;
  /**
   * 项目名称
   */
  name: string;
  /**
   * 平台,如 `mp-weixin`,`mp-alipay`
   */
  platform: string;
  /**
   * 是否压缩
   */
  compress: boolean;
  /**
   * 是否打开开发者工具
   */
  openDevTools: boolean;
  /**
   * 是否是生产环境
   */
  production: boolean;

  /**
   * vue版本
   */
  uniVueVersion: string;
}
export class UniappRuntimeArgs {
  // private _isWindows: boolean;
  private _isMacOs:boolean;
  constructor(public args: runtimeArgs, public config: UnappRunConfig) {
    // this._isWindows = process.platform === "win32";
    this._isMacOs = process.platform === "darwin";
  }

  /**
   * node环境，
   * @returns `production`或`development`
   */
  get nodeEnv(): string {
    return this.args.production ? "production" : "development";
  }

  /**
   * 项目路径
   * @returns `${workPath}`
   */
  get uniInputDir(): string {
    // windows/mac/linux下路径
    return this.args.workPath;
  }

  /**
   * 输出路径
   * @returns `${workPath}/unpackage/dist/${nodeEnv==production?"build":"dev"}/${platform}`
   */
  get uniOutputDir(): string {
    return path.join(
      this.args.workPath,
      "unpackage",
      "dist",
      this.nodeEnv == "production" ? "build" : "dev",
      this.args.platform
    );
  }

  /**
   * 编译平台
   * @returns `${platform}`
   */
  get uniPlatform(): string {
    return this.args.platform;
  }

  /**
   * 是否压缩
   * @returns `${compress}`
   */
  get uniCompress(): boolean {
    return this.args.compress;
  }

  /**
   * uniapp vue版本
   * @returns `${uniVueVersion}`
   */
  get uniVueVersion(): string {
    return this.args.uniVueVersion;
  }

  /**
   * 是否打开开发者工具
   * @returns `${openDevTools}`
   */
  get openDevTools(): boolean {
    return this.args.openDevTools;
  }

  /**
   * 运行时目录
   * @returns  vue2:`${HBuilderPath}/Contents/HBuilder/plugins/uniapp-cli` vue3:`${HBuilderPath}/Contents/HBuilder/plugins/uniapp-cli-vite`
   */
  get cwd(): string {
    let paths: string[] = ["plugins"];
    if (this._isMacOs) {
      paths = ["Contents", "HBuilderX", ...paths];
    }
    if (this.uniVueVersion === "v3") {
      paths = [...paths, "uniapp-cli-vite"];
    } else {
      paths = [...paths, "uniapp-cli"];
    }
    return path.join(this.config.HBuilderPath, ...paths);
  }

  /**
   * node路径
   * @returns `${HBuilderPath}/Contents/HBuilder/plugins/node/node`
   */
  get nodePath(): string {
    let paths: string[] = ["plugins", "node", "node"];
    if (this._isMacOs) {
      paths = ["Contents", "HBuilderX", ...paths];
    }
    return path.join(this.config.HBuilderPath, ...paths);
  }

  /**
   * 需要运行的js文件
   * @returns vue2:`${HBuilderPath}/Contents/HBuilder/plugins/uniapp-cli/bin/uniapp-cli.js` vue3:`${HBuilderPath}/Contents/HBuilder/plugins/uniapp-cli-vite/bin/uni.js`
   */
  get nodeJsPath(): string {
    let paths: string[] = ["plugins"];
    if (this._isMacOs) {
      paths = ["Contents", "HBuilderX", ...paths];
    }
    if (this.uniVueVersion === "v3") {
      paths = [
        ...paths,
        "uniapp-cli-vite",
        "node_modules",
        "@dcloudio",
        "vite-plugin-uni",
        "bin",
        "uni.js",
      ];
    } else {
      paths = [...paths, "uniapp-cli", "bin", "uniapp-cli.js"];
    }
    return path.join(this.config.HBuilderPath, ...paths);
  }

  /**
   * 运行参数
   * @returns vue3时 ['-p',`${platform}`]
   */
  get nodeArgs(): string[] {
    const args: string[] = [];

    if(this.nodeEnv==="production"){
      args.push("build"); 
    }
    if (this.uniVueVersion === "v3") {
      args.push("-p", this.uniPlatform);
    }
    return args;
  }

  /**
   * 环境变量
   * @returns
   */
  get env(): NodeJS.ProcessEnv {
    return {
      NODE_ENV: this.nodeEnv,
      UNI_PLATFORM: this.uniPlatform,
      UNI_INPUT_DIR: this.uniInputDir,
      UNI_OUTPUT_DIR: this.uniOutputDir,
      UNI_MINIMIZE: this.uniCompress ? "true" : "false",
    };
  }
}
