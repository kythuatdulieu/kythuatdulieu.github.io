const https = require('https');

async function searchDuckDuckGo(query) {
    return new Promise((resolve) => {
        // Just a simple html fetch to duckduckgo to extract an image URL
        const q = encodeURIComponent(query + ' architecture diagram filetype:png');
        https.get(`https://html.duckduckgo.com/html/?q=${q}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                // extract links
                const regex = /<a[^>]+href="([^">]+)"[^>]*>/g;
                let match;
                let found = null;
                while ((match = regex.exec(data)) !== null) {
                    if (match[1].endsWith('.png')) {
                        // duckduckgo proxy removes absolute urls sometimes, let's just use it as a hint
                        found = match[1];
                        break;
                    }
                }
                resolve(found);
            });
        });
    });
}

(async () => {
    console.log("Flink: ", await searchDuckDuckGo('Apache Flink'));
    console.log("Snowflake: ", await searchDuckDuckGo('Snowflake'));
    console.log("BigQuery: ", await searchDuckDuckGo('Google BigQuery'));
})();
