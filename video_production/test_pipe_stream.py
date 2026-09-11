import asyncio
import base64
import json
import subprocess
import time
import urllib.request
from test_cdp_client import CDPClient

FFMPEG_PATH = r"C:\Users\ankur\AppData\Roaming\Python\Python314\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe"

async def test_pipe_stream():
    profile_dir = r'C:\Users\ankur\OneDrive\Desktop\Crowd Signal\video_production\test_cdp_profile'
    chrome_proc = subprocess.Popen([
        r'C:\Program Files\Google\Chrome\Application\chrome.exe',
        '--headless=new',
        '--remote-debugging-port=9234',
        '--window-size=1920,1080',
        f'--user-data-dir={profile_dir}',
        '--disable-gpu',
        '--no-first-run',
        'http://localhost:3000'
    ])
    time.sleep(2)
    
    # Start ffmpeg listening on stdin pipe
    out_video = r'video_production\test_live_stream.mp4'
    ffmpeg_cmd = [
        FFMPEG_PATH,
        "-y",
        "-f", "image2pipe",
        "-vcodec", "mjpeg",
        "-r", "20",
        "-i", "-",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "veryfast",
        out_video
    ]
    ffmpeg_proc = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)

    try:
        res = urllib.request.urlopen('http://localhost:9234/json')
        targets = json.loads(res.read().decode())
        page_target = next(t for t in targets if t.get('type') == 'page')
        ws_url = page_target['webSocketDebuggerUrl']
        
        client = CDPClient(ws_url)
        await client.connect()
        await client.call('Page.enable')
        await client.call('Runtime.enable')

        # Inject visible cursor overlay
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
            c.style.transform = 'translate(960px, 540px)';
            c.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="filter: drop-shadow(0 2px 5px rgba(0,0,0,0.7)); transform: translate(-2px, -2px);">
                    <path d="M3 2L16.5 12.5L10 13.5L14.5 20L12 21L7.5 14.5L2.5 18V2Z" fill="#ffffff" stroke="#090d16" stroke-width="1.6" stroke-linejoin="round"/>
                </svg>
                <div id="__cursor_ring__" style="position:absolute;top:2px;left:2px;width:24px;height:24px;border-radius:50%;border:2px solid #38bdf8;opacity:0;transform:scale(0.5);transition:all 0.25s ease-out;pointer-events:none;"></div>
            `;
            document.documentElement.appendChild(c);

            window.__moveCursor = function(x, y) {
                c.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
            };

            window.__clickCursor = function() {
                const ring = document.getElementById('__cursor_ring__');
                if (ring) {
                    ring.style.opacity = '1';
                    ring.style.transform = 'scale(2.2)';
                    setTimeout(() => {
                        ring.style.opacity = '0';
                        ring.style.transform = 'scale(0.5)';
                    }, 220);
                }
            };
        })();
        """
        await client.call("Page.addScriptToEvaluateOnNewDocument", {"source": cursor_script})
        await client.evaluate(cursor_script)

        print("Starting capture loop and interaction...")
        frames_captured = 0
        t0 = time.time()
        
        # We run a 5 second demo: moving cursor from center to navbar, clicking Markets, scrolling
        target_duration = 5.0
        while time.time() - t0 < target_duration:
            elapsed = time.time() - t0
            
            # Animate cursor
            if elapsed < 2.0:
                progress = elapsed / 2.0
                cx = 960 + (120 - 960) * progress
                cy = 540 + (120 - 540) * progress
                await client.evaluate(f"window.__moveCursor({cx}, {cy})")
                await client.call("Input.dispatchMouseEvent", {"type": "mouseMoved", "x": cx, "y": cy})
            elif elapsed < 2.5:
                # Click
                if elapsed < 2.1:
                    await client.evaluate("window.__clickCursor()")
                    await client.evaluate('document.querySelector(\'a[href="/markets"]\').click()')
            else:
                # Scroll
                await client.evaluate("window.scrollBy({ top: 15, behavior: 'auto' })")

            # Capture frame
            snap = await client.call("Page.captureScreenshot", {"format": "jpeg", "quality": 75})
            if snap and "result" in snap and "data" in snap["result"]:
                jpg_bytes = base64.b64decode(snap["result"]["data"])
                ffmpeg_proc.stdin.write(jpg_bytes)
                frames_captured += 1

        print(f"Captured {frames_captured} frames in {time.time() - t0:.2f}s!")
        ffmpeg_proc.stdin.close()
        ffmpeg_proc.wait()
        print("FFmpeg video generated successfully!")
        await client.close()
    finally:
        chrome_proc.terminate()

if __name__ == '__main__':
    asyncio.run(test_pipe_stream())
