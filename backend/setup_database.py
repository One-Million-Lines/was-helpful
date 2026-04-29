"""
Setup script for WasHelpful MongoDB database.
Creates indices and seeds an initial admin user.

Usage:
    source .venv/bin/activate
    python setup_database.py
"""
import sys
import uuid
from datetime import datetime, timezone
from vtutils.misc import get_project_root

ROOT_DIR = get_project_root()
sys.path.append(ROOT_DIR)

from vtutils.confparser import env_config, parse_config
from vtutils.vtlogger import initLog
from vtstorage.perm_storage import VTPermStorage
from api_shared import hash_password

package_name = "setup_database"
vtlog = initLog(package_name)

config = env_config(f"{ROOT_DIR}/.env")
configuration = parse_config("all.ini", config)

vtstorage = VTPermStorage(
    configuration["env_config"]["PERMANENT_STORAGE"],
    configuration["mongodb"],
    params={"database": configuration["env_config"]["PERMANENT_DB"]},
)


def create_indices():
    vtstorage.ensure_index(collection="users", index_options={"fields": "email", "unique": True, "name": "idx_users_email"})
    vtlog.info("index_created", collection="users", index="idx_users_email")

    vtstorage.ensure_index(collection="projects", index_options={"fields": [("userId", 1), ("updatedAt", -1)], "name": "idx_projects_user_updated"})
    vtlog.info("index_created", collection="projects", index="idx_projects_user_updated")

    vtstorage.ensure_index(collection="votes", index_options={"fields": [("projectId", 1), ("createdAt", -1)], "name": "idx_votes_project_created"})
    vtlog.info("index_created", collection="votes", index="idx_votes_project_created")

    vtstorage.ensure_index(collection="votes", index_options={"fields": [("sessionId", 1)], "name": "idx_votes_session"})
    vtlog.info("index_created", collection="votes", index="idx_votes_session")

    vtstorage.ensure_index(collection="feedback", index_options={"fields": [("projectId", 1), ("createdAt", -1)], "name": "idx_feedback_project_created"})
    vtlog.info("index_created", collection="feedback", index="idx_feedback_project_created")


def seed_admin():
    email = "admin@washelpful.com"
    existing = vtstorage.get_one(collection="users", query={"email": email})
    if existing:
        vtlog.info("admin_exists", email=email)
        return

    password = "change-me-before-use"
    user_id = str(uuid.uuid4())
    vtstorage.insert_one(collection="users", set_object={
        "_id": user_id,
        "email": email,
        "password": hash_password(password),
        "createdAt": datetime.now(timezone.utc),
    })
    vtlog.info("admin_seeded", email=email, note="Change the password immediately")
    print(f"\nAdmin user created:\n  email: {email}\n  password: {password}\n  CHANGE THIS PASSWORD!\n")


if __name__ == "__main__":
    create_indices()
    seed_admin()
    print("Database setup complete.")
