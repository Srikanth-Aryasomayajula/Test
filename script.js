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
