import os
import json
import urllib.request
import urllib.error
from http.server import BaseHTTPRequestHandler


def _split_origins(value: str | None):
    if not value:
        return []
    return [v.strip() for v in value.split(",") if v.strip()]


def _origin_allowed(origin: str | None, host: str | None):
    if not origin:
        return True
    allowed = _split_origins(os.getenv("ALLOWED_ORIGINS"))
    if origin in allowed:
        return True
    if host and origin in (f"https://{host}", f"http://{host}"):
        return True
    return False


def _total_chars(messages):
    total = 0
    for m in messages:
        c = m.get("content")
        if isinstance(c, str):
            total += len(c)
    return total


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        api_key = os.getenv("DEEPSEEK_API_KEY")
        origin = self.headers.get("Origin")
        host = self.headers.get("X-Forwarded-Host") or self.headers.get("Host")

        if not _origin_allowed(origin, host):
            self.send_response(403)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": {"message": "Origin không được phép."}}).encode())
            return

        if not api_key:
            self.send_response(500)
            if origin:
                self.send_header("Access-Control-Allow-Origin", origin)
                self.send_header("Vary", "Origin")
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": {"message": "Thiếu biến môi trường DEEPSEEK_API_KEY."}}).encode())
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
            raw_body = self.rfile.read(length) if length > 0 else b"{}"
            payload = json.loads(raw_body.decode("utf-8") or "{}")
        except Exception:
            self.send_response(400)
            if origin:
                self.send_header("Access-Control-Allow-Origin", origin)
                self.send_header("Vary", "Origin")
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": {"message": "Body JSON không hợp lệ."}}).encode())
            return

        if not isinstance(payload, dict):
            self.send_response(400)
            if origin:
                self.send_header("Access-Control-Allow-Origin", origin)
                self.send_header("Vary", "Origin")
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": {"message": "Body phải là object JSON."}}).encode())
            return

        messages = payload.get("messages")
        if not isinstance(messages, list) or len(messages) == 0:
            self.send_response(400)
            if origin:
                self.send_header("Access-Control-Allow-Origin", origin)
                self.send_header("Vary", "Origin")
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": {"message": "Thiếu messages."}}).encode())
            return

        if len(messages) > 20 or _total_chars(messages) > 60000:
            self.send_response(413)
            if origin:
                self.send_header("Access-Control-Allow-Origin", origin)
                self.send_header("Vary", "Origin")
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": {"message": "Nội dung quá lớn."}}).encode())
            return

        safe_messages = []
        for m in messages:
            if not isinstance(m, dict):
                continue
            role = m.get("role")
            content = m.get("content")
            if role not in ("system", "user", "assistant") or not isinstance(content, str):
                continue
            safe_messages.append({"role": role, "content": content})

        if len(safe_messages) == 0:
            self.send_response(400)
            if origin:
                self.send_header("Access-Control-Allow-Origin", origin)
                self.send_header("Vary", "Origin")
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": {"message": "Messages không hợp lệ."}}).encode())
            return

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
                raw = resp.read()
                self.send_response(getattr(resp, "status", 200))
                if origin:
                    self.send_header("Access-Control-Allow-Origin", origin)
                    self.send_header("Vary", "Origin")
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(raw)
        except urllib.error.HTTPError as e:
            raw = e.read() if hasattr(e, "read") else str(e).encode("utf-8")
            self.send_response(getattr(e, "code", 500))
            if origin:
                self.send_header("Access-Control-Allow-Origin", origin)
                self.send_header("Vary", "Origin")
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(raw)
        except Exception as e:
            self.send_response(500)
            if origin:
                self.send_header("Access-Control-Allow-Origin", origin)
                self.send_header("Vary", "Origin")
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": {"message": str(e)}}).encode())

    def do_OPTIONS(self):
        origin = self.headers.get("Origin")
        host = self.headers.get("X-Forwarded-Host") or self.headers.get("Host")
        if not _origin_allowed(origin, host):
            self.send_response(403)
            self.end_headers()
            return
        self.send_response(204)
        if origin:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Max-Age", "86400")
        self.end_headers()
