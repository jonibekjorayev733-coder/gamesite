# PostgreSQL va pgAdmin4 O'rnatish Qo'llanmasi

## Docker-Compose Bilan O'rnatish (Tavsiya Etilgan)

Agar Docker Desktop o'rnatilgan bo'lsa:

```bash
cd c:\react Jonibek\new04\gamesite
docker-compose up -d
```

Bu quyidagi xizmatlarni ishga tushiradi:
- **PostgreSQL 15**: `localhost:5432`
  - Foydalanuvchi: `postgres`
  - Parol: `jonibek`
  - Database: `gamesite_db`

- **pgAdmin 4**: `http://localhost:5050`
  - Email: `admin@gamesite.com`
  - Parol: `jonibek`

---

## Manual PostgreSQL O'rnatish (Windows)

### 1. PostgreSQL-ni Yuklab Oling
- https://www.postgresql.org/download/windows/ dan PostgreSQL 15+ ni yuklab oling
- O'rnatish paytida:
  - Password (postgres foydalanuvchisi uchun): `jonibek`
  - Port: `5432` (default)
  - Locale: O'zbekcha yoki Inglizcha

### 2. Database Yarating
```sql
CREATE DATABASE gamesite_db;
```

### 3. pgAdmin4 O'rnatish
```bash
pip install pgadmin4
pgadmin4
```
Yoki: https://www.pgadmin.org/download/ dan yuklab oling

---

## Backend Configuration

`.env` fayli allaqachon o'rnatilgan:
```
DATABASE_URL=postgresql://postgres:jonibek@localhost:5432/gamesite_db
```

Agar Docker ishlatmayotgan bo'lsangiz, manual o'rnatilgan PostgreSQL-ga ulaning.

---

## Database Migration

Backend ishga tushirilganda avtomatik jadvallar yaratiladi:

```bash
cd backend
python -m uvicorn main:app --reload
```

---

## Tekshirish

1. pgAdmin 4 ga kiring: http://localhost:5050
2. Login qiling: admin@gamesite.com / jonibek
3. PostgreSQL serverini qo'shing
4. gamesite_db databaseni ko'ring
5. tables qismda `games`, `tests`, `sections` jadvallari bo'lishi kerak
