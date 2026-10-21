

const PAISES_ADMITIDOS = [
    "España", "Francia", "Italia", "Alemania", "Portugal"
];

let elementoFocoAnterior = null;

function mostrarModal(titulo, mensaje) {
    elementoFocoAnterior = document.activeElement;
    document.getElementById('modal-titulo').textContent = titulo;
    document.getElementById('modal-mensaje').textContent = mensaje;
    document.getElementById('modal').classList.add('visible');
    setTimeout(() => document.getElementById('modal-boton').focus(), 50);
}

function cerrarModal() {
    document.getElementById('modal').classList.remove('visible');
    if (elementoFocoAnterior) {
        elementoFocoAnterior.focus();
    }
}

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('modal');
        if (modal && modal.classList.contains('visible')) cerrarModal();
    }
});

function normalizarTexto(texto) {
    return texto
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''); // Elimina tildes
}

function validarPais(pais) {
    const limpio = normalizarTexto(pais);
    if (limpio === '') return false;
    return PAISES_ADMITIDOS.some(p => normalizarTexto(p) === limpio);
}

function validarTemperatura(valor, nombreCampo) {
    if (valor === '' || valor === null || isNaN(parseFloat(valor))) {
        return { error: true, aviso: false, mensaje: 'El campo "' + nombreCampo + '" debe ser un número válido.' };
    }
    const num = parseFloat(valor);
    if (num < 22 || num > 26) {
        return { error: false, aviso: true, valor: num, mensaje: 'El campo "' + nombreCampo + '" (' + num + ' °C) está fuera del rango recomendado (22–26 °C).' };
    }
    return { error: false, aviso: false, valor: num };
}

function actualizarDiferencia() {
    const max = parseFloat(document.getElementById('temp-max').value);
    const min = parseFloat(document.getElementById('temp-min').value);
    const out = document.getElementById('diferencia');
    if (!isNaN(max) && !isNaN(min)) {
        out.textContent = (max - min).toFixed(1);
    } else {
        out.textContent = '—';
    }
}

function actualizarIndicadorPassword(password) {
    const indicador = document.getElementById('indicador-password');
    indicador.classList.remove('vacia');

    if (password.length === 0) {
        indicador.textContent = '';
        indicador.classList.add('vacia');
        return;
    }

    let emoji = '';
    let texto = '';

    if (password.length < 9) {
        emoji = '😟'; texto = 'la contrseña noo es segura (mínimo 9 caracteres)';
    } else if (password.length < 12) {
        emoji = '🙂'; texto = 'Contrseña  aceptable';
    } else {
        emoji = '🤩'; texto = 'Contraseña segura';
    }
    indicador.textContent = emoji + ' ' + texto;
}


function validarFormulario(event) {
    event.preventDefault();

    // 1. pais
    const campoPais = document.getElementById('pais');
    if (!validarPais(campoPais.value)) {
        campoPais.setAttribute('aria-invalid', 'true');
        mostrarModal('País erróneo', 'El país introducido no está en la lista admitida. Por favor, selecciona uno de los países sugeridos.');
        return false;
    }
    campoPais.removeAttribute('aria-invalid');

    // 2. contraseña
    const campoPassword = document.getElementById('password');
    if (campoPassword.value.length < 9) {
        campoPassword.setAttribute('aria-invalid', 'true');
        mostrarModal('Contraseña demasiado corta', 'La contraseña debe tener al menos 9 caracteres. Actualmente tiene ' + campoPassword.value.length + '.');
        return false;
    }
    campoPassword.removeAttribute('aria-invalid');

    // 3.  temp
    const campoMax = document.getElementById('temp-max');
    const campoMin = document.getElementById('temp-min');

    const resMax = validarTemperatura(campoMax.value, 'Temperatura máxima');
    const resMin = validarTemperatura(campoMin.value, 'Temperatura mínima');

    let avisos = [];
    if (resMax.error) avisos.push('- ' + resMax.mensaje);
    else if (resMax.aviso) avisos.push('- ' + resMax.mensaje);

    if (resMin.error) avisos.push('- ' + resMin.mensaje);
    else if (resMin.aviso) avisos.push('- ' + resMin.mensaje);

    let coherenciaOk = true;
    if (!resMax.error && !resMin.error) {
        const max = parseFloat(campoMax.value);
        const min = parseFloat(campoMin.value);
        if (max < min) {
            coherenciaOk = false;
            avisos.push('- La temperatura máxima (' + max + ' °C) es inferior a la mínima (' + min + ' °C). La máxima debe ser mayor o igual que la mínima.');
        }
    }

    const temperaturasValidas = (!resMax.error && !resMax.aviso && !resMin.error && !resMin.aviso && coherenciaOk);

    
    localStorage.setItem('sm_pais', campoPais.value.trim());
    localStorage.setItem('sm_ciudad', document.getElementById('ciudad').value.trim());
    localStorage.setItem('sm_localizacion', document.getElementById('localizacion').value.trim());
    localStorage.setItem('sm_mapa', document.getElementById('mapa').value.trim());

 //sens
    let sensoresSeleccionados = [];
    const checkboxes = document.querySelectorAll('input[name="sensores"]:checked');
    for (let i = 0; i < checkboxes.length; i++) {
        sensoresSeleccionados.push(checkboxes[i].value);
    }
    localStorage.setItem('sm_sensores', sensoresSeleccionados.join(','));

    // guardar temperaturas
    if (temperaturasValidas) {
        const max = parseFloat(campoMax.value);
        const min = parseFloat(campoMin.value);
        localStorage.setItem('sm_tempMax', max);
        localStorage.setItem('sm_tempMin', min);
        localStorage.setItem('sm_diferencia', (max - min).toFixed(1));
        localStorage.setItem('sm_temperaturasValidas', 'true');
    } else {
        localStorage.setItem('sm_temperaturasValidas', 'false');
    }

    // 5. msj
    if (avisos.length > 0) {
        mostrarModal('Aviso', avisos.join('\n') + '\n\nEl resto de la configuración se ha guardado correctamente. ' + (temperaturasValidas ? '' : 'Las temperaturas no se mostrarán en la página principal porque no cumplen todos los requisitos.'));
        return false;
    }

    mostrarModal('Guardado', 'Todos los datos son correctos. La configuración se ha guardado.');
    return false;
}

