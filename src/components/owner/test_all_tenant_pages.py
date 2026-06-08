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
        
        print("Logging in as tenant...")
        page.fill("#login-email", "tenant@gmail.com")
        page.fill("#login-password", "password123")
        page.click("button[type='submit']")
        time.sleep(5)
        
        # Dashboard
        print("Taking tenant dashboard screenshot...")
        page.screenshot(path=r"C:\Users\Ajith_Anand_R\AppData\Local\Temp\tenant_dashboard.png")
        
        # Payments
        print("Navigating to /payments ...")
        page.goto("http://localhost:3000/payments")
        time.sleep(2)
        page.screenshot(path=r"C:\Users\Ajith_Anand_R\AppData\Local\Temp\tenant_payments.png")
        
        # Services
        print("Navigating to /services ...")
        page.goto("http://localhost:3000/services")
        time.sleep(2)
        page.screenshot(path=r"C:\Users\Ajith_Anand_R\AppData\Local\Temp\tenant_services.png")
        
        # Meals
        print("Navigating to /meals ...")
        page.goto("http://localhost:3000/meals")
        time.sleep(2)
        page.screenshot(path=r"C:\Users\Ajith_Anand_R\AppData\Local\Temp\tenant_meals.png")
        
        # Community
        print("Navigating to /community ...")
        page.goto("http://localhost:3000/community")
        time.sleep(2)
        page.screenshot(path=r"C:\Users\Ajith_Anand_R\AppData\Local\Temp\tenant_community.png")
        
        # Guest Pass
        print("Navigating to /guest-pass ...")
        page.goto("http://localhost:3000/guest-pass")
        time.sleep(2)
        page.screenshot(path=r"C:\Users\Ajith_Anand_R\AppData\Local\Temp\tenant_guest_pass.png")
        
        # Chats
        print("Navigating to /chats ...")
        page.goto("http://localhost:3000/chats")
        time.sleep(2)
        page.screenshot(path=r"C:\Users\Ajith_Anand_R\AppData\Local\Temp\tenant_chats.png")
        
        # Notifications
        print("Navigating to /notifications ...")
        page.goto("http://localhost:3000/notifications")
        time.sleep(2)
        page.screenshot(path=r"C:\Users\Ajith_Anand_R\AppData\Local\Temp\tenant_notifications.png")
        
        # Profile
        print("Navigating to /profile ...")
        page.goto("http://localhost:3000/profile")
        time.sleep(2)
        page.screenshot(path=r"C:\Users\Ajith_Anand_R\AppData\Local\Temp\tenant_profile.png")
        
        print("Done capturing tenant views!")
        browser.close()

if __name__ == "__main__":
    run()
