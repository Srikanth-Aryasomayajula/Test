(async function main() {
  const data = await fetchDataGram("grammatik.json");
  const tables = prepareDataGram(data);
  generateStyledFlashcardFromRandomTableGram(tables);
})();

// Fetch data from grammatik.json
async function fetchDataGram(url) {
  const response = await fetch(url);
  return await response.json();
}

function insertBlanksIntoStyledTable(tbody, tableData, tableNumber) {
  const candidateCells = [];

  tableData.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (cell && cell.trim()) {
        candidateCells.push({ row: i, col: j, value: cell });
      }
    });
  });

  const blankCount = Math.min(4, candidateCells.length);
  const selected = candidateCells.sort(() => 0.5 - Math.random()).slice(0, blankCount);

  selected.forEach(({ row: i, col: j, value }) => {
    const correctAnswer = value.trim();
    const otherAnswers = selected
      .filter(s => !(s.row === i && s.col === j))
      .map(s => s.value.trim());

    const options = shuffleArray([correctAnswer, ...otherAnswers].slice(0, 4));

    const cell = tbody.rows[i]?.cells[j];
    if (!cell) return;

    cell.innerHTML = ""; // Clear existing content

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
      input.dataset.row = i;
      input.dataset.col = j;
      label.appendChild(input);
      label.appendChild(document.createTextNode(opt));
      optionsDiv.appendChild(label);
      optionsDiv.appendChild(document.createElement("br"));
    });

    cell.appendChild(blankDiv);
    cell.appendChild(optionsDiv);
  });

  return tbody.parentElement; // Return <table>
}


function generateStyledFlashcardFromRandomTableGram(allTables) {
  const randomIndex = Math.floor(Math.random() * allTables.length);
  const tableData = allTables[randomIndex];
  const tableNumber = randomIndex;

  // Clone the table before mutating
  const copiedTable = tableData.map(row => [...row]);

  // Create a <table> element and style it using your existing logic
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

  // Apply bolding and merging logic
  boldWordsInTable(tbody, [
    "Nominativ", "Akkusativ", "Dativ", "Genetiv", "Maskulin", "Feminin", "Neuter",
    "Plural", "Remarks", "Type", "Case", "(O-FUDGE-bis)", "(MAN-VS-BAGZ)", "Wechsel",
    "(displacement vs position)", "(UÜ VIZ. HAAN)", "Präsenz", "Singular", "MV - Singular",
    "MV - Plural", "NS - Singular", "NS - Plural", "NS mit MV - Sin.", "NS mit MV - Pl.",
    "Präteritum", "Perfekt", "Plusquamperfekt", "Futur I", "Futur II", "Kriterien", "Beispiele"
  ]);
  mergeMultipleCells(tbody, getMergeConfigsGram());

  // Now apply flashcard logic (insert blanks & options)
  const flashcardTable = insertBlanksIntoStyledTable(tbody, copiedTable, tableNumber);

  const container = document.getElementById("flashcardContainer");
  container.innerHTML = "";
  container.appendChild(flashcardTable);

  const submitBtn = document.createElement("button");
  submitBtn.textContent = "Submit";
  submitBtn.onclick = () => evaluateTextInputsGram(tableNumber);
  container.appendChild(submitBtn);
}


// Prepare and clean table data for grammatik
function prepareDataGram(data) {
  const tables = [];
  let currentTable = [];

  for (const rowObj of data) {
    const row = Object.values(rowObj);
    if (isEmptyRow(row)) {
      if (currentTable.length) {
        const cleanedTable = removeEmptyColumns(currentTable);
        tables.push(cleanedTable);
        currentTable = [];
      }
    } else {
      currentTable.push(row);
    }
  }

  if (currentTable.length) {
    const cleanedTable = removeEmptyColumns(currentTable);
    tables.push(cleanedTable);
  }

  return tables;
}

