import json
import os
from collections import defaultdict
import string

letters = list(string.ascii_uppercase)

# dizionario globale en -> [it]
en_it_global = defaultdict(list)

# 1. leggi TUTTI i file it_en_*
for letter in letters:
    file_in = f"it_en_{letter}.json"
    if not os.path.exists(file_in):
        continue

    with open(file_in, "r", encoding="utf-8") as f:
        it_en = json.load(f)

    for it_word, en_list in it_en.items():
        for en_word in en_list:
            if it_word not in en_it_global[en_word]:
                en_it_global[en_word].append(it_word)

# 2. crea i file A.json ... Z.json
for letter in letters:
    bucket = {}

    for en_word, it_list in en_it_global.items():
        if en_word and en_word[0].upper() == letter:
            bucket[en_word] = sorted(it_list, key=str.lower)

    # ordina le parole inglesi
    bucket = dict(sorted(bucket.items(), key=lambda x: x[0].lower()))

    file_out = f"{letter}.json"
    with open(file_out, "w", encoding="utf-8") as f:
        json.dump(bucket, f, ensure_ascii=False, indent=2)

    print(f"Creato: {file_out} ({len(bucket)} parole)")
