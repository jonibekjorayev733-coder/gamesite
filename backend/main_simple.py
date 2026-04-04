import sys
print("Starting main_simple.py...", file=sys.stderr)

try:
    print("Step 1: Importing FastAPI...", file=sys.stderr)
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    print("✓ FastAPI imported", file=sys.stderr)
except Exception as e:
    print(f"✗ FastAPI import failed: {e}", file=sys.stderr)
    sys.exit(1)

try:
    print("Step 2: Importing database...", file=sys.stderr)
    from database import engine, Base
    print("✓ Database imported", file=sys.stderr)
except Exception as e:
    print(f"✗ Database import failed: {e}", file=sys.stderr)
    sys.exit(1)

try:
    print("Step 3: Importing models...", file=sys.stderr)
    import models
    print("✓ Models imported", file=sys.stderr)
except Exception as e:
    print(f"✗ Models import failed: {e}", file=sys.stderr)
    sys.exit(1)

try:
    print("Step 4: Creating tables...", file=sys.stderr)
    Base.metadata.create_all(bind=engine)
    print("✓ Tables created", file=sys.stderr)
except Exception as e:
    print(f"✗ Table creation failed: {e}", file=sys.stderr)
    sys.exit(1)

try:
    print("Step 5: Creating FastAPI app...", file=sys.stderr)
    app = FastAPI(title="Test API", version="1.0.0")
    print("✓ App created", file=sys.stderr)
except Exception as e:
    print(f"✗ App creation failed: {e}", file=sys.stderr)
    sys.exit(1)

try:
    print("Step 6: Adding CORS...", file=sys.stderr)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    print("✓ CORS added", file=sys.stderr)
except Exception as e:
    print(f"✗ CORS failed: {e}", file=sys.stderr)
    sys.exit(1)

try:
    print("Step 7: Importing routers...", file=sys.stderr)
    from routers import auth, games, sections, tests, game_tests, teacher_auth, custom_tests
    from routers import dashboard_auth, dashboard_tests, dashboard_results
    print("✓ Routers imported", file=sys.stderr)
except Exception as e:
    print(f"✗ Router import failed: {e}", file=sys.stderr)
    import traceback
    traceback.print_exc(file=sys.stderr)
    sys.exit(1)

try:
    print("Step 8: Including routers...", file=sys.stderr)
    app.include_router(auth.router, tags=["auth"])
    print("  ✓ auth router included", file=sys.stderr)
    
    app.include_router(teacher_auth.router, prefix="/api/auth", tags=["teacher-auth"])
    print("  ✓ teacher_auth router included", file=sys.stderr)
    
    app.include_router(dashboard_auth.router, tags=["dashboard-auth-v2"])
    print("  ✓ dashboard_auth router included", file=sys.stderr)
    
    app.include_router(games.router, prefix="/games", tags=["games"])
    print("  ✓ games router included", file=sys.stderr)
    
    app.include_router(sections.router, prefix="/sections", tags=["sections"])
    print("  ✓ sections router included", file=sys.stderr)
    
    app.include_router(tests.router, prefix="/legacy/tests", tags=["tests-legacy"])
    print("  ✓ tests router included", file=sys.stderr)
    
    app.include_router(dashboard_tests.router, tags=["dashboard-tests-v2"])
    print("  ✓ dashboard_tests router included", file=sys.stderr)
    
    app.include_router(dashboard_results.router, tags=["dashboard-results-v2"])
    print("  ✓ dashboard_results router included", file=sys.stderr)
    
    app.include_router(game_tests.router, tags=["game-tests"])
    print("  ✓ game_tests router included", file=sys.stderr)
    
    app.include_router(custom_tests.router, tags=["custom-tests"])
    print("  ✓ custom_tests router included", file=sys.stderr)
    
    print("✓ All routers included", file=sys.stderr)
except Exception as e:
    print(f"✗ Router inclusion failed: {e}", file=sys.stderr)
    import traceback
    traceback.print_exc(file=sys.stderr)
    sys.exit(1)

@app.get("/")
def root():
    return {"message": "Interaktiv-ta'lim API", "version": "1.0"}

@app.get("/health")
def health():
    return {"status": "ok"}

print("✓ Application ready!", file=sys.stderr)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
