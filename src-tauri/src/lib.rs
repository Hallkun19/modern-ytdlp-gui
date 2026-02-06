use serde::{Deserialize, Serialize};
use tauri::Emitter;
use tauri_plugin_shell::process::CommandEvent;
use tauri_plugin_shell::ShellExt;

#[derive(Debug, Serialize, Deserialize)]
pub struct VideoMetadata {
    pub title: String,
    pub thumbnail: String,
    pub uploader: String,
    pub duration_string: Option<String>,
}

#[tauri::command]
async fn get_video_info(app: tauri::AppHandle, url: String) -> Result<Vec<VideoMetadata>, String> {
    let mut args = vec!["-J".to_string(), "--flat-playlist".to_string()];

    args.push(url);

    let output = app
        .shell()
        .sidecar("yt-dlp")
        .map_err(|e| e.to_string())?
        .args(args)
        .output()
        .await
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    // stdout can contain multiple JSON objects if it's a playlist (one per line or a single object)
    // However, with -J (dump-json), yt-dlp returns a single JSON object which might have "entries" if it's a playlist,
    // OR if we use --flat-playlist it returns valid structure.
    // Actually, with -J, if it is a playlist, it returns a dict with "entries".
    // Let's parse the whole thing as a Value first.

    let json: serde_json::Value =
        serde_json::from_slice(&output.stdout).map_err(|e| e.to_string())?;

    let mut results = Vec::new();

    if let Some(entries) = json.get("entries").and_then(|e| e.as_array()) {
        // It's a playlist or list of videos
        for entry in entries {
            results.push(VideoMetadata {
                title: entry["title"].as_str().unwrap_or("Unknown").to_string(),
                thumbnail: entry["thumbnail"].as_str().unwrap_or("").to_string(),
                uploader: entry["uploader"].as_str().unwrap_or("Unknown").to_string(),
                duration_string: entry["duration_string"].as_str().map(|s| s.to_string()),
            });
        }
    } else {
        // Single video
        results.push(VideoMetadata {
            title: json["title"].as_str().unwrap_or("Unknown").to_string(),
            thumbnail: json["thumbnail"].as_str().unwrap_or("").to_string(),
            uploader: json["uploader"].as_str().unwrap_or("Unknown").to_string(),
            duration_string: json["duration_string"].as_str().map(|s| s.to_string()),
        });
    }

    Ok(results)
}

#[tauri::command]
async fn download_video(
    app: tauri::AppHandle,
    url: String,
    save_path: String,
    quality: String,
    format: String,
    id: String,
    start_time: Option<String>,
    end_time: Option<String>,
    embed_metadata: bool,
    codec: String,       // "h264", "vp9", "av1", "auto"
    audio_codec: String, // "best", "aac", "mp3", "opus", "vorbis", "flac", "m4a"
) -> Result<(), String> {
    let mut args = vec![
        "-o".to_string(),
        format!("{}/%(title)s.%(ext)s", save_path),
        "--newline".to_string(),
    ];

    if embed_metadata {
        args.push("--embed-metadata".to_string());
        args.push("--embed-thumbnail".to_string());
    }

    // Bundled ffmpeg support - robust path resolution for both dev and production
    let triple = tauri::utils::platform::target_triple().unwrap_or_default();
    let ffmpeg_name = format!("ffmpeg-{}.exe", triple);

    let mut ffmpeg_found = false;

    // Try 1: Next to the executable (production build)
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            let ffmpeg_path = exe_dir.join(&ffmpeg_name);
            if ffmpeg_path.exists() {
                args.push("--ffmpeg-location".to_string());
                args.push(ffmpeg_path.to_string_lossy().to_string());
                ffmpeg_found = true;
            }
        }
    }

    // Try 2: src-tauri/bin directory (development mode)
    if !ffmpeg_found {
        let dev_path = std::path::Path::new("src-tauri/bin").join(&ffmpeg_name);
        if dev_path.exists() {
            if let Ok(canonical) = dev_path.canonicalize() {
                args.push("--ffmpeg-location".to_string());
                args.push(canonical.to_string_lossy().to_string());
            }
        }
    }

    if let (Some(start), Some(end)) = (start_time, end_time) {
        if !start.is_empty() && !end.is_empty() {
            args.push("--download-sections".to_string());
            args.push(format!("*{} - {}", start, end));
        }
    }

    match format.as_str() {
        "mp3" | "wav" | "m4a" => {
            args.push("-x".to_string());
            args.push("--audio-format".to_string());
            // If audio_codec is "best", we default to the container format
            args.push(if audio_codec == "best" {
                format.clone()
            } else {
                audio_codec.clone()
            });
        }
        _ => {
            // Video formats - improved merging logic
            let vcodec_filter = match codec.as_str() {
                "h264" => "[vcodec^=avc1]",
                "vp9" => "[vcodec^=vp9]",
                "av1" => "[vcodec^=av01]",
                _ => "",
            };

            let f_str = format!(
                "bestvideo[height<={q}]{v}+bestaudio/best[height<={q}]/best",
                q = quality,
                v = vcodec_filter
            );
            args.push("-f".to_string());
            args.push(f_str);

            // Audio codec preference for video (re-encoding if not best)
            if audio_codec != "best" {
                args.push("--audio-format".to_string());
                args.push(audio_codec.clone());
            }

            // Ensure merging to the requested container
            args.push("--merge-output-format".to_string());
            args.push(format.clone());
        }
    }

    args.push(url);

    let sidecar_command = app
        .shell()
        .sidecar("yt-dlp")
        .map_err(|e| e.to_string())?
        .args(args);

    let (mut rx, _child) = sidecar_command.spawn().map_err(|e| e.to_string())?;

    let event_name = format!("download-progress-{}", id);

    while let Some(event) = rx.recv().await {
        match event {
            CommandEvent::Stdout(line) => {
                let line_str = String::from_utf8_lossy(&line);
                app.emit(&event_name, line_str.to_string()).ok();
            }
            CommandEvent::Stderr(line) => {
                let line_str = String::from_utf8_lossy(&line);
                app.emit(&event_name, line_str.to_string()).ok();
            }
            _ => {}
        }
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_deep_link::init())
        .invoke_handler(tauri::generate_handler![get_video_info, download_video])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
