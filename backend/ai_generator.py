"""AI test generation using Claude"""

import json
import os
from typing import Optional
from anthropic import Anthropic

# Initialize Anthropic client with API key from environment
api_key = os.getenv("ANTHROPIC_API_KEY")

if api_key:
    client = Anthropic(api_key=api_key)
else:
    client = None

# Game contexts for better test generation
GAME_CONTEXTS = {
    "baraban": "Baraban o'yini - aylaning turli sohalaridagi savollarga javob berish. Savollari jodoiy, matematika, tarix, geografiya va boshqa sohalarga tegishi mumkin.",
    "word-search": "So'z qidiruv o'yini - berilgan so'zlarning sinonimlarini, antonimlarini yoki bog'liq so'zlarini topish.",
    "millionaire": "Millionaire o'yini - qiyinchiroq savollarga javob berish, bu muhim va ko'p bilim talab etadi.",
    "davlatni-topish": "Davlatni topish - dunyo geografiyasi haqida savollari, shaharlar, davlatlar, qit'alar va boshqa geografik ma'lumotlar.",
    "shumod": "Shumod o'yini - odatdan matematika va mensa test savollari.",
}

def generate_tests_for_game(game_slug: str, count: int = 5, language: str = "uz") -> Optional[dict]:
    """
    Generate test questions for a specific game using Claude AI.
    
    Args:
        game_slug: The game identifier (e.g., "baraban", "word-search")
        count: Number of questions to generate (default 5)
        language: Language for questions (default "uz" for Uzbek)
    
    Returns:
        Dictionary with generated questions or None if generation fails
    """
    
    if not client:
        return {
            "questions": [],
            "error": "ANTHROPIC_API_KEY environment variable is not set. Please set your Claude API key: $env:ANTHROPIC_API_KEY='sk-...'"
        }
    
    context = GAME_CONTEXTS.get(game_slug, f"O'yin: {game_slug}")
    
    prompt = f"""Sen O'zbekcha savol-javob o'yinlari uchun savol yaratuvchi AI asistentisan.

O'YIN KONTEKSTI:
{context}

VAZIFA:
Ushbu o'yin uchun {count} ta savol yaratish kerak. Har bir savol quyidagi formatda bo'lishi kerak:

{{
  "text": "Savol matnini Uzbek tilida yozing",
  "options": ["A) Birinchi javob", "B) Ikkinchi javob", "C) Uchinchi javob", "D) To'rtinchi javob"],
  "correctIndex": 0,
  "explanation": "Javobning tushuntirmasi"
}}

TALABLAR:
1. Savollari o'zbek tilida bo'lishi kerak
2. Har bir savol aniq va tushunarli bo'lishi kerak
3. Variantlar to'liq va mantiqiy bo'lishi kerak
4. Tushuntirmalar o'rganishga yordam berishi kerak
5. Savollari o'yin kontekstiga mos bo'lishi kerak

{count} ta savol JSON massivi sifatida yozing. Faqat JSON bo'lsin, boshqa hech narsa yozma.
Formatni quyidagicha tuta:

```json
[
  {{
    "text": "...",
    "options": [...],
    "correctIndex": ...,
    "explanation": "..."
  }}
]
```
"""
    
    try:
        conversation_history = []
        
        # Initial request
        conversation_history.append({
            "role": "user",
            "content": prompt
        })
        
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=2048,
            messages=conversation_history
        )
        
        assistant_message = response.content[0].text
        conversation_history.append({
            "role": "assistant",
            "content": assistant_message
        })
        
        # Extract JSON from response
        try:
            # Try to find JSON in the response
            start = assistant_message.find('[')
            end = assistant_message.rfind(']') + 1
            
            if start != -1 and end != 0:
                json_str = assistant_message[start:end]
                questions = json.loads(json_str)
                
                # Validate and clean questions
                validated_questions = []
                for q in questions:
                    if isinstance(q, dict) and "text" in q and "options" in q:
                        # Ensure options is a list of 4 items
                        options = q.get("options", [])
                        if isinstance(options, list):
                            # Clean option text (remove A), B), C), D) prefixes if present)
                            cleaned_options = []
                            for opt in options:
                                if isinstance(opt, str):
                                    # Remove prefix like "A) ", "B) " etc
                                    opt_text = opt.lstrip()
                                    for prefix in ["A) ", "B) ", "C) ", "D) ", "a) ", "b) ", "c) ", "d) "]:
                                        if opt_text.startswith(prefix):
                                            opt_text = opt_text[len(prefix):]
                                            break
                                    cleaned_options.append(opt_text)
                            
                            # Ensure exactly 4 options
                            while len(cleaned_options) < 4:
                                cleaned_options.append("")
                            options = cleaned_options[:4]
                        
                        correct_idx = q.get("correctIndex", 0)
                        if not isinstance(correct_idx, int):
                            correct_idx = 0
                        
                        validated_questions.append({
                            "text": q.get("text", ""),
                            "options": options,
                            "correctIndex": min(max(correct_idx, 0), 3),
                            "explanation": q.get("explanation", "")
                        })
                
                if validated_questions:
                    return {"questions": validated_questions}
        except json.JSONDecodeError:
            pass
        
        return None
        
    except Exception as e:
        print(f"Error generating tests: {e}")
        return None


# Example usage for testing
if __name__ == "__main__":
    result = generate_tests_for_game("baraban", count=3)
    if result:
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print("Failed to generate tests")
