// ===============================
// 📦 Importar dependencias
// ===============================
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

// ===============================
// 🚀 Inicializar servidor
// ===============================
const app = express();
app.use(cors());
app.use(bodyParser.json());

// ===============================
// 📁 Archivos y rutas
// ===============================
const DATA_FILE = path.join(__dirname, 'data.json');

// Servir los archivos estáticos (HTML, CSS, JS) desde /public
app.use(express.static(path.join(__dirname, 'public')));

// ===============================
// 🧠 Funciones para manejar datos
// ===============================
function loadData() {
  if (!fs.existsSync(DATA_FILE)) return { users: {}, dnis: [] };
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return { users: {}, dnis: [] };
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ===============================
// 👤 Registro de usuarios
// ===============================
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.json({ ok: false, error: 'Faltan datos' });

  const data = loadData();
  if (data.users[username])
    return res.json({ ok: false, error: 'Usuario ya existe' });

  data.users[username] = { username, password };
  saveData(data);
  res.json({ ok: true });
});

// ===============================
// 🔐 Inicio de sesión
// ===============================
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const data = loadData();
  if (data.users[username] && data.users[username].password === password)
    return res.json({ ok: true });

  res.json({ ok: false, error: 'Usuario o contraseña incorrectos' });
});

// ===============================
// 🪪 Obtener todos los DNIs
// ===============================
app.get('/api/dnis', (req, res) => {
  const data = loadData();
  res.json(data.dnis || []);
});

// ===============================
// 🪪 Crear un nuevo DNI
// ===============================
app.post('/api/dnis', (req, res) => {
  const dni = req.body;
  if (!dni || !dni.docNumber)
    return res.json({ ok: false, error: 'Falta número de documento' });

  const data = loadData();
  data.dnis = data.dnis || [];
  data.dnis.push(dni);
  saveData(data);
  res.json({ ok: true });
});

// ===============================
// ❌ Eliminar un DNI por número
// ===============================
app.delete('/api/dnis/:doc', (req, res) => {
  const doc = decodeURIComponent(req.params.doc);
  const data = loadData();
  data.dnis = (data.dnis || []).filter(x => x.docNumber !== doc);
  saveData(data);
  res.json({ ok: true });
});

// ===============================
// 🟢 Iniciar servidor
// ===============================
const port = process.env.PORT || 4000;
app.listen(port, () =>
  console.log(`✅ Servidor escuchando en el puerto ${port}`)
);