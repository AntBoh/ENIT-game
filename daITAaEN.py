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

    text = text.replace("},{", "},\n  {")

    text = text.replace(
        ":[{",
        ": [\n  {"
    )

    text = text.replace(
        "}]",
        "}\n ]"
    )

    text = text.replace(
        "],\"",
        "],\n\n\""
    )

    with open(filename, "w", encoding="utf-8") as f:
        f.write(text)



# inglese -> gruppi italiani
en_it = defaultdict(lambda: defaultdict(set))


for letter in letters:

    filename = f"it_en_{letter}.json"

    if not os.path.exists(filename):
        continue


    print("Leggo", filename)


    with open(filename, "r", encoding="utf-8") as f:
        data = json.load(f)



    for it_word, groups in data.items():

        for group in groups:

            group_id = group["id"]

            for en_word in group["text"]:

                en_it[en_word][group_id].add(it_word)




for letter in letters:

    bucket = {}


    for en_word, groups in en_it.items():

        if not en_word:
            continue

        if en_word[0].upper() != letter:
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


        bucket[en_word] = translations



    bucket = dict(sorted(
        bucket.items(),
        key=lambda x: x[0].lower()
    ))



    filename = f"{letter}.json"


    save_compact_json(bucket, filename)

    print("Creato", filename)



print("FINITO")