import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const readmePath = path.join(__dirname, 'README.md');
const contractsDir = path.join(__dirname, 'contracts');

let readmeContent = '';

// If README doesn't exist, create a base template
if (fs.existsSync(readmePath)) {
  readmeContent = fs.readFileSync(readmePath, 'utf8');
} else {
  readmeContent = `# Stacks Aegis Mission Control

Welcome to the Stacks Aegis Protocol repository.

## Smart Contracts
<!-- CONTRACTS_START -->
<!-- CONTRACTS_END -->

## Last Updated
<!-- TIMESTAMP_START -->
<!-- TIMESTAMP_END -->
`;
}

// 1. Generate Contracts List
let contractsList = '';
if (fs.existsSync(contractsDir)) {
  const files = fs.readdirSync(contractsDir).filter(f => f.endsWith('.clar'));
  contractsList = files.map(f => `- **\`${f}\`**`).join('\n');
} else {
  contractsList = '_No contracts found._';
}

// 2. Generate Timestamp
const date = new Date().toUTCString();
const timestamp = `_Last auto-updated via Husky pre-commit hook: ${date}_`;

// 3. Inject into README
const updateSection = (content, startMarker, endMarker, newContent) => {
  const regex = new RegExp(`(${startMarker})[\\s\\S]*?(${endMarker})`, 'g');
  if (regex.test(content)) {
    return content.replace(regex, `$1\n${newContent}\n$2`);
  }
  return content + `\n${startMarker}\n${newContent}\n${endMarker}\n`;
};

readmeContent = updateSection(readmeContent, '<!-- CONTRACTS_START -->', '<!-- CONTRACTS_END -->', contractsList);
readmeContent = updateSection(readmeContent, '<!-- TIMESTAMP_START -->', '<!-- TIMESTAMP_END -->', timestamp);

fs.writeFileSync(readmePath, readmeContent);
console.log('✅ Automated README update completed: injected latest contract list and timestamp.');
