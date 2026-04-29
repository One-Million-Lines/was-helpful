import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api_shared import vtlog, package_name, config
from api_auth import router as auth_router
from api_projects import router as projects_router
from api_public import router as public_router
from api_feedback import router as feedback_router
import signal
import sys

app = FastAPI(
    title="WasHelpful API",
    description="Embeddable feedback widget SaaS API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5332",
        "http://127.0.0.1:5332",
        "https://onemillionlines.com",
        "https://www.onemillionlines.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Public endpoints (used by SDK) need open CORS — handled at nginx level in prod
app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(public_router)
app.include_router(feedback_router)


@app.get("/")
async def root():
    return {"service": package_name, "status": "running"}


@app.get("/health")
async def health():
    return {"status": "ok"}


def exit_handler(sig_num, frame):
    vtlog.info("Stopping application: {0}".format(package_name))
    sys.exit()


if __name__ == "__main__":
    signal.signal(signal.SIGTERM, exit_handler)
    signal.signal(signal.SIGINT, exit_handler)

    port = int(config.get("APP_PORT", "5232"))
    host = config.get("APP_HOST", "0.0.0.0")
    vtlog.info("starting", port=port)
    uvicorn.run("main:app", host=host, port=port, reload=False)
