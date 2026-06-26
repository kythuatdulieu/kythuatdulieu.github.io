import json

try:
    with open('scratch/audit_queue.json', 'r') as f:
        queue = json.load(f)
except (FileNotFoundError, json.JSONDecodeError):
    queue = []

if not queue:
    print("EMPTY")
else:
    popped = queue[:10]
    queue = queue[10:]
    with open('scratch/audit_queue.json', 'w') as f:
        json.dump(queue, f, indent=2)
    for p in popped:
        print(p)
