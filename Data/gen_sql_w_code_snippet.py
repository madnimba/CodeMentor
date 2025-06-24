import json
import hashlib
import re
from slugify import slugify
import bleach


# Optional: Set output file
output_file = "insert_data.sql"

# Subtopics and keyword mapping
subtopics = {
    "Fibonacci": 42,
    "Knapsack": 43,
    "Edit Distance": 45,
    "Coin Change": 46,
    "Majority": 9,
    "Palindrome": 18,
    "Binary Tree": 21,
    "BFS": 32,
    "DFS": 32,
    "Shortest Path": 33,
    "Topological": 34,
    "Union-Find": 35,
    "Trie": 29,
    "Segment Tree": 30,
    "Roman": None,
    "Reverse": None,
    "Permutation": None,
    "Subset": None
}

topics = {
    1: "Arrays & Strings",
    2: "Linked Lists",
    3: "Trees & Binary Trees",
    4: "Graph Algorithms",
    5: "Dynamic Programming",
    6: "SQL Fundamentals",
    7: "Database Design",
    8: "NoSQL Databases",
    9: "Database Performance",
    10: "Transactions & ACID"
}

def guess_subtopic_id(text):
    for key in subtopics:
        if key.lower() in text.lower():
            return subtopics[key] if subtopics[key] is not None else 'NULL'
    return 'NULL'


def guess_track_id(sub_id):
    if sub_id == 'NULL':
        return 'NULL'
    if 1 <= sub_id <= 20:
        return 1
    elif 41 <= sub_id <= 50:
        return 1
    elif 21 <= sub_id <= 40:
        return 1
    return 'NULL'

with open("all_companies_qna.json", "r") as f:
    data = json.load(f)

with open(output_file, "w", encoding="utf-8") as out:
    company_id = 1
    question_id = 1
    companyquestion_id = 1
    solution_id = 1
    questiontopic_id = 1

    for company in data:
        name = company["company_name"].strip().replace("'", "''")
        desc = company.get("introduction", "").replace("'", "''")
        out.write(f"INSERT INTO companies (id, name, country, description) VALUES ({company_id}, '{name}', 'Bangladesh', '{desc}');\n")

        for qna in company["qna"]:
            raw_html = qna["question"]
            allowed_tags = ['b', 'i', 'u', 'em', 'strong', 'ul', 'ol', 'li', 'code', 'pre', 'p', 'br']
            text_html = bleach.clean(raw_html, tags=allowed_tags, strip=True)
            text_html = text_html.replace("'", "''")

            title = text_html[:100].replace("\n", " ")
            slug = slugify(title)
            hash_fp = hashlib.sha256(text_html.encode()).hexdigest()
            subtopic_id = guess_subtopic_id(text_html)
            track_id = guess_track_id(subtopic_id)

            out.write(f"INSERT INTO questions (id, title, slug, description, content_fingerprint, upvotes, downvotes, track_id, subtopic_id) "
                      f"VALUES ({question_id}, '{title}', '{slug}', '{text_html}', '{hash_fp}', 0, 0, {track_id}, {subtopic_id});\n")

            out.write(f"INSERT INTO companyquestions (id, company_id, question_id) VALUES ({companyquestion_id}, {company_id}, {question_id});\n")

            # Best-effort topic guess
            if "graph" in text_html.lower():
                topic_id = 4
            elif "array" in text_html.lower() or "string" in text_html.lower():
                topic_id = 1
            elif "linked list" in text_html.lower():
                topic_id = 2
            elif "tree" in text_html.lower():
                topic_id = 3
            elif "dp" in text_html.lower() or "dynamic programming" in text_html.lower():
                topic_id = 5
            elif "sql" in text_html.lower():
                topic_id = 6
            else:
                topic_id = 'NULL'

            if topic_id != 'NULL':
                out.write(f"INSERT INTO questiontopics (id, question_id, topic_id) VALUES ({questiontopic_id}, {question_id}, {topic_id});\n")
                questiontopic_id += 1

            answer = qna["answer"].strip()
            if answer.lower() != "no answer found":
                answer_clean = answer.replace("'", "''")
                lang = "C++" if "class" in answer or "void" in answer or "#include" in answer else "plaintext"
                out.write(f"INSERT INTO solutions (id, question_id, created_by, code, language, status, runtime, memory) "
                          f"VALUES ({solution_id}, {question_id}, NULL, '{answer_clean}', '{lang}', NULL, NULL, NULL);\n")
                solution_id += 1

            question_id += 1
            companyquestion_id += 1

        company_id += 1

print(f"SQL insert statements written to: {output_file}")
