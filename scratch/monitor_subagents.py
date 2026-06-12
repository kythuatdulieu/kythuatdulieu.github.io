import os
import json
import subprocess

subagents = {
    "991ed135-f281-415b-8f2a-6cae7f8b638b": "E2E Projects Specialist",
    "e2f24b9c-a2ce-4f4e-a547-77f3d9d6af14": "DE Interview Specialist"
}

brain_dir = "/home/duclinh/.gemini/antigravity-cli/brain"

print(f"{'Subagent Role':<30} | {'Modified Files':<15} | {'Last Step Type':<15} | {'Log Status':<55}")
print("-" * 125)

for cid, role in subagents.items():
    log_path = os.path.join(brain_dir, cid, ".system_generated/logs/transcript.jsonl")
    wt_path = os.path.join(brain_dir, "9bbc864e-0bcb-4583-a560-369f9a736ba3/.system_generated/worktrees")
    
    # find worktree matching branch or role
    wt_dir = None
    if os.path.exists(wt_path):
        for entry in os.listdir(wt_path):
            if cid in entry or role.split(" ")[0] in entry:
                wt_dir = os.path.join(wt_path, entry)
                break
    
    modified_count = 0
    if wt_dir and os.path.exists(wt_dir):
        try:
            status_out = subprocess.check_output(["git", "-C", wt_dir, "status", "-s"], text=True)
            modified_count = len([line for line in status_out.splitlines() if line.strip()])
        except Exception:
            pass
            
    last_step_type = "N/A"
    log_status = "Not started"
    
    if os.path.exists(log_path):
        try:
            with open(log_path, "r", encoding="utf-8") as f:
                lines = f.readlines()
                if lines:
                    last_line = lines[-1].strip()
                    try:
                        data = json.loads(last_line)
                        last_step_type = data.get("type", "N/A")
                        content = data.get("content", "")
                        # truncate content for display
                        if content:
                            first_line = content.splitlines()[0] if content.splitlines() else ""
                            log_status = (first_line[:53] + "...") if len(first_line) > 53 else first_line
                        else:
                            log_status = f"Step {data.get('step_index')} finished"
                    except Exception as e:
                        log_status = f"JSON parse err: {str(e)}"
        except Exception as e:
            log_status = f"Read error: {str(e)}"
            
    print(f"{role:<30} | {modified_count:<15} | {last_step_type:<15} | {log_status:<55}")
