import sys
import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:3000")
        page.wait_for_load_state("networkidle")
        time.sleep(3)
        
        page.click("text=Create an Account")
        time.sleep(1)
        
        page.fill("#fullName", "Alex")
        page.fill("#reg-email", "testtenant123@gmail.com")
        page.fill("#phone", "+1 (555) 123-4567")
        page.select_option("#building", value="block_a")
        page.fill("#reg-password", "password123")
        
        page.click("button[type='submit']")
        time.sleep(4)
        
        # Check error
        error_el = page.locator("div[class*='bg-red-50']").first
        if error_el.count() > 0:
            print("ERROR DISPLAYED:", error_el.text_content())
        else:
            print("SUCCESS! No error visible.")
            print(f"Current URL: {page.url}")
            
        browser.close()

if __name__ == "__main__":
    run()
