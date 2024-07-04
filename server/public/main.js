const socket = new WebSocket('ws://localhost:3000');
const labels = [];
const data = {
    labels: labels,
    datasets: [{
        label: 'Altura de Vehículos (cm)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        data: [],
        fill: false,
        tension: 0.1
    }]
};

const config = {
    type: 'line',
    data: data,
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Altura de Vehículos en el Tiempo'
            }
        }
    }
};

window.onload = async function() {
    const ctx = document.getElementById('lineChart').getContext('2d');
    window.lineChart = new Chart(ctx, config);
    fetchData();

    // Obtener el último registro de la base de datos
    const response = await fetch('/latest');
    const latestData = await response.json();
    document.getElementById('currentHeight').textContent = latestData.height ? `${latestData.height} cm` : 'No hay alturas registradas';
};

socket.onmessage = function (event) {
    const sensorData = event.data;
    const currentTime = new Date().toLocaleString();
    const [date, time] = currentTime.split(", ");
    document.getElementById('currentHeight').textContent = `${sensorData} cm`;

    if (labels.length >= 10) {
        labels.shift();
        data.datasets[0].data.shift();
    }
    labels.push(time);
    data.datasets[0].data.push(sensorData);
    window.lineChart.update();

    const tableBody = document.getElementById('historyTable');
    if (tableBody.children.length >= 10) {
        tableBody.removeChild(tableBody.lastChild);
    }
    const row = document.createElement('tr');
    const dateCell = document.createElement('td');
    const timeCell = document.createElement('td');
    const heightCell = document.createElement('td');

    dateCell.className = 'py-2 px-4 border-b';
    timeCell.className = 'py-2 px-4 border-b';
    heightCell.className = 'py-2 px-4 border-b';

    dateCell.textContent = date;
    timeCell.textContent = time;
    heightCell.textContent = `${sensorData} cm`;

    // Aplicar color condicional
    const height = parseFloat(sensorData);
    if (height < 10) {
        row.classList.add('green-row');
    } else if (height >= 10 && height < 15) {
        row.classList.add('yellow-row');
    } else {
        row.classList.add('red-row');
    }

    row.appendChild(dateCell);
    row.appendChild(timeCell);
    row.appendChild(heightCell);
    tableBody.insertBefore(row, tableBody.firstChild);
};

let currentPage = 1;

function fetchData() {
    fetch(`/data?page=${currentPage}`)
        .then(response => response.json())
        .then(data => updateTable(data));
}

function updateTable(data) {
    const tableBody = document.getElementById('historyTable');
    tableBody.innerHTML = '';
    data.forEach(item => {
        const row = document.createElement('tr');
        const dateCell = document.createElement('td');
        const timeCell = document.createElement('td');
        const heightCell = document.createElement('td');

        dateCell.className = 'py-2 px-4 border-b';
        timeCell.className = 'py-2 px-4 border-b';
        heightCell.className = 'py-2 px-4 border-b';

        const dateTime = new Date(item.timestamp);
        dateCell.textContent = dateTime.toLocaleDateString();
        timeCell.textContent = dateTime.toLocaleTimeString();
        heightCell.textContent = `${item.height} cm`;

        // Aplicar color condicional
        const height = parseFloat(item.height);
        if (height < 10) {
            row.classList.add('green-row');
        } else if (height >= 10 && height < 15) {
            row.classList.add('yellow-row');
        } else {
            row.classList.add('red-row');
        }

        row.appendChild(dateCell);
        row.appendChild(timeCell);
        row.appendChild(heightCell);
        tableBody.appendChild(row);  // Añadir al final del contenedor
    });

    // Habilitar o deshabilitar botones de paginación
    document.getElementById('prev').disabled = currentPage === 1;
    document.getElementById('next').disabled = data.length < 10;
}

document.getElementById('prev').addEventListener('click', function() {
    if (currentPage > 1) {
        currentPage--;
        fetchData();
    }
});

document.getElementById('next').addEventListener('click', function() {
    currentPage++;
    fetchData();
});
