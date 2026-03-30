import re
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import urllib.request
import urllib.error
import json
import html
from youtube_transcript_api import YouTubeTranscriptApi
from defusedxml import ElementTree


def get_video_id(url: str):
    match = re.search(r'(?:v=|\/)([0-9A-Za-z_-]{11})(?:[&?]|$)', url)
    return match.group(1) if match else None


def _fmt_ts(seconds: float) -> str:
    s = int(seconds)
    return f"{s // 60:02d}:{s % 60:02d}"


def _fetch_timedtext(video_id: str, lang: str, kind_asr: bool):
    qs = f"v={video_id}&lang={lang}"
    if kind_asr:
        qs += "&kind=asr"
    url = f"https://www.youtube.com/api/timedtext?{qs}"
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0",
            "Accept": "text/xml,application/xml;q=0.9,*/*;q=0.8",
        },
        method="GET",
    )
    with urllib.request.urlopen(req, timeout=25) as resp:
        raw = resp.read().decode("utf-8", errors="ignore").strip()
        if not raw:
            return []
        root = ElementTree.fromstring(raw)
        items = []
        for node in root.findall("text"):
            start = node.attrib.get("start")
            if start is None:
                continue
            try:
                start_f = float(start)
            except Exception:
                continue
            text = node.text or ""
            text = html.unescape(text).replace("\n", " ").strip()
            if text:
                items.append((start_f, text))
        return items


def _transcript_from_timedtext(video_id: str):
    langs = ["en", "en-US", "vi"]
    for lang in langs:
        for kind_asr in (False, True):
            try:
                items = _fetch_timedtext(video_id, lang, kind_asr)
            except Exception:
                items = []
            if items:
                return "\n".join([f"[{_fmt_ts(s)}] {t}" for s, t in items])
    return None


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
                    fetched = None

            if fetched is not None:
                lines = [f"[{int(e.start//60):02d}:{int(e.start%60):02d}] {e.text}" for e in fetched]
                self.wfile.write(json.dumps({"status": "Success", "script": "\n".join(lines)}).encode())
                return

            script = _transcript_from_timedtext(v_id)
            if script:
                self.wfile.write(json.dumps({"status": "Success", "script": script}).encode())
                return

            self.wfile.write(json.dumps({
                "status": "Error",
                "message": "Không thể lấy transcript từ YouTube. Hãy dán transcript thủ công."
            }).encode())

        except Exception as e:
            self.wfile.write(json.dumps({"status": "Error", "message": str(e)}).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
