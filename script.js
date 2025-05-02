// Verificar si se debe mostrar un cartón
const urlParams = new URLSearchParams(window.location.search);
const cardId = urlParams.get('cardId');

if (cardId) {
    // Mostrar solo el cartón
    try {
        const cards = JSON.parse(localStorage.getItem('bingoCards')) || {};
        const numbers = cards[cardId] || [];
        if (numbers.length === 0) {
            throw new Error('Cartón no encontrado');
        }
        document.body.innerHTML = `
            <h1>Cartón de Bingo</h1>
            <p>Haga clic en los números que salgan para marcarlos.</p>
            <label for="colorSelect">Selecciona el color para marcar:</label>
            <select id="colorSelect">
                <option value="yellow">Amarillo</option>
                <option value="red">Rojo</option>
                <option value="black">Negro</option>
                <option value="blue">Azul</option>
                <option value="pink">Rosa</option>
                <option value="cyan">Celeste</option>
                <option value="green">Verde</option>
                <option value="purple">Morado</option>
                <option value="orange">Naranja</option>
                <option value="gray">Gris</option>
            </select>
            <div class="card">
                <h3>Cartón ${cardId}</h3>
                <div class="card-grid"></div>
            </div>
            
        `;
        const grid = document.querySelector('.card-grid');
        const colorSelect = document.getElementById('colorSelect');
        numbers.forEach(number => {
            const cell = document.createElement('div');
            cell.className = 'card-number';
            cell.textContent = number;
            cell.addEventListener('click', () => {
                const currentColor = colorSelect.value;
                const isMarked = cell.classList.contains(`marked-${currentColor}`);
                // Remover cualquier clase marked-* previa
                cell.classList.remove(...Array.from(cell.classList).filter(cls => cls.startsWith('marked-')));
                if (!isMarked) {
                    cell.classList.add(`marked-${currentColor}`);
                }
            });
            grid.appendChild(cell);
        });
    } catch (e) {
        console.error('Error al cargar el cartón:', e);
        document.body.innerHTML = '<h1>Cartón no encontrado. Por favor, genera los cartones en el juego principal.</h1>';
    }
} else {
    // Mostrar el juego completo
    document.body.innerHTML = `
    <div class="lock-screen" id="lock-screen">
        <h2>El Juego está a un PIN de empezar!</h2>
        <input type="password" id="pin-input" placeholder="Ingrese el PIN">
        <button onclick="unlockProfile()" class="lock-button">Desbloquear</button>
    </div>
        <img src="https://i.postimg.cc/90PWcPB6/bingo-Banner.png" width="600" alt="titulo">
        <h1>Juego de Bingo</h1>
        <button id="signupButton">Anotarse</button>
        <div id="signupModal" class="modal">
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <table class="signup-table">
                    <tr>
                        <td colspan="2">
                            <input type="text" id="playerNameInput" class="signup-input" placeholder="Nombre del jugador">
                        </td>
                        <td colspan="2">
                            <input type="text" id="playerNumbersInput" class="signup-input" placeholder="Números (ej. 1,2,3)">
                        </td>
                        <td>
                            <button id="savePlayerButton" class="signup-button">Guardar</button>
                        </td>
                        <td>
                            <button id="deleteAllPlayersButton" class="delete-all-players-button">Eliminar Todos</button>
                        </td>
                        <td>
                            <button id="closeModalButton" class="close-button">Cerrar</button>
                        </td>
                    </tr>
                    <tr>
                        <th>Nombre</th>
                        <th>Números</th>
                        <th>Nombre</th>
                        <th>Números</th>
                        <th>Nombre</th>
                        <th>Números</th>
                    </tr>
                    <tbody id="playerList"></tbody>
                </table>
            </div>
        </div>
        <div id="display">?</div>
        <div class="button-container">
            <button id="callButton">Llamar próxima bola</button>
            <button id="resetButton">Reiniciar</button>
            <button id="bingo90Button">Bingo 1-90</button>
            <button id="bingo100Button">Bingo 1-100</button>
            <button id="autoButton">Automático</button>
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
        <div id="cardsContainer"></div>
        <!-- Firma DjFunny -->
    <div class="content">
        <h2>Dj Funny</h2>
        <h2>Dj Funny</h2>
    </div>
    `;

    let availableNumbers = [];
            let calledNumbers = [];
            let maxNumber = 100;
            let autoInterval = null;
            let volumeLevel = 1;
            let players = JSON.parse(localStorage.getItem('bingoPlayers')) || [];

            const display = document.getElementById('display');
            const callButton = document.getElementById('callButton');
            const resetButton = document.getElementById('resetButton');
            const bingo90Button = document.getElementById('bingo90Button');
            const bingo100Button = document.getElementById('bingo100Button');
            const autoButton = document.getElementById('autoButton');
            const volumeButton = document.getElementById('volumeButton');
            const signupButton = document.getElementById('signupButton');
            const signupModal = document.getElementById('signupModal');
            const modalBackdrop = signupModal.querySelector('.modal-backdrop');
            const playerNameInput = document.getElementById('playerNameInput');
            const playerNumbersInput = document.getElementById('playerNumbersInput');
            const savePlayerButton = document.getElementById('savePlayerButton');
            const deleteAllPlayersButton = document.getElementById('deleteAllPlayersButton');
            const closeModalButton = document.getElementById('closeModalButton');
            const playerList = document.getElementById('playerList');
            const generateCardsButton = document.getElementById('generateCardsButton');
            const deleteAllCardsButton = document.getElementById('deleteAllCardsButton');
            const deleteOneCardButton = document.getElementById('deleteOneCardButton');
            const calledNumbersDiv = document.getElementById('calledNumbers');
            const numberTable = document.getElementById('numberTable');
            const cardsContainer = document.getElementById('cardsContainer');

            // Inicializar juego
            function initGame(max) {
                maxNumber = max;
                availableNumbers = Array.from({length: maxNumber}, (_, i) => i + 1);
                calledNumbers = [];
                localStorage.removeItem('bingoCards');
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
                signupModal.style.display = 'none';
            }

            function unlockProfile() {
                var pin = document.getElementById("pin-input").value;
                if (pin === "13") {
                    document.getElementById("lock-screen").style.display = "none";}}

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
        calledNumbers.forEach(markNumber);
    }

    // Actualizar lista de jugadores
    function updatePlayerList() {
        playerList.innerHTML = '';
        const maxPerRow = 3; // Máximo 3 jugadores por fila (uno por par de columnas)
        for (let i = 0; i < Math.ceil(players.length / maxPerRow); i++) {
            const row = document.createElement('tr');
            // Inicializar celdas vacías
            const cells = ['', '', '', '', '', ''];
            // Llenar celdas con jugadores
            for (let j = 0; j < maxPerRow; j++) {
                const playerIndex = i * maxPerRow + j;
                if (playerIndex < players.length) {
                    const player = players[playerIndex];
                    cells[j * 2] = `<button class="delete-player-button" data-index="${playerIndex}">X</button> ${player.name}`;
                    cells[j * 2 + 1] = player.numbers || '';
                }
            }
            row.innerHTML = `
                <td>${cells[0]}</td>
                <td>${cells[1]}</td>
                <td>${cells[2]}</td>
                <td>${cells[3]}</td>
                <td>${cells[4]}</td>
                <td>${cells[5]}</td>
            `;
            playerList.appendChild(row);
        }

        // Añadir eventos a los botones de eliminar
        const deleteButtons = playerList.querySelectorAll('.delete-player-button');
        deleteButtons.forEach(button => {
            button.addEventListener('click', () => {
                const index = parseInt(button.dataset.index);
                players.splice(index, 1);
                localStorage.setItem('bingoPlayers', JSON.stringify(players));
                updatePlayerList();
            });
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

    // Anunciar número
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

    // Marcar número en la tabla y cartones
    function markNumber(number) {
        const tableCell = document.getElementById(`number-${number}`);
        if (tableCell) tableCell.classList.add('called');
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

    // Cambiar volumen
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

    // Generar números para un cartón
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
        const cards = {};
        for (let i = 1; i <= 30; i++) {
            const cardNumbers = generateCardNumbers();
            cards[i] = cardNumbers;
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
                if (calledNumbers.includes(number)) {
                    cell.classList.add('called');
                }
                grid.appendChild(cell);
            });
            card.appendChild(grid);
            
            const shareLink = `${window.location.origin}${window.location.pathname}?cardId=${i}`;
            const link = document.createElement('a');
            link.href = shareLink;
            link.textContent = 'Compartir cartón';
            card.appendChild(link);
            
            cardsContainer.appendChild(card);
        }
        localStorage.setItem('bingoCards', JSON.stringify(cards));
    }

    // Eliminar todos los cartones
    function deleteAllCards() {
        cardsContainer.innerHTML = '';
        localStorage.removeItem('bingoCards');
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
            const cards = JSON.parse(localStorage.getItem('bingoCards')) || {};
            delete cards[idNum];
            localStorage.setItem('bingoCards', JSON.stringify(cards));
        } else {
            alert(`No se encontró un cartón con ID ${idNum}.`);
        }
    }

    // Mostrar ventana emergente
    function showSignupModal() {
        signupModal.style.display = 'block';
        playerNameInput.focus();
    }

    // Cerrar ventana emergente
    function closeModal() {
        signupModal.style.display = 'none';
        playerNameInput.value = '';
        playerNumbersInput.value = '';
    }

    // Guardar jugador
    function savePlayer() {
        const name = playerNameInput.value.trim();
        const numbers = playerNumbersInput.value.trim();
        if (!name) {
            alert('El nombre es obligatorio.');
            return;
        }
        if (players.length >= 45) {
            alert('No se pueden añadir más de 45 jugadores.');
            return;
        }
        if (players.some(player => player.name.toLowerCase() === name.toLowerCase())) {
            alert('El nombre ya está en uso.');
            return;
        }
        if (numbers && players.some(player => player.numbers === numbers)) {
            alert('Los números ya están en uso.');
            return;
        }
        players.push({ name, numbers });
        localStorage.setItem('bingoPlayers', JSON.stringify(players));
        updatePlayerList();
        playerNameInput.value = '';
        playerNumbersInput.value = '';
    }

    // Eliminar todos los jugadores
    function deleteAllPlayers() {
        players = [];
        localStorage.removeItem('bingoPlayers');
        updatePlayerList();
    }

    // Eventos de botones
    signupButton.addEventListener('click', showSignupModal);
    savePlayerButton.addEventListener('click', savePlayer);
    deleteAllPlayersButton.addEventListener('click', deleteAllPlayers);
    closeModalButton.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);
    playerNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') savePlayer();
    });
    playerNumbersInput.addEventListener('keypress', (e) => {
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
            autoInterval = setInterval(callNextNumber, 5000); // Llama un número cada 5 segundos
            autoButton.textContent = 'Parar';
            autoButton.classList.add('active');
        }
    });

    volumeButton.addEventListener('click', () => {
        toggleVolume();
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
    updatePlayerList();
}