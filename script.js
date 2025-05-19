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

function generateStyledFlashcardFromRandomTableGram(allTables) {
  const randomIndex = Math.floor(Math.random() * allTables.length);
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

  const submitBtn = document.createElement("button");
  submitBtn.textContent = "Submit";
  submitBtn.onclick = () => evaluateTextInputsGram();
  container.appendChild(submitBtn);
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

  const blankCount = Math.min(4, candidateCells.length);
  const selected = shuffleArray(candidateCells).slice(0, blankCount);

  selected.forEach(({ row: i, col: j, value }) => {
    const correctAnswer = value.trim();
    const otherAnswers = selected
      .filter(s => !(s.row === i && s.col === j))
      .map(s => s.value.trim());

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
    const correct = group[0].dataset.answer;
    const selected = group.find(r => r.checked);

    group.forEach(input => {
      const label = input.parentElement;
      label.classList.remove("correct", "incorrect");

      if (selected && input.value === selected.value) {
        label.classList.add(input.value === correct ? "correct" : "incorrect");
      }

      if (!selected && input.value === correct) {
        label.classList.add("correct");
      }
    });
  }
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
    "Präteritum", "Perfekt", "Plusquamperfekt", "Futur I", "Futur II", "Kriterien", "Beispiele"
  ];
}

function mergeMultipleCells(tbody, configs) {
  for (const config of configs) {
    const { text, direction, span, matchPartial, style } = config;

    for (const row of tbody.rows) {
      for (const cell of row.cells) {
        for (const t of text) {
          const match = matchPartial
            ? cell.innerText.includes(t)
            : cell.innerText.trim() === t.trim();
          if (match) {
            if (direction === "row") cell.colSpan = span;
            if (direction === "col") cell.rowSpan = span;

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
    { text: ["MV: Modal Verb"], matchPartial: true, direction: "col", span: 3, style: styleCenter() },
    { text: ["Wechsel Verben (Wohin oder wo?)", "Passiv Satz", "N-Deklanation"], matchPartial: false, direction: "row", span: 4, style: styleCenter() },
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
