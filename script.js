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
      const row = rows[r];
      const cells = Array.from(row.cells);

      for (let c = 0, visualCol = 0; c < cells.length; c++) {
        const cell = cells[c];

        if (cell.textContent.includes(matchText)) {
          if (direction === 'col') {
            cell.colSpan = span;

            for (let i = 1; i < span; i++) {
              const nextCell = row.cells[c + 1]; // always access the next DOM sibling
              if (nextCell && nextCell.parentNode === row) {
                row.removeChild(nextCell);
              }
            }
          } else if (direction === 'row') {
            cell.rowSpan = span;

            for (let i = 1; i < span; i++) {
              const nextRow = rows[r + i];
              if (nextRow) {
                const targetCells = Array.from(nextRow.cells);

                let targetIndex = c;
                // Adjust index due to previous rowspan/colspan merges
                for (let t = 0; t < targetCells.length; t++) {
                  if (targetCells[t].cellIndex === cell.cellIndex) {
                    targetIndex = t;
                    break;
                  }
                }

                const toRemove = targetCells[targetIndex];
                if (toRemove && toRemove.parentNode === nextRow) {
                  nextRow.removeChild(toRemove);
                }
              }
            }
          }

          break; // Done with this match
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
