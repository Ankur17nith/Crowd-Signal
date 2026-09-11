import subprocess
import time
import urllib.request
import json
import os
import shutil
import asyncio
import websockets
import base64

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
CDP_PORT = 9224

SCENES = [
    {
        "id": "scene1_problem",
        "url": "http://localhost:3000/",
        "scroll_y": 0,
        "wait_s": 4.0,
        "desc": "CrowdSignal Terminal Hero & Branding"
    },
    {
        "id": "scene2_solution",
        "url": "http://localhost:3000/",
        "scroll_y": 140,
        "wait_s": 3.0,
        "desc": "Probabilistic Sentiment Overview & Regime"
    },
    {
        "id": "scene3_market_signal",
        "url": "http://localhost:3000/",
        "scroll_y": 420,
        "wait_s": 3.0,
        "desc": "Microstructure Engine & Active Markets"
    },
    {
        "id": "scene4_reputation",
        "url": "http://localhost:3000/leaderboard",
        "scroll_y": 0,
        "wait_s": 3.0,
        "desc": "Predictor Reputation & Brier Calibration"
    },
    {
        "id": "scene5_divergence",
        "url": "http://localhost:3000/",
        "scroll_y": 280,
        "wait_s": 3.0,
        "desc": "Crowd vs Verified Predictor Divergence"
    },
    {
        "id": "scene6_developers",
        "url": "http://localhost:3000/developers",
        "scroll_y": 240,
        "wait_s": 3.0,
        "desc": "Developer Infrastructure & API Reference"
    },
    {
        "id": "scene7_architecture",
        "url": "http://localhost:3000/docs",
        "scroll_y": 550,
        "wait_s": 3.0,
        "desc": "Pipeline Execution & Research Architecture"
    },
    {
        "id": "scene8_closing",
        "url": "http://localhost:3000/",
        "scroll_y": 0,
        "wait_s": 3.0,
        "desc": "Vision & Closing Terminal View"
    }
]

async def capture_all_scenes():
    os.makedirs("video_production/scenes", exist_ok=True)
    user_data = os.path.abspath("video_production/chrome_profile")
    if os.path.exists(user_data):
        shutil.rmtree(user_data, ignore_errors=True)

    proc = subprocess.Popen([
        CHROME_PATH,
        "--headless=new",
        "--disable-gpu",
        f"--user-data-dir={user_data}",
        f"--remote-debugging-port={CDP_PORT}",
        "--window-size=1920,1080",
        "about:blank"
    ])
    await asyncio.sleep(2.0)
    
    try:
        with urllib.request.urlopen(f"http://127.0.0.1:{CDP_PORT}/json") as r:
            targets = json.loads(r.read().decode())
        page_target = next(t for t in targets if t.get("type") == "page")
        ws_url = page_target["webSocketDebuggerUrl"]
        
        async with websockets.connect(ws_url, max_size=25*1024*1024) as ws:
            msg_id = 1
            async def send_cmd(method, params=None):
                nonlocal msg_id
                msg_id += 1
                req = {"id": msg_id, "method": method, "params": params or {}}
                await ws.send(json.dumps(req))
                while True:
                    data = json.loads(await ws.recv())
                    if data.get("id") == msg_id:
                        return data.get("result", {})

            await send_cmd("Page.enable")
            await send_cmd("Emulation.setDeviceMetricsOverride", {
                "width": 1920,
                "height": 1080,
                "deviceScaleFactor": 1,
                "mobile": False
            })
            
            for item in SCENES:
                print(f"Navigating to {item['url']} for {item['id']} ({item['desc']})...")
                await send_cmd("Page.navigate", {"url": item["url"]})
                await asyncio.sleep(item["wait_s"])
                
                if item["scroll_y"] > 0:
                    await send_cmd("Runtime.evaluate", {
                        "expression": f"window.scrollTo({{ top: {item['scroll_y']}, behavior: 'instant' }});"
                    })
                    await asyncio.sleep(0.6)
                    
                res = await send_cmd("Page.captureScreenshot", {"format": "png"})
                img_bytes = base64.b64decode(res["data"])
                out_path = f"video_production/scenes/{item['id']}.png"
                with open(out_path, "wb") as f:
                    f.write(img_bytes)
                print(f"-> Captured {out_path} ({len(img_bytes)} bytes)")
                
    finally:
        proc.kill()
        print("Scene capture complete. Chrome terminated.")

if __name__ == "__main__":
    asyncio.run(capture_all_scenes())
