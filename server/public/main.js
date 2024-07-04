const socket = new WebSocket('ws://localhost:3000');
const labels = [];
const chartData = {
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
    data: chartData,
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

// Datos y configuración para el gráfico de barras
const barChartData = {
    labels: ['< 10 cm', '10 - 15 cm', '> 15 cm'],
    datasets: [{
        label: 'Cantidad de Vehículos',
        data: [0, 0, 0],
        backgroundColor: [
            'rgba(72, 187, 120, 0.2)', // Verde
            'rgba(255, 205, 86, 0.2)', // Amarillo
            'rgba(255, 99, 132, 0.2)'  // Rojo
        ],
        borderColor: [
            'rgba(72, 187, 120, 1)',
            'rgba(255, 205, 86, 1)',
            'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
    }]
};

const barChartConfig = {
    type: 'bar',
    data: barChartData,
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true
            }
        },
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Distribución de Alturas de Vehículos'
            }
        }
    }
};

window.onload = async function() {
    const ctx = document.getElementById('lineChart').getContext('2d');
    window.lineChart = new Chart(ctx, config);

    const barCtx = document.getElementById('barChart').getContext('2d');
    window.barChart = new Chart(barCtx, barChartConfig);

    // Obtener el último registro de la base de datos
    const response = await fetch('/latest');
    const latestData = await response.json();
    document.getElementById('currentHeight').textContent = latestData.height ? `${latestData.height} cm` : 'No hay alturas registradas';

    // Obtener y cargar los datos para la primera página
    await fetchData();

    // Obtener y cargar los datos agregados
    await fetchAggregatedData();
};

socket.onmessage = function (event) {
    const sensorData = event.data;
    const currentTime = new Date().toLocaleString();
    const [date, time] = currentTime.split(", ");
    document.getElementById('currentHeight').textContent = `${sensorData} cm`;

    if (labels.length >= 10) {
        labels.shift();
        chartData.datasets[0].data.shift();
    }
    labels.push(time);
    chartData.datasets[0].data.push(sensorData);
    window.lineChart.update();

    updateBarChart(sensorData);

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

async function fetchData() {
    const response = await fetch(`/data?page=${currentPage}`);
    const data = await response.json();
    updateTable(data);
    updateChart(data);
}

async function fetchAggregatedData() {
    const response = await fetch('/aggregated-data');
    const aggregatedData = await response.json();
    barChartData.datasets[0].data = [aggregatedData.green, aggregatedData.yellow, aggregatedData.red];
    window.barChart.update();
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

function updateChart(data) {
    labels.length = 0;  // Clear existing labels
    chartData.datasets[0].data.length = 0;  // Clear existing data

    data.reverse().forEach(item => {
        const dateTime = new Date(item.timestamp);
        labels.push(dateTime.toLocaleTimeString());
        chartData.datasets[0].data.push(item.height);
    });

    window.lineChart.update();
}

function updateBarChart(sensorData) {
    const height = parseFloat(sensorData);
    if (height < 10) {
        barChartData.datasets[0].data[0]++;
    } else if (height >= 10 && height < 15) {
        barChartData.datasets[0].data[1]++;
    } else {
        barChartData.datasets[0].data[2]++;
    }
    window.barChart.update();
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