// Render tables to the DOM in Grammatik
function renderTablesGram(tables, containerId = "tablesContainer") {
  const container = document.getElementById(containerId);
  container.innerHTML = ""; // Optional: Clear previous content

  tables.forEach((tableData, tableIndex) => {
    const table = document.createElement("table");
    table.dataset.tableNumber = tableIndex;

    const tbody = document.createElement("tbody");

    for (const row of tableData) {
      const tr = document.createElement("tr");
      for (const cell of row) {
        const td = document.createElement("td");
        td.innerHTML = cell.replace(/\n/g, "<br>");
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }

    table.appendChild(tbody);
    container.appendChild(table);

    boldWordsInTable(tbody, [
      "Nominativ", "Akkusativ", "Dativ", "Genetiv", "Maskulin", "Feminin", "Neuter",
      "Plural", "Remarks", "Type", "Case", "(O-FUDGE-bis)", "(MAN-VS-BAGZ)", "Wechsel",
      "(displacement vs position)", "(UÜ VIZ. HAAN)", "Präsenz", "Singular", "MV - Singular",
      "MV - Plural", "NS - Singular", "NS - Plural", "NS mit MV - Sin.", "NS mit MV - Pl.",
      "Präteritum", "Perfekt", "Plusquamperfekt", "Futur I", "Futur II", "Kriterien", "Beispiele"
    ]);

    mergeMultipleCells(tbody, getMergeConfigsGram());
  });
}

// Configuration for merging cells
function getMergeConfigsGram() {
  return [
    {
      text: ["Akkusativ (Displacement)"],
      matchPartial: false,
      direction: "row",
      span: 2,
      style: { fontWeight: "bold", textAlign: "center", verticalAlign: "middle" }
    },
    {
      text: ["Dativ (Position)"],
      matchPartial: false,
      direction: "row",
      span: 2,
      style: { fontWeight: "bold", textAlign: "center", verticalAlign: "middle" }
    },
    {
      text: ["Präpostionen"],
      matchPartial: false,
      direction: "row",
      span: 3,
      style: { fontWeight: "bold", textAlign: "center", verticalAlign: "middle" }
    },
    {
      text: ["Ausnahme:   zu Hause = at home"],
      matchPartial: true,
      direction: "row",
      span: 3,
      style: { fontWeight: "bold", textAlign: "center", verticalAlign: "middle" }
    },
    {
      text: [
        "werden + Partizip II",
        "wurden + Partizip II",
        "sein/haben + Partizip II + worden",
        "war + Part. II + worden",
        "werden + Part. II + werden",
        "werden + Partizip II + worden + sein"
      ],
      matchPartial: false,
      direction: "row",
      span: 3,
      style: { fontWeight: "bold", textAlign: "left", verticalAlign: "middle" }
    },
    {
      text: ["MV: Modal Verb"],
      matchPartial: true,
      direction: "col",
      span: 3,
      style: { fontWeight: "bold", textAlign: "center", verticalAlign: "middle" }
    },
    {
      text: ["Wechsel Verben (Wohin oder wo?)", "Passiv Satz", "N-Deklanation"],
      matchPartial: false,
      direction: "row",
      span: 4,
      style: { fontWeight: "bold", textAlign: "center", verticalAlign: "middle" }
    },
    {
      text: [
        "Personal Pronomen",
        "Adjektiv Deklanation (mit bestimmten artikel der/die/das)",
        "Adjektiv Deklanation (mit unbestimmten artikel ein/eine/ein)",
        "Adjektiv Deklanation (ohne artikel)",
        "Relativpronomen",
        "Relativ Satz (Just like 'which', 'who', etc. in English)"
      ],
      matchPartial: false,
      direction: "row",
      span: 5,
      style: { fontWeight: "bold", textAlign: "center", verticalAlign: "middle" }
    },
    {
      text: [
        "Bestimmtes / Unbestimmtes Wort",
        "Examples of Adjektiv Deklanation",
        "Personal Pronomen Adjektiv Deklanation"
      ],
      matchPartial: false,
      direction: "row",
      span: 6,
      style: { fontWeight: "bold", textAlign: "center", verticalAlign: "middle" }
    },
    {
      text: ["Hinweis: zwei, drei, vier"],
      matchPartial: true,
      direction: "row",
      span: 6,
      style: { fontWeight: "bold", textAlign: "center", verticalAlign: "middle" }
    },
    {
      text: ["Konjuktiv II (I would come if…. Form) Conjugation"],
      matchPartial: false,
      direction: "row",
      span: 8,
      style: { fontWeight: "bold", textAlign: "center", verticalAlign: "middle" }
    },
    {
      text: [`Ich hätte gern`],
      matchPartial: true,
      direction: "row",
      span: 11,
      style: { fontWeight: "bold", textAlign: "center", verticalAlign: "middle" }
    },
    {
      text: [`Note: "möchten"`],
      matchPartial: true,
      direction: "row",
      span: 11,
      style: { fontWeight: "bold", textAlign: "center", verticalAlign: "middle" }
    },
    {
      text: [`Verb Kojuktion (`],
      matchPartial: true,
      direction: "row",
      span: 11,
      style: { fontWeight: "bold", textAlign: "center", verticalAlign: "middle" }
    }
  ];
}



function generateFlashcardFromRandomTableGram(allTables) {
  const randomIndex = Math.floor(Math.random() * allTables.length);
  const tableData = allTables[randomIndex];
  const tableNumber = randomIndex;

  // Deep copy so original isn't affected
  const copiedTable = tableData.map(row => [...row]);

  // Identify candidate cells for blanking
  const candidateCells = [];
  copiedTable.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (cell && cell.trim()) candidateCells.push({ row: i, col: j, value: cell });
    });
  });

  // Randomly choose up to 4 blanks
  const blankCount = Math.min(4, candidateCells.length);
  const selected = candidateCells.sort(() => 0.5 - Math.random()).slice(0, blankCount);

  // Create flashcard container
  const container = document.getElementById("flashcardContainer");
  container.innerHTML = ""; // Clear previous
  const table = document.createElement("table");

  copiedTable.forEach((row, i) => {
    const tr = document.createElement("tr");
    row.forEach((cell, j) => {
      const td = document.createElement("td");

      const match = selected.find(sel => sel.row === i && sel.col === j);
      if (match) {
        const correctAnswer = match.value.trim();
        const otherAnswers = selected
          .filter(s => !(s.row === i && s.col === j))
          .map(s => s.value.trim());

        const options = shuffleArray([correctAnswer, ...otherAnswers].slice(0, 4));

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
          input.dataset.row = i;
          input.dataset.col = j;
          label.appendChild(input);
          label.appendChild(document.createTextNode(opt));
          optionsDiv.appendChild(label);
          optionsDiv.appendChild(document.createElement("br"));
        });

        td.appendChild(blankDiv);
        td.appendChild(optionsDiv);
      } else {
        td.innerHTML = cell.replace(/\n/g, "<br>");
      }

      tr.appendChild(td);
    });
    table.appendChild(tr);
  });

  container.appendChild(table);

  // Add Submit button
  const submitBtn = document.createElement("button");
  submitBtn.textContent = "Submit";
  submitBtn.onclick = () => evaluateTextInputsGram(tableNumber);
  container.appendChild(submitBtn);
}

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

