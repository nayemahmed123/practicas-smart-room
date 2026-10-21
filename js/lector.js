
// ponust
let leyendoPagina = false;

// Función base para leer cualquier texto
function leerTexto(texto) {
    if (!('speechSynthesis' in window)) {
        mostrarModal('Navegador no compatible', 'Tu navegador no soporta la síntesis de voz.');
        return;
    }
    // Cancelamos lecturas anteriores para que no se solapen
    window.speechSynthesis.cancel();
    
    let mensaje = new SpeechSynthesisUtterance(texto);
    mensaje.lang = 'es-ES';
    mensaje.rate = 1.0;
    window.speechSynthesis.speak(mensaje);
}

// Función para leer TODA la página 
function alternarLecturaPagina() {
    const boton = document.getElementById('boton-leer');

    if (leyendoPagina) {
        window.speechSynthesis.cancel();
        leyendoPagina = false;
        boton.textContent = '🔊 Leer página';
        return;
    }

    // Extraemos el texto del contenedor principal
    let contenido = document.querySelector('main') || document.getElementById('contenedor') || document.body;
    let texto = contenido.innerText;

    // Limpiamos un poco el texto para que no lea los emojis
    texto = texto.replace(/[📍🗺️]/g, '');

    let mensaje = new SpeechSynthesisUtterance(texto);
    mensaje.lang = 'es-ES';
    mensaje.rate = 1.0;

    mensaje.onend = function() {
        leyendoPagina = false;
        boton.textContent = '🔊 Leer página';
    };

    window.speechSynthesis.speak(mensaje);
    leyendoPagina = true;
    boton.textContent = '⏹️ Detener lectura';
}

// Esta función se llamará desde el HTML con onfocus
function leerAyuda(texto) {
    // Solo leemos si no está leyendo la página entera para no interrumpir
    if (!leyendoPagina) {
        leerTexto(texto);
    }
}
