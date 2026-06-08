import sys
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        page.on("console", lambda msg: print(f"[BROWSER CONSOLE] {msg.type}: {msg.text}"))
        
        page.goto("http://127.0.0.1:3000")
        page.wait_for_load_state("networkidle")
        
        # Check if console.log is native or overridden
        console_log_str = page.evaluate("() => window.console.log.toString()")
        print(f"console.log.toString(): {console_log_str}")
        
        # Try calling console.log directly
        page.evaluate("() => console.log('Direct test log from browser')")
        
        # Check if body has react comments or hydration markers
        body_html = page.evaluate("() => document.body.innerHTML")
        print(f"Body HTML Length: {len(body_html)}")
        
        browser.close()

if __name__ == "__main__":
    run()
