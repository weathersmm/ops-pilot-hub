interface SheetColumn {
  id: string;
  title: string;
}

interface SheetCell {
  displayValue?: string;
  value?: string;
}

interface SheetRow {
  id: string;
  cells?: SheetCell[];
}

interface SheetDataDetails {
  name: string;
  columns: SheetColumn[];
  rows: SheetRow[];
}

export function exportToCSV(sheetData: SheetDataDetails, filename?: string) {
  const { name, columns, rows } = sheetData;
  
  // Create CSV header
  const headers = columns.map(col => `"${col.title.replace(/"/g, '""')}"`);
  const csvRows = [headers.join(',')];
  
  // Create CSV rows
  rows.forEach(row => {
    const values = row.cells?.map(cell => {
      const value = cell.displayValue || cell.value || '';
      return `"${value.replace(/"/g, '""')}"`;
    }) || [];
    csvRows.push(values.join(','));
  });
  
  // Create blob and download
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename || `${name.replace(/[^a-z0-9]/gi, '_')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
