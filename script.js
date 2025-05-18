fetch('grammatik.json')
  .then(res => res.json())
  .then(data => {
    const tables = [];
    let currentTable = [];

    data.forEach(row => {
      const hasContent = Object.values(row).some(v => v && v.trim?.() !== '');

      if (hasContent) {
        currentTable.push(row);
      } else if (currentTable.length) {
        tables.push(currentTable);
        currentTable = [];
      }
    });

    if (currentTable.length) tables.push(currentTable);

    renderTables(tables);
  });

function renderTables(tables) {
  const container = document.getElementById('tables-container');

  tables.forEach((tableData, index) => {
    const section = document.createElement('section');

    const heading = document.createElement('h2');
    heading.textContent = `Table ${index + 1}`;
    section.appendChild(heading);

    const table = document.createElement('table');

    // Collect all unique keys from the table
    const allKeys = Array.from(
      tableData.reduce((set, row) => {
        Object.keys(row).forEach(k => set.add(k));
        return set;
      }, new Set())
    );

    // Header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    allKeys.forEach(k => {
      const th = document.createElement('th');
      th.textContent = k;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body
    const tbody = document.createElement('tbody');
    tableData.forEach(row => {
      const tr = document.createElement('tr');
      allKeys.forEach(k => {
        const td = document.createElement('td');
        td.textContent = row[k] || '';
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    section.appendChild(table);
    container.appendChild(section);
  });
}
