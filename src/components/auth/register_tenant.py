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
        
        # Wait for hydration
        time.sleep(3)
        
        # Click Create an Account
        print("Switching to registration form...")
        page.click("text=Create an Account")
        time.sleep(1)
        
        # Fill form
        print("Filling registration form...")
        page.fill("#fullName", "Alex")
        page.fill("#reg-email", "tenant@example.com")
        page.fill("#phone", "+1 (555) 123-4567")
        page.select_option("#building", value="block_a")
        page.fill("#reg-password", "password123")
        
        # Click Register
        print("Clicking Register...")
        page.click("button[type='submit']")
        
        # Wait for 5 seconds
        time.sleep(5)
        
        print(f"Current URL: {page.url}")
        
        # Take screenshot
        screenshot_path = r"C:\Users\Ajith_Anand_R\AppData\Local\Temp\registration_result.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")
        
        browser.close()

if __name__ == "__main__":
    run()
