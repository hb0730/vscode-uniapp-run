import * as vscode from 'vscode';
import * as commands from './commands';
import { UniappDebugConfigurationProvider } from './debugger/uniappDebugConfiguration';
import * as UniappDebugFactory from "./debugger/uniappDebugFactory"
import { UniappExplorerProvider } from './explorer';

export function activate(context: vscode.ExtensionContext) {
	const logChannel= vscode.window.createOutputChannel("uniapp-run",{log:true})
	context.subscriptions.push(logChannel)
	// register explorer
	UniappExplorerProvider.setup(context)
	// register commands
	const registerCommand=commands.createRegisterCommand(context,logChannel);
	registerCommand("uniapp-run.publish",commands.publish);
	registerCommand("uniapp-run.run",(ctx,logChannel)=>commands.run(ctx,logChannel));

	// register debug adapter
	UniappDebugConfigurationProvider.activate(context);
	UniappDebugFactory.active(context,logChannel);

}

// This method is called when your extension is deactivated
export function deactivate() {}
