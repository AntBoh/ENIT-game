document.addEventListener("DOMContentLoaded", () => {
let showFoundTimer = null;

  let currentWordKey = "";
  let mode = "en_it";
  mode = "en_it"; // forzato
  
  async function loadAllDictionaries() {
  const promises = alphabet.map(letter => loadDictionaryForLetter(letter));
  const allData = await Promise.all(promises);

  // unisci tutti i file in un unico dictionary
  dictionary[mode] = {};
  for (const data of allData) {
    dictionary[mode] = { ...dictionary[mode], ...data };
  }
}



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
  let counters = JSON.parse(localStorage.getItem("counters")) || {
  completed: 0,
  translations: 0
};

function recalcCountersFromProgress() {
  const dict = dictionary[mode] || {};
  const prog = progress[mode] || {};

  let completed = 0;
  let translations = 0;

  for (const word of Object.keys(prog)) {
    const found = prog[word] || [];
    translations += found.length;

    if (dict[word] && found.length === dict[word].length) {
      completed++;
    }
  }

  counters.completed = completed;
  counters.translations = translations;
}



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

function updateCounters() {
  document.getElementById("completedCounter").textContent =
    `Parole completate: ${counters.completed}`;

  document.getElementById("translationsCounter").textContent =
    `Traduzioni effettuate: ${counters.translations}`;

  localStorage.setItem("counters", JSON.stringify(counters));
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
const loadedLetters = { en_it: new Set(), it_en: new Set() };

 async function chooseWord() {
    const letter = alphabet[Math.floor(Math.random() * alphabet.length)];

  if (!loadedLetters[mode].has(letter)) {
    const data = await loadDictionaryForLetter(letter);
    dictionary[mode] = { ...dictionary[mode], ...data };
    loadedLetters[mode].add(letter);
  }
  const data = await loadDictionaryForLetter(letter);
  dictionary[mode] = { ...dictionary[mode], ...data };


  const allWords = Object.keys(dictionary[mode]);

  const incomplete = allWords.filter(word => {
    const found = progress[mode][word] || [];
    return found.length < dictionary[mode][word].length;
  });

  if (incomplete.length === 0) {
    chooseWord();
    return;
  }
  if (showFoundTimer) {
  clearTimeout(showFoundTimer);
  showFoundTimer = null;
}


  currentWordKey = incomplete[Math.floor(Math.random() * incomplete.length)];

  if (!seenWords[mode].includes(currentWordKey)) {
    seenWords[mode].push(currentWordKey);
  }

  document.getElementById("word").textContent = currentWordKey.toLowerCase();

  const found = progress[mode][currentWordKey] || [];
  if (found.length === 0) {
    document.getElementById("foundContainer").classList.add("hidden");
  } else {
    document.getElementById("foundContainer").classList.remove("hidden");
  }

  recalcCountersFromProgress();
  updateCounters();
}




function showFoundTranslations() {
  const found = progress[mode][currentWordKey] || [];
  const foundDiv = document.getElementById("found");
  const foundContainer = document.getElementById("foundContainer");

  // se non ci sono traduzioni trovate, nascondi subito
  if (found.length === 0) {
    foundContainer.classList.add("hidden");
    return;
  }

  // cancella eventuale timer precedente
  if (showFoundTimer) {
    clearTimeout(showFoundTimer);
  }

  // mostra solo dopo 600ms (puoi cambiare)
  showFoundTimer = setTimeout(() => {
    foundContainer.classList.remove("hidden");
    foundDiv.innerHTML = "Traduzioni già trovate:<br>" + found.join(", ");
  }, 600);
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
      dictionary[mode] = { ...dictionary[mode], ...data };


      const words = Object.keys(data);
      if (dropdown.dataset.loaded === "true") return;


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
  feedback.style.visibility = "hidden";
  const toggleButton = document.getElementById("toggle");
  const resetButton = document.getElementById("resetBtn");
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");
  const closeBtn = document.getElementById("closeBtn");
  const worddexPage = document.getElementById("worddexPage");
  const worddexBtn = document.getElementById("worddexBtn");
  const backToGame = document.getElementById("backToGame");
  const darkBtn = document.getElementById("darkModeBtn");
  const gameBtn = document.getElementById("gameBtn");
  const skipButton = document.getElementById("skip");
  const form = document.getElementById("gameForm");
  toggleButton.disabled = true;
toggleButton.style.opacity = 0.4;
toggleButton.textContent = "Modalità it_en disabilitata";


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

const foundBefore = progress[mode][currentWordKey]?.length || 0;

if (!progress[mode][currentWordKey].includes(userAnswer)) {
  progress[mode][currentWordKey].push(userAnswer);
  localStorage.setItem("progress", JSON.stringify(progress));
  recalcCountersFromProgress();
  updateCounters();
}


    showFoundTranslations();
    renderWorddexAccordion();
    updateCounters();

    feedback.textContent = "Corretto!";
feedback.style.color = "green";
feedback.style.visibility = "visible";

  } else {
    feedback.textContent = "Sbagliato!";
    feedback.style.color = "red";
    feedback.style.visibility = "visible";
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
  });

  darkBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("darkMode", document.body.classList.contains("dark"));
  });

  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
  }

document.querySelectorAll(".accordion-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const panel = btn.nextElementSibling;
    const isOpen = panel.style.maxHeight && panel.style.maxHeight !== "0px";

    // chiudi tutti
    document.querySelectorAll(".accordion-panel").forEach(p => {
      p.style.maxHeight = null;
    });

    // apri quello selezionato
    if (!isOpen) {
      panel.style.maxHeight = panel.scrollHeight + "px";
    }
  });
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
  });

  resetButton.addEventListener("click", () => {
    if (!confirm("Sei sicuro di resettare tutto?")) return;

    progress = { en_it: {}, it_en: {} };
    seenWords = { en_it: [], it_en: [] };

    localStorage.removeItem("progress");
    localStorage.removeItem("seenWords");

    feedback.textContent = "Progressi resettati!";
    feedback.style.color = "orange";

    counters = { completed: 0, translations: 0 };
    localStorage.removeItem("counters");

    chooseWord();
    renderWorddexAccordion();
    updateCounters();
  });




  console.log("elemento toggle:", document.getElementById("toggle"));
  //toggleButton.addEventListener("click", () => {
    //mode = mode === "en_it" ? "it_en" : "en_it";
    //feedback.textContent = "";
    //input.value = "";

    //chooseWord();
    //renderWorddexAccordion();
    //recalcCountersFromProgress();
    //updateCounters();

  //});

  // --- START GAME ---

loadAllDictionaries().then(() => {
  recalcCountersFromProgress();
  updateCounters();
  chooseWord();
});



});
