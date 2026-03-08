import json
import os
import sys
import time

try:
    import google.generativeai as genai
except ImportError:
    print("Please install google-generativeai: pip install google-generativeai")
    sys.exit(1)

# Initialize the client.
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    print("Error: GEMINI_API_KEY environment variable is not set. Please set it before running.")
    sys.exit(1)

genai.configure(api_key=api_key)

def process_questions(input_file, output_file, max_questions=None):
    with open(input_file, "r", encoding="utf-8") as f:
         content = f.read()
    
    # Extract JSON from JS file
    json_str = content.replace("const QUESTIONS_DATA = ", "").strip().rstrip(";")
    questions = json.loads(json_str)
    
    if max_questions:
         questions = questions[:max_questions]

    print(f"Processing {len(questions)} questions...")
    
    updated_questions = []
    
    # Prompt template
    prompt_template = """
You are an expert Databricks Data Engineer. I will provide you with a multiple-choice question from the Databricks Certified Data Engineer Professional exam.
Your task is to provide a detailed explanation in Vietnamese for why the correct answer is correct, and why the other options are incorrect.

Format your response exactly as follows (no markdown formatting outside of what's shown):

✅ Đáp án đúng: [Correct Option Letter]
→ [Text of correct option]

[Detailed explanation of why this option is correct]

❌ Các đáp án sai:
  [Option Letter 1]. [Brief explanation of why this option is incorrect]
  [Option Letter 2]. [Brief explanation of why this option is incorrect]
...

---------------------
Question Details:
Question: {question}

Options:
{options_text}

Correct Answer: {answer}
"""

    model = genai.GenerativeModel('gemini-1.5-flash')

    for i, q in enumerate(questions):
        print(f"[{i+1}/{len(questions)}] Processing Question {q['id']}...")
        
        # Check if it already has a detailed explanation (e.g. contains "Giải thích chi tiết" or is very long)
        if q.get('explanation_vi') and "Giải thích chi tiết" in q['explanation_vi']:
             print(f"  Already has detailed explanation, skipping.")
             updated_questions.append(q)
             continue
             
        # Prepare options text
        options_text = ""
        for letter, text in q['options'].items():
             options_text += f"{letter}: {text}\n"
             
        prompt = prompt_template.format(
             question=q['question'],
             options_text=options_text,
             answer=q['answer']
        )
        
        try:
             # Call Gemini SDK
             response = model.generate_content(
                 prompt,
                 generation_config=genai.types.GenerationConfig(
                     temperature=0.2,
                 )
             )
             
             explanation = response.text.strip()
             if explanation:
                  q['explanation_vi'] = explanation
                  print(f"  Successfully generated explanation.")
             else:
                  print(f"  Got empty response from API.")
                  
        except Exception as e:
             print(f"  Error generating explanation: {e}")
             
        updated_questions.append(q)
        # Sleep to avoid rate limits
        time.sleep(2)
        
        # Save progress every 10 questions
        if (i + 1) % 10 == 0:
             save_data(updated_questions + questions[i+1:], output_file)
             print(f"Saved progress at question {i+1}")

    # Final save
    save_data(updated_questions, output_file)
    print("Finished processing all questions.")

def save_data(data, output_file):
    # Save as JSON
    with open("/home/duclinh/clone/questions.json", "w", encoding="utf-8") as f:
         json.dump(data, f, ensure_ascii=False, indent=2)
         
    # Save as JS
    with open(output_file, "w", encoding="utf-8") as f:
         f.write("const QUESTIONS_DATA = ")
         json.dump(data, f, ensure_ascii=False, indent=2)
         f.write(";\n")

if __name__ == "__main__":
    # For testing, you can pass a number like `python generate_explanations.py 3`
    max_q = int(sys.argv[1]) if len(sys.argv) > 1 else None
    process_questions("/home/duclinh/clone/questions.js", "/home/duclinh/clone/questions.js", max_q)
