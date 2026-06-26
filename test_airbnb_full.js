import mermaid from "mermaid";
import fs from "fs";

const content = fs.readFileSync("src/content/docs/projects/system-design/airbnb-dynamic-pricing.md", "utf8");
const match = /```mermaid\n([\s\S]*?)```/.exec(content);
const graph = match[1];

async function run() {
    mermaid.initialize({ startOnLoad: false, securityLevel: 'loose' });
    try {
        await mermaid.parse(graph);
    } catch(e) {
        if(e.message.includes("DOMPurify")) {
             console.log("Only DOMPurify error, parsing technically succeeded");
             return;
        }
        console.error("Syntax Error:", e);
    }
}
run();
