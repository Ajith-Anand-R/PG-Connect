import sys
import time
from playwright.sync_api import sync_playwright

def run():
    print("Script started!")
    sys.stdout.flush()
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # Capture console messages
        def handle_console(msg):
            print(f"[CONSOLE] {msg.type}: {msg.text}")
            sys.stdout.flush()

        page.on("console", handle_console)
        
        # Capture uncaught exceptions
        def handle_pageerror(exc):
            print(f"[PAGE ERROR] {exc.message}")
            if exc.stack:
                print(f"  Stack:\n{exc.stack}")
            sys.stdout.flush()

        page.on("pageerror", handle_pageerror)
        
        print("Navigating to http://127.0.0.1:3000 ...")
        sys.stdout.flush()
        try:
            page.goto("http://127.0.0.1:3000", timeout=30000)
            page.wait_for_load_state("networkidle")
            
            # Wait 3 seconds for React hydration
            time.sleep(3)
            
            # Inject a listener to prevent default form submission
            page.evaluate("""
                const form = document.querySelector('form');
                if (form) {
                    form.addEventListener('submit', (e) => {
                        console.log('DOM submit event fired, preventing default manually');
                        e.preventDefault();
                    });
                }
            """)
            
            # Fill email/phone
            print("Filling login form...")
            page.fill("#login-email", "ajithanand74@gmail.com")
            page.fill("#login-password", "password123")
            
            # Click Sign In
            print("Clicking Sign In button...")
            page.click("button[type='submit']")
            
            # Wait for 5 seconds
            print("Waiting 5s for response...")
            time.sleep(5)
            
            print(f"Current URL: {page.url}")
            sys.stdout.flush()
            
            # Take screenshot of the logged-in dashboard
            screenshot_path = r"C:\Users\Ajith_Anand_R\AppData\Local\Temp\owner_dashboard.png"
            page.screenshot(path=screenshot_path)
            print(f"Screenshot saved to {screenshot_path}")
            sys.stdout.flush()
            
        except Exception as e:
            print(f"Error: {e}")
            sys.stdout.flush()
        finally:
            browser.close()

if __name__ == "__main__":
    run()
