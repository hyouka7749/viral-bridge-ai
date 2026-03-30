import re
import os
import json
import urllib.request
import urllib.error
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from youtube_transcript_api import YouTubeTranscriptApi

# Local development server — trên Vercel dùng api/get-transcript.py
def _load_dotenv(path: str):
    try:
        with open(path, "r", encoding="utf-8") as f:
            for raw_line in f:
                line = raw_line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, value = line.split("=", 1)
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                if not key:
                    continue
                if key not in os.environ or (os.environ.get(key, "") == "" and value != ""):
                    os.environ[key] = value
    except Exception:
        return


_load_dotenv(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env")))


app = FastAPI()
allowed_origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o.strip()]
if not allowed_origins:
    allowed_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
    allowed_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


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


@app.post("/deepseek-chat")
async def deepseek_chat(payload: dict):
    api_key = os.getenv("DEEPSEEK_API_KEY")
    if not api_key:
        return JSONResponse({"error": {"message": "Thiếu biến môi trường DEEPSEEK_API_KEY."}}, status_code=500)

    req_body = payload if isinstance(payload, dict) else {}
    messages = req_body.get("messages")
    if not isinstance(messages, list) or len(messages) == 0:
        return JSONResponse({"error": {"message": "Thiếu messages."}}, status_code=400)
    if len(messages) > 20:
        return JSONResponse({"error": {"message": "Quá nhiều messages."}}, status_code=413)

    total_chars = 0
    safe_messages = []
    for m in messages:
        if not isinstance(m, dict):
            continue
        role = m.get("role")
        content = m.get("content")
        if role not in ("system", "user", "assistant") or not isinstance(content, str):
            continue
        total_chars += len(content)
        safe_messages.append({"role": role, "content": content})

    if len(safe_messages) == 0:
        return JSONResponse({"error": {"message": "Messages không hợp lệ."}}, status_code=400)
    if total_chars > 60000:
        return JSONResponse({"error": {"message": "Nội dung quá lớn."}}, status_code=413)

    upstream_payload = {
        "model": "deepseek-chat",
        "messages": safe_messages,
        "stream": False,
    }

    data = json.dumps(upstream_payload).encode("utf-8")
    req = urllib.request.Request(
        "https://api.deepseek.com/chat/completions",
        data=data,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=90) as resp:
            raw = resp.read().decode("utf-8")
            return JSONResponse(json.loads(raw), status_code=getattr(resp, "status", 200))
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8") if hasattr(e, "read") else str(e)
        try:
            data = json.loads(raw)
        except Exception:
            data = {"error": {"message": raw}}
        return JSONResponse(data, status_code=getattr(e, "code", 500))
    except Exception as e:
        return JSONResponse({"error": {"message": str(e)}}, status_code=500)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
