from fastapi import FastAPI, Depends, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import engine, Base, get_db
import models, schemas, os
from groq import Groq
from auth import hash_password, verify_password, create_access_token, get_current_user

Base.metadata.create_all(bind=engine)

app = FastAPI(title="SkillSwap API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

@app.get("/")
def home():
    return {"message": "Welcome to SkillSwap API"}

@app.post("/register", response_model=schemas.UserOut, status_code=201)
def register(data: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == data.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")
    user = models.User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
        role=data.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@app.post("/login", response_model=schemas.Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form.username).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Wrong email or password")
    return {"access_token": create_access_token(user.id, user.role), "token_type": "bearer"}

@app.get("/me", response_model=schemas.UserOut)
def me(current_user: models.User = Depends(get_current_user)):
    return current_user
@app.get("/admin/users", response_model=list[schemas.UserOut])
def get_all_users(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only admins can access this endpoint"
        )

    return db.query(models.User).all()
@app.post("/skills", response_model=schemas.SkillOut, status_code=201)
def create_skill(
    data: schemas.SkillCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "mentor":
        raise HTTPException(
            status_code=403,
            detail="Only mentors can create skills"
        )

    skill = models.Skill(
        title=data.title,
        description=data.description,
        category=data.category,
        mentor_id=current_user.id
    )

    db.add(skill)
    db.commit()
    db.refresh(skill)

    return skill
@app.get("/skills", response_model=list[schemas.SkillOut])
def get_skills(
    search: str | None = None,
    category: str | None = None,
    mentor_id: int | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Skill)

    if search:
        query = query.filter(
            models.Skill.title.ilike(f"%{search}%")
        )

    if category:
        query = query.filter(
            models.Skill.category.ilike(f"%{category}%")
        )

    if mentor_id:
        query = query.filter(
            models.Skill.mentor_id == mentor_id
        )

    return query.all()
@app.get("/skills/{skill_id}", response_model=schemas.SkillOut)
def get_skill(skill_id: int, db: Session = Depends(get_db)):
    skill = db.query(models.Skill).filter(models.Skill.id == skill_id).first()

    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    return skill
@app.put("/skills/{skill_id}", response_model=schemas.SkillOut)
def update_skill(
    skill_id: int,
    data: schemas.SkillCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    skill = db.query(models.Skill).filter(
        models.Skill.id == skill_id
    ).first()

    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    if skill.mentor_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only update your own skills"
        )

    skill.title = data.title
    skill.description = data.description
    skill.category = data.category

    db.commit()
    db.refresh(skill)

    return skill
@app.delete("/skills/{skill_id}", status_code=204)
def delete_skill(
    skill_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    skill = db.query(models.Skill).filter(models.Skill.id == skill_id).first()

    if not skill:
        raise HTTPException(
            status_code=404,
            detail="Skill not found"
        )

    if skill.mentor_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only delete your own skills"
        )

    db.delete(skill)
    db.commit()

    return
@app.post("/bookings", response_model=schemas.BookingOut, status_code=201)
def create_booking(
    data: schemas.BookingCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Only students can book mentoring sessions
    if current_user.role != "student":
        raise HTTPException(
            status_code=403,
            detail="Only students can book mentoring sessions"
        )

    # Check that the skill exists
    skill = db.query(models.Skill).filter(
        models.Skill.id == data.skill_id
    ).first()

    if not skill:
        raise HTTPException(
            status_code=404,
            detail="Skill not found"
        )

    # Make sure the selected mentor owns the skill
    if skill.mentor_id != data.mentor_id:
        raise HTTPException(
            status_code=400,
            detail="Selected mentor does not own this skill"
        )

    booking = models.Booking(
        skill_id=data.skill_id,
        student_id=current_user.id,
        mentor_id=data.mentor_id,
        scheduled_at=data.scheduled_at,
        status="pending"
    )

    db.add(booking)
    db.commit()
    db.refresh(booking)

    return booking
@app.get("/bookings", response_model=list[schemas.BookingOut])
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    bookings = db.query(models.Booking).filter(
        models.Booking.student_id == current_user.id
    ).all()

    return bookings
@app.put("/bookings/{booking_id}/cancel")
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    booking = db.query(models.Booking).filter(
        models.Booking.id == booking_id
    ).first()

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    if booking.student_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only cancel your own bookings"
        )

    if booking.status == "cancelled":
        raise HTTPException(
            status_code=400,
            detail="Booking is already cancelled"
        )

    booking.status = "cancelled"
    db.commit()
    db.refresh(booking)

    return booking
@app.post("/reviews", response_model=schemas.ReviewOut, status_code=201)
def create_review(
    data: schemas.ReviewCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    booking = db.query(models.Booking).filter(
        models.Booking.id == data.booking_id
    ).first()

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    if booking.student_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only review your own bookings"
        )

    if booking.status == "cancelled":
        raise HTTPException(
            status_code=400,
            detail="Cannot review a cancelled booking"
        )

    existing_review = db.query(models.Review).filter(
        models.Review.booking_id == data.booking_id
    ).first()

    if existing_review:
        raise HTTPException(
            status_code=400,
            detail="This booking has already been reviewed"
        )

    review = models.Review(
        booking_id=data.booking_id,
        student_id=current_user.id,
        rating=data.rating,
        comment=data.comment
    )

    db.add(review)
    db.commit()
    db.refresh(review)

    return review
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    while True:
        message = await websocket.receive_text()

        await websocket.send_text(
            f"SkillSwap received: {message}"
        )
@app.post("/ai/chat", response_model=schemas.ChatResponse)
def chat(data: schemas.ChatRequest):
    completion = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are SkillSwap AI, a helpful chatbot for a student "
                    "skill-sharing platform. Help users with skills, mentors, "
                    "learning, mentoring sessions, bookings, cancellations, "
                    "reviews, and general SkillSwap questions. Keep answers "
                    "clear, friendly, and concise."
                )
            },
            {
                "role": "user",
                "content": data.message
            }
        ]
    )

    return {
        "response": completion.choices[0].message.content
    }

