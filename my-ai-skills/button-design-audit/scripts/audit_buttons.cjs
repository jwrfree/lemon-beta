const fs = require('fs');
const path = require('path');

const ANTI_PATTERNS = [
  { pattern: /bg-(blue|purple|green|red|emerald|rose|amber|yellow|violet|fuchsia|pink|orange)-[1-9]00/g, severity: 'High', message: 'Literal color class detected on interactive element. Use semantic variants (bg-primary, bg-destructive, bg-success).' },
  { pattern: /text-\[#[0-9a-fA-F]{3,6}\]/g, severity: 'High', message: 'Hardcoded hex color detected. Use semantic tokens.' },
  { pattern: /rounded-(xl|2xl)/g, severity: 'Medium', message: 'Non-standard border radius detected. Buttons should be rounded-full (DS 1.5).' },
  { pattern: /fixed.*bottom-(20|24|28)/g, severity: 'High', message: 'Manual FAB or floating element positioning detected. Use <FAB> with standard bottom-[136px] for mobile nav clearance.' },
  { pattern: /pb-(20|24|28|32|safe)/g, severity: 'Medium', message: 'Manual page clearance detected. Use app-page-body-padding utility instead.' },
  { pattern: /<Button[^>]*size="icon"[^>]*>(?!.*aria-label=).*<\/Button>/gs, severity: 'Critical', message: 'Icon-only button missing aria-label.' },
  { pattern: /<Button[^>]*isLoading={.*}[^>]*>.*spinner.*<\/Button>/gs, severity: 'Low', message: 'Manual spinner logic detected with isLoading prop. Component handles spinner automatically.' }
];

function auditFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const findings = [];

  ANTI_PATTERNS.forEach(({ pattern, severity, message }) => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const lineNum = content.substr(0, match.index).split('\n').length;
      findings.push({ lineNum, severity, message, text: match[0] });
    }
  });

  return findings;
}

const targetDir = process.argv[2] || 'src';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        walkDir(fullPath, callback);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      callback(fullPath);
    }
  });
}

const allFindings = [];
walkDir(targetDir, filePath => {
  const findings = auditFile(filePath);
  if (findings.length > 0) {
    allFindings.push({ filePath, findings });
  }
});

if (allFindings.length === 0) {
  console.log('✅ No button-related anti-patterns found.');
} else {
  console.log(`Found ${allFindings.length} files with potential issues:\n`);
  allFindings.forEach(({ filePath, findings }) => {
    console.log(`📄 ${filePath}:`);
    findings.forEach(f => {
      console.log(`  [${f.severity}] Line ${f.lineNum}: ${f.message} (Found: "${f.text.trim()}")`);
    });
    console.log('');
  });
}
