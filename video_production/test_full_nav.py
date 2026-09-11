import asyncio
import base64
import json
import subprocess
import time
import urllib.request
import websockets
from test_cdp_client import CDPClient

async def test_full_nav():
    profile_dir = r'C:\Users\ankur\OneDrive\Desktop\Crowd Signal\video_production\test_cdp_profile'
    chrome_proc = subprocess.Popen([
        r'C:\Program Files\Google\Chrome\Application\chrome.exe',
        '--headless=new',
        '--remote-debugging-port=9230',
        '--window-size=1920,1080',
        f'--user-data-dir={profile_dir}',
        '--disable-gpu',
        '--no-first-run',
        'http://localhost:3000'
    ])
    time.sleep(2)
    try:
        res = urllib.request.urlopen('http://localhost:9230/json')
        targets = json.loads(res.read().decode())
        page_target = next(t for t in targets if t.get('type') == 'page')
        ws_url = page_target['webSocketDebuggerUrl']
        
        client = CDPClient(ws_url)
        await client.connect()
        await client.call('Page.enable')
        await client.call('Runtime.enable')

        # Find Markets link by href
        find_link = """
        (() => {
            const el = document.querySelector('a[href="/markets"]');
            if (!el) return null;
            const rect = el.getBoundingClientRect();
            return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        })()
        """
        coords = await client.evaluate(find_link)
        print("Markets link coords:", coords)
        
        if coords:
            # Click it
            await client.call("Input.dispatchMouseEvent", {"type": "mousePressed", "x": coords['x'], "y": coords['y'], "button": "left", "clickCount": 1})
            await asyncio.sleep(0.05)
            await client.call("Input.dispatchMouseEvent", {"type": "mouseReleased", "x": coords['x'], "y": coords['y'], "button": "left", "clickCount": 1})
            
            await asyncio.sleep(2.0)
            new_path = await client.evaluate("window.location.pathname")
            print("Path after clicking Markets:", new_path)

            # Check markets on the page
            markets_info = await client.evaluate("""
                (() => {
                    const rows = Array.from(document.querySelectorAll('tbody tr, a[href^="/market/"]'));
                    return {
                        count: rows.length,
                        firstHref: rows[0] ? (rows[0].getAttribute('href') || (rows[0].querySelector('a') ? rows[0].querySelector('a').getAttribute('href') : null)) : null
                    };
                })()
            """)
            print("Markets on page:", markets_info)

        await client.close()
    finally:
        chrome_proc.terminate()

if __name__ == '__main__':
    asyncio.run(test_full_nav())
