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

function mergeMultipleCells(container, configs) {
  configs.forEach(config => mergeCellsWhenContentMatches(container, config));
}

function mergeCellsWhenContentMatches(container, options) {
  const {
    content,
    matchPartial = false,
    direction = "row", // "row" or "col"
    span = 1,
    style = {} // styling object like { fontWeight: "bold", textAlign: "center" }
  } = options;

  const tables = container.querySelectorAll("table");

  tables.forEach(table => {
    const rows = Array.from(table.rows);
    for (let i = 0; i < rows.length; i++) {
      const cells = Array.from(rows[i].cells);
      for (let j = 0; j < cells.length; j++) {
        const cell = cells[j];
        const text = cell.textContent.trim();

        if ((matchPartial && text.includes(content)) || text === content) {
          if (direction === "row") {
            cell.colSpan = span;
            for (let k = 1; k < span; k++) {
              const sibling = cells[j + 1]; // Always the next cell, as previous is removed
              if (sibling) cell.parentNode.removeChild(sibling);
            }
          } else if (direction === "col") {
            cell.rowSpan = span;
            for (let k = 1; k < span; k++) {
              const rowBelow = rows[i + k];
              if (rowBelow && rowBelow.cells[j]) {
                rowBelow.deleteCell(j);
              }
            }
          }

          // Apply styling
          Object.assign(cell.style, style);
          return;
        }
      }
    }
  });
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

      for (const row of tableData) {
        const tr = document.createElement("tr");
        for (const cell of row) {
          const td = document.createElement("td");
          td.textContent = cell;
          tr.appendChild(td);
        }
        table.appendChild(tr);
      }

      // Call merging logic here
      mergeMultipleCells(tablesContainer, [
        {
          content: "Relativ Satz (Just like 'which', 'who', etc. in English)",
          matchPartial: true,
          direction: "row",
          span: 3,
          style: { fontWeight: "bold", textAlign: "center" }
        },
        {
          content: "Adjektiv Deklanation",
          matchPartial: true,
          direction: "col",
          span: 2,
          style: {
            backgroundColor: "#f8f8f8",
            color: "#2a2a8a",
            fontStyle: "italic",
            textAlign: "center"
          }
        }
      ]);

      container.appendChild(table);
    });
  });
