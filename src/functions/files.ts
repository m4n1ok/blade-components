import * as fs from "fs/promises";
import * as path from "path";
import { undot } from "./strings";
import { BladeProp, PhpVariable } from "../interfaces/php";
import { workspace } from "vscode";
import { getConfigFiles } from "./config";

export async function fileContainsVariable(
    filePath: string,
    variableName: string
): Promise<boolean | null | undefined> {
    const fileContents = await fs.readFile(filePath, { encoding: "utf-8" });

    return fileContents.includes(variableName);
}

export async function getVariablesFromClassFile(filePath: string) {
    const fileContents = await fs.readFile(filePath, { encoding: "utf-8" });

    return Array.from(fileContents.matchAll(/public\s*(\w*)\s*\$(\w+)/g)).map(
        (val) => new PhpVariable(val[1], val[2] ?? null)
    );
}

export async function getPropsFromBladeFile(filePath: string): Promise<BladeProp[]> {

    const fileContents = await fs.readFile(filePath, { encoding: 'utf-8' });

    const rawProps = /@props\(\[\s*([\'\w,\s=>\[\]\.\\\:\(\)\_\"]+)\]\)/gm.exec(fileContents);

    if (rawProps !== null) {

        try {
            if (rawProps[1].includes(",")) {
                const propsArray = rawProps[1]
                    .split(/,(?=\w*\s*')/)
                    .filter((string) => string !== '');

                let bladeProps = propsArray.map((prop) => {
                    return BladeProp.fromRawPropString(prop);
                });

                return bladeProps;
            } else {
                return [BladeProp.fromRawPropString(rawProps[1])];
            }
        } catch (error) {
            console.error(error);
            console.info(rawProps, filePath);
        }

    }

    return Promise.resolve([]);
}

export function pathFromDot(string: string): string {
    return undot(string).join(path.sep);
}

export async function getBladeComponentFiles() {
    return await workspace.findFiles(
        "**/resources/views/components/**/*.blade.php",
        "**/vendor/**"
    );
}

export async function getClassComponentFiles() {
    const projectFIles = await workspace.findFiles(
        "**/View/Components/**/*.php",
        "**/vendor/**"
    );
    
    const files = [
        {
            path: null,
            delimiter: null,
            prefix: null,
            files: projectFIles
        }
    ];


    const extensionConfigFiles = await getConfigFiles();

    for (let i = 0; i < extensionConfigFiles.length; i++) {
        const extensionConfig = extensionConfigFiles[i];
        if (extensionConfig?.classComponents) {
            const extraFiles = extensionConfig.classComponents || [];
            
            for (let i = 0; i < extraFiles.length; i++) {
                const filePath = extraFiles[i].path;
                if(!filePath) {
                    continue;
                }

                const filePathSuffix = filePath.endsWith('/') ? "**/*.php" : '/**/*.php';

                let _files = await workspace.findFiles(
                    filePath + filePathSuffix
                );

                files.push({
                    prefix: extraFiles[i]?.prefix || null,
                    delimiter: extraFiles[i].delimiter || null,
                    path: filePath,
                    files: _files
                });
            }
        }
    }

    return files;
}
