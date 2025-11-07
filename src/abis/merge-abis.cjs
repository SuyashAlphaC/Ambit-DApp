const fs = require('fs');

// Read the ABIs
const tokenizedStrategy = JSON.parse(fs.readFileSync('TokenizedStrategy.json', 'utf8'));
const yieldDonatingStrategy = JSON.parse(fs.readFileSync('YieldDonatingStrategy.json', 'utf8'));

// Combine them - TokenizedStrategy functions + YieldDonatingStrategy functions
const combined = [...tokenizedStrategy, ...yieldDonatingStrategy];

// Remove duplicates based on function/event signature
const unique = {};
combined.forEach(item => {
  let key;
  if (item.type === 'function') {
    const inputs = item.inputs ? item.inputs.map(i => i.type).join(',') : '';
    key = `${item.name}(${inputs})`;
  } else if (item.type === 'event') {
    const inputs = item.inputs ? item.inputs.map(i => i.type).join(',') : '';
    key = `event_${item.name}(${inputs})`;
  } else {
    key = `${item.type}_${Math.random()}`;
  }
  unique[key] = item;
});

const mergedABI = Object.values(unique);

// Write the combined ABI
fs.writeFileSync('YieldDonatingVault.json', JSON.stringify(mergedABI, null, 2));

console.log('Merged ABI created: YieldDonatingVault.json');
console.log(`Total items: ${mergedABI.length}`);
console.log(`Functions: ${mergedABI.filter(i => i.type === 'function').length}`);
console.log(`Events: ${mergedABI.filter(i => i.type === 'event').length}`);
