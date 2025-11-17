import asyncio
import logging
import os
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import Depends, FastAPI, HTTPException, Query, status  # pyright: ignore[reportMissingImports]
from fastapi.responses import FileResponse  # pyright: ignore[reportMissingImports]
from fastapi.security import OAuth2PasswordRequestForm  # pyright: ignore[reportMissingImports]
from fastapi.staticfiles import StaticFiles  # pyright: ignore[reportMissingImports]
from sqlalchemy.orm import Session  # pyright: ignore[reportMissingImports]

from core import database, models
from core.auth import (
    create_access_token,
    get_current_user,
    get_user_by_username,
    hash_password,
    verify_password,
)
from core.database import get_db
from core.fetch import fetch_bilibili_dynamics, load_cached_dynamics, save_cached_dynamics
from core.schemas import (
    PasswordChange,
    TaskCreate,
    TaskResponse,
    TaskUpdate,
    Token,
    UserCreate,
    UserProfileUpdate,
    UserPublic,
)

logging.basicConfig(level=logging.INFO, format="[%(asctime)s] %(levelname)s - %(message)s")

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
FAVICON_PATH = STATIC_DIR / "HXK-Terminal.png"

POLL_INTERVAL = int(os.getenv("BILIBILI_REFRESH_INTERVAL", "600"))

bilibili_cache: List[Dict[str, Any]] = load_cached_dynamics()
cache_lock = asyncio.Lock()

app = FastAPI(debug=True)
models.Base.metadata.create_all(bind=database.engine)
STATIC_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


async def refresh_bilibili_dynamics() -> List[Dict[str, Any]]:
    data = await asyncio.to_thread(fetch_bilibili_dynamics)
    async with cache_lock:
        bilibili_cache.clear()
        bilibili_cache.extend(data)
    await asyncio.to_thread(save_cached_dynamics, data)
    logging.info("已刷新 B 站动态：%d 条", len(data))
    return data


async def refresh_bilibili_dynamics_periodically():
    while True:
        try:
            await refresh_bilibili_dynamics()
        except Exception as exc:  # pragma: no cover
            logging.exception("刷新 B 站动态失败: %s", exc)
        await asyncio.sleep(POLL_INTERVAL)


def serialize_task(task: models.Task, current_user: Optional[models.User]) -> TaskResponse:
    tags = task.tags.split(",") if task.tags else []
    accepted_count = len(task.acceptances)
    is_accepted = False
    if current_user:
        is_accepted = any(acc.user_id == current_user.id for acc in task.acceptances)

    publisher_name = task.publisher.nickname or task.publisher.username if task.publisher else "未知"

    return TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        type=task.type,
        priority=task.priority,
        max_accept_count=task.max_accept_count,
        deadline=task.deadline,
        tags=tags,
        status=task.status,
        publisher_id=task.publisher_id,
        publisher_name=publisher_name,
        accepted_count=accepted_count,
        created_at=task.created_at,
        is_accepted=is_accepted,
    )


@app.on_event("startup")
async def on_startup():
    if not bilibili_cache:
        try:
            await refresh_bilibili_dynamics()
        except Exception as exc:
            logging.warning("初始化 B 站动态失败，将使用缓存（若存在）：%s", exc)
    asyncio.create_task(refresh_bilibili_dynamics_periodically())


@app.get("/")
def read_root():
    return {"status": "ok"}


@app.get("/favicon.ico")
async def favicon():
    if not FAVICON_PATH.exists():
        raise HTTPException(status_code=404, detail="favicon not found")
    return FileResponse(str(FAVICON_PATH))


