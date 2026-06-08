import sys
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://127.0.0.1:3000")
        page.wait_for_load_state("networkidle")
        
        # Print form HTML
        form_html = page.eval_on_selector("form", "el => el.outerHTML")
        print("--- FORM HTML ---")
        print(form_html)
        print("-----------------")
        
        # Check if react handles submit
        has_react = page.evaluate("() => typeof window.React !== 'undefined' || !!document.querySelector('#__next') || !!document.querySelector('body')")
        print(f"Has React/Next structure: {has_react}")
        
        browser.close()

if __name__ == "__main__":
    run()
