import json
import os
import subprocess
import shutil
import imageio_ffmpeg

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

def run_cmd(cmd, desc=""):
    print(f"Running: {desc}...")
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        print(f"Error in {desc}:")
        print(res.stderr[-500:])
        raise RuntimeError(f"FFmpeg command failed: {desc}")
    return res

def build_video():
    with open("video_production/timing_v2.json", "r", encoding="utf-8") as f:
        timing = json.load(f)

    os.makedirs("video_production/clips_v2", exist_ok=True)
    os.makedirs("video_production/audio_v2_padded", exist_ok=True)
    
    # 1. Build speech + pause audio clips
    padded_audio_files = []
    for seg in timing:
        padded_path = f"video_production/audio_v2_padded/{seg['id']}_padded.wav"
        pad_duration = seg["scene_duration"]
        cmd = [
            ffmpeg_exe, "-y",
            "-i", seg["audio_file"],
            "-af", f"apad=whole_dur={pad_duration}",
            padded_path
        ]
        run_cmd(cmd, f"Pad audio for {seg['id']}")
        padded_audio_files.append(padded_path)
        
    # Concat all padded audios into master voiceover
    with open("video_production/padded_concat_v2.txt", "w", encoding="utf-8") as f:
        for p in padded_audio_files:
            f.write(f"file '{os.path.abspath(p).replace(os.sep, '/')}'\n")
            
    voice_master = "video_production/voice_master_v2.wav"
    cmd = [
        ffmpeg_exe, "-y",
        "-f", "concat", "-safe", "0",
        "-i", "video_production/padded_concat_v2.txt",
        "-c", "pcm_s16le",
        voice_master
    ]
    run_cmd(cmd, "Concat voice master v2")
    
    # 2. Mix voiceover with subtle background ambient
    mixed_audio = "video_production/mixed_audio_v2.aac"
    cmd = [
        ffmpeg_exe, "-y",
        "-i", voice_master,
        "-i", "video_production/background_ambient.wav",
        "-filter_complex",
        "[1:a]volume=0.18[bg];[0:a][bg]amix=inputs=2:duration=first:dropout_transition=2[out]",
        "-map", "[out]",
        "-c:a", "aac", "-b:a", "192k",
        mixed_audio
    ]
    run_cmd(cmd, "Mix voice and ambient music")
    
    # 3. Create video clips for each scene with subtle camera motion / zoom
    clip_files = []
    for seg in timing:
        img_path = f"video_production/scenes/{seg['id']}.png"
        clip_path = f"video_production/clips_v2/{seg['id']}.mp4"
        dur = seg["scene_duration"]
        frames = int(dur * 30)
        
        cmd = [
            ffmpeg_exe, "-y",
            "-loop", "1",
            "-i", img_path,
            "-vf", f"scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='min(zoom+0.00014,1.022)':d={frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080:fps=30,format=yuv420p",
            "-t", str(dur),
            "-r", "30",
            clip_path
        ]
        run_cmd(cmd, f"Render video clip for {seg['id']}")
        clip_files.append(clip_path)

    # Concat all video clips
    with open("video_production/clips_concat_v2.txt", "w", encoding="utf-8") as f:
        for c in clip_files:
            f.write(f"file '{os.path.abspath(c).replace(os.sep, '/')}'\n")
            
    video_raw = "video_production/video_raw_v2.mp4"
    cmd = [
        ffmpeg_exe, "-y",
        "-f", "concat", "-safe", "0",
        "-i", "video_production/clips_concat_v2.txt",
        "-c:v", "libx264", "-pix_fmt", "yuv420p",
        video_raw
    ]
    run_cmd(cmd, "Concat video clips v2")
    
    # 4. Burn-in subtitles and multiplex with mixed audio
    srt_path = os.path.abspath("video_production/captions_v2.srt").replace(os.sep, "/").replace(":", "\\:")
    final_output = "crowdsignal_hackathon_demo.mp4"
    
    sub_filter = f"subtitles='{srt_path}':force_style='FontName=Arial,FontSize=20,PrimaryColour=&H00FFFFFF,OutlineColour=&H80000000,BorderStyle=4,BackColour=&H60000000,MarginV=36,Alignment=2'"
    
    cmd = [
        ffmpeg_exe, "-y",
        "-i", video_raw,
        "-i", mixed_audio,
        "-vf", sub_filter,
        "-c:v", "libx264", "-preset", "medium", "-crf", "18",
        "-c:a", "copy",
        "-shortest",
        final_output
    ]
    run_cmd(cmd, "Burn subtitles and multiplex final MP4 v2")
    
    # Copy to artifacts directory
    artifact_dir = r"C:\Users\ankur\.gemini\antigravity-ide\brain\88476750-a323-468b-9534-b238b93f4369"
    artifact_dest = os.path.join(artifact_dir, "crowdsignal_hackathon_demo.mp4")
    
    shutil.copyfile(final_output, artifact_dest)
    print(f"\n==========================================")
    print(f"Final Video Successfully Produced & Replaced:")
    print(f"-> Local: {os.path.abspath(final_output)}")
    print(f"-> Artifact: {artifact_dest}")
    print(f"==========================================")

if __name__ == "__main__":
    build_video()
