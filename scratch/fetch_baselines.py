import os
import sys
import time
import requests
from bs4 import BeautifulSoup
import markdownify
from duckduckgo_search import DDGS

def get_baselines_for_topic(topic, num_results=50, num_baselines=5):
    try:
        print(f"Searching DuckDuckGo for: {topic}")
        with DDGS() as ddgs:
            results = list(ddgs.text(f"{topic} architecture data engineering", max_results=num_results))
        
        # Filter for credible domains if possible, or just take the top ones
        credible_domains = ['aws.amazon.com', 'cloud.google.com', 'azure.microsoft.com', 'databricks.com', 'confluent.io', 'medium.com', 'towardsdatascience.com']
        
        selected_urls = []
        for r in results:
            url = r['href']
            if any(domain in url for domain in credible_domains):
                selected_urls.append(url)
            if len(selected_urls) >= num_baselines:
                break
                
        # If we didn't find enough credible domains, just backfill with top results
        if len(selected_urls) < num_baselines:
            for r in results:
                url = r['href']
                if url not in selected_urls:
                    selected_urls.append(url)
                if len(selected_urls) >= num_baselines:
                    break
                    
        print(f"Selected {len(selected_urls)} URLs for baselines.")
        
        aggregated_content = []
        for i, url in enumerate(selected_urls):
            try:
                print(f"[{i+1}/{len(selected_urls)}] Fetching: {url}")
                headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
                resp = requests.get(url, headers=headers, timeout=10)
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, 'html.parser')
                    # Remove script, style, nav, footer
                    for element in soup(['script', 'style', 'nav', 'footer', 'header']):
                        element.decompose()
                    
                    # Try to get main content if possible
                    main = soup.find('main') or soup.find('article') or soup.find('body')
                    if main:
                        md = markdownify.markdownify(str(main), heading_style="ATX")
                        # Keep only reasonable length strings to avoid massive files
                        if len(md) > 200:
                            aggregated_content.append(f"### Source: {url}\n\n{md[:20000]}\n\n")
            except Exception as e:
                print(f"Failed to fetch {url}: {e}")
                
        return "".join(aggregated_content)
    except Exception as e:
        print(f"Search failed: {e}")
        return ""

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python fetch_baselines.py <topic> <output_file>")
        sys.exit(1)
        
    topic = sys.argv[1]
    output_file = sys.argv[2]
    
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    content = get_baselines_for_topic(topic)
    if content:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Successfully wrote baselines to {output_file}")
    else:
        print("Failed to get baselines.")
