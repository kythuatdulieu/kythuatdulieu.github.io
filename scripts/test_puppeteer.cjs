const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Block unnecessary requests to speed up
    await page.setRequestInterception(true);
    page.on('request', req => {
        if (req.resourceType() === 'image' || req.resourceType() === 'stylesheet' || req.resourceType() === 'font') {
            req.abort();
        } else {
            req.continue();
        }
    });

    console.log("Going to page...");
    await page.goto('https://examcademy.com/exams/amazon/aws-certified-data-engineer-associate-dea-c01/1', { waitUntil: 'domcontentloaded' });
    
    console.log("Extracting questions...");
    
    // The data is all client-side. We can just click next 25 times and scrape the DOM.
    let results = [];
    
    for (let i = 0; i < 25; i++) {
        // Wait for question to render
        await page.waitForSelector('.question-content .mc-question, .question-content p', {timeout: 5000}).catch(()=>null);
        
        // Extract data
        const data = await page.evaluate(() => {
            const qBlock = document.querySelector('.question-content');
            if (!qBlock) return null;
            
            // Extract question text
            let textNodes = [];
            for (const child of qBlock.children) {
                if (child.classList.contains('mc-question') || child.classList.contains('options')) break;
                textNodes.push(child.innerText);
            }
            
            // Extract choices
            let choices = {};
            document.querySelectorAll('.options .option').forEach(opt => {
                const label = opt.querySelector('.label')?.innerText.trim();
                const text = opt.querySelector('.text')?.innerText.trim();
                if (label && text) {
                    choices[label] = text;
                }
            });
            
            // Extract answer (if available in DOM, maybe we click "Show Answer")
            // Wait, we already have choices and answer from python.
            // We just need the question text!
            return {
                text: textNodes.join('\n').trim(),
                choices: choices
            };
        });
        
        if (data) {
            results.push(data);
            console.log(`Extracted Q${i+1}: ${data.text.substring(0, 50)}...`);
        }
        
        // Click Next
        const nextBtn = await page.$('button[aria-label="Next"]');
        if (nextBtn) {
            await nextBtn.click();
            // Wait a tiny bit for React to update the DOM
            await new Promise(r => setTimeout(r, 50));
        } else {
            // "Next" button might have a different label, e.g., svg with right arrow.
            // Let's find button by SVG
            const btns = await page.$$('button');
            let clicked = false;
            for (const btn of btns) {
                const html = await btn.evaluate(b => b.innerHTML);
                if (html.includes('lucide-chevron-right')) {
                    await btn.click();
                    clicked = true;
                    await new Promise(r => setTimeout(r, 50));
                    break;
                }
            }
            if (!clicked) break;
        }
    }
    
    console.log(`Finished page. Extracted ${results.length} questions.`);
    await browser.close();
})();
