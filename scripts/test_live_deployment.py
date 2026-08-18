import urllib.request
import re

url = "https://vickytokalwad10-hash.github.io/Agripulse/"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    response = urllib.request.urlopen(req)
    html = response.read().decode('utf-8')
    print("✅ Main Page Status:", response.status)
    title = re.search(r'<title>(.*?)</title>', html)
    print("✅ App Title:", title.group(1) if title else "No title")
    
    # Check JS & CSS assets
    assets = re.findall(r'(?:src|href)=["\']\./(assets/[^"\']+)["\']', html)
    for asset in assets:
        asset_url = url + asset.replace("./", "")
        asset_res = urllib.request.urlopen(urllib.request.Request(asset_url, headers={'User-Agent': 'Mozilla/5.0'}))
        print(f"✅ Asset {asset} -> HTTP {asset_res.status} ({len(asset_res.read())} bytes)")
    print("\n🎉 LIVE DEPLOYMENT IS 100% HEALTHY AND SERVING ASSETS!")
except Exception as e:
    print("❌ Error:", e)
