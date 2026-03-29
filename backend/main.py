import re
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from youtube_transcript_api import YouTubeTranscriptApi

# Local development server — trên Vercel dùng api/get-transcript.py

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


def get_video_id(url: str) -> str | None:
    match = re.search(r'(?:v=|\/)([0-9A-Za-z_-]{11})(?:[&?]|$)', url)
    return match.group(1) if match else None


@app.get("/get-transcript")
async def get_transcript(url: str):
    v_id = get_video_id(url)
    if not v_id:
        return {"status": "Error", "message": "Link YouTube không hợp lệ."}

    try:
        ytt = YouTubeTranscriptApi()

        # Ưu tiên en, fallback sang ngôn ngữ khác rồi translate
        try:
            fetched = ytt.fetch(v_id, languages=['en'])
        except Exception:
            try:
                transcript_list = ytt.list(v_id)
                # Lấy transcript đầu tiên có sẵn rồi translate sang en
                first = next(iter(transcript_list))
                fetched = first.translate('en').fetch()
            except Exception:
                return {"status": "Error", "message": "Video không có phụ đề hoặc không thể dịch sang tiếng Anh."}

        lines = [f"[{int(e.start//60):02d}:{int(e.start%60):02d}] {e.text}" for e in fetched]
        return {"status": "Success", "script": "\n".join(lines)}

    except Exception as e:
        return {"status": "Error", "message": str(e)}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
