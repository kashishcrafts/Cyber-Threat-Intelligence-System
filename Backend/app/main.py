from fastapi import FastAPI

app = FastAPI(
    title="AI Cyber Threat Intelligence Platform"
)

@app.get("/")
def home():
    return {
        "message": "AI Cyber Threat Intelligence Platform Running"
    }