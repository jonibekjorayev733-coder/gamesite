#!/usr/bin/env python3
"""Seed database with test games and questions"""

import os
import sys
from datetime import datetime

os.environ["DATABASE_URL"] = "postgresql://neondb_owner:npg_t2xOIW7iejqA@ep-cold-unit-a1oxzhvi-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

from database import SessionLocal, engine
import models
from auth import get_password_hash

# Create tables
models.Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # 1. Clear existing data
    print("🔄 Clearing existing test data...")
    db.query(models.Test).delete()
    db.query(models.Section).delete()
    db.query(models.Game).delete()
    db.commit()
    
    # 2. Create Games
    print("🔄 Creating games...")
    games_data = [
        {"name": "Baraban", "slug": "baraban"},
        {"name": "So'z Qidiruv", "slug": "word-search"},
        {"name": "Millioner", "slug": "millionaire"},
        {"name": "Davlatni Topish", "slug": "davlatni-topish"},
        {"name": "Shumod Oyini", "slug": "shumod"},
    ]
    
    games = {}
    for game_data in games_data:
        game = models.Game(
            name=game_data["name"],
            slug=game_data["slug"]
        )
        db.add(game)
        games[game_data["slug"]] = game
    db.commit()
    print(f"✅ Created {len(games)} games")
    
    # 3. Create Sections
    print("🔄 Creating sections...")
    sections = {}
    for slug, game in games.items():
        section = models.Section(
            game_id=game.id,
            name=f"{game.name} - Bosh Bo'lim",
            order=1
        )
        db.add(section)
        sections[slug] = section
    db.commit()
    
    # 4. Create Test Questions
    print("🔄 Creating test questions...")
    test_questions = {
        "baraban": [
            {
                "question": "O'zbekiston bosh shahri qaysi shahr?",
                "options": ["Samarqand", "Tashkent", "Bukhara", "Fergana"],
                "correct_index": 1,
                "explanation": "Tashkent O'zbekistonning bosh shahri."
            },
            {
                "question": "O'zbekiston qaysi kontinentda joylashgan?",
                "options": ["Afrikada", "Asiyadа", "Yevropada", "Australiyada"],
                "correct_index": 1,
                "explanation": "O'zbekiston markaziy Asiyadа joylashgan."
            },
            {
                "question": "O'zbekiston nechta viloyatga bo'linadi?",
                "options": ["10", "12", "14", "16"],
                "correct_index": 2,
                "explanation": "O'zbekiston 14 ta viloyatga bo'linadi."
            },
        ],
        "word-search": [
            {
                "question": "Quyidagi so'zlardan 'KITOB' so'zining sinonimini toping:",
                "options": ["Daftar", "Qalam", "Asar", "Qog'oz"],
                "correct_index": 2,
                "explanation": "'Asar' kitob ma'nosini bildiradi."
            },
            {
                "question": "Quyidagi so'zlardan 'PAYSHANBA' kunining sinonimini toping:",
                "options": ["Seshanba", "Juma", "Shanba", "Yakshanba"],
                "correct_index": 1,
                "explanation": "'Juma' payshanba kunidan keyin keladi."
            },
        ],
        "millionaire": [
            {
                "question": "Dunyoning eng katta okeani qaysi?",
                "options": ["Atlantika", "Indiya", "Tinch", "Arktika"],
                "correct_index": 2,
                "explanation": "Tinch okeani dunyoning eng katta okeandir."
            },
            {
                "question": "Qaysi davlat eng katta mamlakat?",
                "options": ["Kanada", "Rossiya", "Xitoy", "AQSh"],
                "correct_index": 1,
                "explanation": "Rossiya maydoni bo'yicha eng katta davlat."
            },
        ],
        "davlatni-topish": [
            {
                "question": "Parizh qaysi davlatning bosh shahri?",
                "options": ["Ingilterra", "Ispaniya", "Frantsiya", "Italiya"],
                "correct_index": 2,
                "explanation": "Parizh Frantsiya davlatining bosh shahri."
            },
        ],
        "shumod": [
            {
                "question": "2 + 2 = ?",
                "options": ["3", "4", "5", "6"],
                "correct_index": 1,
                "explanation": "2 + 2 = 4"
            },
            {
                "question": "10 - 5 = ?",
                "options": ["3", "4", "5", "6"],
                "correct_index": 2,
                "explanation": "10 - 5 = 5"
            },
        ]
    }
    
    test_count = 0
    for slug, questions in test_questions.items():
        if slug in sections:
            section = sections[slug]
            for q_data in questions:
                test = models.Test(
                    section_id=section.id,
                    game_key=slug,
                    question=q_data["question"],
                    options=q_data["options"],
                    correct_index=q_data["correct_index"],
                    explanation=q_data["explanation"],
                    difficulty="medium"
                )
                db.add(test)
                test_count += 1
    
    db.commit()
    print(f"✅ Created {test_count} test questions")
    
    # 5. Create test teachers
    print("🔄 Creating test teachers...")
    import hashlib
    
    teachers_data = [
        {"email": "teacher@example.com", "password": "teacher123", "full_name": "Test Teacher"},
        {"email": "admin@teacher.com", "password": "admin123", "full_name": "Admin Teacher"},
    ]
    
    for teacher_data in teachers_data:
        # Check if teacher exists
        existing = db.query(models.Teacher).filter(models.Teacher.email == teacher_data["email"]).first()
        if not existing:
            password_hash = hashlib.sha256(teacher_data["password"].encode('utf-8')).hexdigest()
            teacher = models.Teacher(
                username=teacher_data["email"].split("@")[0],
                email=teacher_data["email"],
                password_hash=password_hash,
                full_name=teacher_data["full_name"],
                is_active=True,
                created_at=datetime.now()
            )
            db.add(teacher)
            print(f"  ✅ {teacher_data['email']}")
    
    db.commit()
    print("✅ Test teachers created")
    
    print("\n✅ Database seeding completed successfully!")
    print("\n📊 Summary:")
    print(f"  - Games: {len(games)}")
    print(f"  - Test Questions: {test_count}")
    print(f"  - Teachers: 2")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()
