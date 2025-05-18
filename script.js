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

fetch("grammatik.json")
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("tablesContainer");

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

    tables.forEach(tableData => {
      const table = document.createElement("table");
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

	// Bold these words anywhere in the table:
	  boldWordsInTable(tbody, ["Nominativ", "Akkusativ", "Dativ", "Genetiv", "Maskulin", "Feminin", "Neuter",
	    "Plural", "Remarks", "Type", "Case", "(O-FUDGE-bis)", "(MAN-VS-BAGZ)", "Wechsel", "(displacement vs position)",
		"(UÜ VIZ. HAAN)", "Präsenz", "Singular", "MV - Singular", "MV - Plural", "NS - Singular", "NS - Plural",
		"NS mit MV - Sin.", "NS mit MV - Pl.", "Präteritum", "Perfekt", "Plusquamperfekt", "Futur I", "Futur II",
		"Kriterien", "Beispiele"]);

      // Call merging logic on tbody now that it is in DOM
      mergeMultipleCells(tbody, [
        {
          text: ["Akkusativ (Displacement)"],
          matchPartial: false,
          direction: "row",
          span: 2,
          style: { 
            fontWeight: "bold", textAlign: "center", verticalAlign: "middle"
		  }
        },
	{
          text: ["Dativ (Position)"],
          matchPartial: false,
          direction: "row",
          span: 2,
          style: { 
            fontWeight: "bold", textAlign: "center", verticalAlign: "middle"
		  }
        },
	{
          text: ["Präpostionen"],
          matchPartial: false,
          direction: "row",
          span: 3,
          style: { 
            fontWeight: "bold", textAlign: "center", verticalAlign: "middle"
		  }
        },
	{
          text: ["Ausnahme:   zu Hause = at home"],
          matchPartial: true,
          direction: "row",
          span: 3,
          style: { 
            fontWeight: "bold", textAlign: "center", verticalAlign: "middle"
		  }
        },
	{
          text: ["werden + Partizip II", "wurden + Partizip II", "sein/haben + Partizip II + worden",
		 "war + Part. II + worden", "werden + Part. II + werden", "werden + Partizip II + worden + sein"],
          matchPartial: false,
          direction: "row",
          span: 3,
          style: { 
            fontWeight: "bold", textAlign: "left", verticalAlign: "middle"
		  }
        },
	{
          text: ["MV: Modal Verb"],
          matchPartial: true,
          direction: "col",
          span: 3,
          style: { 
            fontWeight: "bold", textAlign: "center", verticalAlign: "middle"
		  }
        },
	{
          text: ["Wechsel Verben (Wohin oder wo?)", "Passiv Satz", "N-Deklanation"],
          matchPartial: false,
          direction: "row",
          span: 4,
          style: { 
            fontWeight: "bold", textAlign: "center", verticalAlign: "middle"
		  }
        },
        {
          text: ["Personal Pronomen", "Adjektiv Deklanation (mit bestimmten artikel der/die/das)",
		 "Adjektiv Deklanation (mit unbestimmten artikel ein/eine/ein)",
		 "Adjektiv Deklanation (ohne artikel)", "Relativpronomen",
		 "Relativ Satz (Just like 'which', 'who', etc. in English)"],
          matchPartial: false,
          direction: "row",
          span: 5,
          style: {
			fontWeight: "bold", textAlign: "center", verticalAlign: "middle"
	  	}
          },
	{
          text: ["Bestimmtes / Unbestimmtes Wort", "Examples of Adjektiv Deklanation",
		 "Personal Pronomen Adjektiv Deklanation"],
          matchPartial: false,
          direction: "row",
          span: 6,
          style: {
			fontWeight: "bold", textAlign: "center", verticalAlign: "middle"
	  	}
          },
	{
          text: ["Hinweis: zwei, drei, vier"],
          matchPartial: true,
          direction: "row",
          span: 6,
          style: {
			fontWeight: "bold", textAlign: "center", verticalAlign: "middle"
	  	}
          },
	{
          text: ["Konjuktiv II (I would come if…. Form) Conjugation"],
          matchPartial: false,
          direction: "row",
          span: 8,
          style: { 
            fontWeight: "bold", textAlign: "center", verticalAlign: "middle"
		  }
        },
	{
          text: [`Ich hätte gern`],
          matchPartial: true,
          direction: "row",
          span: 11,
          style: { 
            fontWeight: "bold", textAlign: "center", verticalAlign: "middle"
		  }
        },
	{
          text: [`Note: "möchten"`],
          matchPartial: true,
          direction: "row",
          span: 11,
          style: { 
            fontWeight: "bold", textAlign: "center", verticalAlign: "middle"
		  }
        },
	{
          text: [`Verb Kojuktion (`],
          matchPartial: true,
          direction: "row",
          span: 11,
          style: { 
            fontWeight: "bold", textAlign: "center", verticalAlign: "middle"
		  }
        },
        
      ]);
    });
  });
