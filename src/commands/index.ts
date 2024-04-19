import * as vscode from "vscode";
export { publish } from './publish';
export { run } from './run';

type CommandCallback<T extends unknown[]> = (
  ...args: T
) => Promise<unknown> | unknown;

export type CommandFactory<T extends unknown[] = any[]> = (
  ctx: vscode.ExtensionContext,
  logger:vscode.LogOutputChannel
) => CommandCallback<T>;


export function createRegisterCommand(ctx: vscode.ExtensionContext,logger:vscode.LogOutputChannel) {
  return function registerCommand(name: string, fn: CommandFactory) {
    ctx.subscriptions.push(vscode.commands.registerCommand(name, fn(ctx,logger)));
  };
}
