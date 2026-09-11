import asyncio
import base64
import json
import os
import shutil
import subprocess
import time
import urllib.request
import wave
import numpy as np

FFMPEG_PATH = r"C:\Users\ankur\AppData\Roaming\Python\Python314\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe"
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
BASE_URL = "http://localhost:3000"
TOTAL_DURATION = 139.53  # Exact duration matching voice_master_v2.wav

class CDPClient:
    def __init__(self, ws_url):
        self.ws_url = ws_url
        self.ws = None
        self.msg_id = 0
        self.pending = {}
        self.reader_task = None

    async def connect(self):
        import websockets
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
        except asyncio.CancelledError:
            pass
        except Exception:
            pass

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

    async def evaluate(self, expr):
        res = await self.call("Runtime.evaluate", {
            "expression": expr,
            "returnByValue": True,
            "awaitPromise": True
        })
        return res.get("result", {}).get("result", {}).get("value")

    async def close(self):
        if self.reader_task:
            self.reader_task.cancel()
        if self.ws:
            await self.ws.close()


def ease_in_out(t):
    return 3 * t * t - 2 * t * t * t

def lerp(a, b, t):
    return a + (b - a) * t

def get_state_at_time(t):
    """
    Returns (x, y, scroll_y, click_action) for any time t in [0, TOTAL_DURATION].
    Every interaction corresponds to the approved 8 scenes.
    """
    # SCENE 1: (0.0 to 14.95) - Problem
    if t < 4.0:
        p = ease_in_out(t / 4.0)
        # Mouse glides from center to Somnia Telemetry badge / top header
        x = lerp(960, 520, p)
        y = lerp(540, 140, p)
        return x, y, 0, None
    elif t < 9.0:
        p = ease_in_out((t - 4.0) / 5.0)
        # Mouse glides down across Probability Sentiment gauge
        x = lerp(520, 560, p)
        y = lerp(140, 480, p)
        return x, y, 0, None
    elif t < 14.95:
        p = ease_in_out((t - 9.0) / 5.95)
        # Scroll down to reveal microprice, entropy, velocity cards
        scroll_y = int(lerp(0, 320, p))
        x = lerp(560, 620, p)
        y = lerp(480, 560, p)
        return x, y, scroll_y, None

    # SCENE 2: (14.95 to 33.26) - Solution & Intelligence Layer
    elif t < 20.0:
        p = ease_in_out((t - 14.95) / 5.05)
        # Mouse inspects Shannon Entropy & Information Velocity cards
        x = lerp(620, 480, p)
        y = lerp(560, 560, p)
        return x, y, 320, None
    elif t < 26.0:
        p = ease_in_out((t - 20.0) / 6.0)
        # Scroll back up to gauge & toggle BTC / ETH
        scroll_y = int(lerp(320, 0, p))
        x = lerp(480, 730, p)
        y = lerp(560, 105, p)
        return x, y, scroll_y, None
    elif t < 27.5:
        # Hover over ETH button
        return 730, 105, 0, None
    elif t < 33.26:
        p = ease_in_out((t - 27.5) / 5.76)
        # Glide towards sidebar 'Markets' navigation button (x=115, y=120)
        x = lerp(730, 115, p)
        y = lerp(105, 120, p)
        return x, y, 0, None

    # SCENE 3: (33.26 to 55.60) - Market Signal & Detail Inspection
    elif t < 34.0:
        # Arrive at Markets nav link
        return 115, 120, 0, None
    elif t < 34.8:
        # Click Markets button at t=34.0!
        return 115, 120, 0, "click_markets"
    elif t < 40.0:
        # On /markets page, let table load, move mouse to table header
        p = ease_in_out((t - 34.8) / 5.2)
        x = lerp(115, 450, p)
        y = lerp(120, 260, p)
        return x, y, 0, None
    elif t < 45.0:
        # Scroll down through the 319 active markets
        p = ease_in_out((t - 40.0) / 5.0)
        scroll_y = int(lerp(0, 350, p))
        x = lerp(450, 750, p)
        y = lerp(260, 360, p)
        return x, y, scroll_y, None
    elif t < 46.5:
        # Move cursor to 'Inspect ->' button on active contract row
        p = ease_in_out((t - 45.0) / 1.5)
        x = lerp(750, 850, p)
        y = lerp(360, 360, p)
        return x, y, 350, None
    elif t < 47.3:
        # Click Inspect button!
        return 850, 360, 350, "click_inspect"
    elif t < 51.0:
        # On /market/[id] detail page: hover over Probability Signal card
        p = ease_in_out((t - 47.3) / 3.7)
        x = lerp(850, 540, p)
        y = lerp(360, 300, p)
        return x, y, 0, None
    elif t < 55.60:
        # Scroll down to show orderbook depth and contract parameters
        p = ease_in_out((t - 51.0) / 4.6)
        scroll_y = int(lerp(0, 400, p))
        x = lerp(540, 600, p)
        y = lerp(300, 420, p)
        return x, y, scroll_y, None

    # SCENE 4: (55.60 to 69.92) - Second Layer: Predictor Reputation
    elif t < 57.0:
        # Move mouse to sidebar 'Leaderboard' link (x=115, y=160)
        p = ease_in_out((t - 55.60) / 1.4)
        x = lerp(600, 115, p)
        y = lerp(420, 160, p)
        return x, y, 0, None
    elif t < 57.8:
        # Click Leaderboard!
        return 115, 160, 0, "click_leaderboard"
    elif t < 64.0:
        # On /leaderboard: inspect Verifiable Reputation Methodology
        p = ease_in_out((t - 57.8) / 6.2)
        scroll_y = int(lerp(0, 280, p))
        x = lerp(115, 520, p)
        y = lerp(160, 320, p)
        return x, y, scroll_y, None
    elif t < 69.92:
        # Hover over quadratic scoring and rank indicators
        p = ease_in_out((t - 64.0) / 5.92)
        x = lerp(520, 700, p)
        y = lerp(320, 400, p)
        return x, y, 280, None

    # SCENE 5: (69.92 to 86.28) - Crowd vs Verified Predictor Divergence
    elif t < 71.5:
        # Move cursor to sidebar 'Overview' link (x=115, y=85)
        p = ease_in_out((t - 69.92) / 1.58)
        x = lerp(700, 115, p)
        y = lerp(400, 85, p)
        return x, y, 0, None
    elif t < 72.3:
        # Click Overview!
        return 115, 85, 0, "click_overview"
    elif t < 78.0:
        # On Overview: scroll down to Divergence Section (y=620)
        p = ease_in_out((t - 72.3) / 5.7)
        scroll_y = int(lerp(0, 620, p))
        x = lerp(115, 500, p)
        y = lerp(85, 450, p)
        return x, y, scroll_y, None
    elif t < 86.28:
        # Inspect Crowd vs Verified Predictor Divergence metrics
        p = ease_in_out((t - 78.0) / 8.28)
        x = lerp(500, 680, p)
        y = lerp(450, 520, p)
        return x, y, 620, None

    # SCENE 6: (86.28 to 106.91) - Reusable Developer Infrastructure & APIs
    elif t < 88.0:
        # Move to sidebar 'Developers' link (x=115, y=195)
        p = ease_in_out((t - 86.28) / 1.72)
        x = lerp(680, 115, p)
        y = lerp(520, 195, p)
        return x, y, 0, None
    elif t < 88.8:
        # Click Developers!
        return 115, 195, 0, "click_developers"
    elif t < 94.0:
        # On /developers: scroll down to Quick Start and RPC
        p = ease_in_out((t - 88.8) / 5.2)
        scroll_y = int(lerp(0, 550, p))
        x = lerp(115, 480, p)
        y = lerp(195, 340, p)
        return x, y, scroll_y, None
    elif t < 99.0:
        # Scroll to REST API Reference, move mouse to GET /api/markets tab
        p = ease_in_out((t - 94.0) / 5.0)
        scroll_y = int(lerp(550, 850, p))
        x = lerp(480, 420, p)
        y = lerp(340, 280, p)
        return x, y, scroll_y, None
    elif t < 99.8:
        # Click GET /api/markets tab!
        return 420, 280, 850, "click_api_markets"
    elif t < 106.91:
        # Scroll down to Solidity Smart Contract Interface
        p = ease_in_out((t - 99.8) / 7.11)
        scroll_y = int(lerp(850, 1250, p))
        x = lerp(420, 650, p)
        y = lerp(280, 450, p)
        return x, y, scroll_y, None

    # SCENE 7: (106.91 to 128.02) - Architecture: Event Contracts to Intelligence
    elif t < 108.5:
        # Move to sidebar 'Docs' link (x=115, y=230)
        p = ease_in_out((t - 106.91) / 1.59)
        x = lerp(650, 115, p)
        y = lerp(450, 230, p)
        return x, y, 0, None
    elif t < 109.3:
        # Click Docs!
        return 115, 230, 0, "click_docs"
    elif t < 117.0:
        # On /docs: scroll to Microstructure & Stoikov Microprice formula
        p = ease_in_out((t - 109.3) / 7.7)
        scroll_y = int(lerp(0, 420, p))
        x = lerp(115, 520, p)
        y = lerp(230, 360, p)
        return x, y, scroll_y, None
    elif t < 128.02:
        # Scroll to Latent Bayesian Probability Engine (CS-PROB-2.0) Kalman formulas
        p = ease_in_out((t - 117.0) / 11.02)
        scroll_y = int(lerp(420, 850, p))
        x = lerp(520, 650, p)
        y = lerp(360, 460, p)
        return x, y, scroll_y, None

    # SCENE 8: (128.02 to 139.53) - Closing: Structured, Measurable, Reusable
    elif t < 129.5:
        # Move to sidebar 'Overview' link (x=115, y=85)
        p = ease_in_out((t - 128.02) / 1.48)
        x = lerp(650, 115, p)
        y = lerp(460, 85, p)
        return x, y, 0, None
    elif t < 130.3:
        # Click Overview!
        return 115, 85, 0, "click_overview_final"
    else:
        # On Overview: return to hero view, smooth deceleration
        p = ease_in_out((t - 130.3) / (TOTAL_DURATION - 130.3))
        scroll_y = int(lerp(0, 0, p))
        x = lerp(115, 780, p)
        y = lerp(85, 420, p)
        return x, y, scroll_y, None


