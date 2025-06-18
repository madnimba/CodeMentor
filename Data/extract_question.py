import json
from bs4 import BeautifulSoup

def extract_qna(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")

    articles = soup.find_all("article")
    qna_list = []

    for article in articles:
        # Get the question
        question_tag = article.find("p")
        question = question_tag.get_text(strip=True) if question_tag else "No question found"

        # Get the answer
        details = article.find("details")
        answer = "No answer found"

        if details:
            # Case 1: plain paragraph answer
            p = details.find("p")
            if p:
                answer = p.get_text(strip=True)
            else:
                # Case 2: code block
                pre = details.find("pre")
                if pre:
                    lines = pre.find_all("span", class_="line")
                    code_lines = [line.get_text() for line in lines]
                    answer = "\n".join(code_lines)

        qna_list.append({
            "question": question,
            "answer": answer
        })

    return qna_list


if __name__ == "__main__":
    input_file = "Brain Station 23 _ Interview BD.html"  # Update as needed
    output_file = "bs23_qna.json"

    qna_data = extract_qna(input_file)

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(qna_data, f, ensure_ascii=False, indent=2)

    print(f"{len(qna_data)} Q&A pairs written to {output_file}")
