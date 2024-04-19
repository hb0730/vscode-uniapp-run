import { DebugProtocol } from "@vscode/debugprotocol";
import { DebugSession, ExitedEvent, InitializedEvent, Logger, OutputEvent, TerminatedEvent, logger } from "@vscode/debugadapter";
import * as vscode from 'vscode';
import { getUniappConfig } from "../context";
import { UniappDebugProcess } from "../core/uniapp/process";
import { UnappRunConfig, UniappRuntimeArgs, runtimeArgs } from "../core/uniapp";
interface LaunchRequestArguments extends DebugProtocol.LaunchRequestArguments {
  /**
   * 编译类型
   */
  platform: string;
  /**
   * 当前项目路径
   */
  cwd:string;
  /**
   * 目标项目路径
   */
  src: string;
  /**
   * 项目名称
   */
  projectName:string;
  /**
   * 是否压缩
   */
  compress: boolean;
  /**
   * uniapp 的vue版本
   */
  vueVersion: "v2" | "v3";
  /**
   * 是否打开开发者工具
   */
  openDevTool: boolean;
  /**
   * 是否打开调试
   */
  trace: boolean;
}

export class UniappDebugSession extends DebugSession {
  private _runtime: UniappDebugProcess;
  private _config:UnappRunConfig
  constructor(public logger:vscode.LogOutputChannel){
    super();
    logger.info("uniapp-run debug session start ....")
    this._config= getUniappConfig()
    this._runtime=new UniappDebugProcess(this._config,logger);

    this._runtime.on("data", (data) => {
      this.sendEvent(new OutputEvent(data));
    });
    this._runtime.on("stdout", (data: string) => {
      this.sendEvent(new OutputEvent(data, "stdout"));
    });
    this._runtime.on("stderr", (data: string) => {
      this.sendEvent(new OutputEvent(data, "stderr"));
    });
    this._runtime.on("exit", (code: number) => {
      this.sendEvent(new ExitedEvent(code));
    });
    this._runtime.on("end", () => {
      this.sendEvent(new TerminatedEvent());
    });

  }
  protected initializeRequest(
    response: DebugProtocol.InitializeResponse,
    args: DebugProtocol.InitializeRequestArguments
  ): void {
    //设置Debug能力
    response.body = response.body || {};
    response.body = {
      supportsCompletionsRequest: false,
      supportsConditionalBreakpoints: false,
      supportsDelayedStackTraceLoading: false,
      supportsEvaluateForHovers: false,
      supportsExceptionInfoRequest: false,
      supportsExceptionOptions: false,
      supportsFunctionBreakpoints: false,
      supportsHitConditionalBreakpoints: false,
      supportsLoadedSourcesRequest: false,
      supportsRestartFrame: false,
      supportsSetVariable: false,
      supportsStepBack: false,
      supportsStepInTargetsRequest: false,
    };

    this.sendResponse(response);
    this.sendEvent(new InitializedEvent());
  }

  /**
   * configurationDone后通知launchRequest
   */
  protected configurationDoneRequest(
    response: DebugProtocol.ConfigurationDoneResponse,
    args: DebugProtocol.ConfigurationDoneArguments
  ): void {
    super.configurationDoneRequest(response, args);
    // this._configurationDone.notify();
  }
  /**
   * 断开
   */
  protected async disconnectRequest(
    response: DebugProtocol.DisconnectResponse,
    args: DebugProtocol.DisconnectArguments,
    request?: DebugProtocol.Request
  ) {
    //关闭
    await this._runtime?.stop();

    this.sendResponse(response);
  }

  /**
   * Launch 模式初始化代码
   */
  protected async launchRequest(
    response: DebugProtocol.LaunchResponse,
    args: LaunchRequestArguments
  ) {
    logger.setup(args.trace ? Logger.LogLevel.Verbose : Logger.LogLevel.Stop, false);
    const uniappConfig= getUniappConfig();
    if(!uniappConfig){
      vscode.window.showErrorMessage('请设置HBuilderX路径');
      this.sendEvent(
        new OutputEvent('请设置HBuilderX路径', 'stderr')
      )
      this.sendErrorResponse(response, 1, '请设置HBuilderX路径');
      return;
    }
    //启动
    const _args:runtimeArgs={
      workPath: args.src||args.cwd,
      name: args.projectName,
      platform: args.platform,
      compress: args.compress||false,
      uniVueVersion: args.vueVersion||'v2',
      openDevTools: args.openDevTool||false,
      production: false
    }
    await this._runtime?.start(new UniappRuntimeArgs(_args,uniappConfig));
    this.sendResponse(response);
  }


}