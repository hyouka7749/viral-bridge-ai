import re
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import json
from youtube_transcript_api import YouTubeTranscriptApi


def get_video_id(url: str):
    match = re.search(r'(?:v=|\/)([0-9A-Za-z_-]{11})(?:[&?]|$)', url)
    return match.group(1) if match else None


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)
        url = params.get('url', [None])[0]

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

        if not url:
            self.wfile.write(json.dumps({"status": "Error", "message": "Thiếu tham số url."}).encode())
            return

        v_id = get_video_id(url)
        if not v_id:
            self.wfile.write(json.dumps({"status": "Error", "message": "Link YouTube không hợp lệ."}).encode())
            return

        try:
            ytt = YouTubeTranscriptApi()

            try:
                fetched = ytt.fetch(v_id, languages=['en'])
            except Exception:
                try:
                    transcript_list = ytt.list(v_id)
                    first = next(iter(transcript_list))
                    try:
                        fetched = first.translate('en').fetch()
                    except Exception:
                        fetched = first.fetch()
                except Exception:
                    self.wfile.write(json.dumps({
                        "status": "Error",
                        "message": "Video không có phụ đề hoặc không thể dịch sang tiếng Anh."
                    }).encode())
                    return

            lines = [f"[{int(e.start//60):02d}:{int(e.start%60):02d}] {e.text}" for e in fetched]
            self.wfile.write(json.dumps({"status": "Success", "script": "\n".join(lines)}).encode())

        except Exception as e:
            self.wfile.write(json.dumps({"status": "Error", "message": str(e)}).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
