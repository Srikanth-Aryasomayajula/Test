(async function main() {
  const data = await fetchDataGram("grammatik.json");
  const tables = prepareDataGram(data);
  generateStyledFlashcardFromRandomTableGram(tables);
})();

async function fetchDataGram(url) {
  const response = await fetch(url);
  return await response.json();
}

function prepareDataGram(data) {
  const tables = [];
  let currentTable = [];

  for (const rowObj of data) {
    const row = Object.values(rowObj);
    if (isEmptyRow(row)) {
      if (currentTable.length) {
        tables.push(removeEmptyColumns(currentTable));
        currentTable = [];
      }
    } else {
      currentTable.push(row);
    }
  }

  if (currentTable.length) {
    tables.push(removeEmptyColumns(currentTable));
  }

  return tables;
}

function isEmptyRow(row) {
  return row.every(cell => !cell || !cell.trim());
}

function removeEmptyColumns(table) {
  const colCount = Math.max(...table.map(row => row.length));
  const isEmptyCol = Array(colCount).fill(true);

  table.forEach(row => {
    row.forEach((cell, i) => {
      if (cell && cell.trim()) {
        isEmptyCol[i] = false;
      }
    });
  });

  return table.map(row => row.filter((_, i) => !isEmptyCol[i]));
}

function generateStyledFlashcardFromRandomTableGram(allTables, currentIndex = null) {
  const randomIndex = currentIndex !== null ? currentIndex : Math.floor(Math.random() * allTables.length);
  const tableData = allTables[randomIndex];
  const tableNumber = randomIndex;
  const copiedTable = tableData.map(row => [...row]);

  const table = document.createElement("table");
  const tbody = document.createElement("tbody");

  copiedTable.forEach(row => {
    const tr = document.createElement("tr");
    row.forEach(cell => {
      const td = document.createElement("td");
      td.innerHTML = cell.replace(/\n/g, "<br>");
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);

  boldWordsInTable(tbody, getBoldWords());
  mergeMultipleCells(tbody, getMergeConfigsGram());
  const flashcardTable = insertBlanksIntoStyledTable(tbody, copiedTable, tableNumber);

  const container = document.getElementById("flashcardContainer");
  container.innerHTML = "";
  container.appendChild(flashcardTable);

	// Navigation Buttons
	currentIndex = currentIndex !== null ? currentIndex : 0;

	const buttonRow = document.createElement("div");
	buttonRow.className = "button-wrapper";

	const prevBtn = document.createElement("button");
	prevBtn.textContent = "Previous";
	prevBtn.id = "prevBtn";
	prevBtn.style.display = "none";
	prevBtn.addEventListener("click", () => {
	  currentIndex = (currentIndex - 1 + allTables.length) % allTables.length;
	  generateStyledFlashcardFromRandomTableGram(allTables, currentIndex);
	});

	const submitBtn = document.createElement("button");
	submitBtn.textContent = "Submit";
	submitBtn.id = "submitBtn";
	submitBtn.className = "loadPracticeBtn";
	submitBtn.addEventListener("click", () => evaluateTextInputsGram());

	const nextBtn = document.createElement("button");
	nextBtn.textContent = "Next";
	nextBtn.id = "nextBtn";
	nextBtn.style.display = "none";
	nextBtn.addEventListener("click", () => {
	  currentIndex = (currentIndex + 1) % allTables.length;
	  generateStyledFlashcardFromRandomTableGram(allTables, currentIndex);
	});

	buttonRow.appendChild(prevBtn);
	buttonRow.appendChild(submitBtn);
	buttonRow.appendChild(nextBtn);
	
	const tableCountDisplay = document.createElement("div");
	tableCountDisplay.className = "progress-indicator";
	tableCountDisplay.textContent = `Table ${randomIndex + 1}/${allTables.length}`;
	tableCountDisplay.style.cssText = "margin: 10px 0; font-weight: bold; text-align: center;";
	container.appendChild(tableCountDisplay);

	container.appendChild(buttonRow);

}

function insertBlanksIntoStyledTable(tbody, tableData) {
  const candidateCells = [];

  tableData.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (cell && cell.trim()) {
        candidateCells.push({ row: i, col: j, value: cell });
      }
    });
  });

  const blankCount = Math.floor(candidateCells.length * 0.85);
  const selected = shuffleArray(candidateCells).slice(0, blankCount);

  selected.forEach(({ row: i, col: j, value }) => {
	
	let correctAnswer = value.trim();

    // Skip bold headers or note-style entries
    const boldWords = getBoldWords();
    const mergeTexts = getMergeConfigsGram().flatMap(config => config.text);

    if (
      boldWords.some(bw => correctAnswer.includes(bw)) ||
      getExcludedPronouns().some(p => correctAnswer === p) ||
      mergeTexts.some(text => correctAnswer.includes(text))
    ) return;

    // Split if '=' is present, blank only left-hand side
    if (correctAnswer.includes("=")) {
      correctAnswer = correctAnswer.split("=")[0].trim();
    }

    const excludedSet = new Set([
	  ...getBoldWords(),
	  ...getExcludedPronouns(),
	  ...getMergeConfigsGram().flatMap(config => config.text),
	]);

	const otherAnswers = selected
	  .filter(s => !(s.row === i && s.col === j))
	  .map(s => s.value.trim())
	  .filter(val => !excludedSet.has(val));

    const options = shuffleArray([correctAnswer, ...otherAnswers].slice(0, 4));

    const cell = tbody.rows[i]?.cells[j];
    if (!cell) return;

    cell.innerHTML = "";

    const blankDiv = document.createElement("div");
    blankDiv.textContent = "_____";

    const optionsDiv = document.createElement("div");
    options.forEach(opt => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `blank-${i}-${j}`;
      input.dataset.answer = correctAnswer;
      input.value = opt;
      label.appendChild(input);
      label.appendChild(document.createTextNode(opt));
      optionsDiv.appendChild(label);
      optionsDiv.appendChild(document.createElement("br"));
    });

    cell.appendChild(blankDiv);
    cell.appendChild(optionsDiv);
  });

  return tbody.parentElement;
}

