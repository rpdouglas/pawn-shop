import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve directory paths in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

const templatePath = path.join(projectRoot, 'docs/projects/00_TEMPLATE.md');
const epicsPath = path.join(projectRoot, 'docs/EPICS.md');

function printUsage() {
  console.log('\x1b[36m%s\x1b[0m', 'Pawn Shop Governance Spec Helper');
  console.log('Usage: npm run governance:project <EPIC_ID> <FEATURE_NAME>');
  console.log('Example: npm run governance:project E39 Admin_Audit_Logs');
  console.log('Note: Use underscores instead of spaces in the feature name.');
}

async function run() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    printUsage();
    process.exit(1);
  }

  let epicId = args[0].toUpperCase();
  // Ensure Epic ID starts with E and is followed by numbers
  if (!/^E\d+$/.test(epicId)) {
    console.error(`\x1b[31mError: Invalid Epic ID format "${epicId}". Must match "E##" (e.g. E01, E28).\x1b[0m`);
    process.exit(1);
  }

  const rawFeatureName = args[1];
  const featureSlug = rawFeatureName.replace(/[^a-zA-Z0-9_]/g, '');
  const featureTitle = featureSlug.replace(/_/g, ' ');

  if (!fs.existsSync(templatePath)) {
    console.error(`\x1b[31mError: Project template file not found at: ${templatePath}\x1b[0m`);
    process.exit(1);
  }

  // 1. Parse EPICS.md to find Epic Title and Phase
  let epicTitle = 'Unknown Epic';
  let phaseName = 'Unknown Phase';
  
  if (fs.existsSync(epicsPath)) {
    try {
      const epicsContent = fs.readFileSync(epicsPath, 'utf8');
      const lines = epicsContent.split('\n');
      
      let currentPhase = 'Unknown Phase';
      
      for (const line of lines) {
        // Track current phase
        if (line.startsWith('## Phase')) {
          phaseName = line.replace('##', '').trim();
          currentPhase = phaseName;
        }
        
        // Match ### E## · Name
        if (line.includes('###') && line.includes(epicId)) {
          // Extract the part after the dot or bullet
          const parts = line.split(/·|::/);
          if (parts.length > 1) {
            epicTitle = parts[1].trim();
          } else {
            epicTitle = line.replace(/###|##/g, '').trim();
          }
          phaseName = currentPhase;
          break;
        }
      }
    } catch (err) {
      console.warn(`\x1b[33mWarning: Failed to parse EPICS.md, using defaults. (${err.message})\x1b[0m`);
    }
  }

  // 2. Read template and perform substitutions
  let templateContent = fs.readFileSync(templatePath, 'utf8');
  
  // Replace project metadata headers
  templateContent = templateContent.replace(/Project \[ID\]: \[Name\]/g, `Project ${epicId}: ${featureTitle}`);
  templateContent = templateContent.replace(/Planned \| Active \| Done/g, 'Planned');
  templateContent = templateContent.replace(/E\[##\] — \[Epic name from EPICS.md\]/g, `${epicId} — ${epicTitle}`);
  templateContent = templateContent.replace(/Phase \[N\] from EPICS.md/g, phaseName);
  
  // 3. Write new project spec file
  const outputFileName = `${epicId}_${featureSlug}.md`;
  const outputPath = path.join(projectRoot, 'docs/projects', outputFileName);
  
  if (fs.existsSync(outputPath)) {
    console.error(`\x1b[31mError: Project spec already exists at: ${outputPath}\x1b[0m`);
    console.error('Use a different name or edit the file manually.');
    process.exit(1);
  }
  
  fs.writeFileSync(outputPath, templateContent, 'utf8');
  
  console.log('\x1b[32m%s\x1b[0m', `✓ Project spec created successfully!`);
  console.log(`Path:  docs/projects/${outputFileName}`);
  console.log(`Epic:  ${epicId} — ${epicTitle}`);
  console.log(`Phase: ${phaseName}\n`);
  console.log(`Next step: Edit "docs/projects/${outputFileName}" to define the objectives and criteria, then run:`);
  console.log(`  npm run governance:plan ${epicId}_${featureSlug}`);
}

run().catch((err) => {
  console.error('\x1b[31m%s\x1b[0m', 'Fatal Error:');
  console.error(err);
  process.exit(1);
});
