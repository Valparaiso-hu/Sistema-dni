// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Archivo de datos
const DATA_FILE = path.join(__dirname, 'data.json');

// Servir frontend
app.use(express.static(path.join(__dirname, 'public')));

// Funciones de carga/guardado
function loadData() {
  if (!fs.existsSync(DATA_FILE)) return { users: {}, dnis: [] };
  try { return JSON.parse(fs.readFileSync(DATA_FILE,'utf8')); }
  catch { return { users: {}, dnis: [] }; }
}
function saveData(data) { fs.writeFileSync(DATA_FILE, JSON.stringify(data,null,2)); }

// Registro de usuarios
app.post('/api/register', (req,res)=>{
  const { username, password } = req.body;
  if(!username || !password) return res.json({ ok:false, error:'Faltan datos' });
  const data = loadData();
  if(data.users[username]) return res.json({ ok:false, error:'Usuario ya existe' });
  data.users[username] = { username, password };
  saveData(data);
  res.json({ ok:true });
});

// Login
app.post('/api/login', (req,res)=>{
  const { username, password } = req.body;
  const data = loadData();
  if(data.users[username] && data.users[username].password === password) return res.json({ ok:true });
  res.json({ ok:false, error:'Usuario o contraseña incorrectos' });
});

// Obtener todos los DNIs
app.get('/api/dnis', (req,res)=>{
  const data = loadData();
  res.json(data.dnis || []);
});

// Crear DNI
app.post('/api/dnis', (req,res)=>{
  const dni = req.body;
  if(!dni || !dni.docNumber) return res.json({ ok:false, error:'Falta número de documento' });
  const data = loadData();
  data.dnis = data.dnis || [];
  data.dnis.push(dni);
  saveData(data);
  res.json({ ok:true });
});

// Eliminar DNI
app.delete('/api/dnis/:doc', (req,res)=>{
  const doc = decodeURIComponent(req.params.doc);
  const data = loadData();
  data.dnis = (data.dnis||[]).filter(x=>x.docNumber!==doc);
  saveData(data);
  res.json({ ok:true });
});

// Puerto Render
const port = process.env.PORT || 4000;
app.listen(port, ()=> console.log(`Servidor escuchando en puerto ${port}`));