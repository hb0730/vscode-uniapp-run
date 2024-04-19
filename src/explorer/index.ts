import * as vscode from "vscode";

export class UniappExplorerProvider
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  static setup(ctx: vscode.ExtensionContext) {
    const provider = new this(ctx);
    const {
      window: { registerTreeDataProvider },
    } = vscode;
    ctx.subscriptions.push(
      registerTreeDataProvider("uniappExplorer", provider)
    );
  }
  private _onDidChangeTreeData =
    new vscode.EventEmitter<vscode.TreeItem | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  private _data: vscode.TreeItem[];

  constructor(ctx: vscode.ExtensionContext) {
    this._data = this.data();
  }
  getTreeItem(element: vscode.TreeItem) {
    return element;
  }

  getChildren(
    element?: vscode.TreeItem
  ): vscode.ProviderResult<vscode.TreeItem[]> {
    return Promise.resolve(this._data);
  }
  getParent?(element: vscode.TreeItem): vscode.ProviderResult<vscode.TreeItem> {
    return undefined;
  }
  resolveTreeItem?(
    item: vscode.TreeItem,
    element: vscode.TreeItem,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.TreeItem> {
    return undefined;
  }

  private data(): vscode.TreeItem[] {
    const data = [];
    const uniappPublishCommand = new vscode.TreeItem("uniapp 发布");
    uniappPublishCommand.command = {
      command: "uniapp-run.publish",
      title: "uniapp 发布",
      tooltip: "uniapp 发布",
    };
    uniappPublishCommand.description = "run build";
    data.push(uniappPublishCommand);

    const uniappBuildCommand = new vscode.TreeItem("uniapp 构建");
    uniappBuildCommand.command = {
      command: "uniapp-run.run",
      title: "uniapp 构建",
      tooltip: "uniapp 构建",
      arguments: ["tooltip"],
    };
    uniappBuildCommand.description = " run dev";
    data.push(uniappBuildCommand);
    return data;
  }
}
