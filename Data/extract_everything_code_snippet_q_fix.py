import json
import requests
from bs4 import BeautifulSoup
from pathlib import Path

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
            introduction = intro_p.get_text(strip=True)

    # Get the interview stages
    stages_header = soup.find("h2", id="star-coder-interview-stages")
    interview_stages = []
    if stages_header:
        stage_list = stages_header.find_next("ol")
        if stage_list:
            interview_stages = [li.get_text(strip=True) for li in stage_list.find_all("li")]

    # Extract Q&A pairs
    articles = soup.find_all("article")
    qna_list = []
    for article in articles:
        question_html = ""
        answer_html = "No answer found"

        # Extract question: content from <p> and everything after it before any <details>
        first_p = article.find("p")
        details_tags = article.find_all("details")
        first_details = details_tags[0] if details_tags else None
        collecting = False
        for child in article.children:
            if not hasattr(child, 'name'):
                continue
            if child == first_p:
                question_html += str(child)
                collecting = True
                continue
            if child == first_details:
                break
            if collecting:
                question_html += str(child)

        # Process all <details> blocks
        for details_tag in details_tags:
            summary = details_tag.find("summary")
            if summary and summary.get_text(strip=True) == "Show Answer":
                answer_p = details_tag.find("p")
                if answer_p:
                    answer_html = str(answer_p)
            else:
                # Non-answer details content goes to question
                for child in details_tag.contents:
                    if child.name != "summary":
                        question_html += str(child)

        qna_list.append({
            "question": question_html.strip(),
            "answer": answer_html.strip()
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
