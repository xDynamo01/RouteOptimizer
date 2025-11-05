// Variáveis globais
let map;
let routeLayer;
let markers = [];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeNavigation();
    initializeTimeUpdater();
    initializeMap();
    loadDashboardData();
    loadVehicles();
    loadDeliveries();
});

// Inicializar mapa com Leaflet
function initializeMap() {
    // Centro do mapa (São Paulo como padrão)
    map = L.map('map').setView([-23.5505, -46.6333], 13);
    
    // Adicionar camada do OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Adicionar alguns marcadores de exemplo
    addSampleMarkers();
}

function addSampleMarkers() {
    // Marcadores de exemplo (podem ser removidos)
    const locations = [
        { lat: -23.5505, lng: -46.6333, title: "Centro" },
        { lat: -23.5635, lng: -46.6533, title: "Zona Sul" },
        { lat: -23.5405, lng: -46.6433, title: "Zona Leste" }
    ];
    
    locations.forEach(loc => {
        const marker = L.marker([loc.lat, loc.lng])
            .addTo(map)
            .bindPopup(loc.title);
        markers.push(marker);
    });
}

// Geocoding com OpenStreetMap Nominatim
async function geocodeAddress(address) {
    try {
        const response = await fetch('/api/geocode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ endereco: address })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            return [result.lat, result.lon];
        } else {
            throw new Error(result.error || 'Erro no geocoding');
        }
    } catch (error) {
        console.error('Erro no geocoding:', error);
        throw error;
    }
}

// Calcular rota
async function calculateRoute() {
    const originAddress = document.getElementById('originAddress').value;
    const destAddress = document.getElementById('destAddress').value;
    
    if (!originAddress || !destAddress) {
        showNotification('Por favor, preencha origem e destino', 'error');
        return;
    }
    
    try {
        showNotification('Calculando rota...', 'info');
        
        // Converter endereços em coordenadas
        const originCoords = await geocodeAddress(originAddress);
        const destCoords = await geocodeAddress(destAddress);
        
        // Calcular rota
        const response = await fetch('/api/calculate-route', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                waypoints: [originCoords, destCoords]
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            displayRouteOnMap(result);
            displayRouteResults(result);
            showNotification('Rota calculada com sucesso!', 'success');
        } else {
            throw new Error(result.error || 'Erro ao calcular rota');
        }
        
    } catch (error) {
        showNotification('Erro ao calcular rota: ' + error.message, 'error');
    }
}

// Exibir rota no mapa
function displayRouteOnMap(routeData) {
    // Limpar rota anterior
    if (routeLayer) {
        map.removeLayer(routeLayer);
    }
    
    // Adicionar nova rota
    routeLayer = L.geoJSON(routeData.geometry, {
        style: {
            color: '#3498db',
            weight: 6,
            opacity: 0.8
        }
    }).addTo(map);
    
    // Ajustar zoom para mostrar a rota completa
    map.fitBounds(routeLayer.getBounds());
}

// Exibir resultados da rota
function displayRouteResults(routeData) {
    document.getElementById('routeDistance').textContent = `${routeData.distance} km`;
    document.getElementById('routeDuration').textContent = `${routeData.duration} min`;
    document.getElementById('routeFuelCost').textContent = `R$ ${routeData.custo_combustivel}`;
    document.getElementById('routeEmployeeCost').textContent = `R$ ${routeData.custo_funcionario}`;
    document.getElementById('routeTotalCost').textContent = `R$ ${routeData.custo_total}`;
    
    document.getElementById('routeResults').style.display = 'block';
}

// Tema
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.className = savedTheme + '-mode';
    updateThemeButton();
}

function toggleTheme() {
    const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.className = newTheme + '-mode';
    localStorage.setItem('theme', newTheme);
    updateThemeButton();
}

function updateThemeButton() {
    const button = document.getElementById('themeToggle');
    const icon = button.querySelector('i');
    icon.className = document.body.classList.contains('dark-mode') ? 'fas fa-sun' : 'fas fa-moon';
}

// Navegação
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            const sectionName = link.getAttribute('data-section');
            showSection(sectionName);
        });
    });
}

