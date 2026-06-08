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
                // Get all text content
                return root.textContent;
            }
            return 'No nextjs-portal found';
        }""")
        
        print("--- PORTAL TEXT CONTENT ---")
        print(text_content.strip())
        print("---------------------------")
        
        browser.close()

if __name__ == "__main__":
    run()
