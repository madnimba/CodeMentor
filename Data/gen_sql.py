import json
import hashlib
from slugify import slugify

# Keyword mapping to track_id, subtopic_id
keyword_map = {
    "palindrome": (1, 18),
    "fibonacci": (1, 42),
    "knapsack": (1, 43),
    "regex": (1, 5),
    "bst": (1, 23),
    "tree": (1, 21),
    "shortest path": (1, 33),
    "graph": (1, 31),
    "sql": (2, 6),
    "join": (2, 6),
    "query": (2, 6),
    "subset": (1, 49),
    "permutation": (1, 48),
    "reverse": (1, 4),
    "decimal": (1, 4),
    "roman": (1, 4),
}

def guess_track_subtopic(question):
    q = question.lower()
    for keyword, ids in keyword_map.items():
        if keyword in q:
            return ids
    return 'NULL', 'NULL'

def fingerprint(question, answer, code):
    return hashlib.sha256((question + answer + code).encode()).hexdigest()

def sanitize(text):
    return text.replace("'", "''").strip()

with open("all_companies_qna.json", "r", encoding="utf-8") as f:
    data = json.load(f)

company_id_map = {}
question_id = 1
company_id = 1
output_sql = []

for company in data:
    name = sanitize(company["company_name"])
    desc = sanitize(company.get("introduction", ""))
    
    if name not in company_id_map:
        company_id_map[name] = company_id
        output_sql.append(
            f"INSERT INTO companies (id, name, description) VALUES ({company_id}, '{name}', '{desc}') "
            f"ON CONFLICT (name) DO NOTHING;"
        )
        company_id += 1
    
    cid = company_id_map[name]

    for qna in company["qna"]:
        question = sanitize(qna["question"])
        answer = sanitize(qna.get("answer", ""))
        code = sanitize(qna.get("code_snippet", ""))
        slug = slugify(question[:80])
        content_fp = fingerprint(question, answer, code)
        track_id, subtopic_id = guess_track_subtopic(question)

        output_sql.append(
            f"INSERT INTO questions (id, title, slug, description, content_fingerprint, track_id, subtopic_id) "
            f"VALUES ({question_id}, '{question[:255]}', '{slug}', '{question}', '{content_fp}', {track_id}, {subtopic_id}) "
            f"ON CONFLICT (slug) DO NOTHING;"
        )

        output_sql.append(
            f"INSERT INTO companyquestions (company_id, question_id) "
            f"VALUES ({cid}, {question_id}) "
            f"ON CONFLICT DO NOTHING;"
        )

        question_id += 1

# Write to file or print
with open("insert_qna.sql", "w", encoding="utf-8") as out:
    out.write("\n".join(output_sql))

print("✅ SQL file generated: insert_qna.sql")
