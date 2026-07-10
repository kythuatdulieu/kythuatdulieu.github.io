import json
import os

SUBAGENTS = [
    ("Chunk 1", "1d234f4b-90a4-438b-b3e6-0df80ecb75c3"),
    ("Chunk 2", "1af2d477-79ff-4744-b3f3-dc3faa61744e"),
    ("Chunk 3", "c1a02ded-8155-45b4-87b9-9ba6fc1c55ee"),
    ("Chunk 4", "9993aed2-13e5-4ba6-b70f-a64ac4e4128e"),
    ("Chunk 5", "3c314e3b-e631-45e2-a7f5-50579dd1ebba")
]

BRAIN_DIR = "C:/Users/ducli/.gemini/antigravity-cli/brain"

def main():
    for name, cid in SUBAGENTS:
        path = os.path.join(BRAIN_DIR, cid, ".system_generated", "logs", "transcript.jsonl")
        if not os.path.exists(path):
            print(f"{name} ({cid}): Transcript path does not exist.")
            continue
            
        with open(path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        print(f"=== {name} ({cid}) - Total Lines: {len(lines)} ===")
        # Look back from the end to find the latest PLANNER_RESPONSE
        found = False
        for line in reversed(lines):
            try:
                obj = json.loads(line)
                if obj.get("type") == "PLANNER_RESPONSE":
                    calls = obj.get("tool_calls", [])
                    for call in calls:
                        print(f"  Tool: {call.get('name')}")
                        if call.get('name') == 'run_command':
                            print(f"    CommandLine: {call.get('args', {}).get('CommandLine')}")
                    found = True
                    break
            except Exception as e:
                pass
        if not found:
            print("  No planner response found.")

if __name__ == "__main__":
    main()
