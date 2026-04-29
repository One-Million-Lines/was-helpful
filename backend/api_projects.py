from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
import uuid

from api_shared import vtstorage, vtlog, get_current_user
from data_models import WHProject, WHConfig, WHTheme

router = APIRouter(prefix="/projects", tags=["projects"])
COLLECTION = "projects"


@router.post("")
async def create_project(project: WHProject, user: dict = Depends(get_current_user)):
    project_id = str(uuid.uuid4())
    project.createdAt = datetime.now()
    project.updatedAt = datetime.now()
    if project.config is None:
        project.config = WHConfig(theme=WHTheme())
    elif project.config.theme is None:
        project.config.theme = WHTheme()
    doc = project.model_dump()
    doc["_id"] = project_id
    doc["userId"] = user["_id"]
    result = vtstorage.insert_one(collection=COLLECTION, set_object=doc)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to create project")
    return {"_id": project_id, **project.model_dump()}


@router.get("")
async def list_projects(limit: int = 50, start: int = 0, user: dict = Depends(get_current_user)):
    projects = vtstorage.get_many(
        collection=COLLECTION,
        query={"userId": user["_id"]},
        limit=limit,
        start=start,
        sort=[("updatedAt", -1)],
    )
    result = []
    for p in projects:
        p["stats"] = _get_project_stats(p["_id"])
        result.append(p)
    return {"projects": result}


@router.get("/{project_id}")
async def get_project(project_id: str, user: dict = Depends(get_current_user)):
    project = vtstorage.get_one(collection=COLLECTION, query={"_id": project_id, "userId": user["_id"]})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    project["stats"] = _get_project_stats(project_id)
    return project


@router.put("/{project_id}")
async def update_project(project_id: str, project: WHProject, user: dict = Depends(get_current_user)):
    project.updatedAt = datetime.now()
    data = project.model_dump()
    result = vtstorage.update_one(
        collection=COLLECTION,
        query={"_id": project_id, "userId": user["_id"]},
        set_object={"$set": data}
    )
    if not result or result.get("matched_count", 0) == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"_id": project_id, **data}


@router.put("/{project_id}/config")
async def update_config(project_id: str, config: WHConfig, user: dict = Depends(get_current_user)):
    project = vtstorage.get_one(collection=COLLECTION, query={"_id": project_id, "userId": user["_id"]})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if config.theme is None:
        config.theme = WHTheme()
    result = vtstorage.update_one(
        collection=COLLECTION,
        query={"_id": project_id, "userId": user["_id"]},
        set_object={"$set": {"config": config.model_dump(), "updatedAt": datetime.now()}}
    )
    return {"_id": project_id, "config": config.model_dump()}


@router.delete("/{project_id}")
async def delete_project(project_id: str, user: dict = Depends(get_current_user)):
    vtstorage.delete_one(collection=COLLECTION, query={"_id": project_id, "userId": user["_id"]})
    return {"deleted": True}


def _get_project_stats(project_id: str) -> dict:
    try:
        total_votes = vtstorage.count(collection="votes", query={"projectId": project_id}) or 0
        up_votes = vtstorage.count(collection="votes", query={"projectId": project_id, "vote": "up"}) or 0
        down_votes = vtstorage.count(collection="votes", query={"projectId": project_id, "vote": "down"}) or 0
        total_feedback = vtstorage.count(collection="feedback", query={"projectId": project_id}) or 0
        return {
            "totalVotes": total_votes,
            "upVotes": up_votes,
            "downVotes": down_votes,
            "totalFeedback": total_feedback,
        }
    except Exception:
        return {"totalVotes": 0, "upVotes": 0, "downVotes": 0, "totalFeedback": 0}
