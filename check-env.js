import 'dotenv/config.js';

console.log('\n=== API Key Environment Check ===\n');

const keys = [];
const primary = process.env.GEMINI_API_KEY;

console.log('GEMINI_API_KEY:', primary ? `SET (${primary.substring(0,20)}...)` : 'NOT SET');

for (let i = 1; i <= 3; i++) {
  const key = process.env[`GEMINI_API_KEY_BACKUP_${i}`];
  console.log(`GEMINI_API_KEY_BACKUP_${i}:`, key ? `SET (${key.substring(0,20)}...)` : 'NOT SET');
  if (key && key.trim()) {
    keys.push(key);
  }
}

if (primary && primary.trim()) {
  keys.unshift(primary);
}

console.log('\n✓ Total API keys found:', keys.length);
keys.forEach((k, i) => {
  console.log(`  [${i}] ${k.substring(0, 30)}...`);
});
