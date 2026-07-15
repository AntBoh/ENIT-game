import json
import os
import string

letters = list(string.ascii_uppercase)

counter = 1


def compact_json(data):
    """
    Scrive gli oggetti {id, text:[...]} su una riga.
    """
    return json.dumps(
        data,
        ensure_ascii=False,
        separators=(",", ": ")
    )


for letter in letters:

    filename = f"{letter}.json"

    if not os.path.exists(filename):
        continue

    print(f"Elaborazione {filename}...")

    with open(filename, "r", encoding="utf-8") as f:
        data = json.load(f)


    new_data = {}

    for word, translations in data.items():

        new_translations = []


        # già convertito
        if translations and isinstance(translations[0], dict):

            new_data[word] = translations

            for t in translations:
                counter = max(counter, t["id"] + 1)

            continue


        # vecchio formato
        for translation in translations:

            new_translations.append({
                "id": counter,
                "text": [translation]
            })

            counter += 1


        new_data[word] = new_translations



    # scrittura manuale
    with open(filename, "w", encoding="utf-8") as f:

        f.write("{\n")

        words = list(new_data.items())

        for i, (word, translations) in enumerate(words):

            f.write(
                f'  {json.dumps(word, ensure_ascii=False)}: [\n'
            )

            for j, t in enumerate(translations):

                f.write(
                    "    " + compact_json(t)
                )

                if j < len(translations)-1:
                    f.write(",")

                f.write("\n")


            f.write("  ]")

            if i < len(words)-1:
                f.write(",")

            f.write("\n")


        f.write("}\n")


    print(f"{filename} completato")


print("\nFinito.")
print("Prossimo ID disponibile:", counter)