function showSection(sectionName) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${sectionName}-section`).classList.add('active');
    document.getElementById('current-section').textContent = 
        document.querySelector(`[data-section="${sectionName}"]`).textContent;
}

// Dashboard
async function loadDashboardData() {
    try {
        const stats = await apiCall('/api/dashboard/stats');
        if (stats && !stats.error) {
            updateDashboardStats(stats);
        }
        
        const charts = await apiCall('/api/dashboard/charts');
        if (charts && !charts.error) {
            initializeDashboardCharts(charts);
        }
    } catch (error) {
        showNotification('Erro ao carregar dashboard', 'error');
    }
}

function updateDashboardStats(stats) {
    const statsGrid = document.getElementById('stats-grid');
    statsGrid.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon">
                <i class="fas fa-truck"></i>
            </div>
            <div class="stat-info">
                <span class="stat-value">${stats.total_veiculos}</span>
                <span class="stat-label">Veículos</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">
                <i class="fas fa-package"></i>
            </div>
            <div class="stat-info">
                <span class="stat-value">${stats.entregas_hoje}</span>
                <span class="stat-label">Entregas Hoje</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">
                <i class="fas fa-chart-line"></i>
            </div>
            <div class="stat-info">
                <span class="stat-value">${stats.eficiencia}%</span>
                <span class="stat-label">Eficiência</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">
                <i class="fas fa-clock"></i>
            </div>
            <div class="stat-info">
                <span class="stat-value">${stats.entregas_pendentes}</span>
                <span class="stat-label">Pendentes</span>
            </div>
        </div>
    `;
}

function initializeDashboardCharts(charts) {
    if (window.mileageChart) {
        window.mileageChart.destroy();
    }
    
    window.mileageChart = new Chart(document.getElementById('mileageChart'), {
        type: 'bar',
        data: {
            labels: charts.mileage.labels,
            datasets: [{
                label: 'Quilometragem (km)',
                data: charts.mileage.data,
                backgroundColor: '#3498db'
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } }
        }
    });
}

