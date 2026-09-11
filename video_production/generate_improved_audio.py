import asyncio
import os
import json
import subprocess
import edge_tts
import imageio_ffmpeg

# EXACT wording from approved script - strictly preserved
SEGMENTS = [
    {
        "id": "scene1_problem",
        # Exact words: "Prediction markets contain a valuable source of information: what people collectively believe will happen next. But that information is fragmented across markets and difficult to use outside the market interface."
        "spoken_text": (
            "Prediction markets contain a valuable source of information: "
            "what people collectively believe will happen next.\n\n"
            "But that information is fragmented across markets, "
            "and difficult to use outside the market interface."
        ),
        "display_text": (
            "Prediction markets contain a valuable source of information: "
            "what people collectively believe will happen next. "
            "But that information is fragmented across markets and difficult to use outside the market interface."
        )
    },
    {
        "id": "scene2_solution",
        # Exact words: "Developers, protocols, DAOs and AI agents need more than raw predictions. They need structured, measurable and verifiable intelligence. This is CrowdSignal. CrowdSignal is the intelligence layer for DreamDEX Event Contracts on Somnia."
        "spoken_text": (
            "Developers, protocols, DAOs, and AI agents need more than raw predictions.\n"
            "They need structured, measurable, and verifiable intelligence.\n\n"
            "This is CrowdSignal.\n\n"
            "CrowdSignal is the intelligence layer for DreamDEX Event Contracts on Somnia."
        ),
        "display_text": (
            "Developers, protocols, DAOs and AI agents need more than raw predictions. "
            "They need structured, measurable and verifiable intelligence. "
            "This is CrowdSignal. CrowdSignal is the intelligence layer for DreamDEX Event Contracts on Somnia."
        )
    },
    {
        "id": "scene3_market_signal",
        # Exact words: "It transforms Event Contract activity into live crowd intelligence, predictor reputation, divergence signals and reusable developer infrastructure. The first layer is the CrowdSignal market signal. Instead of simply displaying a market, CrowdSignal processes market activity into an interpretable probability signal."
        "spoken_text": (
            "It transforms Event Contract activity into live crowd intelligence, "
            "predictor reputation, divergence signals, and reusable developer infrastructure.\n\n"
            "The first layer is the CrowdSignal market signal.\n\n"
            "Instead of simply displaying a market, "
            "CrowdSignal processes market activity into an interpretable probability signal."
        ),
        "display_text": (
            "It transforms Event Contract activity into live crowd intelligence, predictor reputation, divergence signals and reusable developer infrastructure. "
            "The first layer is the CrowdSignal market signal. Instead of simply displaying a market, CrowdSignal processes market activity into an interpretable probability signal."
        )
    },
    {
        "id": "scene4_reputation",
        # Exact words: "The second layer is prediction reputation. CrowdSignal tracks prediction history and evaluates performance as markets resolve, allowing historically stronger predictors to be distinguished from the broader crowd."
        "spoken_text": (
            "The second layer is prediction reputation.\n\n"
            "CrowdSignal tracks prediction history and evaluates performance as markets resolve, "
            "allowing historically stronger predictors to be distinguished from the broader crowd."
        ),
        "display_text": (
            "The second layer is prediction reputation. "
            "CrowdSignal tracks prediction history and evaluates performance as markets resolve, allowing historically stronger predictors to be distinguished from the broader crowd."
        )
    },
    {
        "id": "scene5_divergence",
        # Exact words: "This enables another important signal: crowd consensus versus verified predictor consensus. Instead of asking only what the crowd believes, CrowdSignal can identify when historically stronger predictors disagree with that crowd."
        "spoken_text": (
            "This enables another important signal: "
            "crowd consensus versus verified predictor consensus.\n\n"
            "Instead of asking only what the crowd believes, "
            "CrowdSignal can identify when historically stronger predictors disagree with that crowd."
        ),
        "display_text": (
            "This enables another important signal: crowd consensus versus verified predictor consensus. "
            "Instead of asking only what the crowd believes, CrowdSignal can identify when historically stronger predictors disagree with that crowd."
        )
    },
    {
        "id": "scene6_developers",
        # Exact words: "But CrowdSignal is not only a dashboard. Its real purpose is to make this intelligence reusable. Developers can consume CrowdSignal through APIs and on-chain feeds instead of independently building market discovery, data processing, probability calculations, reputation systems and analytics."
        "spoken_text": (
            "But CrowdSignal is not only a dashboard.\n\n"
            "Its real purpose is to make this intelligence reusable.\n\n"
            "Developers can consume CrowdSignal through APIs and on-chain feeds, "
            "instead of independently building market discovery, data processing, "
            "probability calculations, reputation systems, and analytics."
        ),
        "display_text": (
            "But CrowdSignal is not only a dashboard. Its real purpose is to make this intelligence reusable. "
            "Developers can consume CrowdSignal through APIs and on-chain feeds instead of independently building market discovery, data processing, probability calculations, reputation systems and analytics."
        )
    },
    {
        "id": "scene7_architecture",
        # Exact words: "The architecture is simple: DreamDEX Event Contracts generate activity. CrowdSignal indexes and processes that activity. The analytics layer transforms it into intelligence. And that intelligence becomes available to applications, protocols, DAOs and AI agents."
        "spoken_text": (
            "The architecture is simple:\n\n"
            "DreamDEX Event Contracts generate activity.\n"
            "CrowdSignal indexes and processes that activity.\n"
            "The analytics layer transforms it into intelligence.\n\n"
            "And that intelligence becomes available to applications, protocols, DAOs, and AI agents."
        ),
        "display_text": (
            "The architecture is simple: DreamDEX Event Contracts generate activity. "
            "CrowdSignal indexes and processes that activity. The analytics layer transforms it into intelligence. "
            "And that intelligence becomes available to applications, protocols, DAOs and AI agents."
        )
    },
    {
        "id": "scene8_closing",
        # Exact words: "Prediction markets already contain collective intelligence. CrowdSignal makes that intelligence structured, measurable, verifiable and reusable."
        "spoken_text": (
            "Prediction markets already contain collective intelligence.\n\n"
            "CrowdSignal makes that intelligence structured, measurable, verifiable, and reusable."
        ),
        "display_text": (
            "Prediction markets already contain collective intelligence. "
            "CrowdSignal makes that intelligence structured, measurable, verifiable and reusable."
        )
    }
]

