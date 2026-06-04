const fs = require('fs');

function fixPackageJson(path, isOperations) {
  const pkg = JSON.parse(fs.readFileSync(path, 'utf8'));
  pkg.engines = { node: "20" };
  
  if (isOperations) {
    pkg.scripts.build = "esbuild src/index.ts --bundle --platform=node --target=node20 --outfile=lib/index.js --external:firebase-admin --external:firebase-functions --external:@google/generative-ai --external:sharp --external:twilio --external:@sendgrid/mail";
  } else {
    pkg.scripts.build = "esbuild src/index.ts --bundle --platform=node --target=node20 --outfile=lib/index.js --external:firebase-admin --external:firebase-functions";
  }

  if (pkg.dependencies && pkg.dependencies['@pawn-shop/shared']) {
    pkg.devDependencies = pkg.devDependencies || {};
    pkg.devDependencies['@pawn-shop/shared'] = pkg.dependencies['@pawn-shop/shared'];
    delete pkg.dependencies['@pawn-shop/shared'];
  }
  
  fs.writeFileSync(path, JSON.stringify(pkg, null, 2));
}

fixPackageJson('functions/core/package.json', false);
fixPackageJson('functions/operations/package.json', true);
