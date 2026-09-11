import asyncio
import base64
import json
import subprocess
import time
import urllib.request
import websockets

class CDPClient:
    def __init__(self, ws_url):
        self.ws_url = ws_url
        self.ws = None
        self.msg_id = 0
        self.pending = {}
        self.event_handlers = {}
        self.reader_task = None

    async def connect(self):
        self.ws = await websockets.connect(self.ws_url, max_size=50 * 1024 * 1024)
        self.reader_task = asyncio.create_task(self._reader())

    async def _reader(self):
        try:
            async for raw in self.ws:
                msg = json.loads(raw)
                if "id" in msg and msg["id"] in self.pending:
                    fut = self.pending.pop(msg["id"])
                    if not fut.done():
                        fut.set_result(msg)
                elif "method" in msg:
                    method = msg["method"]
                    if method in self.event_handlers:
                        for handler in self.event_handlers[method]:
                            asyncio.create_task(handler(msg.get("params", {})))
        except asyncio.CancelledError:
            pass
        except Exception as e:
            print("CDP reader error:", e)

    def on(self, event, handler):
        if event not in self.event_handlers:
            self.event_handlers[event] = []
        self.event_handlers[event].append(handler)

    async def call(self, method, params=None):
        self.msg_id += 1
        curr_id = self.msg_id
        fut = asyncio.get_event_loop().create_future()
        self.pending[curr_id] = fut
        payload = {"id": curr_id, "method": method}
        if params:
            payload["params"] = params
        await self.ws.send(json.dumps(payload))
        return await fut

    async def evaluate(self, expr, return_by_value=True):
        res = await self.call("Runtime.evaluate", {
            "expression": expr,
            "returnByValue": return_by_value,
            "awaitPromise": True
        })
        return res.get("result", {}).get("result", {}).get("value")

    async def close(self):
        if self.reader_task:
            self.reader_task.cancel()
        if self.ws:
            await self.ws.close()

async def main():
    profile_dir = r'C:\Users\ankur\OneDrive\Desktop\Crowd Signal\video_production\test_cdp_profile'
    chrome_proc = subprocess.Popen([
        r'C:\Program Files\Google\Chrome\Application\chrome.exe',
        '--headless=new',
        '--remote-debugging-port=9228',
        '--window-size=1920,1080',
        f'--user-data-dir={profile_dir}',
        '--disable-gpu',
        '--no-first-run',
        'http://localhost:3000'
    ])
    time.sleep(2)
    try:
        res = urllib.request.urlopen('http://localhost:9228/json')
        targets = json.loads(res.read().decode())
        page_target = next(t for t in targets if t.get('type') == 'page')
        ws_url = page_target['webSocketDebuggerUrl']
        
        client = CDPClient(ws_url)
        await client.connect()
        await client.call("Page.enable")
        await client.call("Runtime.enable")
        await client.call("DOM.enable")

        title = await client.evaluate("document.title")
        print("Page Title:", title)
        pathname = await client.evaluate("window.location.pathname")
        print("Current Path:", pathname)

        # Inject mouse cursor
        cursor_script = """
        (function() {
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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6)); transform: translate(-2px, -2px);">
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
                    ring.style.transform = 'scale(2.2)';
                    setTimeout(() => {
                        ring.style.opacity = '0';
                        ring.style.transform = 'scale(0.5)';
                    }, 220);
                }
            }, { passive: true });
        })();
        """
        await client.call("Page.addScriptToEvaluateOnNewDocument", {"source": cursor_script})
        await client.evaluate(cursor_script)

        # Find "Markets" link
        find_link = """
        (() => {
            const links = Array.from(document.querySelectorAll('a, button'));
            const m = links.find(el => el.textContent.trim() === 'Markets');
            if (!m) return null;
            const rect = m.getBoundingClientRect();
            return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        })()
        """
        coords = await client.evaluate(find_link)
        print("Markets link coords:", coords)

        if coords:
            # Move cursor smoothly
            x0, y0 = 960, 540
            steps = 25
            for i in range(1, steps + 1):
                cx = x0 + (coords['x'] - x0) * (i / steps)
                cy = y0 + (coords['y'] - y0) * (i / steps)
                await client.call("Input.dispatchMouseEvent", {"type": "mouseMoved", "x": cx, "y": cy})
                await asyncio.sleep(0.02)

            # Click
            await client.call("Input.dispatchMouseEvent", {"type": "mousePressed", "x": coords['x'], "y": coords['y'], "button": "left", "clickCount": 1})
            await asyncio.sleep(0.08)
            await client.call("Input.dispatchMouseEvent", {"type": "mouseReleased", "x": coords['x'], "y": coords['y'], "button": "left", "clickCount": 1})

            # Wait for route
            await asyncio.sleep(2.0)
            new_path = await client.evaluate("window.location.pathname")
            print("New Path after click:", new_path)

            # Capture screenshot
            snap = await client.call("Page.captureScreenshot", {"format": "png"})
            img_bytes = base64.b64decode(snap["result"]["data"])
            with open(r'video_production\test_nav_screenshot.png', 'wb') as f:
                f.write(img_bytes)
            print("Saved screenshot, size:", len(img_bytes))

        await client.close()
    finally:
        chrome_proc.terminate()

if __name__ == '__main__':
    asyncio.run(main())
