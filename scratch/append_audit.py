import sys
import json

if len(sys.argv) < 2:
    sys.exit(1)

files = sys.argv[1:]

try:
    with open('scratch/audit_queue.json', 'r') as f:
        queue = json.load(f)
except (FileNotFoundError, json.JSONDecodeError):
    queue = []

queue.extend(files)

with open('scratch/audit_queue.json', 'w') as f:
    json.dump(queue, f, indent=2)
print("Appended:", files)
