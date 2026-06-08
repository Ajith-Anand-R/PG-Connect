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
        time.sleep(3)
        
        print("Filling credentials...")
        page.fill("#login-email", "ajithanand74@gmail.com")
        page.fill("#login-password", "password123")
        
        print("Clicking Sign In...")
        page.click("button[type='submit']")
        
        print("Waiting for response...")
        time.sleep(5)
        page.wait_for_load_state("networkidle")
        
        print(f"Current URL: {page.url}")
        print(f"Page Title: {page.title()}")
        
        screenshot_path = r"C:\Users\Ajith_Anand_R\AppData\Local\Temp\owner_dashboard_logged_in.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")
        
        browser.close()

if __name__ == "__main__":
    run()
