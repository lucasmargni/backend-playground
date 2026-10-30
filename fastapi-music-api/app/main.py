from fastapi import FastAPI
from app.api.routes import scale_router, chord_router, harmony_router

app = FastAPI(
    title="fastapi-music-api",
    description="A music theory engine API",
    version="0.1.0"
)

@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}

app.include_router(scale_router, prefix="/api")
app.include_router(chord_router, prefix="/api")
app.include_router(harmony_router, prefix="/api")