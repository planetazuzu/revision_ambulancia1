#!/bin/bash

echo "🚀 Iniciando AmbuReview - Versión Simplificada"
echo "=============================================="

# Crear directorio de datos si no existe
mkdir -p /app/data

# Inicializar base de datos SQLite
echo "📊 Inicializando base de datos..."
sqlite3 /app/data/ambureview.db << EOF
-- Crear tablas básicas
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ambulances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'available',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ambulance_id INTEGER,
    user_id INTEGER,
    rating INTEGER CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ambulance_id) REFERENCES ambulances(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insertar datos de prueba
INSERT OR IGNORE INTO users (email, password, role) VALUES 
('admin@ambureview.com', 'admin123', 'admin'),
('user@ambureview.com', 'user123', 'user');

INSERT OR IGNORE INTO ambulances (name, type, status) VALUES 
('Ambulancia 001', 'Básica', 'available'),
('Ambulancia 002', 'Avanzada', 'available'),
('Ambulancia 003', 'UCI', 'maintenance');

EOF

echo "✅ Base de datos inicializada"

# Crear servidor backend simple
echo "🔧 Iniciando servidor backend..."
cat > /app/server.js << 'EOF'
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.BACKEND_PORT || 9990;
const FRONTEND_PORT = process.env.FRONTEND_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Conectar a SQLite
const db = new sqlite3.Database('/app/data/ambureview.db');

// Rutas de API
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/users', (req, res) => {
    db.all('SELECT id, email, role, created_at FROM users', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/ambulances', (req, res) => {
    db.all('SELECT * FROM ambulances', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/reviews', (req, res) => {
    db.all(`
        SELECT r.*, u.email as user_email, a.name as ambulance_name 
        FROM reviews r 
        LEFT JOIN users u ON r.user_id = u.id 
        LEFT JOIN ambulances a ON r.ambulance_id = a.id
        ORDER BY r.created_at DESC
    `, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/reviews', (req, res) => {
    const { ambulance_id, user_id, rating, comment } = req.body;
    
    db.run(
        'INSERT INTO reviews (ambulance_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
        [ambulance_id, user_id, rating, comment],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID, message: 'Review creada exitosamente' });
        }
    );
});

// Servir frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend ejecutándose en puerto ${PORT}`);
    console.log(`🌐 Frontend disponible en puerto ${FRONTEND_PORT}`);
    console.log(`📊 Base de datos: SQLite en /app/data/ambureview.db`);
});

// Manejo de errores
process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando servidor...');
    db.close();
    process.exit(0);
});
EOF

