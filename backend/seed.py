"""
Seed script: creates games, sections, default tests, admin user.
Run: cd backend && python seed.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from database import SessionLocal, engine
from models import Base, User, Game, Section, Test
from auth import get_password_hash

GAMES = [
    (1, "Baraban", "wheel"),
    (2, "Arqon tortish", "tug_of_war"),
    (3, "So'z qidiruv", "word_search"),
    (4, "Davlatni top", "country"),
    (5, "Chempion o'quvchi", "champion"),
    (6, "Viktorina", "quiz"),
    (7, "Millioner", "millionaire"),
    (8, "Xotira o'yini", "memory"),
    (9, "Tezkor hisob", "math"),
    (10, "So'z topish", "word"),
    (11, "Vaqt boshi", "speed_round"),
    (12, "Krossvord", "crossword"),
    (13, "Kattasini top", "biggest"),
    (14, "1v1 Jang", "duel"),
    (15, "Savol zanjiri", "chain"),
]

DEFAULT_TESTS = [
    (2, "Arqon tortish", [
        ("O'zbekiston poytaxti qaysi shahar?", ["Samarqand", "Toshkent", "Buxoro", "Xiva"], 1),
        ("2 + 2 × 3 = ?", ["12", "8", "10", "6"], 1),
        ("Eng katta okean qaysi?", ["Atlantika", "Hind", "Tinch", "Shimoliy Muz"], 2),
        ("H2O nima?", ["Tuz", "Suv", "Kislorod", "Vodorod"], 1),
        ("2 + 5 = ?", ["5", "6", "7", "8"], 2),
        ("Quyosh sistemasida nechta sayyora bor?", ["7", "8", "9", "6"], 1),
        ("3 × 4 = ?", ["10", "11", "12", "13"], 2),
    ]),
    (6, "Viktorina", [
        ("Amir Temur qachon tug'ilgan?", ["1336", "1370", "1405", "1300"], 0),
        ("\"Alpomish\" dostoni qaysi xalqqa tegishli?", ["Tojik", "O'zbek", "Qozoq", "Qirg'iz"], 1),
        ("Eng kichik tub son?", ["0", "1", "2", "3"], 2),
        ("1 km necha metr?", ["100", "1000", "10000", "500"], 1),
        ("O'zbekiston mustaqillik kuni?", ["1 Sentyabr", "8 Dekabr", "21 Mart", "9 May"], 0),
    ]),
    (7, "Millioner", [
        ("O'zbekiston poytaxti?", ["Samarqand", "Toshkent", "Buxoro", "Xiva"], 1),
        ("1 km = ? metr", ["100", "1000", "500", "10000"], 1),
    ]),
    (1, "Baraban", [
        ("2 + 3 = ?", ["4", "5", "6", "7"], 1),
        ("Eng kichik tub son?", ["0", "1", "2", "3"], 2),
    ]),
    (11, "Vaqt boshi", [
        ("30 sekundda qancha to'g'ri javob bera olasiz?", ["5", "10", "15", "Cheksiz"], 1),
        ("2² + 3² = ?", ["10", "13", "12", "11"], 1),
        ("PI qiymati (taxminan)?", ["3.14", "3.15", "3.16", "2.71"], 0),
        ("Quyosh qayerdan chiqadi?", ["G'arb", "Sharq", "Janub", "Shimol"], 1),
    ]),
    (12, "Krossvord", [
        ("O'zbekistonning poytaxti (5 harf)?", ["Buxoro", "Toshkent", "Xiva", "Nukus"], 1),
        ("Yilning birinchi oyi?", ["Mart", "Yanvar", "Dekabr", "Sentyabr"], 1),
        ("2 + 2 = ?", ["3", "4", "5", "6"], 1),
    ]),
    (13, "Kattasini top", [
        ("Qaysi son kattaroq?", ["99", "101", "100", "98"], 1),
        ("Eng katta sonni toping:", ["1000", "9999", "1001", "100"], 1),
        ("√81 = ?", ["8", "9", "7", "10"], 1),
    ]),
    (14, "1v1 Jang", [
        ("O'zbekiston bayrog'ida nechta yulduz bor?", ["10", "12", "11", "9"], 1),
        ("Eng uzun daryo?", ["Nil", "Amazon", "Yangi", "Mississippi"], 0),
        ("10 × 10 = ?", ["90", "100", "110", "1000"], 1),
    ]),
    (15, "Savol zanjiri", [
        ("Ketma-ket: 2, 4, 6, ... Keyingi son?", ["8", "10", "7", "9"], 0),
        ("Alifboda 'A' dan keyin qaysi harf?", ["B", "V", "O", "Yo"], 0),
        ("Haftada necha kun bor?", ["5", "6", "7", "8"], 2),
    ]),
]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        for gid, name, slug in GAMES:
            if db.query(Game).filter(Game.slug == slug).first() is None:
                db.add(Game(id=gid, name=name, slug=slug))
                print(f"Created game: {name} ({slug})")
        db.commit()

        try:
            if db.query(User).filter(User.username == "admin").first() is None:
                db.add(User(username="admin", password_hash=get_password_hash("admin123")))
                db.commit()
                print("Created user: admin / admin123")
        except Exception as e:
            db.rollback()
            print(f"User yaratishda xato (users jadvalini yangilang): {e}")

        # Sections va default testlar
        for game_id, section_name, tests_data in DEFAULT_TESTS:
            section = db.query(Section).filter(
                Section.game_id == game_id,
                Section.name == section_name
            ).first()
            if section is None:
                section = Section(game_id=game_id, name=section_name, order=0)
                db.add(section)
                db.commit()
                db.refresh(section)
                print(f"Created section: {section_name} (game_id={game_id})")

            # Get the game slug for game_key
            game = db.query(Game).filter(Game.id == game_id).first()
            game_slug = game.slug if game else section_name.lower()

            for q, opts, correct in tests_data:
                exists = db.query(Test).filter(
                    Test.section_id == section.id,
                    Test.question == q
                ).first()
                if not exists:
                    db.add(Test(
                        section_id=section.id,
                        game_key=game_slug,
                        question=q,
                        options=opts,
                        correct_index=correct
                    ))
                    print("  + Test qo'shildi")
        db.commit()
        print("\nSeed tugadi. Test jadvaliga default testlar qo'shildi.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