function evaluateTextInputsGram(tableNumber) {
  const inputs = document.querySelectorAll(`input[type="radio"]:checked`);
  inputs.forEach(input => {
    const userAnswer = input.value.trim().toLowerCase();
    const correctAnswer = input.dataset.answer.trim().toLowerCase();

    const resultIcon = document.createElement("span");
    resultIcon.textContent = userAnswer === correctAnswer ? "✅" : "❌";
    resultIcon.style.marginLeft = "5px";
    resultIcon.style.color = userAnswer === correctAnswer ? "green" : "red";
    input.parentNode.appendChild(resultIcon);

    const correctDisplay = document.createElement("div");
    correctDisplay.textContent = `Answer: ${input.dataset.answer}`;
    correctDisplay.style.color = "blue";
    input.parentNode.appendChild(correctDisplay);
  });
}


function boldWordsInTable(tbody, wordsToBold) {
  if (!wordsToBold || wordsToBold.length === 0) return;

  const regex = new RegExp(`\\b(${wordsToBold.map(w => escapeRegExp(w)).join('|')})\\b`, 'gi');

  // Escape RegExp helper
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  for (const row of tbody.rows) {
    for (const cell of row.cells) {
      // Replace text while preserving <br>
      let html = cell.innerHTML;

      // Replace all matched words with <strong>wrapped
      html = html.replace(regex, match => `<strong>${match}</strong>`);

      cell.innerHTML = html;
    }
  }
}


function isEmptyRow(row) {
  return row.every(cell => !cell || cell.trim() === '');
}

function removeEmptyColumns(tableData) {
  const columnCount = tableData[0]?.length || 0;
  const nonEmptyCols = Array(columnCount).fill(false);

  for (const row of tableData) {
    row.forEach((cell, idx) => {
      if (cell && cell.trim() !== '') {
        nonEmptyCols[idx] = true;
      }
    });
  }

  return tableData.map(row => row.filter((_, idx) => nonEmptyCols[idx]));
}

function mergeMultipleCells(tbody, configs) {
  configs.forEach(config => mergeCellsWhenContentMatches(tbody, config));
}

function mergeCellsWhenContentMatches(tbody, mergeInstruction) {
  const { text, span, direction, style = {}, matchPartial = false } = mergeInstruction;
  const rows = Array.from(tbody.rows);

  const texts = Array.isArray(text) ? text : [text]; // Normalize to array

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    for (let j = 0; j < row.cells.length; j++) {
      const cell = row.cells[j];
      if (!cell) continue;

      const content = cell.textContent.trim();

      const matches = texts.some(t =>
		matchPartial
			? content.toLowerCase().includes(t.toLowerCase())
			: content === t
		);

      if (matches) {
        if (direction === "row") {
          cell.colSpan = span;
          for (let k = 1; k < span; k++) {
            const cellToDelete = row.cells[j + 1];
            if (cellToDelete && cellToDelete.parentNode === row) {
              row.removeChild(cellToDelete);
            }
          }
        } else if (direction === "col") {
          cell.rowSpan = span;
          for (let k = 1; k < span; k++) {
            const rowBelow = rows[i + k];
            if (rowBelow) {
              const colIndex = j;
              if (rowBelow.cells.length > colIndex) {
                const toDelete = rowBelow.cells[colIndex];
                if (toDelete && toDelete.parentNode === rowBelow) {
                  rowBelow.removeChild(toDelete);
                }
              }
            }
          }
        }

        Object.assign(cell.style, style);
        return; // stop after first match
      }
    }
  }
}
