import { EventEmitter } from "events";
import { LaunchRequestArguments } from "./debugSession";
import * as childProcess from "child_process";
import { logger } from "@vscode/debugadapter";
import * as path from "path";
import { Config, OpenDevTools, SupportPlatform } from "../devtools";
import { WxDevtool } from "../devtools/wx";
import { BaiduDevtool } from "../devtools/baidu";

//v2 cd /Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/ && NODE_ENV=development UNI_INPUT_DIR=/Users/hb0730/development/temp/uniapp-v2 UNI_OUTPUT_DIR=/Users/hb0730/development/temp/uniapp-v2/dist UNI_PLATFORM=mp-weixin  /Applications/HBuilderX.app/Contents/HBuilderX/plugins/node/node --max-old-space-size=2048 /Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/bin/uniapp-cli.js
//v3 cd /Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli-vite/ && NODE_ENV=development UNI_PLATFORM=mp-weixin UNI_INPUT_DIR=/Users/hb0730/development/temp/uniapp-vue3 UNI_OUTPUT_DIR=/Users/hb0730/development/temp/uniapp-vue3/dist /Applications/HBuilderX.app/Contents/HBuilderX/plugins/node/node --max-old-space-size=2048 node_modules/@dcloudio/vite-plugin-uni/bin/uni.js -p mp-weixin
export class DebugRuntime extends EventEmitter {
  private _uniappProcess?: childProcess.ChildProcess;
  private _project: Project;
  private _openDevtools: OpenDevTools;
  private _isOpen: boolean = false;
  private _isFishComplete: boolean = false;

  public set project(project: Project) {
    this._project = project;
  }
  public get project() {
    return this._project;
  }

  /**
   * 发送初始化请求
   */
  public async start(args: LaunchRequestArguments): Promise<void> {
    const _args=new RuntimeArgs(args,this._project);
    logger.log("uniapp run process start ....");
    logger.log(`HBuilderX path: ${this._project.HBuilderPath}`);
    logger.log(`nodeJS path: ${_args.nodeJs}`);
    logger.log(`node path: ${_args.node}`);
    logger.log(`platform: ${_args.uniPlatform}`);
    logger.log(`compress: ${_args.compress}`);
    logger.log(`openDevTool: ${_args.openDevTool}`);
    logger.log(`vueVersion: ${_args.vueVersion}`);
    logger.log(`cwd: ${_args.cwd}`);
    logger.log(`node env: ${JSON.stringify(_args.env())}`);
    logger.log(`node args: ${JSON.stringify(_args.args)}`);
    const script = childProcess.spawn(
      _args.node,
      ["--max-old-space-size=2048", _args.nodeJs, ..._args.args],
      {
        cwd: _args.cwd,
        env: _args.env(),
      }
    );
    script.stdout.on("data", (data: Buffer) => {
      const content = data.toString();
      if (!this._isOpen) {
        this._isFishComplete = content.includes("Build complete");
        if (this._isFishComplete) {
          this.runDevTools(_args);
          this._isOpen = true;
        }
      }
      this.sendEvent("stdout", data.toString());
    });
    script.stderr.on("data", (data: Buffer) => {
      this.sendEvent("stderr", data.toString());
    });
    script.on("exit", (code: number | null) => {
      this.sendEvent("exit", code ?? 0);
      this.sendEvent("end");
    });
    script.on("error", (error: Error) => {
      this.sendEvent("data", error.stack + "\n");
    });
    this._uniappProcess = script;
    // 启动开发者工具
    // this.runDevTools(_arg);
    // 控制台输出：在命令行中执行编译命令后，控制台会输出编译的进度和结果。当编译完成后，控制台会显示“Build complete.”的提示信息。
    // dist目录变化：在编译过程中，uniapp-cli会将编译结果输出到项目根目录下的dist目录中。因此，可以通过监视dist目录中文件的变化来判断编译是否完成。

  }
  /**
   * 通知Debugger停止运行
   */
  public async stopRun() {
    logger.log("uniapp run process stop ....");
    this._uniappProcess?.kill();
  }

  public sendEvent(event: string, ...args: any[]): void {
    setTimeout(() => {
      this.emit(event, ...args);
    }, 0);
  }
  private runDevTools(args: RuntimeArgs) {
    if (!args.openDevTool) {
      this.sendEvent("data", "skip open devTools \n");
      return;
    }
    const _platform: SupportPlatform = args.uniPlatform as SupportPlatform;
    let _config: Config = undefined;
    switch (_platform) {
      case SupportPlatform.weixin:
        _config = { devToolsPath: this._project.wxDevtoolPath };
        this._openDevtools = new WxDevtool(_config);
        break;
      case SupportPlatform.baidu:
        _config = { devToolsPath: this._project.baiduDevtoolPath };
        this._openDevtools = new BaiduDevtool(_config);
        break;
    }
    if (this._openDevtools) {
      this.sendEvent("data", `opening ${_platform} dev tools ..... \n`);
      this._openDevtools.exec(args.uniOutputDir, this);
    }
  }
}

/**
 * 项目配置
 */
export class Project {
  /**
   * 是否windows环境
   */
   private _isWindows: boolean;
  /**
   * HBuilderX 安装路径
   *
   */
  private _localInstall: string;
  /**
   * 微信开发者工具安装路径
   */
  private _wxDevtoolPath: string;
  private _baiduDevtoolPath: string;

