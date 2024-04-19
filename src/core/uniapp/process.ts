import { EventEmitter } from "events";
import { UnappRunConfig, UniappRuntimeArgs } from ".";
import * as vscode from "vscode";
import { ChildProcess, spawn } from "child_process";
import { DevToolConfig, OpenDevTool, OpenDevToolPlatform } from "../devtools";
import { WxDevTool } from "../devtools/weixin";

export class UniappDebugProcess extends EventEmitter {
  private _isWindows: boolean;
  private _uniappProcess?: ChildProcess;
  private _openDevTools: boolean;
  private _firstBuildComplete: boolean;

  constructor(
    public config: UnappRunConfig,
    public logger: vscode.LogOutputChannel
  ) {
    super();
    this._isWindows = process.platform === "win32";
  }

  public async start(args: UniappRuntimeArgs) {
    this.logger.info("uniapp-run process start ....");
    this.logger.info(`HBuilderX path: ${this.config.HBuilderPath}`);
    this.logger.info(`WorkPath: ${args.uniInputDir}`);
    this.logger.info(`Platform: ${args.uniPlatform}`);
    this.logger.info(`OutputDir: ${args.uniOutputDir}`);
    this.logger.info(`Compress: ${args.uniCompress}`);
    this.logger.info(`UniVueVersion: ${args.uniVueVersion}`);
    this.logger.info(`Node path: ${args.nodePath}`);
    this.logger.info(`Node env: ${JSON.stringify(args.env)}`);
    this.logger.info(`Node args: ${JSON.stringify(args.nodeArgs)}`);

    const script = spawn(
      args.nodePath,
      ["--max-old-space-size=2048", args.nodeJsPath, ...args.nodeArgs],
      {
        cwd: args.cwd,
        env: args.env,
      }
    );

    script.stdout.on("data", (data: Buffer) => {
      const content = data.toString();
      if (!this._openDevTools) {
        this._firstBuildComplete = content.includes("Build complete");
        if (this._firstBuildComplete) {
          this.openDevTool(args);
          this._openDevTools = true;
        }
      }
      this.logger.info(content);
      this.sendEvent("stdout", content);
    });
    script.stderr.on("data", (data: Buffer) => {
      this.logger.error(data.toString());
      this.sendEvent("stderr", data.toString());
    });

    script.on("exit", (code: number) => {
      this.logger.info(`uniapp-run process exit with code ${code}`);
      this.sendEvent("exit", code);
      this.sendEvent("end");
    });
    script.on("error", (err: Error) => {
      this.logger.error(err.stack);
      this.sendEvent("data", err.stack + "\n");
    });

    this._uniappProcess = script;
  }

  public sendEvent(event: string, ...args: any[]): void {
    this.emit(event, ...args);
  }

  public async stop() {
    this.logger.info("uniapp-run process stop ....");
    if (this._uniappProcess) {
      this._uniappProcess.kill();
    }
  }
  private openDevTool(arg: UniappRuntimeArgs) {
    if (!arg.openDevTools) {
      this.logger.info("Skip open devtools");
      this.sendEvent("data", "Skip open devtools\n");
      return;
    }
    const _platform = arg.uniPlatform as OpenDevToolPlatform;
    let _openDevTool: OpenDevTool;
    let _openDevConfig: DevToolConfig;
    switch (_platform) {
      case OpenDevToolPlatform.weixin:
        _openDevConfig = {
          path: arg.config.WxDevToolPath,
        };
        _openDevTool = new WxDevTool(_openDevConfig, this.logger);
        break;
    }

    if (_openDevTool) {
      this.logger.info(`open ${_platform} devtools ...`);
      this.sendEvent("data", `open ${_platform} devtools ...\n`);
      _openDevTool.exec(arg.uniOutputDir);
      return;
    }
    this.logger.info(`Not support open ${_platform} devtools`);
    this.sendEvent("data", `Not support open ${_platform} devtools\n`);
  }
}
