import { workspace } from "vscode";
import * as fs from 'fs';
import * as path from 'path';

export const getConfigFile = () => {
    const workspaceFolders = workspace.workspaceFolders;
    if (workspaceFolders) {
        const rootPath = workspaceFolders[0].uri.fsPath;

        const configPath = path.join(rootPath, 'blade-components.json');

        if (fs.existsSync(configPath)) {
            const configFile = fs.readFileSync(configPath, 'utf-8');
            
            const config = JSON.parse(configFile);

            return config;

        }

        console.log('Configuration file not found.');

        return null;
    }

    console.log('Configuration file not found.');

    return null;
};