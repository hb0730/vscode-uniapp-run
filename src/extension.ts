import * as vscode from 'vscode';
import { activateDebug } from './debugger/activateDebug';


export function activate(context: vscode.ExtensionContext) {
	console.log("uniapp run actived!");
	// 激活debugger
	activateDebug(context);
}

// This method is called when your extension is deactivated
export function deactivate() {}
