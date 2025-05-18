fetch('grammatik.json')
  .then(res => res.json())
  .then(data => {
    const groupedTables = [];
    let currentTable = [];

    for (const row of data) {
      const values = Object.values(row).map(v => (v || "").trim());
      const isEmpty = values.every(v => v === "");

      if (isEmpty) {
        if (currentTable.length > 0) {
          const cleaned = cleanTable(currentTable);
          if (cleaned.length > 0 && cleaned[0].length > 0) {
            groupedTables.push(cleaned);
          }
          currentTable = [];
        }
      } else {
        currentTable.push(values);
      }
    }

    if (currentTable.length > 0) {
      const cleaned = cleanTable(currentTable);
      if (cleaned.length > 0 && cleaned[0].length > 0) {
        groupedTables.push(cleaned);
      }
    }

    renderTables(groupedTables);
  });

// Function to remove empty rows and columns
function cleanTable(table) {
  // Remove completely empty rows
  table = table.filter(row => row.some(cell => cell.trim() !== ""));

  // Transpose to check columns
  const colCount = Math.max(...table.map(row => row.length));
  const transposed = Array.from({ length: colCount }, (_, i) =>
    table.map(row => row[i] || "")
  );

  // Determine non-empty columns
  const nonEmptyColIndices = transposed
    .map((col, i) => ({ i, empty: col.every(cell => cell.trim() === "") }))
    .filter(col => !col.empty)
    .map(col => col.i);

  // Reconstruct table with non-empty columns
  return table.map(row =>
    nonEmptyColIndices.map(i => row[i] || "")
  );
}

function renderTables(tables) {
  const container = document.getElementById('tablesContainer');
  tables.forEach(table => {
    const tableElem = document.createElement('table');
    tableElem.classList.add('grammar-table');

    table.forEach(row => {
      const tr = document.createElement('tr');
      row.forEach(cell => {
        const td = document.createElement('td');
        td.textContent = cell;
        tr.appendChild(td);
      });
      tableElem.appendChild(tr);
    });

    container.appendChild(tableElem);
  });
}
