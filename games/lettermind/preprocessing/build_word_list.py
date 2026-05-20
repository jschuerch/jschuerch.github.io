import requests
import json
from wordfreq import zipf_frequency

url = "https://raw.githubusercontent.com/tabatkins/wordle-list/main/words"

text = requests.get(url).text

words = [
    w.strip().lower()
    for w in text.splitlines()
    if len(w.strip()) == 5 and w.strip().isalpha()
]

answer_words = [w for w in words if zipf_frequency(w, 'en', wordlist='best', minimum=0.0) > 4]

print(f"Total valid words: {len(words)}")
print(f"Total answer words: {len(answer_words)}")

with open("valid_words.json", "w") as f:
    json.dump(sorted(set(words)), f)

with open("answer_words.json", "w") as f:
    json.dump(sorted(set(answer_words)), f)