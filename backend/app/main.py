from fastapi import FastAPI

app = FastAPI(
    title="Personal Control Center API",
    description="REST API для управления устройствами",
    version="1.0.0"
)


@app.get("/")
async def root():
    return {"message": "Personal Control Center API is running!"}


@app.get("/health")
async def health_check():
    return {"status": "ok"}