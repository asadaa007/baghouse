const fs = require('fs');
const path = require('path');

// Files to fix with their unused imports
const filesToFix = [
  {
    file: 'src/components/bugs/BugStats.tsx',
    remove: ['Clock', 'TrendingUp']
  },
  {
    file: 'src/components/bugs/BugTable.tsx',
    remove: ['MoreVertical']
  },
  {
    file: 'src/components/common/Footer.tsx',
    remove: ['Link']
  },
  {
    file: 'src/components/dashboard/ActivityFeed.tsx',
    remove: ['Settings']
  },
  {
    file: 'src/components/dashboard/QuickActions.tsx',
    remove: ['Bell']
  },
  {
    file: 'src/pages/Bugs.tsx',
    remove: ['React']
  },
  {
    file: 'src/pages/Dashboard.tsx',
    remove: ['React']
  },
  {
    file: 'src/pages/Home.tsx',
    remove: ['React']
  },
  {
    file: 'src/pages/Projects.tsx',
    remove: ['React', 'Filter']
  },
  {
    file: 'src/services/bugService.ts',
    remove: ['query', 'where', 'orderBy', 'limit']
  },
  {
    file: 'src/services/projectService.ts',
    remove: ['query', 'where', 'orderBy']
  },
  {
    file: 'src/services/userService.ts',
    remove: ['deleteAuthUser']
  },
  {
    file: 'src/utils/firebaseTest.ts',
    remove: ['auth']
  }
];

function removeUnusedImports(filePath, importsToRemove) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  importsToRemove.forEach(importName => {
    // Remove from lucide-react imports
    content = content.replace(
      new RegExp(`\\s*${importName},?\\s*`, 'g'),
      ''
    );
    
    // Remove from react imports
    content = content.replace(
      new RegExp(`import React,?\\s*`, 'g'),
      'import '
    );
    content = content.replace(
      new RegExp(`import \\{\\s*\\}\\s*from 'react';`, 'g'),
      ''
    );
    
    // Remove from firebase imports
    content = content.replace(
      new RegExp(`\\s*${importName},?\\s*`, 'g'),
      ''
    );
    
    // Clean up empty import lines
    content = content.replace(/import \{\s*\}\s*from ['"][^'"]+['"];\s*\n/g, '');
    content = content.replace(/import \{\s*\}\s*from ['"][^'"]+['"];\s*/g, '');
  });
  
  // Clean up trailing commas in import statements
  content = content.replace(/,\s*}/g, '}');
  content = content.replace(/,\s*\)/g, ')');
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed: ${filePath}`);
}

// Fix all files
filesToFix.forEach(({ file, remove }) => {
  removeUnusedImports(file, remove);
});

console.log('Import cleanup completed!');
