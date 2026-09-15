from fastapi import FastAPI, Response, Request
from fastapi.middleware.cors import CORSMiddleware
import httpx
import uvicorn

app = FastAPI(title="Guideia API")

# Allow CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Guideia Backend is running!"}

@app.get("/api/tts")
async def proxy_google_tts(q: str, tl: str = "en", client: str = "tw-ob", ie: str = "UTF-8", slow: bool = False):
    """
    Proxy the Google Translate TTS endpoint to avoid CORS issues in the browser.
    """
    url = "https://translate.google.com/translate_tts"
    
    # Construct query parameters exactly as Google expects
    params = {
        "ie": ie,
        "q": q,
        "tl": tl,
        "client": client,
    }
    if slow:
        params["slow"] = "true"
        
    # Set headers to mimic a browser
    headers = {
        "Referer": "https://translate.google.com/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, params=params, headers=headers)
            response.raise_for_status()
            
            # Return the audio data directly as a Response
            return Response(
                content=response.content,
                media_type="audio/mpeg",
                headers={
                    "Cache-Control": "public, max-age=3600"
                }
            )
        except Exception as e:
            print(f"Error fetching TTS: {e}")
            return Response(status_code=500, content=f"Error generating TTS: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
