import { exec, execFile, spawn } from "child_process";
import { UniappRuntimeArgs } from ".";
import * as vscode from "vscode";
import { UniappDebugProcess } from "./process";

export async function publishCommand(
  args: UniappRuntimeArgs,
  logger: vscode.LogOutputChannel
) {
  //[INFO:] node "/Applications/HBuilderX.app/Contents/HBuilderX/plugins/node/node"
  // args ("--max-old-space-size=2048", "--no-warnings", "/Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli-vite/node_modules/@dcloudio/vite-plugin-uni/bin/uni.js", "build", "-p", "mp-weixin")

  const process= new UniappDebugProcess(args.config,logger);
  process.start(args);

  // 完成后关闭进程

}
