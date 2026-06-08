import sys
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://127.0.0.1:3000")
        page.wait_for_load_state("networkidle")
        
        text_content = page.evaluate("""() => {
            const portal = document.querySelector('nextjs-portal');
            if (portal) {
                const root = portal.shadowRoot || portal;
                return root.textContent;
            }
            return '';
        }""")
        
        print("--- FILTERED PORTAL TEXT ---")
        lines = text_content.split('\n')
        non_empty = [line.strip() for line in lines if line.strip()]
        for line in non_empty:
            # Print if it contains keywords, or just print the first 30 lines of readable text
            lower = line.lower()
            if any(k in lower for k in ["error", "fail", "mismatch", "warning", "exception", "invalid", "route", "compile"]):
                print("[MATCH]", line[:150])
        
        print(f"Total non-empty lines: {len(non_empty)}")
        print("First 20 lines of text:")
        for line in non_empty[:20]:
            print("  ", line[:120])
        print("----------------------------")
        
        browser.close()

if __name__ == "__main__":
    run()
