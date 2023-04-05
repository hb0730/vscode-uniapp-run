import {
    ExitedEvent,
    InitializedEvent,
    logger,
    Logger,
    LoggingDebugSession,
    OutputEvent,
    TerminatedEvent,
  } from "@vscode/debugadapter";
  import { DebugProtocol } from "@vscode/debugprotocol";
  // import { Subject } from "await-notify";
  import { DebugRuntime, Project } from "./debugRuntime";
  import * as vscode from "vscode";
  
  export interface LaunchRequestArguments
    extends DebugProtocol.LaunchRequestArguments {
    /**编译类型*/
    platform: string;
    /**是否压缩 */
    compress: boolean;
  
    [key: string]: any;
  }
  
  export class UniappDebugSession extends LoggingDebugSession {
    private _runtime: DebugRuntime;
    // private _configurationDone = new Subject();
  
    public constructor() {
      super("uniapp-run.log");
      logger.log("uniapp run session start ......");
  
      this.setDebuggerColumnsStartAt1(true);
      this.setDebuggerLinesStartAt1(true);
      this._runtime = new DebugRuntime();
      this._runtime.project = this.initProject();
  
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
      logger.log("uniapp run session initializeRequest .....");
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
      await this._runtime?.stopRun();
  
      this.sendResponse(response);
    }
  
    protected attachRequest(
      response: DebugProtocol.AttachResponse,
      args: DebugProtocol.AttachRequestArguments,
      request?: DebugProtocol.Request
    ): void {
      this.sendErrorResponse(response,0,'Attach requests are not supported');
      this.shutdown();
    }
    /**
     * Launch 模式初始化代码
     */
    protected async launchRequest(
      response: DebugProtocol.LaunchResponse,
      args: LaunchRequestArguments
    ) {
      logger.setup(
        args.trace ? Logger.LogLevel.Verbose : Logger.LogLevel.Stop,
        false
      );
      if (!this._runtime.project) {
        vscode.window.showErrorMessage("请配置HBuilderX安装路径");
        this.sendEvent(new TerminatedEvent());
        this.sendResponse(response);
        return;
      }
      // await this._configurationDone.wait(1000);
      await this._runtime?.start(args);
  
      this.sendResponse(response);
    }
  
    private initProject(): Project | undefined {
      const uniAppRunProperties = vscode.workspace.getConfiguration("uniapp-run");
      const installLocal: string | undefined =
        uniAppRunProperties.get("HBuilderX");
      if (!installLocal) {
        return undefined;
      }
      const project = new Project(process.platform === "win32", installLocal);
      // 微信开发者
      project.wxDevtoolPath=uniAppRunProperties.get("wxDevtool");
      // 百度开发者
      project.baiduDevtoolPath=uniAppRunProperties.get("baiduDevtool");
      return project;
    }
  }
  