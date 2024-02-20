const apiUrl = 'https://your-backend.herokuapp.com/api'; // Replace with your Heroku backend URL

async function addRow() {
    var table = document.getElementById("attendanceTable").getElementsByTagName('tbody')[0];
    var newRow = table.insertRow(table.rows.length);
    var cell1 = newRow.insertCell(0);
    var cell2 = newRow.insertCell(1);
    var cell3 = newRow.insertCell(2);
    cell1.innerHTML = '<input type="text" name="name[]" placeholder="Enter Name">';
    cell2.innerHTML = '<input type="text" name="roll[]" placeholder="Enter Roll Number">';
    cell3.innerHTML = '<select name="status[]"><option value="Present">Present</option><option value="Absent">Absent</option></select>';
}

async function saveTemplate() {
    var templateName = prompt("Enter Template Name:");
    if (templateName) {
        var template = [];
        var rows = document.getElementById("attendanceTable").getElementsByTagName("tr");
        for (var i = 1; i < rows.length; i++) {
            var cells = rows[i].getElementsByTagName("td");
            template.push({
                name: cells[0].getElementsByTagName("input")[0].value,
                roll: cells[1].getElementsByTagName("input")[0].value
            });
        }
        try {
            const response = await fetch(`${apiUrl}/template`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: templateName, roll: template }),
            });
            if (response.ok) {
                alert('Template saved successfully');
                updateTemplateDropdown();
            } else {
                throw new Error('Failed to save template');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to save template');
        }
    }
}

async function updateTemplateDropdown() {
    var dropdown = document.getElementById("templateDropdown");
    dropdown.innerHTML = '<option value="">Select Template</option>';
    try {
        const response = await fetch(`${apiUrl}/templates`);
        if (response.ok) {
            const templates = await response.json();
            templates.forEach(template => {
                dropdown.innerHTML += `<option value="${template._id}">${template.name}</option>`;
            });
        } else {
            throw new Error('Failed to fetch templates');
        }
    } catch (error) {
        console.error(error);
        alert('Failed to fetch templates');
    }
}

async function generatePDF() {
    var doc = new jsPDF();
    var table = document.getElementById("attendanceTable");
    var rows = table.getElementsByTagName("tr");
    var data = [];
    for (var i = 0; i < rows.length; i++) {
        var cells = rows[i].getElementsByTagName("td");
        var rowData = [];
        for (var j = 0; j < cells.length; j++) {
            rowData.push(cells[j].firstChild.value);
        }
        data.push(rowData);
    }
    doc.autoTable({
        head: [['Name', 'Roll Number', 'Status']],
        body: data
    });
    window.pdfData = doc.output();
}

async function downloadPDF() {
    if (window.pdfData) {
        var blob = new Blob([window.pdfData], { type: 'application/pdf' });
        var link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'attendance.pdf';
        link.click();
    } else {
        alert('Generate PDF first!');
    }
}

updateTemplateDropdown();
