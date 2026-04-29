from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class WHTheme(BaseModel):
    primaryColor: str = "#6366f1"
    backgroundColor: str = "#ffffff"
    textColor: str = "#1f2937"
    borderRadius: str = "8px"
    buttonStyle: str = "filled"  # filled | outline
    fontFamily: str = "inherit"


class WHConfig(BaseModel):
    questionText: str = "Was this helpful?"
    positiveLabel: str = "Yes, helpful"
    negativeLabel: str = "Not helpful"
    thankYouMessage: str = "Thanks for your feedback!"
    followUpEnabled: bool = True
    followUpType: str = "textarea"  # textarea | poll | poll_with_input
    followUpQuestion: str = "What could be improved?"
    pollOptions: Optional[List[str]] = ["Missing information", "Confusing explanation", "Wrong answer", "Other"]
    displayMode: str = "inline"  # inline | compact | modal
    theme: Optional[WHTheme] = None


class WHProject(BaseModel):
    name: str
    description: Optional[str] = ""
    config: Optional[WHConfig] = None
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None


class Vote(BaseModel):
    projectId: str
    vote: str  # up | down
    sessionId: str
    pageUrl: Optional[str] = ""
    metadata: Optional[dict] = {}
    createdAt: Optional[datetime] = None


class FeedbackSubmission(BaseModel):
    projectId: str
    sessionId: str
    voteId: Optional[str] = None
    pollAnswer: Optional[str] = None
    textInput: Optional[str] = ""
    pageUrl: Optional[str] = ""
    createdAt: Optional[datetime] = None
