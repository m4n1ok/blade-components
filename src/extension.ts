import { ExtensionContext, commands, languages, window, workspace, Uri, Position, Range, TextEditorRevealType, Selection, CancellationToken, Definition, Location, ProviderResult, TextDocument } from "vscode";
import TagsProvider from "./providers/TagsProvider";
import AttributesProvider from "./providers/AttributesProvider";
import { updateComponentCache } from "./functions/cache";
import path = require("path");

export async function activate(context: ExtensionContext) {
    updateComponentCache(context);

    const definitionProvider = languages.registerDefinitionProvider(
        { scheme: 'file', language: 'blade' },
        {
            async provideDefinition(
                document: TextDocument,
                position: Position,
                token: CancellationToken
            ): Promise<Definition | null | undefined> {
                const wordRange = document.getWordRangeAtPosition(position, /[A-Za-z0-9\-:]+/);
                const word = document.getText(wordRange);

                // Custom logic to find the PHP file corresponding to the Blade component
                const definitionPath = await findBladeComponentDefinition(word);
                if (!definitionPath) {
                    return null;
                }

                const definitionUri = Uri.file(definitionPath);
                const definitionPosition = new Position(0, 0); // Usually, component classes start at the top

                return new Location(definitionUri, definitionPosition);
            }
        }
    );

    context.subscriptions.push(
        languages.registerCompletionItemProvider(
            { scheme: "file", language: "blade" },
            new TagsProvider(context),
            "x"
        ),
        languages.registerCompletionItemProvider(
            "blade",
            new AttributesProvider(context),
            ":"
        ),
        commands.registerCommand('blade-components.refreshCache', () => {
            updateComponentCache(context);
        }),
        
    );

    console.log("blade-components activated");
}

async function findBladeComponentDefinition(component: string): Promise<string | undefined> {
    // Assuming component names like 'x-alert' map to 'AlertComponent.php'

    const componentNameParts = component.split('-');
    const className = componentNameParts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('') + 'Component';

    // Assume components are stored in app/View/Components directory
    const componentPath = path.join(workspace.rootPath || '', 'app', 'View', 'Components', `${className}.php`);

    // Check if the file exists (this is a simplified check)
    if ( await workspace.fs.stat(Uri.file(componentPath))) {
        return componentPath;
    }

    return undefined;
}

// this method is called when your extension is deactivated
export function deactivate(context: ExtensionContext) {
    console.log("blade-components deactivated");
}
