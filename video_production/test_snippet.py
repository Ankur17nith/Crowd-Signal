import asyncio
import base64
import json
import os
import subprocess
import time
import urllib.request
from test_cdp_client import CDPClient

async def test_demo_snippet():
    out_dir = r"video_production\test_snippet_frames"
    os.makedirs(out_dir, exist_ok=True)
    
    profile_dir = r'C:\Users\ankur\OneDrive\Desktop\Crowd Signal\video_production\test_snippet_profile'
    chrome_proc = subprocess.Popen([
        r'C:\Program Files\Google\Chrome\Application\chrome.exe',
        '--headless=new',
        '--remote-debugging-port=9236',
        '--window-size=1920,1080',
        f'--user-data-dir={profile_dir}',
        '--disable-gpu',
        '--no-first-run',
        'http://localhost:3000'
    ])
    time.sleep(2)
    
    try:
        res = urllib.request.urlopen('http://localhost:9236/json')
        targets = json.loads(res.read().decode())
        page_target = next(t for t in targets if t.get('type') == 'page')
        ws_url = page_target['webSocketDebuggerUrl']
        
        client = CDPClient(ws_url)
        await client.connect()
        await client.call('Page.enable')
        await client.call('Runtime.enable')

        cursor_script = """
        (function() {
            function ensureCursor() {
                if (document.getElementById('__virtual_cursor__')) return;
                const c = document.createElement('div');
                c.id = '__virtual_cursor__';
                c.style.position = 'fixed';
                c.style.left = '0px';
                c.style.top = '0px';
                c.style.zIndex = '2147483647';
                c.style.pointerEvents = 'none';
                c.style.width = '26px';
                c.style.height = '26px';
                c.style.transform = 'translate(960px, 540px)';
                c.innerHTML = `
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.8)); transform: translate(-2px, -2px);">
                        <path d="M3 2L16.5 12.5L10 13.5L14.5 20L12 21L7.5 14.5L2.5 18V2Z" fill="#ffffff" stroke="#000000" stroke-width="1.6" stroke-linejoin="round"/>
                    </svg>
                    <div id="__cursor_ring__" style="position:absolute;top:2px;left:2px;width:28px;height:28px;border-radius:50%;border:2.5px solid #38bdf8;box-shadow: 0 0 10px #38bdf8;opacity:0;transform:scale(0.3);transition:all 0.22s ease-out;pointer-events:none;"></div>
                `;
                document.documentElement.appendChild(c);
            }
            ensureCursor();
            document.addEventListener('DOMContentLoaded', ensureCursor);
            window.__moveCursor = function(x, y) {
                ensureCursor();
                const c = document.getElementById('__virtual_cursor__');
                if (c) c.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
            };
            window.__clickCursor = function() {
                ensureCursor();
                const ring = document.getElementById('__cursor_ring__');
                if (ring) {
                    ring.style.opacity = '1';
                    ring.style.transform = 'scale(2.2)';
                    setTimeout(() => {
                        ring.style.opacity = '0';
                        ring.style.transform = 'scale(0.3)';
                    }, 220);
                }
            };
        })();
        """
        await client.call("Page.addScriptToEvaluateOnNewDocument", {"source": cursor_script})
        await client.evaluate(cursor_script)

        # Run 10 seconds: move cursor around hero, scroll down, move to Markets, click
        t0 = time.time()
        frame_idx = 0
        while time.time() - t0 < 10.0:
            elapsed = time.time() - t0
            if elapsed < 3.0:
                # Hover around hero
                p = elapsed / 3.0
                cx = 960 + (600 - 960) * p
                cy = 540 + (250 - 540) * p
                await client.evaluate(f"window.__moveCursor({cx:.1f}, {cy:.1f})")
            elif elapsed < 6.0:
                # Scroll down
                p = (elapsed - 3.0) / 3.0
                cx = 600 + (700 - 600) * p
                cy = 250 + (400 - 250) * p
                scroll_y = int(300 * p)
                await client.evaluate(f"window.scrollTo(0, {scroll_y}); window.__moveCursor({cx:.1f}, {cy:.1f})")
            elif elapsed < 8.0:
                # Move to sidebar Markets link (x=110, y=120)
                p = (elapsed - 6.0) / 2.0
                cx = 700 + (110 - 700) * p
                cy = 400 + (120 - 400) * p
                await client.evaluate(f"window.__moveCursor({cx:.1f}, {cy:.1f})")
            elif elapsed < 8.5:
                # Click Markets
                if elapsed < 8.1:
                    await client.evaluate("window.__clickCursor()")
                    await client.evaluate("document.querySelector('a[href=\"/markets\"]').click()")
            else:
                # On markets page: scroll slightly
                p = (elapsed - 8.5) / 1.5
                scroll_y = int(200 * p)
                cx = 110 + (400 - 110) * p
                cy = 120 + (300 - 120) * p
                await client.evaluate(f"window.scrollTo(0, {scroll_y}); window.__moveCursor({cx:.1f}, {cy:.1f})")

            # Capture frame
            snap = await client.call("Page.captureScreenshot", {"format": "jpeg", "quality": 75})
            if snap and "result" in snap and "data" in snap["result"]:
                data = base64.b64decode(snap["result"]["data"])
                with open(os.path.join(out_dir, f"frame_{frame_idx:05d}.jpg"), "wb") as f:
                    f.write(data)
                frame_idx += 1

        print(f"Captured {frame_idx} test snippet frames!")
        await client.close()
    finally:
        chrome_proc.terminate()

if __name__ == '__main__':
    asyncio.run(test_demo_snippet())
