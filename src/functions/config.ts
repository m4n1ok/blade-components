import { workspace } from "vscode";
import * as fs from 'fs';
import * as path from 'path';

export const getConfigFiles = async () => {
    console.log('getConfifiles');
    const workspaceFolders = workspace.workspaceFolders;
    const configFiles: any[] = [];


    if (workspaceFolders) {
        const vendorConfigFiles = await findBladeComponentsConfigs();

        const rootPath = workspaceFolders[0].uri.fsPath;

        const configPath = path.join(rootPath, 'blade-components.config.json');

        vendorConfigFiles.push(configPath);

        vendorConfigFiles.forEach(configFilePath => {
            if (fs.existsSync(configFilePath)) {
                const configFile = fs.readFileSync(configFilePath, 'utf-8');
                
                const config = JSON.parse(configFile);

                configFiles.push(config);

            } else {
                console.log('Configuration file not found: ', configFilePath );
            }
        });

        return configFiles;
    }

    return configFiles;
};


export async function findBladeComponentsConfigs(): Promise<string[]> {
    console.log('findBladeComponentsConfigs');
    const configFiles: string[] = [];
    
    // Get the first workspace folder (assuming single-root workspace)
    const workspaceFolder = workspace.workspaceFolders?.[0];
    
    if (!workspaceFolder) {
        return configFiles;
    }
    
    const vendorPath = path.join(workspaceFolder.uri.fsPath, 'vendor');
    
    if (fs.existsSync(vendorPath)) {
        console.log('vendorpath');
        await searchVendorDirectory(vendorPath, configFiles);
    }
    
    return configFiles;
}

async function searchVendorDirectory(dirPath: string, configFiles: string[]): Promise<void> {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
            // Recursively search subdirectories
            await searchVendorDirectory(fullPath, configFiles);
        } else if (entry.isFile() && entry.name === 'blade-components.config.json') {
            // Add config file to the list if found
            configFiles.push(fullPath);
        }
    }
}