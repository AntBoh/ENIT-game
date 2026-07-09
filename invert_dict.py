import json
import os
from collections import defaultdict
import string

letters = list(string.ascii_uppercase)

# dizionario globale it -> [en]
it_en_global = defaultdict(list)

# 1. leggi TUTTI i file en_it
for letter in letters:
    file_in = f"{letter}.json"
    if not os.path.exists(file_in):
        continue

    with open(file_in, "r", encoding="utf-8") as f:
        en_it = json.load(f)

    for en_word, it_list in en_it.items():
        for it_word in it_list:
            if en_word not in it_en_global[it_word]:
                it_en_global[it_word].append(en_word)

# 2. crea i file it_en_A ... it_en_Z
for letter in letters:
    bucket = {}

    for it_word, en_list in it_en_global.items():
        if it_word[0].upper() == letter:
            bucket[it_word] = sorted(en_list, key=str.lower)

    # ordina le parole italiane
    bucket = dict(sorted(bucket.items(), key=lambda x: x[0].lower()))

    file_out = f"it_en_{letter}.json"
    with open(file_out, "w", encoding="utf-8") as f:
        json.dump(bucket, f, ensure_ascii=False, indent=2)

    print(f"Creato: {file_out} ({len(bucket)} parole)")
