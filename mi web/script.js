const USE_SERVER = true;
const API_BASE = "https://portal-identidad.onrender.com/api"; // <- Cambiar a tu URL de Render

function qs(id){return document.getElementById(id)}
function saveLocal(k,v){localStorage.setItem(k,JSON.stringify(v))}
function loadLocal(k,d){const v=localStorage.getItem(k);return v?JSON.parse(v):d}

function showMsg(el,txt,t=3000){el.innerText=txt;if(t>0)setTimeout(()=>el.innerText='',t)}

async function apiRegister(username,password){ 
  const res = await fetch(API_BASE+'/register',{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})
  });
  return res.json();
}

async function apiLogin(username,password){ 
  const res = await fetch(API_BASE+'/login',{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})
  });
  return res.json();
}

async function apiGetAllDnis(){ 
  const res = await fetch(API_BASE+'/dnis'); return res.json();
}

async function apiCreateDni(dniObj){ 
  const res = await fetch(API_BASE+'/dnis',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(dniObj)}); return res.json();
}

async function apiDeleteDni(docNumber){ 
  const res = await fetch(API_BASE+'/dnis/'+encodeURIComponent(docNumber),{method:'DELETE'}); return res.json();
}

let CURRENT_USER = loadLocal("session_user",null);
const userInfoEl = qs("user-info");

function setLoggedIn(username){
  CURRENT_USER=username;
  saveLocal("session_user",username);
  renderTop();
  qs("login-screen").classList.add("hidden");
  qs("main-screen").classList.remove("hidden");
}

function logout(){
  CURRENT_USER=null;
  localStorage.removeItem("session_user");
  qs("main-screen").classList.add("hidden");
  qs("login-screen").classList.remove("hidden");
  renderTop();
}

function renderTop(){
  if(CURRENT_USER) userInfoEl.innerHTML=`<div class="small">Conectado: <b>${CURRENT_USER}</b></div>`;
  else userInfoEl.innerHTML='';
}

// --- LOGIN / REGISTER
qs("btn-register").addEventListener("click",async()=>{
  const u = qs("reg-username").value.trim();
  if(!u){ showMsg(qs("reg-result"),"Ingresa usuario"); return; }
  const pwd = Math.random().toString(36).slice(2,10);
  const res = await apiRegister(u,pwd);
  if(!res.ok){ showMsg(qs("reg-result"),res.error||"Error"); return; }
  showMsg(qs("reg-result"),`Cuenta creada. Tu contraseña: ${pwd}`,10000);
});

qs("btn-login").addEventListener("click",async()=>{
  const u = qs("login-username").value.trim();
  const p = qs("login-password").value;
  if(!u||!p){ showMsg(qs("login-msg"),"Completa usuario y contraseña"); return; }
  const res = await apiLogin(u,p);
  if(!res.ok){ showMsg(qs("login-msg"),res.error||"Login falló"); return; }
  setLoggedIn(u);
});

qs("btn-to-register").addEventListener("click",()=>{ qs("reg-username").focus(); });
qs("btn-logout").addEventListener("click",logout);

if(CURRENT_USER){ qs("login-screen").classList.add("hidden"); qs("main-screen").classList.remove("hidden"); }