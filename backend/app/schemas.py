from pydantic import BaseModel, EmailStr

class UserRegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr

    class Config:
        from_attributes = True


class UpdateUsernameRequest(BaseModel):
    username: str


class FavoriteCreateRequest(BaseModel):
    movie_id: str
    title: str
    genres: list[str] = []
    trailer_url: str | None = None


class FavoriteResponse(BaseModel):
    id: int
    movie_id: str
    title: str
    genres: list[str]
    trailer_url: str | None = None
    is_deleted: bool

    class Config:
        from_attributes = True


class FeedbackCreateRequest(BaseModel):
    movie_id: str
    title: str
    reaction: str
    emotion_context: str | None = None
    analysis_text: str | None = None


class FeedbackResponse(BaseModel):
    id: int
    movie_id: str
    title: str
    reaction: str
    emotion_context: str | None = None
    analysis_text: str | None = None

    class Config:
        from_attributes = True


class FeedbackStatsResponse(BaseModel):
    emotion_context: str
    total: int
    like_count: int
    neutral_count: int
    dislike_count: int
    approval_rate: float
