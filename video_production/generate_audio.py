import asyncio
import os
import json
import subprocess
import edge_tts
import imageio_ffmpeg

SEGMENTS = [
    {
        "id": "scene1_problem",
        "text": "Prediction markets contain a valuable source of information: what people collectively believe will happen next. But that information is fragmented across markets and difficult to use outside the market interface."
    },
    {
        "id": "scene2_solution",
        "text": "Developers, protocols, DAOs and AI agents need more than raw predictions. They need structured, measurable and verifiable intelligence. This is CrowdSignal. CrowdSignal is the intelligence layer for DreamDEX Event Contracts on Somnia."
    },
    {
        "id": "scene3_market_signal",
        "text": "It transforms Event Contract activity into live crowd intelligence, predictor reputation, divergence signals and reusable developer infrastructure. The first layer is the CrowdSignal market signal. Instead of simply displaying a market, CrowdSignal processes market activity into an interpretable probability signal."
    },
    {
        "id": "scene4_reputation",
        "text": "The second layer is prediction reputation. CrowdSignal tracks prediction history and evaluates performance as markets resolve, allowing historically stronger predictors to be distinguished from the broader crowd."
    },
    {
        "id": "scene5_divergence",
        "text": "This enables another important signal: crowd consensus versus verified predictor consensus. Instead of asking only what the crowd believes, CrowdSignal can identify when historically stronger predictors disagree with that crowd."
    },
    {
        "id": "scene6_developers",
        "text": "But CrowdSignal is not only a dashboard. Its real purpose is to make this intelligence reusable. Developers can consume CrowdSignal through APIs and on-chain feeds instead of independently building market discovery, data processing, probability calculations, reputation systems and analytics."
    },
    {
        "id": "scene7_architecture",
        "text": "The architecture is simple: DreamDEX Event Contracts generate activity. CrowdSignal indexes and processes that activity. The analytics layer transforms it into intelligence. And that intelligence becomes available to applications, protocols, DAOs and AI agents."
    },
    {
        "id": "scene8_closing",
        "text": "Prediction markets already contain collective intelligence. CrowdSignal makes that intelligence structured, measurable, verifiable and reusable."
    }
]

VOICE = "en-US-ChristopherNeural"
RATE = "-3%"
PAUSE_SEC = 0.8  # Natural transition pause between scenes

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

def get_duration(audio_path):
    cmd = [
        ffmpeg_exe,
        "-i", audio_path,
        "-hide_banner"
    ]
    res = subprocess.run(cmd, stderr=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
    for line in res.stderr.splitlines():
        if "Duration:" in line:
            parts = line.split("Duration:")[1].split(",")[0].strip()
            h, m, s = parts.split(":")
            return float(h) * 3600 + float(m) * 60 + float(s)
    return 0.0

def format_srt_time(seconds):
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int(round((seconds - int(seconds)) * 1000))
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

async def generate_all():
    print("Synthesizing narration with edge-tts...")
    os.makedirs("video_production/audio", exist_ok=True)
    
    timing_data = []
    current_time = 0.0
    
    for i, seg in enumerate(SEGMENTS):
        out_mp3 = f"video_production/audio/{seg['id']}.mp3"
        comm = edge_tts.Communicate(seg["text"], VOICE, rate=RATE)
        await comm.save(out_mp3)
        dur = get_duration(out_mp3)
        
        start_t = current_time
        end_t = start_t + dur
        scene_end_t = end_t + PAUSE_SEC
        
        timing_data.append({
            "index": i + 1,
            "id": seg["id"],
            "text": seg["text"],
            "audio_file": out_mp3,
            "speech_start": start_t,
            "speech_end": end_t,
            "scene_duration": dur + PAUSE_SEC,
            "scene_start": current_time,
            "scene_end": scene_end_t
        })
        current_time = scene_end_t
        print(f"[{seg['id']}] Speech Duration: {dur:.2f}s | Scene End: {current_time:.2f}s")
        
    print(f"\nTotal Planned Video Duration: {current_time:.2f}s ({int(current_time//60)}m {int(current_time%60)}s)")
    
    with open("video_production/timing.json", "w", encoding="utf-8") as f:
        json.dump(timing_data, f, indent=2)
        
    # Generate Subtitles SRT
    srt_entries = []
    for item in timing_data:
        # Split text into readable 1-2 sentence subtitle chunks
        sentences = [s.strip() for s in item["text"].split(". ") if s.strip()]
        total_chars = sum(len(s) for s in sentences)
        seg_dur = item["speech_end"] - item["speech_start"]
        
        cursor = item["speech_start"]
        for s_idx, sentence in enumerate(sentences):
            if not sentence.endswith("."):
                sentence += "."
            s_len = len(sentence)
            s_dur = (s_len / total_chars) * seg_dur
            s_end = cursor + s_dur
            
            srt_entries.append({
                "start": cursor,
                "end": s_end,
                "text": sentence
            })
            cursor = s_end
            
    with open("video_production/captions.srt", "w", encoding="utf-8") as f:
        for idx, sub in enumerate(srt_entries, 1):
            f.write(f"{idx}\n")
            f.write(f"{format_srt_time(sub['start'])} --> {format_srt_time(sub['end'])}\n")
            f.write(f"{sub['text']}\n\n")
            
    print("Generated video_production/timing.json and video_production/captions.srt successfully!")

if __name__ == "__main__":
    asyncio.run(generate_all())
