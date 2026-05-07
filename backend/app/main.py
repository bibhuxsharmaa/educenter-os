from fastapi import FastAPI

app = FastAPI(
    title="EduCenter OS API",
    description="Backend API for EduCenter OS coaching center management platform.",
    version="0.1.0",
)


@app.get("/")
def root():
    return {
        "message": "EduCenter OS API is running",
        "status": "healthy",
        "version": "0.1.0",
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "educenter-backend",
    }