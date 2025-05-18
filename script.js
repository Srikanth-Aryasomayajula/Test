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
              const sibling = cells[j + k];
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
          return; // stop after first match
        }
      }
    }
  });
}
