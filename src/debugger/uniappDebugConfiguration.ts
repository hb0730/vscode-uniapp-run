import * as vscode from 'vscode';
export class UniappDebugConfigurationProvider implements vscode.DebugConfigurationProvider {
    static activate(ctx:vscode.ExtensionContext) {
        const provider = new UniappDebugConfigurationProvider();
        ctx.subscriptions.push(
            vscode.debug.registerDebugConfigurationProvider("uniapp-run", provider)
        );
    }
    resolveDebugConfiguration(folder, config, token) {
        if (!config.type && !config.name) {
            config.type = "uniapp-run";
            config.name = "Uniapp Run";
            config.request = "launch";
        }
        // 项目路径
        config.cwd = "${workspaceFolder}";
        // 项目名称
        config.projectName = folder === null || folder === void 0 ? void 0 : folder.name;
        return config;
    }
}