# Calm, warm, grounded male engineer voice
VOICE = "en-US-BrianMultilingualNeural"
RATE = "-6%"
PITCH = "+0Hz"
SCENE_PAUSE_SEC = 1.05  # Natural pause between major scenes for thoughtful pacing

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

def get_duration(audio_path):
    cmd = [ffmpeg_exe, "-i", audio_path, "-hide_banner"]
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

async def generate_improved_voice():
    print(f"Generating improved human voiceover using {VOICE} at rate {RATE}...")
    os.makedirs("video_production/audio_v2", exist_ok=True)
    
    timing_data = []
    current_time = 0.0
    
    for i, seg in enumerate(SEGMENTS):
        out_mp3 = f"video_production/audio_v2/{seg['id']}.mp3"
        comm = edge_tts.Communicate(seg["spoken_text"], VOICE, rate=RATE, pitch=PITCH)
        await comm.save(out_mp3)
        dur = get_duration(out_mp3)
        
        start_t = current_time
        speech_end_t = start_t + dur
        scene_end_t = speech_end_t + SCENE_PAUSE_SEC
        
        timing_data.append({
            "index": i + 1,
            "id": seg["id"],
            "display_text": seg["display_text"],
            "spoken_text": seg["spoken_text"],
            "audio_file": out_mp3,
            "speech_start": start_t,
            "speech_end": speech_end_t,
            "scene_duration": dur + SCENE_PAUSE_SEC,
            "scene_start": current_time,
            "scene_end": scene_end_t
        })
        current_time = scene_end_t
        print(f"[{seg['id']}] Speech: {dur:.2f}s | Scene Duration: {dur + SCENE_PAUSE_SEC:.2f}s | Total: {current_time:.2f}s")
        
    print(f"\n==========================================")
    print(f"Total Video Duration: {current_time:.2f} seconds ({int(current_time//60)}m {int(current_time%60)}s)")
    print(f"Target Window: 2:00 to 3:00 (Target ~2:30)")
    print(f"==========================================")
    
    with open("video_production/timing_v2.json", "w", encoding="utf-8") as f:
        json.dump(timing_data, f, indent=2)
        
    # Generate Synchronized Subtitles (SRT) matching display text exactly
    srt_entries = []
    for item in timing_data:
        sentences = [s.strip() for s in item["display_text"].split(". ") if s.strip()]
        total_chars = sum(len(s) for s in sentences)
        seg_dur = item["speech_end"] - item["speech_start"]
        
        cursor = item["speech_start"]
        for sentence in sentences:
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
            
    with open("video_production/captions_v2.srt", "w", encoding="utf-8") as f:
        for idx, sub in enumerate(srt_entries, 1):
            f.write(f"{idx}\n")
            f.write(f"{format_srt_time(sub['start'])} --> {format_srt_time(sub['end'])}\n")
            f.write(f"{sub['text']}\n\n")
            
    print("Generated video_production/timing_v2.json and video_production/captions_v2.srt successfully!")

if __name__ == "__main__":
    asyncio.run(generate_improved_voice())
