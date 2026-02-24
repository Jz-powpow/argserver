let metodoSeleccionado = "";

// Cambiar panel activo
function showPanel(id){
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// Selección de método
function selectMethod(metodo){
    metodoSeleccionado = metodo;
    showPanel("panelDatos");

    if(metodo === "binance"){
        document.getElementById("datosMetodo").innerHTML = `
            <p onclick="copiar(this, '782849551')">ID BINANCE: 782849551</p>
            <p>NOMBRE: argserver</p>
            <label>Monto en USDT:</label>
        `;
    } else {
        document.getElementById("datosMetodo").innerHTML = `
            <p onclick="copiar(this, '0000003100066665774614')">CVU: 0000003100066665774614</p>
            <p onclick="copiar(this, 'brianna.paredes')">ALIAS: brianna.paredes</p>
            <p>NOMBRE: Rocío Michel Paredes</p>
            <label>Monto en ARS:</label>
        `;
    }
}

// Copiar al portapapeles
function copiar(el, texto){
  navigator.clipboard.writeText(texto);
  const s = document.createElement('span');
  s.className = 'copiado';
  s.textContent = '✓ Copiado';
  el.after(s);
  setTimeout(()=>s.remove(), 1500);
}

// Ir al formulario de comprobante
function goToComprobante(){
  showPanel("panelComprobante");
  document.getElementById("montoFinal").placeholder = 
    metodoSeleccionado === "binance" ? "Monto en USDT" : "Monto en ARS";
}

// Leer URL
const codigoRecarga = new URLSearchParams(window.location.search).get('recarga') || '';

if(codigoRecarga){
  document.getElementById('recargaCode').textContent = codigoRecarga;
  document.getElementById('recargaBanner').classList.add('show');
} else {
  document.getElementById('recargaMissing').classList.add('show');
}

// Enviar comprobante
function enviarATelegram(nombre, correo, monto, file){
  if(!codigoRecarga){
    // Si no hay code
    return;
  }

  const TELEGRAM_TOKEN = "8377456219:AAFTaDBSnVnoZ1i4uiXyiYS8KMKqajpKPmA"; // < token
  const CHAT_ID = "7814482653";        // < chat id
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendDocument`;

  const formData = new FormData();
  formData.append("chat_id", CHAT_ID);
  formData.append("document", file);

  formData.append("caption", 
    `↓ Nuevo comprobante ↓

» CÓDIGO DE RECARGA: ${codigoRecarga}
————————————————————————
» NOMBRE:  ${nombre}

» CORREO:  ${correo}

» MONTO:  ${monto} ${metodoSeleccionado === "binance" ? "USDT" : "ARS"}`
  );

  fetch(url, { method: "POST", body: formData });
}

// Panel final según condición
function mostrarPanelFinal(){
  const panelFinal = document.getElementById("panelFinal");

  if(!codigoRecarga){
    // Mensaje de error
    panelFinal.innerHTML = `
      <div class="error-icon">❌</div>
      <h1>NO SE PUDO ENVIAR EL COMPROBANTE</h1>
      <p>Falta código de recarga en la URL</p>
    `;
  } else {
    // Mensaje de éxito
    panelFinal.innerHTML = `
      <div class="success-icon">✅</div>
      <h1>Comprobante enviado con éxito</h1>
      <p>La acreditación puede demorar hasta 5-10 minutos</p>
      <p id="countdownText">Serás redirigido en... (20 segundos)</p>
    `;

    // Cuenta regresiva
    let seconds = 20;
    const countdownEl = document.getElementById("countdownText");
    const interval = setInterval(() => {
      seconds--;
      countdownEl.textContent = `Serás redirigido en... (${seconds} segundos)`;
      if (seconds <= 0) {
        clearInterval(interval);
        window.location.href = "https://argserver.com/";
      }
    }, 1000);
  }

  // panel final
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  panelFinal.classList.add('active');
}

// formulario
document.getElementById("comprobanteForm").addEventListener("submit", function(e){
  e.preventDefault();

  const nombre = document.getElementById("nombre").value;
  const correo = document.getElementById("correo").value;
  const monto = document.getElementById("montoFinal").value;
  const file = document.getElementById("screenshot").files[0];

  enviarATelegram(nombre, correo, monto, file);

  mostrarPanelFinal();
});
