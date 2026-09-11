import asyncio
import json
import subprocess
import time
import urllib.request
from test_cdp_client import CDPClient

async def test_click():
    profile_dir = r'C:\Users\ankur\OneDrive\Desktop\Crowd Signal\video_production\test_cdp_profile'
    chrome_proc = subprocess.Popen([
        r'C:\Program Files\Google\Chrome\Application\chrome.exe',
        '--headless=new',
        '--remote-debugging-port=9232',
        '--window-size=1920,1080',
        f'--user-data-dir={profile_dir}',
        '--disable-gpu',
        '--no-first-run',
        'http://localhost:3000'
    ])
    time.sleep(2)
    try:
        res = urllib.request.urlopen('http://localhost:9232/json')
        targets = json.loads(res.read().decode())
        page_target = next(t for t in targets if t.get('type') == 'page')
        ws_url = page_target['webSocketDebuggerUrl']
        
        client = CDPClient(ws_url)
        await client.connect()
        await client.call('Page.enable')
        await client.call('Runtime.enable')

        # Click Markets
        await client.evaluate("""
            const el = document.querySelector('a[href="/markets"]');
            if (el) el.click();
        """)
        await asyncio.sleep(1.5)
        path = await client.evaluate('window.location.pathname')
        print('Path after el.click():', path)

        # Click a market
        await client.evaluate("""
            const row = document.querySelector('tbody tr a, a[href^="/market/"]');
            if (row) row.click();
        """)
        await asyncio.sleep(1.5)
        path_market = await client.evaluate('window.location.pathname')
        print('Path after clicking market row:', path_market)

        # Click Leaderboard
        await client.evaluate("""
            const el = document.querySelector('a[href="/leaderboard"]');
            if (el) el.click();
        """)
        await asyncio.sleep(1.5)
        path_lead = await client.evaluate('window.location.pathname')
        print('Path after clicking Leaderboard:', path_lead)

        # Click Developers
        await client.evaluate("""
            const el = document.querySelector('a[href="/developers"]');
            if (el) el.click();
        """)
        await asyncio.sleep(1.5)
        path_dev = await client.evaluate('window.location.pathname')
        print('Path after clicking Developers:', path_dev)

        # Click Docs
        await client.evaluate("""
            const el = document.querySelector('a[href="/docs"]');
            if (el) el.click();
        """)
        await asyncio.sleep(1.5)
        path_docs = await client.evaluate('window.location.pathname')
        print('Path after clicking Docs:', path_docs)

        # Return to Overview
        await client.evaluate("""
            const el = document.querySelector('a[href="/"]');
            if (el) el.click();
        """)
        await asyncio.sleep(1.5)
        path_home = await client.evaluate('window.location.pathname')
        print('Path after returning to Overview:', path_home)

        await client.close()
    finally:
        chrome_proc.terminate()

if __name__ == '__main__':
    asyncio.run(test_click())
