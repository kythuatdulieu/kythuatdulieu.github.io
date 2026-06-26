import json
import random

with open('scratch/expansion_queue.json', 'r') as f:
    queue = json.load(f)

if not queue:
    print("EMPTY")
else:
    random.shuffle(queue)
    popped = queue[:10]
    queue = queue[10:]
    with open('scratch/expansion_queue.json', 'w') as f:
        json.dump(queue, f, indent=2)
    for p in popped:
        print(p)
