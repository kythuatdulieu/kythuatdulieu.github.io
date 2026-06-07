import pypdf

def extract_text(pdf_path, output_path):
    print(f"Reading {pdf_path}...")
    reader = pypdf.PdfReader(pdf_path)
    text = ""
    for i, page in enumerate(reader.pages):
        text += f"--- PAGE {i+1} ---\n"
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
            
    print(f"Writing {len(text)} characters to {output_path}...")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(text)
    print("Done!")

if __name__ == "__main__":
    extract_text("Certified Data Engineer Professional_Answers.pdf", "/tmp/pdf_extract.txt")
