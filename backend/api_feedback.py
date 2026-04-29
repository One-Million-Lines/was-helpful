from fastapi import APIRouter, Depends
from typing import Optional

from api_shared import vtstorage, vtlog, get_current_user

router = APIRouter(prefix="/feedback", tags=["feedback"])

VOTES_COLLECTION = "votes"
FEEDBACK_COLLECTION = "feedback"
PROJECTS_COLLECTION = "projects"


@router.get("/votes")
async def list_votes(
    project_id: str,
    vote: Optional[str] = None,
    limit: int = 50,
    start: int = 0,
    user: dict = Depends(get_current_user),
):
    # Verify project ownership
    project = vtstorage.get_one(collection=PROJECTS_COLLECTION, query={"_id": project_id, "userId": user["_id"]})
    if not project:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Project not found")

    query = {"projectId": project_id}
    if vote in ("up", "down"):
        query["vote"] = vote

    votes = vtstorage.get_many(
        collection=VOTES_COLLECTION,
        query=query,
        limit=limit,
        start=start,
        sort=[("createdAt", -1)],
    )
    total = vtstorage.count(collection=VOTES_COLLECTION, query=query) or 0
    return {"votes": votes, "total": total}


@router.get("/responses")
async def list_feedback(
    project_id: str,
    limit: int = 50,
    start: int = 0,
    user: dict = Depends(get_current_user),
):
    project = vtstorage.get_one(collection=PROJECTS_COLLECTION, query={"_id": project_id, "userId": user["_id"]})
    if not project:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Project not found")

    feedback = vtstorage.get_many(
        collection=FEEDBACK_COLLECTION,
        query={"projectId": project_id},
        limit=limit,
        start=start,
        sort=[("createdAt", -1)],
    )
    total = vtstorage.count(collection=FEEDBACK_COLLECTION, query={"projectId": project_id}) or 0
    return {"feedback": feedback, "total": total}


@router.get("/analytics")
async def get_analytics(project_id: str, user: dict = Depends(get_current_user)):
    project = vtstorage.get_one(collection=PROJECTS_COLLECTION, query={"_id": project_id, "userId": user["_id"]})
    if not project:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Project not found")

    total_votes = vtstorage.count(collection=VOTES_COLLECTION, query={"projectId": project_id}) or 0
    up_votes = vtstorage.count(collection=VOTES_COLLECTION, query={"projectId": project_id, "vote": "up"}) or 0
    down_votes = vtstorage.count(collection=VOTES_COLLECTION, query={"projectId": project_id, "vote": "down"}) or 0
    total_feedback = vtstorage.count(collection=FEEDBACK_COLLECTION, query={"projectId": project_id}) or 0

    helpfulness_rate = round((up_votes / total_votes) * 100, 1) if total_votes > 0 else 0.0
    follow_up_rate = round((total_feedback / down_votes) * 100, 1) if down_votes > 0 else 0.0

    # Poll answer distribution
    poll_counts: dict = {}
    feedback_items = vtstorage.get_many(
        collection=FEEDBACK_COLLECTION,
        query={"projectId": project_id, "pollAnswer": {"$exists": True, "$ne": ""}},
        limit=1000,
    )
    for item in feedback_items:
        answer = item.get("pollAnswer", "")
        if answer:
            poll_counts[answer] = poll_counts.get(answer, 0) + 1

    return {
        "totalVotes": total_votes,
        "upVotes": up_votes,
        "downVotes": down_votes,
        "helpfulnessRate": helpfulness_rate,
        "totalFeedback": total_feedback,
        "followUpRate": follow_up_rate,
        "pollDistribution": poll_counts,
    }