function evaluateTextInputsGram() {
  const inputs = document.querySelectorAll("input[type=radio]");
  const grouped = {};

  inputs.forEach(input => {
    const name = input.name;
    if (!grouped[name]) grouped[name] = [];
    grouped[name].push(input);
  });

  for (const name in grouped) {
    const group = grouped[name];
    const correctAnswer = group[0].dataset.answer;
    const selected = group.find(r => r.checked);

    if (selected) {
      const isCorrect = selected.value === correctAnswer;
      const resultIcon = document.createElement("span");
      resultIcon.textContent = isCorrect ? "✅" : "❌";
      resultIcon.style.color = isCorrect ? "green" : "red";
      selected.parentNode.appendChild(resultIcon);

      if (!isCorrect) {
        const correctInput = group.find(i => i.value === correctAnswer);
        const parentDiv = selected.closest("div");
        const existing = parentDiv.querySelector(".correct-combo");

        if (!existing) {
          parentDiv.style.display = "block";
          const correctAnswerSpan = document.createElement("div");
          correctAnswerSpan.className = "correct-combo";
          correctAnswerSpan.textContent = `Answer: ${correctInput.dataset.answer}`;
          correctAnswerSpan.style.cssText = "color: blue; margin-top: 4px; display: block;";
          parentDiv.appendChild(correctAnswerSpan);
        }
      }
    } else {
      // No radio selected
      const answerCell = group[0]?.closest("td");
      const resultIcon = document.createElement("span");
      resultIcon.textContent = "❌";
      resultIcon.style.color = "red";
      group[0].parentNode.appendChild(resultIcon);

      const correctInput = group.find(i => i.value === correctAnswer);
      const correctAnswerSpan = document.createElement("div");
      correctAnswerSpan.textContent = `Answer: ${correctInput.dataset.answer}`;
      correctAnswerSpan.style.color = "blue";
      answerCell.appendChild(correctAnswerSpan);
    }
  }

  // Show navigation buttons
  document.getElementById("nextBtn")?.style.setProperty("display", "inline-block");
  document.getElementById("prevBtn")?.style.setProperty("display", "inline-block");
  document.getElementById("submitBtn")?.style.setProperty("display", "none");
}


function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

function boldWordsInTable(tbody, keywords) {
  for (const row of tbody.rows) {
    for (const cell of row.cells) {
      for (const word of keywords) {
        if (cell.innerHTML.includes(word)) {
          cell.innerHTML = cell.innerHTML.replace(
            new RegExp(word, "g"),
            `<strong>${word}</strong>`
          );
        }
      }
    }
  }
}

function getBoldWords() {
  return [
	"Nominativ", "Akkusativ", "Dativ", "Genetiv", "Maskulin", "Feminin", "Neuter",
    "Plural", "Remarks", "Type", "Case", "(O-FUDGE-bis)", "(MAN-VS-BAGZ)", "Wechsel",
    "(displacement vs position)", "(UÜ VIZ. HAAN)", "Präsenz", "Singular", "MV - Singular",
    "MV - Plural", "NS - Singular", "NS - Plural", "NS mit MV - Sin.", "NS mit MV - Pl.",
    "Präteritum", "Perfekt", "Plusquamperfekt", "Futur I", "Futur II", "Kriterien", "Beispiele",
	"Würde-Form + Infinitiv for regelmäßig Präteritum", "Unregelmäßig Präteritum",
	"Modalverben im Konjunktiv (Modalverb [finites Verb] + Infinitiv)" 
  ];
}

function getExcludedPronouns() {
  return [
    "I", "ich", "you", "you (inf.)", "du", "he/she/it", "er/sie/es", "er/es", "we", "wir",
    "you (pl.,inf.)", "ihr", "you (form.)/they", "Sie/sie", "sie/sie", "würden form can also be used for these"
  ];
}

