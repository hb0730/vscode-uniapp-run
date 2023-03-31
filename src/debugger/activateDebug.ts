import * as vscode from "vscode";
import * as Net from "net";
import {
  WorkspaceFolder,
  DebugConfiguration,
  ProviderResult,
  CancellationToken,
} from "vscode";
import { UniappDebugSession } from "./debugSession";
// 激活
export function activateDebug(context: vscode.ExtensionContext) {
  console.log("active debug!");
  const provider = new UniappConfigProvider();
  context.subscriptions.push(
    vscode.debug.registerDebugConfigurationProvider("uniapp-run", provider)
  );

  const factory = new UniappDebugAdapterFactory();
  context.subscriptions.push(
    vscode.debug.registerDebugAdapterDescriptorFactory("uniapp-run", factory)
  );
  context.subscriptions.push(factory);
}

class UniappConfigProvider implements vscode.DebugConfigurationProvider {
  resolveDebugConfiguration(
    folder: WorkspaceFolder | undefined,
    config: DebugConfiguration,
    token?: CancellationToken
  ): ProviderResult<DebugConfiguration> {
    console.log("activate debug config!");
    if (!config.type && !config.name) {
      config.type = "uniapp-run";
      config.name = "Uniapp Run";
      config.request = "launch";
    }
    // 项目路径
    config.cwd = "${workspaceFolder}";
    // 项目名称
    config.projectName = folder?.name;
    return config;
  }
}

class UniappDebugAdapterFactory
  implements vscode.DebugAdapterDescriptorFactory
{
  private server?: Net.Server;

  createDebugAdapterDescriptor(
    session: vscode.DebugSession,
    executable: vscode.DebugAdapterExecutable | undefined
  ): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
    console.log("activate debug session!");
    if (!this.server) {
      // start listening on a random port
      this.server = Net.createServer((socket) => {
        const session = new UniappDebugSession();
        session.setRunAsServer(true);
        session.start(socket as NodeJS.ReadableStream, socket);
      }).listen(0);
    }

    // make VS Code connect to debug server
    return new vscode.DebugAdapterServer(
      (this.server.address() as Net.AddressInfo).port
    );
  }

  dispose() {
    if (this.server) {
      console.log("close debug session!");
      this.server.close();
    }
  }
}
