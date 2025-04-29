// Verificar si se debe mostrar una captura o un cartón
const urlParams = new URLSearchParams(window.location.search);
const cardData = urlParams.get('card');
const captureData = urlParams.get('capture');

if (cardData) {
    // Mostrar solo el cartón
    try {
        const {id, numbers} = JSON.parse(decodeURIComponent(cardData));
        document.body.innerHTML = `
            <h1>Cartón de Bingo</h1>
            <div class="card">
                <h3>Cartón ${id}</h3>
                <div class="card-grid"></div>
            </div>
        `;
        const grid = document.querySelector('.card-grid');
        numbers.forEach(number => {
            const cell = document.createElement('div');
            cell.className = 'card-number';
            cell.textContent = number;
            grid.appendChild(cell);
        });
    } catch (e) {
        console.error('Error al cargar el cartón:', e);
        document.body.innerHTML = '<h1>Error al cargar el cartón</h1>';
    }
} else if (captureData) {
    // Mostrar solo la captura
    document.body.innerHTML = `
        <h1>Captura del Juego de Bingo</h1>
        <img id="captureImage" src="${decodeURIComponent(captureData)}" alt="Captura del juego">
    `;
} else {
    // Mostrar el juego completo
    document.body.innerHTML = `
    <img src="https://i.postimg.cc/90PWcPB6/bingo-Banner.png" width="600" alt="titulo">
        <h1>Juego de Bingo</h1>
        <button id="signupButton">Anotar</button>
        <div id="signupTable">
            <table class="signup-table">
                <tr>
                    <td><input type="text" id="playerNameInput" class="signup-input" placeholder="Nombre del jugador"></td>
                    <td><button id="savePlayerButton" class="signup-button">Guardar</button></td>
                    <td><button id="closeTableButton" class="close-button">Cerrar</button></td>
                </tr>
                <tr>
                    <td colspan="3">
                        <ul id="playerList"></ul>
                    </td>
                </tr>
            </table>
        </div>
        <div id="display">?</div>
        <div class="button-container">
            <button id="callButton">Llamar próxima bola</button>
            <button id="bingo90Button">Bingo 1-90</button>
            <button id="bingo100Button">Bingo 1-100</button>
            <button id="autoButton">Automático</button>
            <button id="resetButton">Reiniciar</button>
            <button id="volumeButton">Volumen: Alto</button>
        </div>
        <div id="calledNumbers">
            <p>Números llamados:</p>
        </div>
        <div id="numberTable"></div>
        <div class="cards-button-container">
            <button id="generateCardsButton">Generar Cartones</button>
            <button id="deleteAllCardsButton">Eliminar Cartones</button>
            <button id="deleteOneCardButton">Eliminar 1 Cartón</button>
        </div>
        <button id="captureButton">Tomar Captura</button>
        <div id="cardsContainer"></div>
        <div id="captureContainer"></div>
        <div class="content">
        <h2>Dj Funny</h2>
        <h2>Dj Funny</h2>
    </div>
    <div class="lock-screen" id="lock-screen">
        <h2>El Juego está a un PIN de empezar!</h2>
        <input type="password" id="pin-input" placeholder="Ingrese el PIN">
        <button onclick="unlockProfile()" class="lock-button">Desbloquear</button>
    </div>
    `;

    let availableNumbers = [];
    let calledNumbers = [];
    let maxNumber = 100;
    let autoInterval = null;
    let volumeLevel = 1;
    let players = [];

    const display = document.getElementById('display');
    const callButton = document.getElementById('callButton');
    const resetButton = document.getElementById('resetButton');
    const bingo90Button = document.getElementById('bingo90Button');
    const bingo100Button = document.getElementById('bingo100Button');
    const autoButton = document.getElementById('autoButton');
    const volumeButton = document.getElementById('volumeButton');
    const captureButton = document.getElementById('captureButton');
    const signupButton = document.getElementById('signupButton');
    const signupTable = document.getElementById('signupTable');
    const playerNameInput = document.getElementById('playerNameInput');
    const savePlayerButton = document.getElementById('savePlayerButton');
    const closeTableButton = document.getElementById('closeTableButton');
    const playerList = document.getElementById('playerList');
    const generateCardsButton = document.getElementById('generateCardsButton');
    const deleteAllCardsButton = document.getElementById('deleteAllCardsButton');
    const deleteOneCardButton = document.getElementById('deleteOneCardButton');
    const calledNumbersDiv = document.getElementById('calledNumbers');
    const numberTable = document.getElementById('numberTable');
    const cardsContainer = document.getElementById('cardsContainer');
    const captureContainer = document.getElementById('captureContainer');

    function unlockProfile() {
        var pin = document.getElementById("pin-input").value;
        if (pin === "001") {
            document.getElementById("lock-screen").style.display = "none";}}

    // Inicializar juego
    function initGame(max) {
        maxNumber = max;
        availableNumbers = Array.from({length: maxNumber}, (_, i) => i + 1);
        calledNumbers = [];
        players = [];
        display.textContent = '?';
        callButton.disabled = false;
        callButton.textContent = 'Llamar próxima bola';
        autoButton.textContent = 'Automático';
        autoButton.classList.remove('active');
        if (autoInterval) clearInterval(autoInterval);
        updateCalledNumbers();
        updatePlayerList();
        createNumberTable();
        cardsContainer.innerHTML = '';
        signupTable.style.display = 'none';
    }

    // Crear tabla de números
    function createNumberTable() {
        numberTable.innerHTML = '';
        for (let i = 1; i <= maxNumber; i++) {
            const cell = document.createElement('div');
            cell.className = 'number-cell';
            cell.textContent = i;
            cell.id = `number-${i}`;
            numberTable.appendChild(cell);
        }
        // Marcar números ya llamados en la tabla
        calledNumbers.forEach(markNumber);
    }

    // Actualizar lista de jugadores
    function updatePlayerList() {
        playerList.innerHTML = '';
        players.forEach(player => {
            const li = document.createElement('li');
            li.textContent = player;
            playerList.appendChild(li);
        });
    }

    // Obtener número aleatorio
    function getRandomNumber() {
        if (availableNumbers.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * availableNumbers.length);
        const number = availableNumbers[randomIndex];
        availableNumbers.splice(randomIndex, 1);
        return number;
    }

    // Función para anunciar el número
    function announceNumber(number) {
        if (number !== null) {
            const utterance = new SpeechSynthesisUtterance(`Número ${number}`);
            utterance.lang = 'es-ES';
            utterance.volume = volumeLevel;
            utterance.rate = 1;
            utterance.pitch = 1;
            window.speechSynthesis.speak(utterance);
        }
    }

    // Actualizar pantalla
    function updateDisplay(number) {
        display.textContent = number !== null ? number : 'Fin';
        if (number !== null) {
            calledNumbers.push(number);
            updateCalledNumbers();
            markNumber(number);
            announceNumber(number);
        } else {
            callButton.disabled = true;
            callButton.textContent = 'Juego Terminado';
            autoButton.textContent = 'Automático';
            autoButton.classList.remove('active');
            if (autoInterval) clearInterval(autoInterval);
        }
    }

    // Marcar número en la tabla y en los cartones
    function markNumber(number) {
        // Marcar en la tabla principal
        const tableCell = document.getElementById(`number-${number}`);
        if (tableCell) tableCell.classList.add('called');

        // Marcar en los cartones generados
        const cardCells = cardsContainer.querySelectorAll('.card-number');
        cardCells.forEach(cell => {
            if (parseInt(cell.textContent) === number) {
                cell.classList.add('called');
            }
        });
    }

    // Actualizar números llamados
    function updateCalledNumbers() {
        const numbersText = calledNumbers.join(', ');
        calledNumbersDiv.innerHTML = `<p>Números llamados: ${numbersText}</p>`;
    }

    // Llamar número automáticamente
    function callNextNumber() {
        const nextNumber = getRandomNumber();
        updateDisplay(nextNumber);
    }

    // Cambiar nivel de volumen
    function toggleVolume() {
        if (volumeLevel === 1) {
            volumeLevel = 0.5;
            volumeButton.textContent = 'Volumen: Medio';
        } else if (volumeLevel === 0.5) {
            volumeLevel = 0;
            volumeButton.textContent = 'Volumen: Mute';
        } else {
            volumeLevel = 1;
            volumeButton.textContent = 'Volumen: Alto';
        }
    }

    // Generar números aleatorios para un cartón
    function generateCardNumbers() {
        const numbers = Array.from({length: maxNumber}, (_, i) => i + 1);
        const cardNumbers = [];
        for (let i = 0; i < 25; i++) {
            const randomIndex = Math.floor(Math.random() * numbers.length);
            cardNumbers.push(numbers.splice(randomIndex, 1)[0]);
        }
        return cardNumbers/* .sort((a, b) => a - b) */;
    }

    // Generar cartones
    function generateCards() {
        cardsContainer.innerHTML = '';
        for (let i = 1; i <= 30; i++) {
            const cardNumbers = generateCardNumbers();
            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.id = i;
            card.innerHTML = `<h3>Cartón ${i}</h3>`;
            const grid = document.createElement('div');
            grid.className = 'card-grid';
            cardNumbers.forEach(number => {
                const cell = document.createElement('div');
                cell.className = 'card-number';
                cell.textContent = number;
                // Marcar si el número ya fue llamado
                if (calledNumbers.includes(number)) {
                    cell.classList.add('called');
                }
                grid.appendChild(cell);
            });
            card.appendChild(grid);
            
            // Crear enlace para compartir
            const cardData = encodeURIComponent(JSON.stringify({id: i, numbers: cardNumbers}));
            const shareLink = `${window.location.origin}${window.location.pathname}?card=${cardData}`;
            const link = document.createElement('a');
            link.href = shareLink;
            link.textContent = 'Compartir cartón';
            card.appendChild(link);
            
            cardsContainer.appendChild(card);
        }
    }

    // Eliminar todos los cartones
    function deleteAllCards() {
        cardsContainer.innerHTML = '';
    }

    // Eliminar un cartón por ID
    function deleteOneCard() {
        const id = prompt('Ingrese el ID del cartón a eliminar (1-30):');
        if (id === null) return;
        const idNum = parseInt(id);
        if (isNaN(idNum) || idNum < 1 || idNum > 30) {
            alert('Por favor, ingrese un ID válido (1-30).');
            return;
        }
        const card = cardsContainer.querySelector(`.card[data-id="${idNum}"]`);
        if (card) {
            card.remove();
        } else {
            alert(`No se encontró un cartón con ID ${idNum}.`);
        }
    }

    // Tomar captura de pantalla
    function takeScreenshot() {
        // Crear contenedor temporal con los elementos deseados
        captureContainer.innerHTML = `
            <h1>Juego de Bingo</h1>
            <button id="signupButton">Anotarse</button>
            <div id="display">${display.textContent}</div>
            <div class="button-container">
                <button id="callButton">${callButton.textContent}</button>
                <button id="resetButton">Reiniciar</button>
                <button id="bingo90Button">Bingo 1-90</button>
                <button id="bingo100Button">Bingo 1-100</button>
                <button id="autoButton">${autoButton.textContent}</button>
                <button id="volumeButton">${volumeButton.textContent}</button>
                <button id="captureButton">Captura</button>
            </div>
            <div id="calledNumbers">${calledNumbersDiv.innerHTML}</div>
            <div id="numberTable">${numberTable.innerHTML}</div>
        `;

        // Aplicar estilos al contenedor temporal
        captureContainer.style.position = 'absolute';
        captureContainer.style.top = '-9999px';
        captureContainer.style.left = '-9999px';
        captureContainer.style.backgroundColor = '#f0f0f0';
        captureContainer.style.padding = '20px';
        captureContainer.style.display = 'flex';
        captureContainer.style.flexDirection = 'column';
        captureContainer.style.alignItems = 'center';

        // Renderizar captura
        html2canvas(captureContainer, {backgroundColor: '#f0f0f0'}).then(canvas => {
            const imageData = canvas.toDataURL('image/png');
            const shareLink = `${window.location.origin}${window.location.pathname}?capture=${encodeURIComponent(imageData)}`;
            
            // Mostrar enlace para compartir
            const link = document.createElement('a');
            link.href = shareLink;
            link.textContent = 'Compartir captura';
            link.style.display = 'block';
            link.style.marginTop = '10px';
            link.style.color = '#1976d2';
            link.style.textDecoration = 'none';
            link.style.fontSize = '16px';
            captureContainer.innerHTML = '';
            captureContainer.appendChild(link);
            captureContainer.style.position = 'static';
            captureContainer.style.top = 'auto';
            captureContainer.style.left = 'auto';
            
            // Limpiar después de 10 segundos
            setTimeout(() => {
                captureContainer.innerHTML = '';
            }, 10000);
        }).catch(e => {
            console.error('Error al tomar la captura:', e);
            alert('Error al tomar la captura. Intente de nuevo.');
        });
    }

    // Mostrar tabla de anotación
    function showSignupTable() {
        signupTable.style.display = 'block';
        playerNameInput.focus();
    }

    // Guardar jugador
    function savePlayer() {
        const name = playerNameInput.value.trim();
        if (name) {
            players.push(name);
            updatePlayerList();
            playerNameInput.value = '';
        }
    }

    // Cerrar tabla
    function closeTable() {
        signupTable.style.display = 'none';
        playerNameInput.value = '';
    }

    // Eventos de botones
    signupButton.addEventListener('click', showSignupTable);
    savePlayerButton.addEventListener('click', savePlayer);
    closeTableButton.addEventListener('click', closeTable);
    playerNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') savePlayer();
    });

    callButton.addEventListener('click', () => {
        callNextNumber();
    });

    resetButton.addEventListener('click', () => {
        initGame(maxNumber);
    });

    bingo90Button.addEventListener('click', () => {
        initGame(90);
    });

    bingo100Button.addEventListener('click', () => {
        initGame(100);
    });

    autoButton.addEventListener('click', () => {
        if (autoInterval) {
            clearInterval(autoInterval);
            autoInterval = null;
            autoButton.textContent = 'Automático';
            autoButton.classList.remove('active');
        } else {
            autoInterval = setInterval(callNextNumber, 6000);
            autoButton.textContent = 'Parar';
            autoButton.classList.add('active');
        }
    });

    volumeButton.addEventListener('click', () => {
        toggleVolume();
    });

    captureButton.addEventListener('click', () => {
        takeScreenshot();
    });

    generateCardsButton.addEventListener('click', () => {
        generateCards();
    });

    deleteAllCardsButton.addEventListener('click', () => {
        deleteAllCards();
    });

    deleteOneCardButton.addEventListener('click', () => {
        deleteOneCard();
    });

    // Iniciar juego por defecto con 100 números
    initGame(100);
}