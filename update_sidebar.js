const fs = require('fs');
let config = fs.readFileSync('astro.config.mjs', 'utf8');

// Add collapsed: true to every sidebar group
config = config.replace(/(label:\s*'[^']+',)(\s*)(autogenerate|items|link)/g, '$1\n$2collapsed: true,\n$2$3');

// Inject the sidebar-resizer script to the head
const resizerScript = `
				{
					tag: 'script',
					attrs: { src: '/sidebar-resizer.js', defer: true },
				},`;

if (!config.includes('sidebar-resizer.js')) {
    config = config.replace(/(head:\s*\[)/, `$1${resizerScript}`);
}

fs.writeFileSync('astro.config.mjs', config);
console.log("Updated astro.config.mjs successfully.");
