var model = null;
var historyContent = [];
var coins = 0;
var interval = null;
var hasAutoClick = false;


// Renderização de Histório

/**
 * Função para renderizar o histórico na tela
 * @returns {void}
 */
function renderHistory() {
  const table = document.getElementById('history');

  const content = `
                ${historyContent
                  .map(
                    ({ n, real, ai, proximity }) => `
                    <tr data-firstdigit="${proximity.toString()[0]}">
                        <td>${n}</td>
                        <td>${real}</td>
                        <td>${ai}</td>
                        <td>${proximity}%</td>
                    </tr>
                `
                  )
                  .join('')}
            `;

  table.querySelector('tbody').innerHTML = content;
}

/**
 * Função para adicionar ao histórico e ativar renderização na tela
 * @param {Number} n 
 * @param {Number} real 
 * @param {Number} ai 
 * @param {Number} proximity 
 */
function pushToHistory(n, real, ai, proximity) {
  historyContent.push({ n, real, ai, proximity });
  renderHistory();
}

// Machine Learning

/**
 * Função para treinar o modelo para poder calcular a raiz quadrada de um número
 * @returns {Promise<void>}
 */
async function trainModel() {
  // Define the training data: numbers and their square roots
  const numbers = [144, 121, 100, 81, 64, 49, 36, 25, 16, 9, 4, 1];
  const squareRoots = [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

  // Normalize the data
  const xs = tf.tensor2d(numbers, [numbers.length, 1]);
  const ys = tf.tensor2d(squareRoots, [squareRoots.length, 1]);

  // Create a more complex model with hidden layers
  model = tf.sequential();
  model.add(
    tf.layers.dense({ units: 16, inputShape: [1], activation: 'relu' })
  );
  model.add(tf.layers.dense({ units: 8, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 1 }));

  // Compile the model
  model.compile({
    loss: 'meanSquaredError',
    optimizer: 'adam',
  });

  // Train the model
  await model.fit(xs, ys, {
    epochs: 1000,
  });
}

/**
 * Função para prever a raiz quadrada de um número
 * @returns {void}
 */
function predict() {
  const inputTensor = tf.tensor2d([n], [1, 1]);

  const result = model.predict(inputTensor).dataSync();
  const real = Math.sqrt(n);
  const closePercentage = Math.abs(real - result[0]);
  const proximityPercentage = 100 - (closePercentage / real) * 100;

  console.log(
    `Number: ${n}, Real: ${real}, AI: ${result[0]}, Proximity: ${proximityPercentage}% `
  );
  pushToHistory(n, real, result[0], proximityPercentage);
}

// Funções de Interface

/**
 * Função para gerar um número aleatório
 * @returns {void}
 */
function generateRandomNumber() {
  n = Math.floor(Math.random() * 100) + 1;
  document.getElementById('number').innerText = `${n} (Raiz = ${Math.sqrt(n)})`;
}

/**
 * Função para atualizar as moedas na tela
 * @returns {void}
 */
function updateCookies() {
  const cookies = document.getElementById('cookies');
  const lastHistory = historyContent[historyContent.length - 1];
  const proximity = lastHistory.proximity;
  if (proximity >= 90) {
    coins++;
  }
  cookies.innerText = coins;
}

/**
 * Função para animar o clique no cookie
 * @returns {void}
 */
function handleCookieClickAnimation() {
  const cookies = document.querySelector('.cookie-btn');
  cookies.classList.add('cookie-click-animation');
  setTimeout(() => {
    cookies.classList.remove('cookie-click-animation');
  }, 250);
}

/**
 * Função para agrupar as ações de clique no cookie
 * @returns {void}
 */
function handleClick() {
  handleCookieClickAnimation();
  predict();
  generateRandomNumber();
  updateCookies();
}

/**
 * Função para habilitar o Auto Click
 * @returns {void}
 */
function enableAutoClick() {
  const PRICE = 20;

  if (coins < PRICE) {
    alert('Você não tem moedas suficientes');
    return;
  }

  hasAutoClick = true;

  coins -= PRICE;

  interval = setInterval(() => {
    handleClick();
  }, 1000);

  const button = document.getElementById('auto');
  button.disabled = true;
  button.innerText = 'Auto Click (ON)';
  button.classList.add('auto-click-active');
}

/**
 * Função de extração de relatório através de um arquivo .csv
 * @returns {void}
 */
function getReport() {
  // get report in csv file
  // headers
  const data = [
    ['Number', 'Real', 'AI', 'Proximity'],
    ...historyContent.map(({ n, real, ai, proximity }) => [
      n,
      real,
      ai,
      proximity,
    ]),
  ];

  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(data.join('\n'));
  a.download = 'report.csv';
  a.click();
}

// Inicialização

/**
 * Função para inicializar o script, treinando o modelo e gerando número aleatório
 * @returns {void}
 */
window.onload = () => {
  trainModel();
  generateRandomNumber();
};
