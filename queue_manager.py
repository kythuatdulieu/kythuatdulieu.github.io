import os
import json
import fcntl

QUEUE_FILE = "rewrite_queue.json"

def init_queue():
    if not os.path.exists(QUEUE_FILE):
        files_to_process = []
        for root, dirs, files in os.walk('src/content/docs/concepts'):
            for f in files:
                if f.endswith('.md'):
                    files_to_process.append(os.path.join(root, f))
        
        with open(QUEUE_FILE, 'w') as f:
            json.dump({"pending": files_to_process, "completed": [], "failed": []}, f)
        print(f"Initialized queue with {len(files_to_process)} files.")
    else:
        with open(QUEUE_FILE, 'r') as f:
            data = json.load(f)
        print(f"Queue exists: {len(data['pending'])} pending.")

def pop_task():
    with open(QUEUE_FILE, 'r+') as f:
        fcntl.flock(f, fcntl.LOCK_EX)
        data = json.load(f)
        if not data["pending"]:
            print("EMPTY")
        else:
            task = data["pending"].pop(0)
            f.seek(0)
            f.truncate()
            json.dump(data, f)
            print(task)
        fcntl.flock(f, fcntl.LOCK_UN)

def mark_done(task):
    with open(QUEUE_FILE, 'r+') as f:
        fcntl.flock(f, fcntl.LOCK_EX)
        data = json.load(f)
        data["completed"].append(task)
        f.seek(0)
        f.truncate()
        json.dump(data, f)
        print("OK")
        fcntl.flock(f, fcntl.LOCK_UN)

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        if sys.argv[1] == "init":
            init_queue()
        elif sys.argv[1] == "pop":
            pop_task()
        elif sys.argv[1] == "done" and len(sys.argv) > 2:
            mark_done(sys.argv[2])
