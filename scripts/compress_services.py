import os
import json
import base64
import urllib.request
import urllib.error

TINIFY_API_KEY = "mzchvzm2dZNj8yZD80WctJcNNRg5JtWf"
auth_header = "Basic " + base64.b64encode(f"api:{TINIFY_API_KEY}".encode()).decode("utf-8")

os.makedirs("public/services", exist_ok=True)

images = [
    ("/Users/yapil/.gemini/antigravity/brain/8f8280f0-f008-4b90-b7a0-10a937f3419d/service_sites_1786907889798.jpg", "public/services/sites.webp"),
    ("/Users/yapil/.gemini/antigravity/brain/8f8280f0-f008-4b90-b7a0-10a937f3419d/service_print_1786907904129.jpg", "public/services/polygraphy.webp"),
    ("/Users/yapil/.gemini/antigravity/brain/8f8280f0-f008-4b90-b7a0-10a937f3419d/service_identity_1786907915083.jpg", "public/services/identity.webp"),
    ("/Users/yapil/.gemini/antigravity/brain/8f8280f0-f008-4b90-b7a0-10a937f3419d/service_smm_1786907926200.jpg", "public/services/smm.webp"),
    ("/Users/yapil/.gemini/antigravity/brain/8f8280f0-f008-4b90-b7a0-10a937f3419d/service_pres_1786907938278.jpg", "public/services/presentations.webp"),
    ("/Users/yapil/.gemini/antigravity/brain/8f8280f0-f008-4b90-b7a0-10a937f3419d/service_support_1786907951827.jpg", "public/services/support.webp"),
]

for src, dst in images:
    print(f"Processing {src} -> {dst}...")
    with open(src, "rb") as f:
        data = f.read()

    req = urllib.request.Request(
        "https://api.tinify.com/shrink",
        data=data,
        headers={
            "Authorization": auth_header,
            "Content-Type": "application/octet-stream"
        },
        method="POST"
    )
    
    with urllib.request.urlopen(req) as resp:
        res_json = json.loads(resp.read().decode())
        output_url = res_json["output"]["url"]
    
    # Request conversion to WebP and download
    convert_payload = json.dumps({"convert": {"type": ["image/webp"]}}).encode("utf-8")
    convert_req = urllib.request.Request(
        output_url,
        data=convert_payload,
        headers={
            "Authorization": auth_header,
            "Content-Type": "application/json"
        },
        method="POST"
    )
    
    with urllib.request.urlopen(convert_req) as convert_resp:
        webp_data = convert_resp.read()
        with open(dst, "wb") as out_file:
            out_file.write(webp_data)
    
    print(f"Saved {dst} ({len(webp_data)} bytes)")

print("All images compressed and converted to WebP successfully!")
