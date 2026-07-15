import json
import os
import string
from collections import defaultdict

letters = list(string.ascii_uppercase)


# italiano -> lista di oggetti inglesi con id
it_en = defaultdict(list)


for letter in letters:

    filename = f"{letter}.json"

    if not os.path.exists(filename):
        continue

    print("Leggo", filename)

    with open(filename, "r", encoding="utf-8") as f:
        data = json.load(f)


    for en_word, translations in data.items():

        for item in translations:

            en_id = item["id"]

            for it_word in item["text"]:

                it_en[it_word].append({
                    "id": en_id,
                    "text": [en_word]
                })



class CompactEncoder(json.JSONEncoder):

    def encode(self, obj):

        if isinstance(obj, dict):

            # caso:
            # {"id":5,"text":["word"]}
            if (
                "id" in obj
                and "text" in obj
                and len(obj) == 2
            ):
                return (
                    '{"id":'
                    + str(obj["id"])
                    + ',"text":'
                    + json.dumps(
                        obj["text"],
                        ensure_ascii=False,
                        separators=(",", ":")
                    )
                    + '}'
                )


            items = []

            for k, v in obj.items():
                items.append(
                    json.dumps(k, ensure_ascii=False)
                    + ": "
                    + self.encode(v)
                )

            return "{\n" + ",\n".join(items) + "\n}"


        elif isinstance(obj, list):

            # lista di traduzioni
            if (
                obj
                and all(
                    isinstance(x, dict)
                    and "id" in x
                    and "text" in x
                    for x in obj
                )
            ):
                return "[\n" + ",\n".join(
                    "  " + self.encode(x)
                    for x in obj
                ) + "\n]"


            return json.dumps(
                obj,
                ensure_ascii=False,
                separators=(",", ":")
            )


        else:
            return json.dumps(
                obj,
                ensure_ascii=False
            )



# crea file italiani divisi per lettera

for letter in letters:

    bucket = {}

    for it_word, translations in it_en.items():

        if it_word[0].upper() == letter:
            bucket[it_word] = translations


    bucket = dict(sorted(
        bucket.items(),
        key=lambda x: x[0].lower()
    ))


    filename = f"it_en_{letter}.json"


    with open(filename, "w", encoding="utf-8") as f:

        f.write(
            CompactEncoder(
                ensure_ascii=False
            ).encode(bucket)
        )


    print("Creato", filename)



print("FINITO")