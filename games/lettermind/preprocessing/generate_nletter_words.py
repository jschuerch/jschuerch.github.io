import requests
import json
from wordfreq import zipf_frequency
import argparse

url = "https://raw.githubusercontent.com/dwyl/english-words/refs/heads/master/words_dictionary.json"

parser = argparse.ArgumentParser(description="Generate valid and answer word lists")
parser.add_argument("-l", "--length", type=int, default=4, help="Length of words to generate")
parser.add_argument("-f", "--frequency", type=int, default=4, help="Minimum frequency threshold")

args = parser.parse_args()

wordLength = args.length
wordFrequencyThreshold = args.frequency
response = requests.get(url)
wordsDict = response.json()

words = [
    w.strip().lower()
    for w in wordsDict.keys()
    if len(w.strip()) == wordLength and w.strip().isalpha()
]

answer_words = [w for w in words if zipf_frequency(w, 'en', wordlist='best', minimum=0.0) > wordFrequencyThreshold]

print(f"Total valid words: {len(words)}")
print(f"Total answer words: {len(answer_words)}")

with open(f"valid_words_{wordLength}letters.json", "w") as f:
    json.dump(sorted(set(words)), f)

with open(f"answer_words_{wordLength}letters.json", "w") as f:
    json.dump(sorted(set(answer_words)), f)
