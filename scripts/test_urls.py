import urllib.request

urls = [
    "https://vickytokalwad10-hash.github.io/Agripulse/",
    "https://vickytokalwad10-hash.github.io/agripulse/",
    "https://vickytokalwad10-hash.github.io/Agripulse/index.html",
    "https://vickytokalwad10-hash.github.io/2026_Syntax_error/",
    "https://vickytokalwad10-hash.github.io/"
]

for u in urls:
    try:
        req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req)
        print(f"✅ {u} -> HTTP {res.status}")
    except Exception as e:
        print(f"❌ {u} -> {e}")
