import json
import os
import string
from collections import defaultdict

letters = list(string.ascii_uppercase)


def save_compact_json(data, filename):

    text = json.dumps(
        data,
        ensure_ascii=False,
        separators=(",", ":")
    )

    # sistema gli oggetti delle traduzioni
    text = text.replace("},{", "},\n  {")

    # mette gli array delle parole su righe separate
    text = text.replace(
        ":[{",
        ": [\n  {"
    )

    # chiusura degli array
    text = text.replace(
        "}]",
        "}\n ]"
    )

    # separazione parole principali
    text = text.replace(
        "],\"",
        "],\n\n\""
    )

    with open(filename, "w", encoding="utf-8") as f:
        f.write(text)



# italiano -> gruppi inglesi
it_en = defaultdict(lambda: defaultdict(set))


for letter in letters:

    filename = f"{letter}.json"

    if not os.path.exists(filename):
        continue

    print("Leggo", filename)

    with open(filename, "r", encoding="utf-8") as f:
        data = json.load(f)


    for en_word, groups in data.items():

        for group in groups:

            group_id = group["id"]

            for it_word in group["text"]:

                it_en[it_word][group_id].add(en_word)



for letter in letters:

    bucket = {}

    for it_word, groups in it_en.items():

        if not it_word:
            continue

        if it_word[0].upper() != letter:
            continue


        translations = []

        for group_id, words in groups.items():

            translations.append({
                "id": group_id,
                "text": sorted(words, key=str.lower)
            })


        translations.sort(
            key=lambda x: x["id"]
        )

        bucket[it_word] = translations



    bucket = dict(sorted(
        bucket.items(),
        key=lambda x: x[0].lower()
    ))


    filename = f"it_en_{letter}.json"

    save_compact_json(bucket, filename)

    print("Creato", filename)


print("FINITO")