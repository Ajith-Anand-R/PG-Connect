import sys
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://127.0.0.1:3000")
        page.wait_for_load_state("networkidle")
        
        # Check global variables
        variables = page.evaluate("""() => {
            return {
                windowExists: typeof window !== 'undefined',
                nextExists: typeof window.next !== 'undefined',
                nextRouterExists: typeof window.next?.router !== 'undefined',
                reactExists: typeof window.React !== 'undefined',
                bodyClasses: document.body.className,
                htmlClasses: document.documentElement.className,
                scriptsCount: document.querySelectorAll('script').length,
                reactDevToolsHook: typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined'
            };
        }""")
        
        print("--- BROWSER GLOBALS ---")
        for k, v in variables.items():
            print(f"{k}: {v}")
        print("-----------------------")
        
        browser.close()

if __name__ == "__main__":
    run()