// Veículos (mantido do código anterior)
async function loadVehicles() {
    try {
        const vehicles = await apiCall('/api/veiculos');
        if (vehicles && !vehicles.error) {
            const tbody = document.getElementById('vehiclesList');
            tbody.innerHTML = vehicles.map(vehicle => `
                <tr>
                    <td>${vehicle.placa}</td>
                    <td>${vehicle.tipo}</td>
                    <td>${vehicle.capacidade} kg</td>
                    <td>${vehicle.consumo} km/l</td>
                    <td><span class="status-badge ${vehicle.status}">${vehicle.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="editVehicle(${vehicle.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteVehicle(${vehicle.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        showNotification('Erro ao carregar veículos', 'error');
    }
}

function showVehicleModal(vehicleId = null) {
    const modal = document.getElementById('vehicleModal');
    const title = document.getElementById('vehicleModalTitle');
    
    if (vehicleId) {
        title.textContent = 'Editar Veículo';
        loadVehicleData(vehicleId);
    } else {
        title.textContent = 'Adicionar Veículo';
        document.getElementById('vehicleForm').reset();
        document.getElementById('vehicleId').value = '';
    }
    
    modal.style.display = 'block';
}

function hideVehicleModal() {
    document.getElementById('vehicleModal').style.display = 'none';
}

async function loadVehicleData(id) {
    try {
        const vehicle = await apiCall(`/api/veiculos/${id}`);
        if (vehicle && !vehicle.error) {
            document.getElementById('vehicleId').value = vehicle.id;
            document.getElementById('placa').value = vehicle.placa;
            document.getElementById('tipo').value = vehicle.tipo;
            document.getElementById('capacidade').value = vehicle.capacidade;
            document.getElementById('consumo').value = vehicle.consumo;
        }
    } catch (error) {
        showNotification('Erro ao carregar veículo', 'error');
    }
}

async function saveVehicle(event) {
    event.preventDefault();
    
    const formData = {
        placa: document.getElementById('placa').value,
        tipo: document.getElementById('tipo').value,
        capacidade: parseFloat(document.getElementById('capacidade').value),
        consumo: parseFloat(document.getElementById('consumo').value)
    };

    try {
        const vehicleId = document.getElementById('vehicleId').value;
        if (vehicleId) {
            await apiCall(`/api/veiculos/${vehicleId}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
            showNotification('Veículo atualizado com sucesso!', 'success');
        } else {
            await apiCall('/api/veiculos', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            showNotification('Veículo adicionado com sucesso!', 'success');
        }
        
        hideVehicleModal();
        loadVehicles();
    } catch (error) {
        showNotification('Erro ao salvar veículo', 'error');
    }
}

async function editVehicle(id) {
    showVehicleModal(id);
}

async function deleteVehicle(id) {
    if (confirm('Tem certeza que deseja deletar este veículo?')) {
        try {
            await apiCall(`/api/veiculos/${id}`, { method: 'DELETE' });
            showNotification('Veículo deletado com sucesso!', 'success');
            loadVehicles();
        } catch (error) {
            showNotification('Erro ao deletar veículo', 'error');
        }
    }
}

// Entregas (mantido do código anterior)
async function loadDeliveries() {
    try {
        const deliveries = await apiCall('/api/entregas');
        if (deliveries && !deliveries.error) {
            const tbody = document.getElementById('deliveriesList');
            tbody.innerHTML = deliveries.map(delivery => `
                <tr>
                    <td>${delivery.cliente}</td>
                    <td>${delivery.endereco}</td>
                    <td>${delivery.peso} kg</td>
                    <td>${new Date(delivery.prazo).toLocaleString('pt-BR')}</td>
                    <td><span class="status-badge ${delivery.status}">${delivery.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="editDelivery(${delivery.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteDelivery(${delivery.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        showNotification('Erro ao carregar entregas', 'error');
    }
}

function showDeliveryModal(deliveryId = null) {
    const modal = document.getElementById('deliveryModal');
    const title = document.getElementById('deliveryModalTitle');
    
    if (deliveryId) {
        title.textContent = 'Editar Entrega';
        loadDeliveryData(deliveryId);
    } else {
        title.textContent = 'Adicionar Entrega';
        document.getElementById('deliveryForm').reset();
        document.getElementById('deliveryId').value = '';
        
        // Prazo padrão: 2 horas à frente
        const now = new Date();
        now.setHours(now.getHours() + 2);
        document.getElementById('prazo').value = now.toISOString().slice(0, 16);
    }
    
    modal.style.display = 'block';
}

function hideDeliveryModal() {
    document.getElementById('deliveryModal').style.display = 'none';
}

async function loadDeliveryData(id) {
    try {
        const delivery = await apiCall(`/api/entregas/${id}`);
        if (delivery && !delivery.error) {
            document.getElementById('deliveryId').value = delivery.id;
            document.getElementById('cliente').value = delivery.cliente;
            document.getElementById('endereco').value = delivery.endereco;
            document.getElementById('peso').value = delivery.peso;
            document.getElementById('prazo').value = delivery.prazo.slice(0, 16);
        }
    } catch (error) {
        showNotification('Erro ao carregar entrega', 'error');
    }
}

async function saveDelivery(event) {
    event.preventDefault();
    
    const formData = {
        cliente: document.getElementById('cliente').value,
        endereco: document.getElementById('endereco').value,
        peso: parseFloat(document.getElementById('peso').value),
        prazo: document.getElementById('prazo').value + ':00'
    };

    try {
        const deliveryId = document.getElementById('deliveryId').value;
        if (deliveryId) {
            await apiCall(`/api/entregas/${deliveryId}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
            showNotification('Entrega atualizada com sucesso!', 'success');
        } else {
            await apiCall('/api/entregas', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            showNotification('Entrega adicionada com sucesso!', 'success');
        }
        
        hideDeliveryModal();
        loadDeliveries();
    } catch (error) {
        showNotification('Erro ao salvar entrega', 'error');
    }
}

async function editDelivery(id) {
    showDeliveryModal(id);
}

async function deleteDelivery(id) {
    if (confirm('Tem certeza que deseja deletar esta entrega?')) {
        try {
            await apiCall(`/api/entregas/${id}`, { method: 'DELETE' });
            showNotification('Entrega deletada com sucesso!', 'success');
            loadDeliveries();
        } catch (error) {
            showNotification('Erro ao deletar entrega', 'error');
        }
    }
}

// Configurações
async function saveSettings() {
    const settings = {
        preco_combustivel: document.getElementById('preco_combustivel').value,
        custo_hora_funcionario: document.getElementById('custo_hora_funcionario').value
    };

    try {
        await apiCall('/api/configuracoes', {
            method: 'POST',
            body: JSON.stringify(settings)
        });
        showNotification('Configurações salvas com sucesso!', 'success');
    } catch (error) {
        showNotification('Erro ao salvar configurações', 'error');
    }
}

// Utilitários
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(endpoint, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`Erro ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erro na API:', error);
        return { error: error.message };
    }
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const messageElement = document.getElementById('notificationMessage');
    
    notification.className = `notification ${type}`;
    messageElement.textContent = message;
    
    setTimeout(() => {
        notification.className = 'notification hidden';
    }, 5000);
}

function hideNotification() {
    document.getElementById('notification').className = 'notification hidden';
}

function initializeTimeUpdater() {
    function updateTime() {
        const now = new Date();
        document.getElementById('current-time').textContent = 
            now.toLocaleTimeString('pt-BR');
    }
    updateTime();
    setInterval(updateTime, 1000);
}

// Event Listeners
document.getElementById('themeToggle').addEventListener('click', toggleTheme);

// Fechar modais
window.addEventListener('click', (event) => {
    const modals = ['vehicleModal', 'deliveryModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});