function mergeMultipleCells(tbody, configs) {
  for (const config of configs) {
    const { text, direction, span, matchPartial, style } = config;

    for (let rowIndex = 0; rowIndex < tbody.rows.length; rowIndex++) {
      const row = tbody.rows[rowIndex];

      for (let cellIndex = 0; cellIndex < row.cells.length; cellIndex++) {
        const cell = row.cells[cellIndex];
        for (const t of text) {
          const match = matchPartial
            ? cell.innerText.includes(t)
            : cell.innerText.trim() === t.trim();

          if (match) {
            if (direction === "row") {
              cell.colSpan = span;
              // Remove next (span - 1) cells in same row
              for (let k = 1; k < span; k++) {
                if (row.cells[cellIndex + 1]) {
                  row.deleteCell(cellIndex + 1);
                }
              }
            }

            if (direction === "col") {
              cell.rowSpan = span;
              for (let k = 1; k < span; k++) {
                const nextRow = tbody.rows[rowIndex + k];
                if (nextRow && nextRow.cells[cellIndex]) {
                  nextRow.deleteCell(cellIndex);
                }
              }
            }

            for (const key in style) {
              cell.style[key] = style[key];
            }
          }
        }
      }
    }
  }
}

function getMergeConfigsGram() {
  return [
    { text: ["Akkusativ (Displacement)"], matchPartial: false, direction: "row", span: 2, style: styleCenter() },
    { text: ["Dativ (Position)"], matchPartial: false, direction: "row", span: 2, style: styleCenter() },
    { text: ["Präpostionen"], matchPartial: false, direction: "row", span: 3, style: styleCenter() },
    { text: ["Ausnahme:   zu Hause = at home"], matchPartial: true, direction: "row", span: 3, style: styleCenter() },
    { text: ["werden + Partizip II"], matchPartial: false, direction: "row", span: 3, style: { fontWeight: "bold", textAlign: "left", verticalAlign: "middle" }},
    { text: ["wurden + Partizip II"], matchPartial: false, direction: "row", span: 3, style: { fontWeight: "bold", textAlign: "left", verticalAlign: "middle" }},
	{ text: ["sein/haben + Partizip II + worden"], matchPartial: false, direction: "row", span: 3, style: { fontWeight: "bold", textAlign: "left", verticalAlign: "middle" }},
	{ text: ["war + Part. II + worden"], matchPartial: false, direction: "row", span: 3, style: { fontWeight: "bold", textAlign: "left", verticalAlign: "middle" }},
	{ text: ["werden + Part. II + werden"], matchPartial: false, direction: "row", span: 3, style: { fontWeight: "bold", textAlign: "left", verticalAlign: "middle" }},  
	{ text: ["werden + Partizip II + worden + sein"], matchPartial: false, direction: "row", span: 3, style: { fontWeight: "bold", textAlign: "left", verticalAlign: "middle" }},
	{ text: ["MV: Modal Verb"], matchPartial: true, direction: "col", span: 3, style: styleCenter() },
    { text: ["Passiv Satz"], matchPartial: false, direction: "row", span: 4, style: styleCenter() },
	{ text: ["N-Deklanation"], matchPartial: false, direction: "row", span: 4, style: styleCenter() },
	{ text: ["Wechsel Verben (Wohin oder wo?)"], matchPartial: false, direction: "row", span: 4, style: styleCenter() },
    { text: ["Personal Pronomen"], matchPartial: false, direction: "row", span: 5, style: styleCenter() },
	{ text: ["Adjektiv Deklanation (mit bestimmten artikel der/die/das)"], matchPartial: false, direction: "row", span: 5, style: styleCenter() },
	{ text: ["Adjektiv Deklanation (mit unbestimmten artikel ein/eine/ein)"], matchPartial: false, direction: "row", span: 5, style: styleCenter() },
	{ text: ["Adjektiv Deklanation (ohne artikel)"], matchPartial: false, direction: "row", span: 5, style: styleCenter() },
	{ text: ["Relativpronomen"], matchPartial: false, direction: "row", span: 5, style: styleCenter() },
	{ text: ["Relativ Satz (Just like 'which', 'who', etc. in English)"], matchPartial: false, direction: "row", span: 5, style: styleCenter() },
	{ text: ["Examples of Adjektiv Deklanation"], matchPartial: false, direction: "row", span: 6, style: styleCenter() },
	{ text: ["Bestimmtes / Unbestimmtes Wort"], matchPartial: false, direction: "row", span: 6, style: styleCenter() },
	{ text: ["Personal Pronomen Adjektiv Deklanation"], matchPartial: false, direction: "row", span: 6, style: styleCenter() },
	{ text: ["Hinweis: zwei, drei, vier"], matchPartial: true, direction: "row", span: 6, style: styleCenter() },
	{ text: ["Konjuktiv II (I would come if…. Form) Conjugation"], matchPartial: false, direction: "row", span: 8, style: styleCenter() },
    { text: [`Ich hätte gern`], matchPartial: true, direction: "row", span: 11, style: styleCenter() },
    { text: [`Note: "möchten"`], matchPartial: true, direction: "row", span: 11, style: styleCenter() },
    { text: [`Verb Kojuktion (`], matchPartial: true, direction: "row", span: 11, style: styleCenter() }
  ];
}

function styleCenter() {
  return {
    fontWeight: "bold",
    textAlign: "center",
    verticalAlign: "middle"
  };
}
