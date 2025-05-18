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

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    for (let j = 0; j < row.cells.length; j++) {
      const cell = row.cells[j];
      if (
        cell &&
        ((matchPartial && cell.textContent.includes(text)) || (!matchPartial && cell.textContent === text))
      ) {
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
          td.textContent = cell;
          tr.appendChild(td);
        }
        tbody.appendChild(tr);
      }
      table.appendChild(tbody);
      container.appendChild(table);

      // Call merging logic on tbody now that it is in DOM
      mergeMultipleCells(tbody, [
        {
          text: "Relativ Satz (Just like 'which', 'who', etc. in English)",
          matchPartial: true,
          direction: "row",
          span: 3,
          style: { fontWeight: "bold", textAlign: "center" }
        },
        {
          text: "Adjektiv Deklanation",
          matchPartial: true,
          direction: "col",
          span: 4,
          style: {
            backgroundColor: "#f8f8f8",
            color: "#2a2a8a",
            fontWeight: "bold",
            textAlign: "center"
          }
        }
      ]);
    });
  });
