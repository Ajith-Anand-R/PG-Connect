import sys
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # Track all network requests
        failed_requests = []
        def handle_request_failed(request):
            failed_requests.append(f"{request.url} failed: {request.failure.error_text}")
        page.on("requestfailed", handle_request_failed)
        
        page.goto("http://127.0.0.1:3000")
        page.wait_for_load_state("networkidle")
        
        # List all scripts
        scripts = page.evaluate("""() => {
            return Array.from(document.querySelectorAll('script')).map(s => ({
                src: s.src,
                type: s.type,
                async: s.async,
                defer: s.defer,
                innerHTML: s.innerHTML.slice(0, 100)
            }));
        }""")
        
        print("--- LOADED SCRIPTS ---")
        for s in scripts:
            print(f"src: {s['src']}, type: {s['type']}, async: {s['async']}, defer: {s['defer']}, html: {s['innerHTML']}")
        print("----------------------")
        
        if failed_requests:
            print("--- FAILED REQUESTS ---")
            for req in failed_requests:
                print(req)
            print("-----------------------")
        else:
            print("No failed network requests.")
            
        browser.close()

if __name__ == "__main__":
    run()
