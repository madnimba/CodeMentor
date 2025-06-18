from bs4 import BeautifulSoup

def extract_company_links(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")

    sidebar = soup.find("aside", class_="VPSidebar")
    if not sidebar:
        print("Sidebar not found.")
        return []

    links = []
    for a in sidebar.find_all("a", class_="VPLink"):
        href = a.get("href")
        text = a.get_text(strip=True)
        if href and "/companies/" in href:
            links.append((text, href))

    return links


if __name__ == "__main__":
    html_file = "Brain Station 23 _ Interview BD.html"  # Change this to your file name
    output_file = "company_links.txt"

    company_links = extract_company_links(html_file)

    with open(output_file, "w", encoding="utf-8") as out:
        for name, link in company_links:
            out.write(f"{link}\n")

    print(f"{len(company_links)} links written to {output_file}")
