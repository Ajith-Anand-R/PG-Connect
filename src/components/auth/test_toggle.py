import sys
import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        page.on("console", lambda msg: print(f"[CONSOLE] {msg.type}: {msg.text}"))
        page.on("pageerror", lambda exc: print(f"[PAGE ERROR] {exc.message}"))
        
        print("Navigating to http://localhost:3000 ...")
        page.goto("http://localhost:3000")
        page.wait_for_load_state("networkidle")
        
        # Wait 3 seconds for hydration
        time.sleep(3)
        
        # Check initial type of password input
        initial_type = page.eval_on_selector("#login-password", "el => el.type")
        print(f"Initial password input type: {initial_type}")
        
        # Click the toggle button
        print("Clicking toggle password visibility button...")
        page.click("#togglePassword")
        
        # Wait a moment
        time.sleep(0.5)
        
        # Check new type
        new_type = page.eval_on_selector("#login-password", "el => el.type")
        print(f"New password input type: {new_type}")
        
        browser.close()

if __name__ == "__main__":
    run()