  constructor(isWindows: boolean, installLocalPath: string) {
    this._isWindows = isWindows;
    // 路径分割符问题
    this._localInstall = installLocalPath;
  }
  /**
   * HBuilderX 安装路径
   */
  get HBuilderPath(){
    return this._localInstall;
  }

  /**
   * 微信开发者工具路径
   */
  set wxDevtoolPath(wxDevtoolPath: string | undefined) {
    if (wxDevtoolPath) {
      this._wxDevtoolPath = wxDevtoolPath;
    }
  }
  get wxDevtoolPath(): string {
    return this._wxDevtoolPath;
  }
  /**
   * 百度开发者工具路径
   */
  set baiduDevtoolPath(baiduDevtoolPath: string) {
    this._baiduDevtoolPath = baiduDevtoolPath;
  }
  get baiduDevtoolPath(): string {
    return this._baiduDevtoolPath;
  }
  /**
   * 是否windows环境
   */
  get isWindows(): boolean {
    return this._isWindows;
  }
}

export class RuntimeArgs{
  /**
   * 工作目录
   */
  private _workPath:string;
  /**
   * 项目名称
   */
  private _name:string;
  /**
   * 平台,mp-weixin,mp-qq,mp-baidu
   */
  private _platform:string;
  /**
   * 是否压缩
   */
  private _compress:boolean;
  /**
   * 是否打开开发者工具
   */
  private _openDevTool:boolean;
  /**
   * vue版本 `v2`,`v3`
   */
  private _vueVersion:string;
  private _project:Project;

  constructor(args: LaunchRequestArguments, project: Project){
    this._workPath = args.src||args.cwd;
    this._name = args.projectName;
    this._platform = args.platform;
    this._compress = args.compress === true;
    this._vueVersion= args.vueVersion||"v2";
    this._openDevTool = args["openDevTool"];
    this._project=project;
  }
  /**
   * node环境 `NODE_ENV: development`
   * @returns `development`
   */
  get nodeEnv():string{
    return "development";
  }
  /**
   * 项目路径 `UNI_INPUT_DIR: ${pwd}`
   * @return `${pwd}`
   */
  get uniInputDir():string{
    return this._workPath;
  }
  /**
   * 输出路径 `UNI_OUTPUT_DIR: ${pwd}/unpackage/dist/dev/${UNI_PLATFORM}`
   * @return `${pwd}/unpackage/dist/dev/${UNI_PLATFORM}`
   */
  get uniOutputDir():string{
    return path.join(this._workPath,"unpackage","dist","dev",  this._platform);
  }
  /**
   * 平台 `UNI_PLATFORM: mp-weixin,mp-qq,mp-baidu`
   * @return `${platform}`
   */
  get uniPlatform():string{
    return this._platform;
  }
  /**
   * 是否压缩: `UNI_MINIMIZE: 'true'`
   * @return `UNI_MINIMIZE`
   */
  get compress():boolean{
    return this._compress;
  }
  /**
   * 是否打开开发者工具
   * @return `true`
   */
  get openDevTool():boolean{
    return this._openDevTool;
  }
  /**
   * vue版本 `v2`,`v3`
   */
  get vueVersion():string{
    return this._vueVersion;
  }
  /**
   * 运行目录,`v2`: `/Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/`, `v3`: `/Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli-vite`
   */
  get cwd():string{
    let paths:string[]=['plugins'];
    if(!this._project.isWindows){
      paths = ["Contents", "HBuilderX", ...paths];
    }
    if(this._vueVersion==='v3'){
      paths=[...paths,'uniapp-cli-vite'];
    }else{
      paths=[...paths,'uniapp-cli'];
    }
    return path.join(this._project.HBuilderPath,...paths);
  }

  /**
   * hbuilderx node路径
   * @return `/Applications/HBuilderX.app/Contents/HBuilderX/plugins/node/node`
   */
  get node():string{
    let paths: string[] = ["plugins", "node", "node"];
    if (!this._project.isWindows) {
      paths = ["Contents", "HBuilderX", ...paths];
    }
    return path.join(this._project.HBuilderPath, ...paths);
  }
  /**
   * 执行的nodejs文件 `v2`: `/Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/bin/uniapp-cli.js`, `v3`: `/Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli-vite/node_modules/@dcloudio/vite-plugin-uni/bin/uni.js`
   */
  get nodeJs():string{
    let paths:string[]=['plugins'];
    if(!this._project.isWindows){
      paths = ["Contents", "HBuilderX", ...paths];
    }
    if(this._vueVersion==='v3'){
      paths=[...paths,'uniapp-cli-vite','node_modules','@dcloudio','vite-plugin-uni','bin','uni.js'];
    }else{
      paths=[...paths,'uniapp-cli','bin','uniapp-cli.js'];
    }
    return path.join(this._project.HBuilderPath,...paths);
  }

  /**
   * 运行参数,`v2`: ``, `v3`: `['-p',${platform}]`
   */
  get args():string[]{
    if(this._vueVersion==='v3'){
      return ['-p',this._platform];
    }
    return [];
  }
  
  public env():NodeJS.ProcessEnv{
    return {
      NODE_ENV: this.nodeEnv,
      UNI_INPUT_DIR: this.uniInputDir,
      UNI_OUTPUT_DIR: this.uniOutputDir,
      UNI_PLATFORM: this.uniPlatform,
      UNI_MINIMIZE: this.compress.toString()
    };
  }
}