import sys
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://127.0.0.1:3000")
        page.wait_for_load_state("networkidle")
        
        # Check portal text
        portal_text = page.evaluate("""() => {
            const portal = document.querySelector('nextjs-portal');
            if (portal) {
                // Access shadow DOM if it exists
                const root = portal.shadowRoot || portal;
                return root.innerHTML || portal.innerHTML;
            }
            return 'No nextjs-portal found';
        }""")
        
        print("--- PORTAL INNER HTML ---")
        print(portal_text)
        print("-------------------------")
        
        browser.close()

if __name__ == "__main__":
    run()
