
function dictarEnCampo(idCampo) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        mostrarModal('Navegador no compatible', 'Tu navegador no soporta el reconocimiento de voz. Prueba con Google Chrome o Microsoft Edge.');
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    const campo = document.getElementById(idCampo);
    const boton = campo.parentElement.querySelector('.btn-dictar');
    const textoOriginal = boton.textContent;

    boton.textContent = '🎙️...';
    boton.disabled = true;
    campo.style.borderColor = '#E69F00'; // Feedback visual

    recognition.start();

    recognition.onresult = function (event) {
        let textoDictado = event.results[0][0].transcript.trim();
        
        // Lógica específica según el campo
        if (idCampo === 'pais') {
            // Buscar en la lista de países sin tener en cuenta los acentos
            const paisEncontrado = PAISES_ADMITIDOS.find(function (pais) {
                return normalizarTexto(pais) === normalizarTexto(textoDictado);
            });
            if (paisEncontrado) {
                campo.value = paisEncontrado;
                leerTexto('País seleccionado: ' + paisEncontrado);
            } else {
                campo.value = textoDictado;
                leerTexto('País no reconocido: ' + textoDictado);
            }
        } 
        else if (idCampo === 'temp-max' || idCampo === 'temp-min') {
            let num = parseFloat(textoDictado.replace(',', '.'));
            if (isNaN(num)) {
                const diccionario = {'cero':0, 'uno':1, 'dos':2, 'tres':3, 'cuatro':4, 'cinco':5, 'seis':6, 'siete':7, 'ocho':8, 'nueve':9, 'diez':10, 'once':11, 'doce':12, 'trece':13, 'catorce':14, 'quince':15, 'dieciseis':16, 'diecisiete':17, 'dieciocho':18, 'diecinueve':19, 'veinte':20, 'veintiuno':21, 'veintidos':22, 'veintitres':23, 'veinticuatro':24, 'veinticinco':25, 'veintiseis':26};
                num = diccionario[normalizarTexto(textoDictado)];
            }
            if (num !== undefined && !isNaN(num)) {
                campo.value = num;
                actualizarDiferencia();
                leerTexto('Temperatura: ' + num + ' grados');
            } else {
                leerTexto('No se ha reconocido un número válido');
            }
        }
        else {
            campo.value = textoDictado;
            leerTexto('Texto dictado: ' + textoDictado);
        }

        boton.textContent = '✅';
        campo.style.borderColor = '';
        setTimeout(() => { boton.textContent = textoOriginal; }, 2000);
    };

    recognition.onerror = function (event) {
        boton.textContent = textoOriginal;
        boton.disabled = false;
        campo.style.borderColor = '';
        if (event.error === 'not-allowed') {
            mostrarModal('Micrófono bloqueado', 'Debes permitir el acceso al micrófono en tu navegador.');
        } else if (event.error === 'no-speech') {
            mostrarModal('No se ha detectado voz', 'Inténtalo de nuevo y habla claro.');
        }
    };

    recognition.onend = function () {
        boton.disabled = false;
        campo.style.borderColor = '';
        if (boton.textContent === '🎙️...') {
            boton.textContent = textoOriginal;
        }
    };
}

// Función de lectura en voz alta (necesaria para las confirmaciones)
function leerTexto(texto) {
    window.speechSynthesis.cancel();
    let mensaje = new SpeechSynthesisUtterance(texto);
    mensaje.lang = 'es-ES';
    mensaje.rate = 1.0;
    window.speechSynthesis.speak(mensaje);
}

