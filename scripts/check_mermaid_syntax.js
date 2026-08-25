import { JSDOM } from "jsdom";
const { window } = new JSDOM("");
global.window = window;
global.document = window.document;
global.DOMParser = window.DOMParser;
global.HTMLElement = window.HTMLElement;
global.MutationObserver = window.MutationObserver;
global.SVGElement = window.SVGElement;

import fs from "fs";

// Dynamically import mermaid AFTER globals are set
const { default: mermaid } = await import("mermaid");

function getFiles(dir, files = []) {
    const list = fs.readdirSync(dir);
    for (let file of list) {
        file = dir + "/" + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            getFiles(file, files);
        } else {
            if (file.endsWith(".md") || file.endsWith(".mdx")) {
                files.push(file);
            }
        }
    }
    return files;
}

const allFiles = getFiles("src/content/docs");
let hasError = false;

async function checkFiles() {
    mermaid.initialize({ startOnLoad: false, securityLevel: 'loose' });
    
    for (const file of allFiles) {
        const content = fs.readFileSync(file, "utf8");
        const blocks = [];
        const regex = /```mermaid\n([\s\S]*?)```/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            blocks.push(match[1]);
        }
        
        for (let i = 0; i < blocks.length; i++) {
            try {
                await mermaid.parse(blocks[i]);
            } catch (e) {
                console.error(`\n==================\nSyntax error in ${file} (Block ${i}):`);
                console.error(e.message || e);
                hasError = true;
            }
        }
    }
}

checkFiles().then(() => {
    if (!hasError) {
        console.log("All mermaid blocks passed syntax check!");
    } else {
        console.error("Mermaid syntax errors found! Please fix them.");
        process.exit(1);
    }
}).catch(e => {
    console.error(e);
    process.exit(1);
});
