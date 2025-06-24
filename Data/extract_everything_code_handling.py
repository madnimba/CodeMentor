import json
import requests
from bs4 import BeautifulSoup
from pathlib import Path
from bs4 import NavigableString

def extract_text_with_inline_code(element):
    parts = []
    for child in element.children:
        if child.name == "code":
            code_text = child.get_text(strip=True).replace('\n', ' ')
            parts.append(f" {code_text} ")
        elif isinstance(child, NavigableString):
            parts.append(child.strip().replace('\n', ' '))
        elif hasattr(child, 'get_text'):
            # Recursively handle child elements (without double counting <code>)
            parts.append(extract_text_with_inline_code(child))
    return ' '.join(filter(None, parts)).strip()


def extract_qna_from_soup(soup):
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
            introduction = extract_text_with_inline_code(intro_p)

    # Get the interview stages
    stages_header = soup.find("h2", id="star-coder-interview-stages")
    interview_stages = []
    if stages_header:
        stage_list = stages_header.find_next("ol")
        if stage_list:
            interview_stages = [
                extract_text_with_inline_code(li)
                for li in stage_list.find_all("li")
            ]

    # Extract Q&A pairs
    articles = soup.find_all("article")
    qna_list = []
    for article in articles:
        question_parts = []

        for child in article.children:
            if getattr(child, 'name', None) == "details":
                continue

            if child.name == "pre":
                lines = child.find_all("span", class_="line")
                code_block = "\n".join(line.get_text() for line in lines)
                question_parts.append(code_block)
            else:
                text = extract_text_with_inline_code(child)
                if text:
                    question_parts.append(text)

        question = "\n".join(question_parts).strip()

        # Extract code snippet inside <details> if any
        code_snippet = ""
        code_block = article.find("details")
        if code_block:
            pre_tag = code_block.find("pre")
            if pre_tag:
                lines = pre_tag.find_all("span", class_="line")
                code_snippet = "\n".join(line.get_text() for line in lines)

        # Extract answer
        answer = "No answer found"
        answer_summary = article.find("summary", string=lambda text: text and "Show Answer" in text)
        if answer_summary:
            details_tag = answer_summary.find_parent("details")
            if details_tag:
                answer_p = details_tag.find("p")
                if answer_p:
                    answer = extract_text_with_inline_code(answer_p)
                else:
                    pre = details_tag.find("pre")
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

def process_links(input_links_file):
    results = []
    with open(input_links_file, "r", encoding="utf-8") as f:
        links = [line.strip() for line in f if line.strip()]

    for link in links:
        try:
            print(f"Fetching: {link}")
            response = requests.get(link)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")
            company_data = extract_qna_from_soup(soup)
            results.append(company_data)
        except Exception as e:
            print(f"Error processing {link}: {e}")

    return results

if __name__ == "__main__":
    input_links_file = "company_links.txt"
    output_file = "all_companies_qna.json"

    all_data = process_links(input_links_file)

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)

    print(f"Extracted data for {len(all_data)} companies to {output_file}")
