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

function mergeCellsWhenContentMatches(table, mergeInstructions) {
  const rows = Array.from(table.rows);

  for (const [matchText, { direction, span }] of Object.entries(mergeInstructions)) {
    for (let r = 0; r < rows.length; r++) {
      const cells = Array.from(rows[r].cells);
      for (let c = 0; c < cells.length; c++) {
        const cell = cells[c];
        if (cell.textContent.includes(matchText)) {
          if (direction === 'col') {
            cell.colSpan = span;
            // Remove merged cells to the right
            for (let i = 1; i < span; i++) {
              const nextCell = cells[c + 1];
              if (nextCell) {
                rows[r].removeChild(nextCell);
              }
            }
          } else if (direction === 'row') {
            cell.rowSpan = span;
            for (let i = 1; i < span; i++) {
              const nextRow = rows[r + i];
              if (nextRow && nextRow.cells[c]) {
                nextRow.removeChild(nextRow.cells[c]);
              }
            }
          }
          break; // once matched, move to next instruction
        }
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
      mergeCellsWhenContentMatches(table, {
        "Relativ Satz": { direction: "col", span: 3 },
        "Personal Pronomen": { direction: "row", span: 2 }
        // Add more patterns as needed
      });

      container.appendChild(table);
    });
  });
