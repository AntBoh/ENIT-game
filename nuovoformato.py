import json
import string
import os


letters = string.ascii_uppercase


for letter in letters:

    filename = f"{letter}.json"

    if not os.path.exists(filename):
        continue

    print(f"Conversione {filename}...")

    with open(filename, "r", encoding="utf-8") as f:
        data = json.load(f)


    new_data = {}

    for word, translations in data.items():

        # se per qualche motivo è già convertito, lo lascia stare
        if translations and isinstance(translations[0], list):
            new_data[word] = translations
            continue


        # vecchio formato -> nuovo formato
        new_data[word] = [
            [translation]
            for translation in translations
        ]


    with open(filename, "w", encoding="utf-8") as f:
        json.dump(
            new_data,
            f,
            ensure_ascii=False,
            indent=2
        )


    print(f"  OK: {filename}")


print("Conversione completata.")