async def run_master_recording():
    frames_dir = os.path.abspath(r"video_production\demo_frames")
    if os.path.exists(frames_dir):
        shutil.rmtree(frames_dir)
    os.makedirs(frames_dir, exist_ok=True)

    profile_dir = os.path.abspath(r"video_production\chrome_live_profile")
    if os.path.exists(profile_dir):
        shutil.rmtree(profile_dir, ignore_errors=True)

    print(f"=== Starting Live Browser Recording for CrowdSignal ===", flush=True)
    print(f"Target Duration: {TOTAL_DURATION}s", flush=True)

    chrome_proc = subprocess.Popen([
        CHROME_PATH,
        "--headless=new",
        "--remote-debugging-port=9240",
        "--window-size=1920,1080",
        f"--user-data-dir={profile_dir}",
        "--disable-gpu",
        "--no-first-run",
        BASE_URL
    ])
    time.sleep(3)

    targets = None
    for attempt in range(12):
        try:
            res = urllib.request.urlopen("http://localhost:9240/json")
            targets = json.loads(res.read().decode())
            if targets:
                break
        except Exception:
            time.sleep(1.0)

    if not targets:
        chrome_proc.terminate()
        raise RuntimeError("Failed to connect to Chrome remote debugging port after 12 seconds")

    try:
        page_target = next(t for t in targets if t.get("type") == "page")
        ws_url = page_target["webSocketDebuggerUrl"]

        client = CDPClient(ws_url)
        await client.connect()
        await client.call("Page.enable")
        await client.call("Runtime.enable")

        # Custom cursor overlay script with smooth animation and glowing click ripple
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
                c.style.width = '28px';
                c.style.height = '28px';
                c.style.transform = 'translate(960px, 540px)';
                c.innerHTML = `
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.8)); transform: translate(-2px, -2px);">
                        <path d="M3 2L16.5 12.5L10 13.5L14.5 20L12 21L7.5 14.5L2.5 18V2Z" fill="#ffffff" stroke="#000000" stroke-width="1.6" stroke-linejoin="round"/>
                    </svg>
                    <div id="__cursor_ring__" style="position:absolute;top:2px;left:2px;width:28px;height:28px;border-radius:50%;border:2.5px solid #38bdf8;box-shadow: 0 0 12px #38bdf8;opacity:0;transform:scale(0.3);transition:all 0.25s ease-out;pointer-events:none;"></div>
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
                    ring.style.transform = 'scale(2.4)';
                    setTimeout(() => {
                        ring.style.opacity = '0';
                        ring.style.transform = 'scale(0.3)';
                    }, 240);
                }
            };
        })();
        """
        await client.call("Page.addScriptToEvaluateOnNewDocument", {"source": cursor_script})
        await client.evaluate(cursor_script)

        # Warm-up pause: wait for fonts and initial layout
        await client.evaluate("document.fonts.ready")
        await asyncio.sleep(2.0)

        # Pre-query navigation links coordinates
        print("Pre-warming navigation routes...")
        t_start = time.time()
        frame_idx = 0
        executed_actions = set()

        last_status_print = 0

        while True:
            t = time.time() - t_start
            if t >= TOTAL_DURATION:
                break

            x, y, scroll_y, action = get_state_at_time(t)

            # Check if an action needs to be triggered
            if action and action not in executed_actions:
                executed_actions.add(action)
                print(f"[t={t:5.1f}s] Triggering action: {action}")
                # Trigger click ripple
                await client.evaluate("window.__clickCursor()")

                if action == "click_markets":
                    await client.evaluate("document.querySelector('a[href=\"/markets\"]').click()")
                elif action == "click_inspect":
                    # Click inspect button on the first active market row
                    await client.evaluate("""
                        (() => {
                            const btn = document.querySelector('tbody tr a[href^="/market/"], a[href^="/market/"]');
                            if (btn) btn.click();
                        })()
                    """)
                elif action == "click_leaderboard":
                    await client.evaluate("document.querySelector('a[href=\"/leaderboard\"]').click()")
                elif action == "click_overview":
                    await client.evaluate("document.querySelector('a[href=\"/\"]').click()")
                elif action == "click_developers":
                    await client.evaluate("document.querySelector('a[href=\"/developers\"]').click()")
                elif action == "click_api_markets":
                    await client.evaluate("""
                        (() => {
                            const btns = Array.from(document.querySelectorAll('button'));
                            const b = btns.find(el => el.textContent.includes('/api/markets'));
                            if (b) b.click();
                        })()
                    """)
                elif action == "click_docs":
                    await client.evaluate("document.querySelector('a[href=\"/docs\"]').click()")
                elif action == "click_overview_final":
                    await client.evaluate("document.querySelector('a[href=\"/\"]').click()")

            # Update browser cursor and scroll
            await client.evaluate(f"window.scrollTo(0, {scroll_y}); window.__moveCursor({x:.1f}, {y:.1f});")

            # Capture frame
            snap = await client.call("Page.captureScreenshot", {"format": "jpeg", "quality": 80})
            if snap and "result" in snap and "data" in snap["result"]:
                img_data = base64.b64decode(snap["result"]["data"])
                frame_path = os.path.join(frames_dir, f"frame_{frame_idx:05d}.jpg")
                with open(frame_path, "wb") as f:
                    f.write(img_data)
                frame_idx += 1

            # Progress log every 10 seconds
            if t - last_status_print >= 10.0:
                last_status_print = t
                fps_est = frame_idx / t if t > 0 else 0
                print(f"Recorded {t:5.1f}s / {TOTAL_DURATION:.1f}s | Frames: {frame_idx} ({fps_est:.1f} FPS)", flush=True)

        elapsed_total = time.time() - t_start
        print(f"\nRecording completed! Captured {frame_idx} frames in {elapsed_total:.2f}s.", flush=True)
        fps = frame_idx / TOTAL_DURATION
        print(f"Calculated playback FPS: {fps:.3f}", flush=True)

        await client.close()
    finally:
        chrome_proc.terminate()

    # Step 2: Compile video with FFmpeg
    print("\n=== Compiling Final MP4 Video with FFmpeg ===", flush=True)
    final_output = r"c:\Users\ankur\OneDrive\Desktop\Crowd Signal\crowdsignal_hackathon_demo.mp4"
    audio_file = r"video_production\final_mixed_audio.wav"
    captions_file = r"captions_v2.srt"

    # We run ffmpeg from video_production directory so captions_v2.srt has no path escaping issues
    compile_cmd = [
        FFMPEG_PATH,
        "-y",
        "-framerate", f"{fps:.4f}",
        "-i", r"demo_frames\frame_%05d.jpg",
        "-i", r"final_mixed_audio.wav",
        "-vf", "subtitles=captions_v2.srt:force_style='FontSize=17,FontName=Inter,PrimaryColour=&H00FFFFFF,OutlineColour=&H90000000,BackColour=&H40000000,BorderStyle=4,Outline=1.2,Shadow=1.0,MarginV=26'",
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "19",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        final_output
    ]

    print("Running FFmpeg compilation...")
    compile_res = subprocess.run(compile_cmd, cwd=r"c:\Users\ankur\OneDrive\Desktop\Crowd Signal\video_production", capture_output=True, text=True)
    if compile_res.returncode != 0:
        print("FFmpeg error:", compile_res.stderr)
        raise RuntimeError("FFmpeg compilation failed")

    print(f"Successfully generated final video at:\n  {final_output}")
    size_mb = os.path.getsize(final_output) / (1024 * 1024)
    print(f"File size: {size_mb:.2f} MB")

    # Copy to artifacts directory
    artifact_path = r"C:\Users\ankur\.gemini\antigravity-ide\brain\88476750-a323-468b-9534-b238b93f4369\crowdsignal_hackathon_demo.mp4"
    shutil.copyfile(final_output, artifact_path)
    print(f"Copied to artifact directory:\n  {artifact_path}")

if __name__ == "__main__":
    asyncio.run(run_master_recording())
