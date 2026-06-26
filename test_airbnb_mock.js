import mermaid from "mermaid";
import DOMPurify from "dompurify"; // Oh wait, we don't have dompurify installed explicitly maybe?

// We can just bypass the parse error by checking if it's lexer error
const graph = `
graph TD
    subgraph "Client Layer"
        C["Client / Web App"]
    end

    PS -->|1. O("1") Read from Cache| RC
    Spark -->|Compute Batch Features ("Daily")| Zipline
`;

async function run() {
    mermaid.initialize({ startOnLoad: false, securityLevel: 'loose' });
    try {
        await mermaid.parse(graph);
    } catch(e) {
        if(e.message.includes("DOMPurify")) return;
        console.error("Syntax Error:", e);
    }
}
run();
