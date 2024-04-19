import * as vscode from 'vscode';
import * as Net from 'net';
import { UniappDebugSession } from './uniappDebug';

export function active(ctx:vscode.ExtensionContext,logOutputChannel:vscode.LogOutputChannel){
    const factory=new UniappDebugAdapterFactory(logOutputChannel);
    ctx.subscriptions.push(vscode.debug.registerDebugAdapterDescriptorFactory("uniapp-run",factory));
}

class UniappDebugAdapterFactory implements vscode.DebugAdapterDescriptorFactory {
  private _server:Net.Server|undefined;
  constructor(private outputChannel: vscode.LogOutputChannel) {}
  createDebugAdapterDescriptor(
    session: vscode.DebugSession,
    executable: vscode.DebugAdapterExecutable
  ): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
    if(!this._server){
    this._server= Net.createServer(socket=>{
        const session=new UniappDebugSession(this.outputChannel)
        session.setRunAsServer(true)
        session.start(socket,socket)
      }).listen(0)
    }
    return new vscode.DebugAdapterServer( (this._server.address() as Net.AddressInfo).port);
  }

  public async dispose() {
    if(this._server){
      this._server.close()
    }
  }
}