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
        
        print("Logging in...")
        page.fill("#login-email", "ajithanand74@gmail.com")
        page.fill("#login-password", "password123")
        page.click("button[type='submit']")
        time.sleep(4)
        
        # Verify Owner Dashboard
        print("Taking dashboard screenshot...")
        page.screenshot(path=r"C:\Users\Ajith_Anand_R\AppData\Local\Temp\owner_dashboard.png")
        
        # Navigate to Payments
        print("Navigating to /payments ...")
        page.goto("http://localhost:3000/payments")
        time.sleep(2)
        page.screenshot(path=r"C:\Users\Ajith_Anand_R\AppData\Local\Temp\owner_payments.png")
        
        # Navigate to Services
        print("Navigating to /services ...")
        page.goto("http://localhost:3000/services")
        time.sleep(2)
        page.screenshot(path=r"C:\Users\Ajith_Anand_R\AppData\Local\Temp\owner_services.png")
        
        # Navigate to Notices
        print("Navigating to /notices ...")
        page.goto("http://localhost:3000/notices")
        time.sleep(2)
        page.screenshot(path=r"C:\Users\Ajith_Anand_R\AppData\Local\Temp\owner_notices.png")
        
        # Navigate to Meals
        print("Navigating to /meals ...")
        page.goto("http://localhost:3000/meals")
        time.sleep(2)
        page.screenshot(path=r"C:\Users\Ajith_Anand_R\AppData\Local\Temp\owner_meals.png")
        
        print("Done capturing owner views!")
        browser.close()

if __name__ == "__main__":
    run()
