# Laravel Blade Component Support

A simple autocompletion extension for blade components



## Features

Provide autocompletion for class/anonymous blade components.

![Demonstration](https://raw.githubusercontent.com/webdevsavvy/blade-components/master/images/blade-component-demonstration.gif)

Plugin will load all class/anonymous component file at project's level. 

### External components autocompletion

Vendors packages components autocompletion is supported with a `blade-components.config.json`. This file allows you to specifiy whrere the plugin should look to register components for autocompletion.  

Path souhld be relative to the root of the project. Prefix and delimiter are supported. 

This sample configuration below will generate autocompletion for components called this way `x-cprefix-[component-name]`

```json
{
    "classComponents": [
        {
            "prefix": "cprefix",
            "delimiter": "-",
            "path": "vendor/package/path-to-components-class-folder
        }
    ]
}
```

Plugin will try to auto-discovery configuration file define at the root of each vendor package. 

As a package library author, you might add a `blade-components.config.json` to enable autocompletion on VScode.

Note: currently, only classComponents definition are supported from configuration file. Anonymous components support should be provided soon.
