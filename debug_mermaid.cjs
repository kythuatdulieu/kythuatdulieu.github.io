const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    // Start a local static server for the 'dist' directory
    const { exec } = require('child_process');
    const server = exec('npx serve dist -p 4321');
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log("Server started, launching puppeteer...");
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    
    // Open a page that has mermaid
    // e.g. /concepts/data-warehouse
    await page.goto('http://localhost:4321/concepts/data-warehouse', { waitUntil: 'networkidle0' });
    
    // Give it a moment for mermaid to render
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if mermaid rendered
    const mermaidContainers = await page.$$('.mermaid-rendered');
    console.log(`Found ${mermaidContainers.length} mermaid containers.`);
    
    if (mermaidContainers.length > 0) {
        // Get outerHTML of the first SVG
        const svgHTML = await page.evaluate(() => {
            const el = document.querySelector('.mermaid-rendered svg');
            return el ? el.outerHTML : 'No SVG found';
        });
        
        fs.writeFileSync('debug_svg.html', svgHTML);
        console.log("Saved SVG to debug_svg.html");
        
        // Take a screenshot of the container
        await mermaidContainers[0].screenshot({ path: 'debug_screenshot.png' });
        console.log("Saved screenshot to debug_screenshot.png");
    }
    
    await browser.close();
    server.kill();
})();
