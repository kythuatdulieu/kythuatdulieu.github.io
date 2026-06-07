#!/usr/bin/env python3
"""
Parse the PDF-extracted text to get structured explanations per question
and inject them into questions.js.

PDF STRUCTURE:
  [discussions for Q_n] ... Topic MQuestion #N ... [question + options + Suggested Answer + vote] [more discussions Q_n] ...
  [discussions for Q_{n+1}] ... Topic MQuestion #(N+1) ...

So:
  - The "correct" explanation for Q_n is assembled from:
      1. The "Suggested Answer" and community vote INSIDE the Q_n block
      2. The discussion comments appearing BEFORE the Q_n question block (which belong to Q_n)
"""
import json
import re

def load_pdf_text(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

def load_questions(path):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    json_str = content.replace("const QUESTIONS_DATA = ", "").strip().rstrip(";")
    return json.loads(json_str)

def extract_best_comment(comments_block):
    """
    Given a block of community comments, extract the best/most detailed explanation.
    Priority order:
    1. _Lukas_ comment with Correct:/Incorrect: structure
    2. Highest voted comment (Highly Voted label)
    3. Most Recent comment (_Most Recent_ label)
    """
    # Clean page markers
    text = re.sub(r'--- PAGE \d+ ---\n?', '', comments_block)
    
    # 1. _Lukas_ comment
    lukas_match = re.search(
        r'_Lukas_[^\n]*\n(?:Selected Answer: [A-E]\n)?(.*?)(?=\nupvoted)',
        text, re.DOTALL
    )
    if lukas_match:
        comment = lukas_match.group(1).strip()
        if len(comment) > 30:
            return comment
    
    # 2. Highly Voted
    hv_match = re.search(
        r'\w+Highly Voted [^\n]+\n(?:Selected Answer: [A-E]\n)?(.*?)(?=\nupvoted)',
        text, re.DOTALL
    )
    if hv_match:
        comment = hv_match.group(1).strip()
        if len(comment) > 30:
            return comment
    
    # 3. Most Recent (usually the most up-to-date analysis)
    mr_match = re.search(
        r'\w+Most Recent [^\n]+\n(?:Selected Answer: [A-E]\n)?(.*?)(?=\nupvoted)',
        text, re.DOTALL
    )
    if mr_match:
        comment = mr_match.group(1).strip()
        if len(comment) > 30:
            return comment
    
    return None


def parse_pdf_explanations(pdf_text):
    explanations = {}

    # Split the full text by "Topic NQuestion #N" markers
    # This gives pairs: (preceding_discussion, q_id)
    # Pattern: "Topic 1Question #1" or "Topic 1 Question #1"
    split_pattern = r'Topic \d+Question #(\d+)\b'
    parts = re.split(split_pattern, pdf_text)

    # parts layout: [text before Q1, q_id(1), q1_block, q_id(2), q2_block, ...]
    # The text BEFORE each "Topic NQuestion #N" is the community discussion for THAT question

    i = 1  # Start at first q_id
    while i < len(parts):
        q_id = int(parts[i])
        q_block = parts[i + 1] if i + 1 < len(parts) else ""
        preceding_discussion = parts[i - 1] if i >= 1 else ""  # Discussion before this question marker

        # From q_block, extract:
        # - Suggested Answer
        # - Community vote
        suggested_match = re.search(r'Suggested Answer:\s*([A-E])', q_block)
        suggested_answer = suggested_match.group(1) if suggested_match else "?"
        
        vote_match = re.search(r'Community vote distribution\s*\n([A-E] \(\d+%\)(?:[,/]\s*[A-E] \(\d+%\))*)', q_block)
        community_vote = vote_match.group(1).strip() if vote_match else ""
        
        # Get the actual answer text
        answer_text_match = re.search(
            r'^' + re.escape(suggested_answer) + r'\. (.+)',
            q_block, re.MULTILINE
        )
        answer_text = answer_text_match.group(1).strip() if answer_text_match else ""

        # Best comment: look in PRECEDING block (for this question's comments at PDF top)
        # AND in the q_block itself (comments at bottom after Suggested Answer)
        best_comment = extract_best_comment(preceding_discussion) or extract_best_comment(q_block) or ""

        # Build final explanation
        lines = [f"✅ Đáp án đúng: {suggested_answer}"]
        if answer_text:
            lines.append(f"→ {answer_text}")
        lines.append("")
        if best_comment:
            lines.append(best_comment)
        if community_vote:
            lines.append("")
            lines.append(f"📊 Kết quả cộng đồng: {community_vote}")

        explanations[q_id] = "\n".join(lines)
        i += 2

    return explanations

def save_data(questions, output_js):
    with open("/home/duclinh/clone/questions.json", "w", encoding="utf-8") as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
    with open(output_js, "w", encoding="utf-8") as f:
        f.write("const QUESTIONS_DATA = ")
        json.dump(questions, f, ensure_ascii=False, indent=2)
        f.write(";\n")

def main():
    pdf_text = load_pdf_text("/tmp/pdf_extract.txt")
    questions = load_questions("/home/duclinh/clone/questions.js")

    print("Parsing PDF explanations...")
    explanations = parse_pdf_explanations(pdf_text)
    print(f"Found {len(explanations)} explanations from PDF")

    updated = 0
    for q in questions:
        qid = q["id"]
        if qid in explanations and explanations[qid].strip():
            q["explanation_vi"] = explanations[qid]
            updated += 1

    print(f"Updated {updated} / {len(questions)} questions with PDF explanations")
    save_data(questions, "/home/duclinh/clone/questions.js")
    print("Saved to questions.js and questions.json")

    # Show sample
    for q in questions[:5]:
        print(f"\n=== Q#{q['id']} ===")
        print(q.get("explanation_vi", "NO EXPLANATION")[:600])
        print("---")

if __name__ == "__main__":
    main()
