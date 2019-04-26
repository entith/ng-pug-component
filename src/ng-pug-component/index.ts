import { Rule, SchematicContext, Tree, chain, externalSchematic } from '@angular-devkit/schematics';
import path = require('path');


// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function ngPugComponent(_options: any): Rule {
  return chain([
    externalSchematic('@schematics/angular', 'component', _options),
    (tree: Tree, _context: SchematicContext) => {
      var createdFiles = (tree as any)._record._filesToCreate as Set<string>;

      if(createdFiles.size == 0)
        return;

      var rootPath = path.dirname(createdFiles.values().next().value);

      tree.getDir(rootPath).visit((_dirPath, fileEntry) => {
        if(!fileEntry)
          return;
        var filePath = fileEntry.path;

        if(filePath.endsWith('component.ts')){
          var name = path.basename(filePath);
          name = name.substr(0, name.lastIndexOf('.component.ts'));

          var contentBuffer = fileEntry.content;
          if(!contentBuffer)
            return;

          var content = contentBuffer.toString();
          
          var replace = `templateUrl: './${name}.component.html'`;
          var withStr = `templateUrl: './${name}.component.pug'`;
          
          content = content.replace(replace, withStr);
          tree.overwrite(filePath, content);
        }
        else if(filePath.endsWith('component.html'))
        {
          var name = path.basename(filePath);
          name = name.substr(0, name.lastIndexOf('.component.html'));

          var newPath = filePath.replace(`${name}.component.html`, `${name}.component.pug`);

          tree.rename(filePath, newPath);
          tree.overwrite(newPath, `p ${name} works!`);
        }
      })

      return tree;
    },
]);
}
