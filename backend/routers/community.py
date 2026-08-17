"""
Community & Peer Learning Router
Provides endpoints for:
1. Farmer peer forum discussions (grouped by crop/region)
2. Upvoting, commenting, and asking agronomic questions
3. Success story highlight cards
4. Basic moderation flag support
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/api/community", tags=["Community & Peer Learning"])

class PostCreateRequest(BaseModel):
    author_name: str
    author_location: str
    crop_tag: str
    title: str
    content: str

class CommentCreateRequest(BaseModel):
    post_id: str
    author_name: str
    comment_text: str

# ---------------------------------------------------------------------------
# In-Memory Seed Storage
# ---------------------------------------------------------------------------
MOCK_POSTS = [
    {
        "id": "POST-101",
        "author_name": "Baldev Singh Dhillon",
        "author_role": "Progressive Farmer (18 Acres)",
        "author_location": "Nilokheri, Karnal (HR)",
        "crop_tag": "Wheat",
        "title": "Saved 40% Water with Laser Leveling + CRI Drip this Rabi Season!",
        "content": "Brothers, we tried laser leveling our 6-acre parcel before sowing DBW-303 wheat. Water requirement dropped from 8 hours per acre to under 4 hours, and zero water stagnation occurred during last week's unseasonal showers. Highly recommend connecting with Custom Hiring Centers on the Rentals tab.",
        "upvotes": 48,
        "upvoted_by_me": False,
        "is_success_story": True,
        "created_at": "2 hours ago",
        "comments": [
            {
                "id": "COM-01",
                "author_name": "Ramesh Patil",
                "author_location": "Dindori (MH)",
                "text": "Great insights Sardar ji! What was the laser leveler rental rate per hour in your mandi?",
                "created_at": "1 hour ago"
            },
            {
                "id": "COM-02",
                "author_name": "Baldev Singh Dhillon",
                "author_location": "Nilokheri",
                "text": "Paid ₹600/hr including operator. Completed 6 acres in 5 hours.",
                "created_at": "45 mins ago"
            }
        ]
    },
    {
        "id": "POST-102",
        "author_name": "Vikas Jadhav",
        "author_role": "FPO Secretary (140 Members)",
        "author_location": "Latur, Maharashtra",
        "crop_tag": "Soybean & Pulses",
        "title": "Adani Wilmar & ITC Escrow Trade: ₹4,920/qtl Realized on 800 Quintals",
        "content": "Our FPO just completed an 800 quintal soybean trade using AgriPulse Escrow. 100% money locked before dispatch, zero mandi cess deductions, and payment credited within 24 hours of NABL moisture assay confirmation.",
        "upvotes": 64,
        "upvoted_by_me": True,
        "is_success_story": True,
        "created_at": "5 hours ago",
        "comments": [
            {
                "id": "COM-03",
                "author_name": "Suresh Gupta",
                "author_location": "Indore (MP)",
                "text": "Congratulations Vikas bhai! How much did you save on freight and arhtiya commission?",
                "created_at": "3 hours ago"
            }
        ]
    },
    {
        "id": "POST-103",
        "author_name": "Jaspreet Kaur",
        "author_role": "Organic Farmer",
        "author_location": "Ludhiana, Punjab",
        "crop_tag": "Mustard",
        "title": "Aphid outbreak spotted on late-sown mustard in Ludhiana",
        "content": "Seeing black aphids on terminal shoots of Giriraj mustard sown in November. Anyone tried Verticillium lecanii bio-spray vs Rogor chemical spray? Please share your field experience.",
        "upvotes": 21,
        "upvoted_by_me": False,
        "is_success_story": False,
        "created_at": "1 day ago",
        "comments": [
            {
                "id": "COM-04",
                "author_name": "Dr. Arvind Rao (Agronomist)",
                "author_location": "IARI New Delhi",
                "text": "If infestation is over 20% plants, use Imidacloprid 17.8 SL @ 0.5ml/L for immediate knockdown, followed by bio-spray after 10 days.",
                "created_at": "18 hours ago"
            }
        ]
    }
]

# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("/posts")
def get_community_feed(crop: Optional[str] = "All"):
    """Get farmer community discussion feed with optional crop filtering."""
    filtered = MOCK_POSTS
    if crop and crop != "All":
        filtered = [p for p in filtered if crop.lower() in p["crop_tag"].lower()]
    return {"status": "success", "total": len(filtered), "posts": filtered}


@router.post("/posts")
def create_community_post(payload: PostCreateRequest):
    """Create a new post in the farmer forum."""
    new_post = {
        "id": f"POST-{len(MOCK_POSTS) + 101}",
        "author_name": payload.author_name or "Farmer Partner",
        "author_role": "Active Farmer",
        "author_location": payload.author_location or "Karnal, Haryana",
        "crop_tag": payload.crop_tag,
        "title": payload.title,
        "content": payload.content,
        "upvotes": 1,
        "upvoted_by_me": False,
        "is_success_story": False,
        "created_at": "Just now",
        "comments": []
    }
    MOCK_POSTS.insert(0, new_post)
    return {"status": "success", "message": "Post published to community board!", "post": new_post}


@router.post("/upvote/{post_id}")
def upvote_post(post_id: str):
    """Toggle upvote on a community post."""
    for p in MOCK_POSTS:
        if p["id"] == post_id:
            p["upvoted_by_me"] = not p["upvoted_by_me"]
            p["upvotes"] += 1 if p["upvoted_by_me"] else -1
            return {"status": "success", "upvotes": p["upvotes"], "upvoted": p["upvoted_by_me"]}
    return {"status": "error", "message": "Post not found"}


@router.post("/comments")
def add_comment(payload: CommentCreateRequest):
    """Add a comment to an existing forum post."""
    for p in MOCK_POSTS:
        if p["id"] == payload.post_id:
            new_comment = {
                "id": f"COM-{len(p['comments']) + 1}",
                "author_name": payload.author_name or "Farmer",
                "author_location": "Local Zone",
                "text": payload.comment_text,
                "created_at": "Just now"
            }
            p["comments"].append(new_comment)
            return {"status": "success", "comment": new_comment}
    return {"status": "error", "message": "Post not found"}
