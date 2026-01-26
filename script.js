document.addEventListener("DOMContentLoaded", () => {

  let currentWordKey = "";
  let mode = "en_it";

  let seenWords = JSON.parse(localStorage.getItem("seenWords")) || {
    en_it: [],
    it_en: []
  };

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");


  let dictionary = {
    en_it: {},
    it_en: {}
  };

  let progress = JSON.parse(localStorage.getItem("progress"));

  if (!progress || typeof progress !== "object") {
    progress = { en_it: {}, it_en: {} };
  }

  if (!progress.en_it) progress.en_it = {};
  if (!progress.it_en) progress.it_en = {};

  function normalize(str) {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }



function loadDictionaryForLetter(letter) {
  let filePath;

  if (mode === "en_it") {
    filePath = `${letter}.json`;            // A.json, B.json ...
  } else {
    filePath = `it_en_${letter}.json`;      // it_en_A.json, it_en_B.json ...
  }

  return fetch(filePath)
    .then(res => {
      if (!res.ok) throw new Error("File non trovato: " + filePath);
      return res.json();
    });
}


 async function chooseWord() {

  const letter = alphabet[Math.floor(Math.random() * alphabet.length)];
  const data = await loadDictionaryForLetter(letter);
  dictionary[mode] = data;

  const allWords = Object.keys(dictionary[mode]); // NON toLowerCase()

  const incomplete = allWords.filter(word => {
    const found = progress[mode][word] || [];
    return found.length < dictionary[mode][word].length;
  });

  if (incomplete.length === 0) {
    chooseWord();
    return;
  }

currentWordKey = incomplete[Math.floor(Math.random() * incomplete.length)];

if (!seenWords[mode].includes(currentWordKey)) {
  seenWords[mode].push(currentWordKey);
}

document.getElementById("word").textContent = currentWordKey.toLowerCase();
showFoundTranslations();

}



  function showFoundTranslations() {
    const found = progress[mode][currentWordKey] || [];
    const foundDiv = document.getElementById("found");
    const foundContainer = document.getElementById("foundContainer");

    if (found.length === 0) {
      foundContainer.classList.add("hidden");
    } else {
      foundContainer.classList.remove("hidden");
      foundDiv.innerHTML = "Traduzioni già trovate:<br>" + found.join(", ");
    }
    localStorage.setItem("seenWords", JSON.stringify(seenWords));

  }

  async function renderWorddexAccordion() {
  const accordionContainer = document.getElementById("accordionContainer");
  accordionContainer.innerHTML = "";

  for (const letter of alphabet) {
    const letterBlock = document.createElement("div");
    letterBlock.className = "letter-block";

    const letterBtn = document.createElement("button");
    letterBtn.textContent = letter;
    letterBtn.className = "letter-btn";

    const dropdown = document.createElement("div");
    dropdown.className = "dropdown hidden";

    const titlesRow = document.createElement("div");
    titlesRow.className = "row titles";

    const leftTitle = document.createElement("div");
    leftTitle.className = "dropdown-title left";
    leftTitle.textContent = "Da tradurre";

    const rightTitle = document.createElement("div");
    rightTitle.className = "dropdown-title right";
    rightTitle.textContent = "Traduzioni";

    titlesRow.appendChild(leftTitle);
    titlesRow.appendChild(rightTitle);
    dropdown.appendChild(titlesRow);

    letterBtn.addEventListener("click", async () => {
      dropdown.classList.toggle("hidden");

      if (dropdown.dataset.loaded === "true") return;

      const data = await loadDictionaryForLetter(letter);
      dictionary[mode] = data;

      const words = Object.keys(dictionary[mode]);

      words.forEach(word => {
        const row = document.createElement("div");
        row.className = "row";

        const itemLeft = document.createElement("div");
        itemLeft.className = "word-item left";

        const itemRight = document.createElement("div");
        itemRight.className = "word-item right";

        const isSeen = seenWords[mode].includes(word.toLowerCase());
        const allRaw = dictionary[mode][word];
        const all = Array.isArray(allRaw) ? allRaw : [];
        const found = Array.isArray(progress[mode]?.[word]) ? progress[mode][word] : [];

        itemLeft.textContent = isSeen ? word : "???";

        if (isSeen && found.length === all.length) {
          itemLeft.textContent += " ✔";
        }

        if (!isSeen) {
          itemRight.textContent = "";
        } else if (found.length === 0) {
          itemRight.textContent = all.map(() => "...").join(", ");
        } else {
          itemRight.textContent = all
            .map(t => found.includes(t) ? t : "...")
            .join(", ");
        }

        row.appendChild(itemLeft);
        row.appendChild(itemRight);
        dropdown.appendChild(row);
      });

      dropdown.dataset.loaded = "true";
    });

    letterBlock.appendChild(letterBtn);
    letterBlock.appendChild(dropdown);
    accordionContainer.appendChild(letterBlock);
  }
}


  // --- DOM ELEMENTS ---

  const input = document.getElementById("answer");
  const button = document.getElementById("check");
  const feedback = document.getElementById("feedback");
  const toggleButton = document.getElementById("toggle");
  const resetButton = document.getElementById("resetBtn");
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");
  const closeBtn = document.getElementById("closeBtn");
  const worddexPage = document.getElementById("worddexPage");
  const worddexBtn = document.getElementById("worddexBtn");
  const backToGame = document.getElementById("backToGame");
  const settingsBtn = document.getElementById("settingsBtn");
  const settingsPanel = document.getElementById("settingsPanel");
  const darkBtn = document.getElementById("darkModeBtn");
  const gameBtn = document.getElementById("gameBtn");
  const skipButton = document.getElementById("skip");
  const form = document.getElementById("gameForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const userAnswer = normalize(input.value);

  if (!dictionary[mode] || !dictionary[mode][currentWordKey]) {
    feedback.textContent = "Errore: parola non trovata.";
    feedback.style.color = "red";
  } else if (
    dictionary[mode][currentWordKey].map(normalize).includes(userAnswer)
  ) {
    if (!progress[mode][currentWordKey]) {
      progress[mode][currentWordKey] = [];
    }

    if (!progress[mode][currentWordKey].includes(userAnswer)) {
      progress[mode][currentWordKey].push(userAnswer);
      localStorage.setItem("progress", JSON.stringify(progress));
    }

    showFoundTranslations();
    renderWorddexAccordion();

    feedback.textContent = "Corretto!";
    feedback.style.color = "green";
  } else {
    feedback.textContent = "Sbagliato!";
    feedback.style.color = "red";
  }

  input.value = "";
  chooseWord();
});



if (skipButton) {skipButton.addEventListener("click", () => {
  feedback.textContent = "";
  input.value = "";
  chooseWord();
});}


  // --- EVENT LISTENERS ---

  gameBtn.addEventListener("click", () => {
    sidebar.classList.remove("open");
    worddexPage.classList.add("hidden");
    settingsPanel.classList.remove("open");
  });

  darkBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("darkMode", document.body.classList.contains("dark"));
  });

  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
  }

  settingsBtn.addEventListener("click", () => {
    settingsPanel.classList.toggle("open");
  });

  worddexBtn.addEventListener("click", () => {
    worddexPage.classList.remove("hidden");
    renderWorddexAccordion();
  });

  backToGame.addEventListener("click", () => {
    worddexPage.classList.add("hidden");
  });

  menuBtn.addEventListener("click", () => {
    sidebar.classList.add("open");
  });

  closeBtn.addEventListener("click", () => {
    sidebar.classList.remove("open");
    settingsPanel.classList.add("hidden");
  });

  resetButton.addEventListener("click", () => {
    if (!confirm("Sei sicuro di resettare tutto?")) return;

    progress = { en_it: {}, it_en: {} };
    seenWords = { en_it: [], it_en: [] };

    localStorage.removeItem("progress");
    localStorage.removeItem("seenWords");

    feedback.textContent = "Progressi resettati!";
    feedback.style.color = "orange";

    chooseWord();
    renderWorddexAccordion();
  });

  function submitAnswer() {
    const userAnswer = normalize(input.value);

    if (!dictionary[mode] || !dictionary[mode][currentWordKey]) {
      feedback.textContent = "Errore: parola non trovata.";
      feedback.style.color = "red";
    } else if (
      dictionary[mode][currentWordKey].map(normalize).includes(userAnswer)
    ) {
      if (!progress[mode][currentWordKey]) {
  progress[mode][currentWordKey] = [];
}

if (!progress[mode][currentWordKey].includes(userAnswer)) {
  progress[mode][currentWordKey].push(userAnswer);
}


      showFoundTranslations();
      renderWorddexAccordion();

      feedback.textContent = "Corretto!";
      feedback.style.color = "green";
    } else {
      feedback.textContent = "Sbagliato!";
      feedback.style.color = "red";
    }

    input.value = "";
    chooseWord();
  };



  console.log("elemento toggle:", document.getElementById("toggle"));
  toggleButton.addEventListener("click", () => {
    mode = mode === "en_it" ? "it_en" : "en_it";
    feedback.textContent = "";
    input.value = "";

    chooseWord();
    renderWorddexAccordion();
  });

  // --- START GAME ---

  chooseWord();
});
