import json
import os
import string
from collections import defaultdict

letters = list(string.ascii_uppercase)


en_it = defaultdict(list)


for letter in letters:

    filename = f"it_en_{letter}.json"

    if not os.path.exists(filename):
        continue

    print("Leggo", filename)

    with open(filename, "r", encoding="utf-8") as f:
        data = json.load(f)


    for it_word, translations in data.items():

        for item in translations:

            it_id = item["id"]

            for en_word in item["text"]:

                en_it[en_word].append({
                    "id": it_id,
                    "text": [it_word]
                })



class CompactEncoder(json.JSONEncoder):

    def encode(self, obj):

        if isinstance(obj, dict):

            # compatta:
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

            # compatta liste di traduzioni
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



for letter in letters:

    bucket = {}


    for en_word, translations in en_it.items():

        if en_word[0].upper() == letter:

            bucket[en_word] = translations



    bucket = dict(sorted(
        bucket.items(),
        key=lambda x: x[0].lower()
    ))



    filename = f"{letter}.json"


    with open(filename, "w", encoding="utf-8") as f:

        f.write(
            CompactEncoder(
                ensure_ascii=False
            ).encode(bucket)
        )


    print("Creato", filename)



print("FINITO")