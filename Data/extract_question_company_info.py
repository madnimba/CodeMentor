import json
from bs4 import BeautifulSoup

def extract_qna(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")

    # Get company name
    company_name_tag = soup.find("h1")
    company_name = company_name_tag.get_text(strip=True) if company_name_tag else "Unknown Company"

    # Extract company and career website URLs from the table
    table = soup.find("table")
    company_website = career_website = "Not found"
    if table:
        rows = table.find_all("tr")
        for row in rows:
            cells = row.find_all("td")
            if len(cells) == 2:
                label = cells[0].get_text(strip=True).lower()
                if "company website" in label:
                    link = cells[1].find("a")
                    if link:
                        company_website = link.get("href")
                elif "career website" in label:
                    link = cells[1].find("a")
                    if link:
                        career_website = link.get("href")

    # Get the introduction paragraph
    intro_header = soup.find("h2", id="introduction")
    introduction = ""
    if intro_header:
        intro_p = intro_header.find_next("p")
        if intro_p:
            introduction = intro_p.get_text(strip=True)
            introduction = introduction.replace('\n', ' ')

    # Get the interview stages
    stages_header = soup.find("h2", id="star-coder-interview-stages")
    interview_stages = []
    if stages_header:
        stage_list = stages_header.find_next("ol")
        if stage_list:
            interview_stages = [li.get_text(strip=True).replace('\n', ' ') for li in stage_list.find_all("li")]

    # Extract Q&A pairs
    articles = soup.find_all("article")
    qna_list = []
    for article in articles:
        question_tag = article.find("p")
        question = question_tag.get_text(strip=True).replace('\n', ' ') if question_tag else "No question found"

        # Extract code snippet (if any)
        code_snippet = ""
        code_block = article.find("pre")
        if code_block:
            lines = code_block.find_all("span", class_="line")
            code_snippet = "\n".join(line.get_text() for line in lines)

        # Extract answer
        details = article.find("details")
        answer = "No answer found"
        if details:
            p = details.find("p")
            if p:
                answer = p.get_text(strip=True)
                answer = answer.replace('\n', ' ')
            else:
                pre = details.find("pre")
                if pre:
                    lines = pre.find_all("span", class_="line")
                    answer = "\n".join(line.get_text() for line in lines)

        qna_list.append({
            "question": question,
            "code_snippet": code_snippet,
            "answer": answer
        })

    return {
        "company_name": company_name,
        "company_website": company_website,
        "career_website": career_website,
        "introduction": introduction,
        "interview_stages": interview_stages,
        "qna": qna_list
    }

if __name__ == "__main__":
    input_file = "Brain Station 23 _ Interview BD.html"
    output_file = "bs23_qna_full.json"

    data = extract_qna(input_file)

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Extracted {len(data['qna'])} Q&A pairs to {output_file}")