// mps
function convertirGMSaDecimal(gms) {
    const limpio = gms.replace(/[’'′]/g, '′').replace(/["”″]/g, '″').trim();
    const regex = /^(-?\d+(?:\.\d+)?)\s*°\s*(\d+(?:\.\d+)?)?\s*′?\s*(\d+(?:\.\d+)?)?\s*″?\s*([NSEO])?$/i;
    const m = limpio.match(regex);
    
    if (!m) return null;

    const grados = parseFloat(m[1]);
    const minutos = parseFloat(m[2] || 0);
    const segundos = parseFloat(m[3] || 0);
    const direccion = (m[4] || '').toUpperCase();

    let decimal = Math.abs(grados) + (minutos / 60) + (segundos / 3600);
    
    // Sur u Oeste negativo
    if (direccion === 'S' || direccion === 'O' || direccion === 'W') {
        decimal = -decimal;
    }
    return decimal;
}

// Detecta si es decimal o GMS y lo convierte
function parsearCoordenada(texto) {
    const limpio = texto.trim();
    if (limpio === '') return null;
    if (/[°′″]/.test(limpio)) {
        return convertirGMSaDecimal(limpio);
    }
    const num = parseFloat(limpio);
    return isNaN(num) ? null : num;
}

// Función principal del botón
function generarEnlaceMaps() {
    const campoCoords = document.getElementById('localizacion');
    const campoMapa = document.getElementById('mapa');
    
    // Separar por coma (latitud, longitud)
    const partes = campoCoords.value.split(',').map(s => s.trim());

    if (partes.length !== 2) {
        mostrarModal('Error en coordenadas', 'Debes introducir la latitud y la longitud separadas por una coma. Ejemplo: 40.4818, -3.3643');
        return false;
    }

    const lat = parsearCoordenada(partes[0]);
    const lon = parsearCoordenada(partes[1]);

    // Validar límites del planeta
    if (lat === null || lon === null || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        mostrarModal('Coordenadas no válidas', 'Las coordenadas introducidas no tienen un formato correcto o están fuera de los límites permitidos.');
        return false;
    }

    campoMapa.value = 'https://maps.google.com/maps?q=' + lat + ',' + lon;
    return true;
}

// Email norm
function validarEmailCadena() {
    const email = document.getElementById('email').value.trim();
    const res = document.getElementById('resultado-email');
    
    // 1. No vacío
    if (email === '') {
        res.textContent = ' El email está vacío.';
        res.style.backgroundColor = '#ffebee'; res.style.color = '#b00020'; res.style.border = '2px solid #b00020';
        return false;
    }

    // 2. Tiene que contener exactamente un @
    const partesArroba = email.split('@');
    if (partesArroba.length !== 2) {
        res.textContent = ' El email debe contener exactamente un @.';
        res.style.backgroundColor = '#ffebee'; res.style.color = '#b00020'; res.style.border = '2px solid #b00020';
        return false;
    }

    const usuario = partesArroba[0];
    const dominio = partesArroba[1];

    // 3. Partes no vacías
    if (usuario.length === 0 || dominio.length === 0) {
        res.textContent = ' La parte del usuario o del dominio está vacía.';
        res.style.backgroundColor = '#ffebee'; res.style.color = '#b00020'; res.style.border = '2px solid #b00020';
        return false;
    }

    // 4. El dominio debe tener al menos un punto
    const partesDominio = dominio.split('.');
    if (partesDominio.length < 2) {
        res.textContent = ' El dominio debe tener al menos un punto (ej: .com, .es).';
        res.style.backgroundColor = '#ffebee'; res.style.color = '#b00020'; res.style.border = '2px solid #b00020';
        return false;
    }

    // 5. El TLD  debe tener al menos 2 letras
    if (partesDominio[partesDominio.length - 1].length < 2) {
        res.textContent = ' La terminación del dominio debe tener al menos 2 letras.';
        res.style.backgroundColor = '#ffebee'; res.style.color = '#b00020'; res.style.border = '2px solid #b00020';
        return false;
    }

    // Si pasa todo
    res.textContent = 'Email válido (Método Cadena)';
    res.style.backgroundColor = '#e8f5e8'; res.style.color = '#1b5e20'; res.style.border = '2px solid #1b5e20';
    return true;

function validarEmailRegex() {
    const email = document.getElementById('email').value.trim();
    const res = document.getElementById('resultado-email');
    
    // Expresión regular: usuario@dominio.tld
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (regex.test(email)) {
        res.textContent = ' Email válido (Método Regex)';
        res.style.backgroundColor = '#e8f5e8'; res.style.color = '#1b5e20'; res.style.border = '2px solid #1b5e20';
        return true;
    } else {
        res.textContent = ' Email no válido según la Expresión Regular.';
        res.style.backgroundColor = '#ffebee'; res.style.color = '#b00020'; res.style.border = '2px solid #b00020';
        return false;
    }
}





//calculadora
// Variables globales
        let pantalla = document.getElementById('pantalla');
        let operacionActual = '0';
        let nuevaOperacion = true;

        // Funciones calculadora
        function agregarNumero(numero) {
            if (nuevaOperacion || operacionActual === '0') {
                operacionActual = numero;
                nuevaOperacion = false;
            } else {
                operacionActual += numero;
            }
            pantalla.value = operacionActual;
        }

        function agregarDecimal() {
            if (nuevaOperacion) {
                operacionActual = '0.';
                nuevaOperacion = false;
            } else if (!operacionActual.includes('.')) {
                operacionActual += '.';
            }
            pantalla.value = operacionActual;
        }

        function agregarOperador(operador) {
            if (!nuevaOperacion) {
                operacionActual += operador;
                nuevaOperacion = false;
                pantalla.value = operacionActual;
            }
        }

        function limpiar() {
            operacionActual = '0';
            nuevaOperacion = true;
            pantalla.value = operacionActual;
            document.getElementById('resultado-conversion').textContent = '-';
        }

        function borrarUltimo() {
            if (operacionActual.length > 1) {
                operacionActual = operacionActual.slice(0, -1);
            } else {
                operacionActual = '0';
                nuevaOperacion = true;
            }
            pantalla.value = operacionActual;
        }

        function calcular() {
            try {
                const expresion = operacionActual.replace('×', '*');
                const resultado = eval(expresion);
                
                if (isNaN(resultado) || !isFinite(resultado)) {
                    throw new Error('Error');
                }
                
                const resultadoFinal = Math.round(resultado * 100) / 100;
                operacionActual = resultadoFinal.toString();
                pantalla.value = operacionActual;
                nuevaOperacion = true;
                
                document.getElementById('valor-actual').textContent = resultadoFinal;
                
            } catch (error) {
                pantalla.value = 'Error';
                nuevaOperacion = true;
            }
        }

        // Funciones conversión temperatura
        function convertirTemperatura(destino) {
            const valorActual = parseFloat(document.getElementById('valor-actual').textContent);
            
            if (isNaN(valorActual)) {
                alert('Primero realiza una operación para obtener un valor');
                return;
            }

            let resultado, unidad;
            switch(destino) {
                case 'f': // Celsius a Fahrenheit
                    resultado = (valorActual * 9/5) + 32;
                    unidad = '°F';
                    break;
                case 'k': // Celsius a Kelvin
                    resultado = valorActual + 273.15;
                    unidad = 'K';
                    break;
                case 'c': // Mantener Celsius
                    resultado = valorActual;
                    unidad = '°C';
                    break;
            }

            resultado = Math.round(resultado * 100) / 100;
            document.getElementById('resultado-conversion').textContent = resultado + ' ' + unidad;
        }
}