# Crear frontend simple
echo "🌐 Creando frontend simple..."
mkdir -p /app/dist
cat > /app/dist/index.html << 'EOF'
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AmbuReview - Sistema de Revisión de Ambulancias</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 20px; 
        }
        .header {
            background: rgba(255,255,255,0.95);
            padding: 20px;
            border-radius: 15px;
            margin-bottom: 30px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            text-align: center;
        }
        .header h1 { 
            color: #2c3e50; 
            margin-bottom: 10px;
            font-size: 2.5em;
        }
        .header p { 
            color: #7f8c8d; 
            font-size: 1.2em;
        }
        .stats { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 20px; 
            margin-bottom: 30px; 
        }
        .stat-card { 
            background: rgba(255,255,255,0.95); 
            padding: 25px; 
            border-radius: 15px; 
            text-align: center; 
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        .stat-card:hover { 
            transform: translateY(-5px); 
        }
        .stat-card h3 { 
            color: #2c3e50; 
            margin-bottom: 10px; 
            font-size: 1.5em;
        }
        .stat-card .number { 
            font-size: 2.5em; 
            font-weight: bold; 
            color: #3498db; 
        }
        .section { 
            background: rgba(255,255,255,0.95); 
            padding: 25px; 
            border-radius: 15px; 
            margin-bottom: 20px; 
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        .section h2 { 
            color: #2c3e50; 
            margin-bottom: 20px; 
            font-size: 1.8em;
        }
        .btn { 
            background: #3498db; 
            color: white; 
            padding: 12px 24px; 
            border: none; 
            border-radius: 8px; 
            cursor: pointer; 
            font-size: 1em;
            transition: background 0.3s ease;
            margin: 5px;
        }
        .btn:hover { 
            background: #2980b9; 
        }
        .btn-success { background: #27ae60; }
        .btn-success:hover { background: #229954; }
        .btn-warning { background: #f39c12; }
        .btn-warning:hover { background: #e67e22; }
        .btn-danger { background: #e74c3c; }
        .btn-danger:hover { background: #c0392b; }
        .data-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 15px; 
        }
        .data-table th, .data-table td { 
            padding: 12px; 
            text-align: left; 
            border-bottom: 1px solid #ddd; 
        }
        .data-table th { 
            background: #f8f9fa; 
            font-weight: bold; 
            color: #2c3e50;
        }
        .data-table tr:hover { 
            background: #f5f5f5; 
        }
        .status { 
            padding: 4px 8px; 
            border-radius: 4px; 
            font-size: 0.9em; 
            font-weight: bold;
        }
        .status.available { background: #d4edda; color: #155724; }
        .status.maintenance { background: #fff3cd; color: #856404; }
        .status.busy { background: #f8d7da; color: #721c24; }
        .loading { 
            text-align: center; 
            padding: 20px; 
            color: #7f8c8d; 
        }
        .error { 
            background: #f8d7da; 
            color: #721c24; 
            padding: 15px; 
            border-radius: 8px; 
            margin: 10px 0; 
        }
        .success { 
            background: #d4edda; 
            color: #155724; 
            padding: 15px; 
            border-radius: 8px; 
            margin: 10px 0; 
        }
        @media (max-width: 768px) {
            .stats { grid-template-columns: 1fr; }
            .header h1 { font-size: 2em; }
            .container { padding: 10px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚑 AmbuReview</h1>
            <p>Sistema de Revisión y Gestión de Ambulancias</p>
        </div>

        <div class="stats">
            <div class="stat-card">
                <h3>Usuarios</h3>
                <div class="number" id="userCount">-</div>
            </div>
            <div class="stat-card">
                <h3>Ambulancias</h3>
                <div class="number" id="ambulanceCount">-</div>
            </div>
            <div class="stat-card">
                <h3>Revisiones</h3>
                <div class="number" id="reviewCount">-</div>
            </div>
            <div class="stat-card">
                <h3>Estado</h3>
                <div class="number" id="systemStatus">🟢</div>
            </div>
        </div>

        <div class="section">
            <h2>🚑 Ambulancias</h2>
            <button class="btn btn-success" onclick="loadAmbulances()">🔄 Actualizar</button>
            <div id="ambulancesContainer">
                <div class="loading">Cargando ambulancias...</div>
            </div>
        </div>

        <div class="section">
            <h2>👥 Usuarios</h2>
            <button class="btn btn-success" onclick="loadUsers()">🔄 Actualizar</button>
            <div id="usersContainer">
                <div class="loading">Cargando usuarios...</div>
            </div>
        </div>

        <div class="section">
            <h2>📝 Revisiones</h2>
            <button class="btn btn-success" onclick="loadReviews()">🔄 Actualizar</button>
            <div id="reviewsContainer">
                <div class="loading">Cargando revisiones...</div>
            </div>
        </div>
    </div>

    <script>
        const API_BASE = window.location.origin;
        
        async function fetchData(url) {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return await response.json();
            } catch (error) {
                console.error('Error:', error);
                return null;
            }
        }

        async function loadAmbulances() {
            const container = document.getElementById('ambulancesContainer');
            container.innerHTML = '<div class="loading">Cargando ambulancias...</div>';
            
            const ambulances = await fetchData(`${API_BASE}/api/ambulances`);
            if (!ambulances) {
                container.innerHTML = '<div class="error">Error al cargar ambulancias</div>';
                return;
            }

            const html = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Tipo</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ambulances.map(amb => `
                            <tr>
                                <td>${amb.id}</td>
                                <td>${amb.name}</td>
                                <td>${amb.type}</td>
                                <td><span class="status ${amb.status}">${amb.status}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            container.innerHTML = html;
        }

        async function loadUsers() {
            const container = document.getElementById('usersContainer');
            container.innerHTML = '<div class="loading">Cargando usuarios...</div>';
            
            const users = await fetchData(`${API_BASE}/api/users`);
            if (!users) {
                container.innerHTML = '<div class="error">Error al cargar usuarios</div>';
                return;
            }

            const html = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Fecha Creación</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(user => `
                            <tr>
                                <td>${user.id}</td>
                                <td>${user.email}</td>
                                <td>${user.role}</td>
                                <td>${new Date(user.created_at).toLocaleDateString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            container.innerHTML = html;
        }

        async function loadReviews() {
            const container = document.getElementById('reviewsContainer');
            container.innerHTML = '<div class="loading">Cargando revisiones...</div>';
            
            const reviews = await fetchData(`${API_BASE}/api/reviews`);
            if (!reviews) {
                container.innerHTML = '<div class="error">Error al cargar revisiones</div>';
                return;
            }

            const html = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Ambulancia</th>
                            <th>Usuario</th>
                            <th>Calificación</th>
                            <th>Comentario</th>
                            <th>Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${reviews.map(review => `
                            <tr>
                                <td>${review.id}</td>
                                <td>${review.ambulance_name || 'N/A'}</td>
                                <td>${review.user_email || 'N/A'}</td>
                                <td>${'⭐'.repeat(review.rating || 0)}</td>
                                <td>${review.comment || '-'}</td>
                                <td>${new Date(review.created_at).toLocaleDateString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            container.innerHTML = html;
        }

        async function updateStats() {
            const [users, ambulances, reviews] = await Promise.all([
                fetchData(`${API_BASE}/api/users`),
                fetchData(`${API_BASE}/api/ambulances`),
                fetchData(`${API_BASE}/api/reviews`)
            ]);

            document.getElementById('userCount').textContent = users ? users.length : '-';
            document.getElementById('ambulanceCount').textContent = ambulances ? ambulances.length : '-';
            document.getElementById('reviewCount').textContent = reviews ? reviews.length : '-';
            
            // Verificar estado del sistema
            const health = await fetchData(`${API_BASE}/health`);
            document.getElementById('systemStatus').textContent = health ? '🟢' : '🔴';
        }

        // Cargar datos iniciales
        document.addEventListener('DOMContentLoaded', () => {
            updateStats();
            loadAmbulances();
            loadUsers();
            loadReviews();
            
            // Actualizar cada 30 segundos
            setInterval(updateStats, 30000);
        });
    </script>
</body>
</html>
EOF

# Instalar dependencias necesarias
echo "📦 Instalando dependencias..."
npm install express sqlite3 cors

# Iniciar el servidor
echo "🚀 Iniciando aplicación..."
node /app/server.js