@app.post("/auth/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    if get_user_by_username(db, user.username):
        raise HTTPException(status_code=400, detail="用户名已存在")
    db_user = models.User(
        username=user.username,
        nickname=user.nickname or user.username,
        password_hash=hash_password(user.password),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    access_token = create_access_token({"sub": db_user.username})
    return Token(access_token=access_token)


@app.post("/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = get_user_by_username(db, form_data.username)
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="用户名或密码错误")
    access_token = create_access_token({"sub": user.username})
    return Token(access_token=access_token)


@app.get("/auth/me", response_model=UserPublic)
def get_profile(current_user: models.User = Depends(get_current_user)):
    return UserPublic(
        id=current_user.id,
        username=current_user.username,
        nickname=current_user.nickname,
        avatar=current_user.avatar,
        qq=current_user.qq,
        created_at=current_user.created_at,
    )


@app.put("/auth/me", response_model=UserPublic)
def update_profile(
    profile: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if profile.nickname is not None:
        current_user.nickname = profile.nickname
    if profile.avatar is not None:
        current_user.avatar = profile.avatar
    if profile.qq is not None:
        current_user.qq = profile.qq
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return UserPublic(
        id=current_user.id,
        username=current_user.username,
        nickname=current_user.nickname,
        avatar=current_user.avatar,
        qq=current_user.qq,
        created_at=current_user.created_at,
    )


@app.post("/auth/change-password", status_code=204)
def change_password(
    payload: PasswordChange,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not verify_password(payload.old_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="原密码不正确")
    current_user.password_hash = hash_password(payload.new_password)
    db.add(current_user)
    db.commit()


@app.get("/tasks", response_model=List[TaskResponse])
def list_tasks(
    scope: str = Query("available", pattern="^(available|my)$"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if scope == "my":
        tasks = (
            db.query(models.Task)
            .join(models.TaskAcceptance)
            .filter(models.TaskAcceptance.user_id == current_user.id)
            .order_by(models.Task.created_at.desc())
            .all()
        )
    else:
        tasks = (
            db.query(models.Task)
            .filter(models.Task.status == "available")
            .order_by(models.Task.created_at.desc())
            .all()
        )
    return [serialize_task(task, current_user) for task in tasks]


@app.post("/tasks", response_model=TaskResponse)
def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    max_accept = task.max_accept_count
    if task.type == "personal":
        max_accept = 1

    db_task = models.Task(
        title=task.title,
        description=task.description,
        type=task.type,
        priority=task.priority,
        max_accept_count=max_accept,
        deadline=task.deadline,
        tags=",".join(task.tags) if task.tags else None,
        publisher_id=current_user.id,
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return serialize_task(db_task, current_user)


@app.get("/tasks/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    return serialize_task(task, current_user)


@app.put("/tasks/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_update: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    if task.publisher_id != current_user.id:
        raise HTTPException(status_code=403, detail="无权修改此任务")

    for field, value in task_update.model_dump(exclude_unset=True).items():
        if field == "tags" and value is not None:
            setattr(task, "tags", ",".join(value))
        else:
            setattr(task, field, value)

    db.add(task)
    db.commit()
    db.refresh(task)
    return serialize_task(task, current_user)


@app.delete("/tasks/{task_id}", status_code=204)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    if task.publisher_id != current_user.id:
        raise HTTPException(status_code=403, detail="无权删除此任务")
    db.delete(task)
    db.commit()


@app.post("/tasks/{task_id}/accept", response_model=TaskResponse)
def accept_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")

    if any(acc.user_id == current_user.id for acc in task.acceptances):
        raise HTTPException(status_code=400, detail="你已接取该任务")

    if len(task.acceptances) >= task.max_accept_count:
        raise HTTPException(status_code=400, detail="任务接取人数已满")

    acceptance = models.TaskAcceptance(task_id=task.id, user_id=current_user.id)
    task.status = "inProgress"
    db.add(acceptance)
    db.add(task)
    db.commit()
    db.refresh(task)
    return serialize_task(task, current_user)


@app.post("/tasks/{task_id}/complete", response_model=TaskResponse)
def complete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    acceptance = (
        db.query(models.TaskAcceptance)
        .filter(
            models.TaskAcceptance.task_id == task_id,
            models.TaskAcceptance.user_id == current_user.id,
        )
        .first()
    )
    if not acceptance:
        raise HTTPException(status_code=404, detail="你尚未接取此任务")
    acceptance.status = "completed"
    db.add(acceptance)

    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if task:
        if all(acc.status == "completed" for acc in task.acceptances):
            task.status = "completed"
        db.add(task)

    db.commit()
    if task:
        db.refresh(task)
        return serialize_task(task, current_user)
    raise HTTPException(status_code=404, detail="任务不存在")


@app.post("/tasks/{task_id}/abandon", response_model=TaskResponse)
def abandon_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    acceptance = (
        db.query(models.TaskAcceptance)
        .filter(
            models.TaskAcceptance.task_id == task_id,
            models.TaskAcceptance.user_id == current_user.id,
        )
        .first()
    )
    if not acceptance:
        raise HTTPException(status_code=404, detail="你尚未接取此任务")

    db.delete(acceptance)
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if task:
        if not task.acceptances or len(task.acceptances) <= 1:
            task.status = "available"
        db.add(task)

    db.commit()
    if task:
        db.refresh(task)
        return serialize_task(task, current_user)
    raise HTTPException(status_code=404, detail="任务不存在")


@app.get("/bilibili/dynamics")
async def get_bilibili_dynamics():
    async with cache_lock:
        cached = bilibili_cache.copy()
    if cached:
        return cached
    return await refresh_bilibili_dynamics()