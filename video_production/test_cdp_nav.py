import asyncio
import base64
import json
import subprocess
import time
import urllib.request
import websockets

async def test_navigation_and_cursor():
    profile_dir = r'C:\Users\ankur\OneDrive\Desktop\Crowd Signal\video_production\test_cdp_profile'
    chrome_proc = subprocess.Popen([
        r'C:\Program Files\Google\Chrome\Application\chrome.exe',
        '--headless=new',
        '--remote-debugging-port=9227',
        '--window-size=1920,1080',
        f'--user-data-dir={profile_dir}',
        '--disable-gpu',
        '--no-first-run',
        'http://localhost:3000'
    ])
    time.sleep(2)
    try:
        res = urllib.request.urlopen('http://localhost:9227/json')
        targets = json.loads(res.read().decode())
        page_target = next(t for t in targets if t.get('type') == 'page')
        ws_url = page_target['webSocketDebuggerUrl']
        
        async with websockets.connect(ws_url, max_size=20*1024*1024) as ws:
            await ws.send(json.dumps({'id': 1, 'method': 'Page.enable'}))
            await ws.recv()
            await ws.send(json.dumps({'id': 2, 'method': 'Runtime.enable'}))
            await ws.recv()

            cursor_script = """
            (function() {
                function initCursor() {
                    if (document.getElementById('__virtual_cursor__')) return;
                    const c = document.createElement('div');
                    c.id = '__virtual_cursor__';
                    c.style.position = 'fixed';
                    c.style.left = '0px';
                    c.style.top = '0px';
                    c.style.zIndex = '2147483647';
                    c.style.pointerEvents = 'none';
                    c.style.width = '24px';
                    c.style.height = '24px';
                    c.innerHTML = `
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="filter: drop-shadow(0 2px 5px rgba(0,0,0,0.7)); transform: translate(-2px, -2px);">
                            <path d="M3 2L16.5 12.5L10 13.5L14.5 20L12 21L7.5 14.5L2.5 18V2Z" fill="#ffffff" stroke="#090d16" stroke-width="1.6" stroke-linejoin="round"/>
                        </svg>
                        <div id="__cursor_ring__" style="position:absolute;top:2px;left:2px;width:24px;height:24px;border-radius:50%;border:2px solid #38bdf8;opacity:0;transform:scale(0.5);transition:all 0.25s ease-out;pointer-events:none;"></div>
                    `;
                    document.documentElement.appendChild(c);

                    window.addEventListener('mousemove', (e) => {
                        c.style.transform = 'translate(' + e.clientX + 'px, ' + e.clientY + 'px)';
                    }, { passive: true });

                    window.addEventListener('mousedown', (e) => {
                        const ring = document.getElementById('__cursor_ring__');
                        if (ring) {
                            ring.style.opacity = '1';
                            ring.style.transform = 'scale(2.0)';
                            setTimeout(() => {
                                ring.style.opacity = '0';
                                ring.style.transform = 'scale(0.5)';
                            }, 200);
                        }
                    }, { passive: true });
                }
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', initCursor);
                } else {
                    initCursor();
                }
            })();
            """
            await ws.send(json.dumps({'id': 4, 'method': 'Page.addScriptToEvaluateOnNewDocument', 'params': {'source': cursor_script}}))
            await ws.recv()

            await ws.send(json.dumps({'id': 5, 'method': 'Runtime.evaluate', 'params': {'expression': cursor_script}}))
            await ws.recv()

            await ws.send(json.dumps({'id': 6, 'method': 'Runtime.evaluate', 'params': {'expression': 'document.title'}}))
            r6 = json.loads(await ws.recv())
            print('Initial Title:', r6['result']['result']['value'])

            # Find coordinates of 'Markets' link
            find_link = """
            (() => {
                const links = Array.from(document.querySelectorAll('a, button'));
                const m = links.find(el => el.textContent.trim() === 'Markets');
                if (!m) return null;
                const rect = m.getBoundingClientRect();
                return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
            })()
            """
            await ws.send(json.dumps({'id': 7, 'method': 'Runtime.evaluate', 'params': {'expression': find_link, 'returnByValue': True}}))
            r7 = json.loads(await ws.recv())
            coords = r7['result']['result']['value']
            print('Markets link coords:', coords)

            if coords:
                # Move mouse smoothly towards Markets link
                x0, y0 = 960, 540
                steps = 25
                for i in range(1, steps + 1):
                    cx = x0 + (coords['x'] - x0) * (i / steps)
                    cy = y0 + (coords['y'] - y0) * (i / steps)
                    await ws.send(json.dumps({'id': 100 + i, 'method': 'Input.dispatchMouseEvent', 'params': {'type': 'mouseMoved', 'x': cx, 'y': cy}}))
                    await ws.recv()
                    await asyncio.sleep(0.02)

                # Click mouse on link
                await ws.send(json.dumps({'id': 200, 'method': 'Input.dispatchMouseEvent', 'params': {'type': 'mousePressed', 'x': coords['x'], 'y': coords['y'], 'button': 'left', 'clickCount': 1}}))
                await ws.recv()
                await asyncio.sleep(0.05)
                await ws.send(json.dumps({'id': 201, 'method': 'Input.dispatchMouseEvent', 'params': {'type': 'mouseReleased', 'x': coords['x'], 'y': coords['y'], 'button': 'left', 'clickCount': 1}}))
                await ws.recv()

                # Wait for navigation & rendering
                await asyncio.sleep(2.0)
                await ws.send(json.dumps({'id': 202, 'method': 'Runtime.evaluate', 'params': {'expression': 'window.location.pathname'}}))
                r202 = json.loads(await ws.recv())
                print('New pathname after click:', r202['result']['result']['value'])

                # Capture screenshot
                await ws.send(json.dumps({'id': 203, 'method': 'Page.captureScreenshot', 'params': {'format': 'png'}}))
                r203 = json.loads(await ws.recv())
                img_data = base64.b64decode(r203['result']['data'])
                with open(r'video_production\test_nav_screenshot.png', 'wb') as f:
                    f.write(img_data)
                print('Screenshot saved! Size:', len(img_data))
    finally:
        chrome_proc.terminate()

if __name__ == '__main__':
    asyncio.run(test_navigation_and_cursor())
