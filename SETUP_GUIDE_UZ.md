# Gamesite Setup va O'rnatish Qo'llanmasi

## 1. Backend API Endpoints

### Authentication
- **POST** `/register` - Yangi foydalanuvchini ro'yxatdan o'tkazish
  ```json
  {
    "username": "user123",
    "password": "password123"
  }
  ```
  
- **POST** `/login` - Kirish
  ```json
  {
    "username": "user123",
    "password": "password123"
  }
  ```

### O'yin Savollari
- **GET** `/api/game-tests/{game_slug}/questions?count=8` - O'yin savollari olish
  - Misol: `/api/game-tests/wheel/questions?count=8`

### Foydalanuvchi O'yin Natijalari
- **POST** `/api/user-games/save` - O'yin natijasini saqlash
  ```json
  {
    "username": "user123",
    "email": "user@example.com",
    "game_slug": "wheel",
    "score": 75,
    "mode": "single",
    "questions_answered": 8,
    "correct_answers": 6
  }
  ```

- **GET** `/api/user-games/user/{username}` - Foydalanuvchining barcha o'yin natijalari
- **GET** `/api/user-games/game/{game_slug}?limit=10` - O'yin top 10 rейтингі

## 2. Database Jadvallar

### `users` - Foydalanuvchilar
- `id`: Integer (Primary Key)
- `username`: String (Unique)
- `password_hash`: String

### `user_games` - O'yin Natijalari
- `id`: Integer (Primary Key)
- `user_id`: Integer (Foreign Key → users)
- `game_slug`: String (e.g., "wheel", "tug_of_war")
- `email`: String (Optional)
- `score`: Integer
- `mode`: String ("single" or "team")
- `team1_score`: Integer (Team o'yinida)
- `team2_score`: Integer (Team o'yinida)
- `questions_answered`: Integer
- `correct_answers`: Integer
- `created_at`: DateTime
- `updated_at`: DateTime

### `games` - O'yin Turlari
- `id`: Integer
- `name`: String (e.g., "Baraban O'yini")
- `slug`: String (e.g., "wheel")

### `tests` - Savol-Javoblar
- `id`: Integer
- `game_key`: String (O'yining slug'i)
- `question`: String (Savol)
- `options`: JSON (4 ta javob variant)
- `correct_index`: Integer (To'g'ri javobning indeksi)
- `explanation`: String (Tushuntirish)
- `difficulty`: String

## 3. Frontend Integration

### Login/Register
```typescript
// Register
const response = await fetch('http://localhost:8000/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'user', password: 'pass' })
});

// Login
const response = await fetch('http://localhost:8000/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'user', password: 'pass' })
});
```

### O'yin Natijalasini Saqlash
```typescript
const saveGameResult = async (userData) => {
  await fetch('http://localhost:8000/api/user-games/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: userData.username,
      email: userData.email,
      game_slug: 'wheel',
      score: 75,
      mode: 'single',
      questions_answered: 8,
      correct_answers: 6
    })
  });
};
```

## 4. O'yin O'tkaziş Jarayoni

1. Foydalanuvchi o'yin turini tanlaydi (Baraban, Arqon tortish, va boshqalar)
2. O'yin boshlanadi va savollari API dan yuklaniadi
3. Foydalanuvchi savollarga javob beradi
4. Ballari to'planiadi
5. O'yin tugaganda natijalar `/api/user-games/save` ga yuboriladi
6. Natijalar `user_games` jadvalida saqlanadi

## 5. Foydalanish Misoli

### 1. Ro'yxatdan o'tish
```bash
curl -X POST http://localhost:8000/register \
  -H "Content-Type: application/json" \
  -d '{"username":"jonibek","password":"password123"}'
```

### 2. O'yin savollari olish
```bash
curl http://localhost:8000/api/game-tests/wheel/questions?count=8
```

### 3. Natijalani saqlash
```bash
curl -X POST http://localhost:8000/api/user-games/save \
  -H "Content-Type: application/json" \
  -d '{
    "username":"jonibek",
    "email":"jonibek@example.com",
    "game_slug":"wheel",
    "score":85,
    "mode":"single",
    "questions_answered":8,
    "correct_answers":7
  }'
```

## 6. API Documentation

Swagger UI: http://localhost:8000/docs
ReDoc: http://localhost:8000/redoc

## 7. Ishlay Turadigan Serverlar

- **Frontend**: http://localhost:5175
- **Backend**: http://localhost:8000
- **Database**: SQLite (test.db)

## 8. Yangi O'yin Qo'shish

1. `seed.py` da `GAMES` ro'yxatiga yangi o'yin qo'shing
2. `DEFAULT_TESTS` da o'yin uchun savollari qo'shing
3. `seed.py` ni ishga tushiring: `python seed.py`
4. Frontend da o'yin yo'nalishini yarating

Misol:
```python
GAMES = [
    (1, "Baraban", "wheel"),
    (2, "Yangi O'yin", "new_game"),  # Yangi
    ...
]

DEFAULT_TESTS = [
    (2, "Yangi O'yin", [
        ("Savol 1?", ["Javob A", "Javob B", "Javob C", "Javob D"], 0),
        ("Savol 2?", ["Javob A", "Javob B", "Javob C", "Javob D"], 1),
    ]),
    ...
]
```

---

**Ishlanmoqda!** ✅ Barcha tizimlar to'g'ri ishlayapti. Login qiling va o'yinlarni boshlang! 🎮
