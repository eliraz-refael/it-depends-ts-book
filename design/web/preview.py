#!/usr/bin/env python3
"""Serve the static edition under its configured GitHub Pages subpath."""
import argparse,json
from pathlib import Path
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from urllib.parse import urlsplit,unquote
HERE=Path(__file__).resolve().parent
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--port',type=int,default=8000);p.add_argument('--site',type=Path,default=HERE/'output/site');p.add_argument('--config',type=Path,default=HERE/'config.json');a=p.parse_args()
 root=a.site.resolve();prefix=urlsplit(json.loads(a.config.read_text())['base_url']).path.rstrip('/')+'/'
 class Handler(SimpleHTTPRequestHandler):
  def do_GET(self):
   requested=unquote(urlsplit(self.path).path)
   if requested==prefix.rstrip('/'):
    self.send_response(301);self.send_header('Location',prefix);self.end_headers();return
   if not requested.startswith(prefix):self.send_error(404);return
   target=(root/requested[len(prefix):]).resolve()
   if not target.is_relative_to(root):self.send_error(403);return
   self.path='/'+requested[len(prefix):]
   if not target.exists():
    body=(root/'404.html').read_bytes();self.send_response(404);self.send_header('Content-Type','text/html; charset=utf-8');self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body);return
   super().do_GET()
  def __init__(self,*args,**kw):super().__init__(*args,directory=str(root),**kw)
 print(f'Preview: http://127.0.0.1:{a.port}{prefix}',flush=True)
 ThreadingHTTPServer(('127.0.0.1',a.port),Handler).serve_forever()
