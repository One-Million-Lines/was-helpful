"""
Public API — used by the embeddable SDK (no auth required).
Endpoints are rate-limited per IP and session_id.
"""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid
import re

from api_shared import vtstorage, vtlog

router = APIRouter(prefix="/public", tags=["public"])

PROJECTS_COLLECTION = "projects"
VOTES_COLLECTION = "votes"
FEEDBACK_COLLECTION = "feedback"

_RATE_LIMIT: dict[str, list] = {}
_MAX_VOTES_PER_SESSION = 10
_WINDOW_SECONDS = 60


def _check_rate_limit(key: str) -> bool:
    """Simple in-memory rate limit. Returns True if allowed."""
    now = datetime.now().timestamp()
    window_start = now - _WINDOW_SECONDS
    hits = _RATE_LIMIT.get(key, [])
    hits = [t for t in hits if t > window_start]
    if len(hits) >= _MAX_VOTES_PER_SESSION:
        _RATE_LIMIT[key] = hits
        return False
    hits.append(now)
    _RATE_LIMIT[key] = hits
    return True


def _sanitize(text: Optional[str], max_len: int = 2000) -> str:
    if not text:
        return ""
    # Strip potential HTML/script tags
    clean = re.sub(r"<[^>]*>", "", text)
    return clean[:max_len].strip()


class VoteRequest(BaseModel):
    projectId: str
    vote: str  # up | down
    sessionId: str
    pageUrl: Optional[str] = ""
    metadata: Optional[dict] = {}


class FeedbackRequest(BaseModel):
    projectId: str
    sessionId: str
    voteId: Optional[str] = None
    pollAnswer: Optional[str] = None
    textInput: Optional[str] = ""
    pageUrl: Optional[str] = ""


@router.get("/config")
async def get_project_config(project_id: str):
    project = vtstorage.get_one(collection=PROJECTS_COLLECTION, query={"_id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    # Return only the config, not internal fields
    config = project.get("config", {})
    return {"projectId": project_id, "config": config}


@router.post("/vote")
async def record_vote(req: VoteRequest, request: Request):
    if req.vote not in ("up", "down"):
        raise HTTPException(status_code=400, detail="vote must be 'up' or 'down'")

    project = vtstorage.get_one(collection=PROJECTS_COLLECTION, query={"_id": req.projectId})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    client_ip = request.client.host if request.client else "unknown"
    rate_key = f"{client_ip}:{req.sessionId}"
    if not _check_rate_limit(rate_key):
        raise HTTPException(status_code=429, detail="Too many requests")

    vote_id = str(uuid.uuid4())
    doc = {
        "_id": vote_id,
        "projectId": req.projectId,
        "vote": req.vote,
        "sessionId": req.sessionId,
        "pageUrl": _sanitize(req.pageUrl, 500),
        "metadata": req.metadata or {},
        "createdAt": datetime.now(),
    }
    vtstorage.insert_one(collection=VOTES_COLLECTION, set_object=doc)
    vtlog.info("vote_recorded", project_id=req.projectId, vote=req.vote)
    return {"voteId": vote_id, "success": True}


@router.post("/feedback")
async def record_feedback(req: FeedbackRequest, request: Request):
    project = vtstorage.get_one(collection=PROJECTS_COLLECTION, query={"_id": req.projectId})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    client_ip = request.client.host if request.client else "unknown"
    rate_key = f"{client_ip}:{req.sessionId}"
    if not _check_rate_limit(rate_key):
        raise HTTPException(status_code=429, detail="Too many requests")

    feedback_id = str(uuid.uuid4())
    doc = {
        "_id": feedback_id,
        "projectId": req.projectId,
        "sessionId": req.sessionId,
        "voteId": req.voteId,
        "pollAnswer": _sanitize(req.pollAnswer, 200),
        "textInput": _sanitize(req.textInput, 2000),
        "pageUrl": _sanitize(req.pageUrl, 500),
        "createdAt": datetime.now(),
    }
    vtstorage.insert_one(collection=FEEDBACK_COLLECTION, set_object=doc)
    vtlog.info("feedback_recorded", project_id=req.projectId)
    return {"feedbackId": feedback_id, "success": True}
