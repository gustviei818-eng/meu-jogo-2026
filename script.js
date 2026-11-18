// CONFIGURAÇÃO DAS FASES

const phases = [
    {
        name: "Aprendiz Ambiental",
        count: 5,
        time: null
    },

    

    {
        name: "Guardião do Planeta",
        count: 15,
        time: 30
    }
];


// MATERIAIS DO JOGO

const materials = [

    {
        name: "Jornal",
        emoji: "📰",
        bin: "papel"
    },

    {
        name: "Caixa de papelão",
        emoji: "📦",
        bin: "papel"
    },

    {
        name: "Folha de papel",
        emoji: "📄",
        bin: "papel"
    },

    {
        name: "Garrafa PET",
        emoji: "🧴",
        bin: "plastico"
    },

    {
        name: "Embalagem plástica",
        emoji: "🥤",
        bin: "plastico"
    },

    {
        name: "Garrafa de vidro",
        emoji: "🍾",
        bin: "vidro"
    },

    {
        name: "Pote de vidro",
        emoji: "🫙",
        bin: "vidro"
    },

    {
        name: "Lata de refrigerante",
        emoji: "🥫",
        bin: "metal"
    },

    {
        name: "Lata de conserva",
        emoji: "🥫",
        bin: "metal"
    },

    {
        name: "Casca de banana",
        emoji: "🍌",
        bin: "organico"
    },

    {
        name: "Restos de frutas",
        emoji: "🍎",
        bin: "organico"
    }

];


// VARIÁVEIS

const screens = [
    "home-screen",
    "game-screen",
    "result-screen",
    "ranking-screen"
];

const $ = id => document.getElementById(id);

let playerName = "";
let phaseIndex = 0;
let currentItems = [];
let itemIndex = 0;
let score = 0;
let lives = 3;
let timeLeft = 0;
let timerId = null;
let locked = false;


// TROCAR DE TELA

function showScreen(id) {

    screens.forEach(screen => {

        $(screen).classList.toggle(
            "hidden",
            screen !== id
        );

    });

}


// EMBARALHAR OBJETOS

function shuffle(list) {

    const copy = [...list];

    for (let i = copy.length - 1; i > 0; i--) {

        const j = Math.floor(
            Math.random() * (i + 1)
        );

        [copy[i], copy[j]] =
        [copy[j], copy[i]];

    }

    return copy;

}


// COMEÇAR JOGO

function startGame() {

    playerName =
    $("player-name").value.trim() || "Participante";

    phaseIndex = 0;
    score = 0;
    lives = 3;

    startPhase();

}


// COMEÇAR FASE

function startPhase() {

    clearInterval(timerId);

    const phase = phases[phaseIndex];

    currentItems = shuffle(materials)
    .slice(0, phase.count);

    itemIndex = 0;

    timeLeft = phase.time;

    $("phase-kicker").textContent =
    `FASE ${phaseIndex + 1}`;

    $("phase-name").textContent =
    phase.name;

    $("timer-stat").classList.toggle(
        "hidden",
        phase.time === null
    );

    showScreen("game-screen");

    updateStats();

    showItem();

    if (phase.time !== null) {

        $("timer").textContent = timeLeft;

        timerId = setInterval(() => {

            timeLeft--;

            $("timer").textContent = timeLeft;

            if (timeLeft <= 0) {

                endGame(
                    false,
                    "O tempo acabou! Tente novamente."
                );

            }

        }, 1000);

    }

}


// ATUALIZAR INFORMAÇÕES

function updateStats() {

    $("score").textContent = score;

    $("lives").textContent = lives;

    $("progress").textContent =
    `${Math.min(itemIndex + 1, phases[phaseIndex].count)}/${phases[phaseIndex].count}`;

    $("progress-fill").style.width =
    `${(itemIndex / phases[phaseIndex].count) * 100}%`;

}


// MOSTRAR OBJETO

function showItem() {

    if (itemIndex >= currentItems.length) {

        finishPhase();

        return;

    }

    locked = false;

    const item = currentItems[itemIndex];

    $("item-emoji").textContent = item.emoji;

    $("item-name").textContent = item.name;

    $("feedback").textContent =
    "Escolha uma lixeira abaixo!";

    $("feedback").classList.remove("wrong");

    updateStats();

}


// ESCOLHER LIXEIRA

function chooseBin(bin) {

    if (locked) return;

    locked = true;

    const item = currentItems[itemIndex];

    const feedback = $("feedback");

    if (bin === item.bin) {

        let points = 10;

        if (phaseIndex === 2) {
            points += 5;
        }

        score += points;

        feedback.textContent =
        `Muito bem! +${points} pontos! 🌱`;

        feedback.classList.remove("wrong");

    } else {

        lives--;

        $("lives").textContent = lives;

        feedback.textContent =
        "Resposta incorreta! Você perdeu uma vida.";

        feedback.classList.add("wrong");

    }

    $("score").textContent = score;

    setTimeout(() => {

        if (lives <= 0) {

            endGame(
                false,
                "Suas vidas acabaram. Tente novamente!"
            );

            return;

        }

        itemIndex++;

        showItem();

    }, 850);

}


// TERMINAR FASE

function finishPhase() {

    clearInterval(timerId);

    if (phaseIndex < phases.length - 1) {

        $("result-medal").textContent = "🌳";

        $("result-kicker").textContent =
        `FASE ${phaseIndex + 1} CONCLUÍDA`;

        $("result-title").textContent =
        "Muito bem!";

        $("result-message").textContent =
        "Você concluiu esta fase. Prepare-se para o próximo desafio!";

        $("continue-button").textContent =
        "PRÓXIMA FASE";

        $("continue-button").classList.remove("hidden");

        $("ranking-button").classList.add("hidden");

        $("final-score").textContent = score;

        showScreen("result-screen");

    } else {

        endGame(
            true,
            "Você completou todas as fases e mostrou que sabe cuidar do planeta!"
        );

    }

}


// SALVAR PONTUAÇÃO

function saveScore() {

    const scores = JSON.parse(
        localStorage.getItem("desafioEcologicoRanking") || "[]"
    );

    scores.push({

        name: playerName,

        score: score,

        date: new Date().toLocaleDateString("pt-BR")

    });

    scores.sort((a, b) => b.score - a.score);

    localStorage.setItem(
        "desafioEcologicoRanking",
        JSON.stringify(scores.slice(0, 10))
    );

}


// FIM DE JOGO

function endGame(won, message) {

    clearInterval(timerId);

    if (won) {
        saveScore();
    }

    $("result-medal").textContent =
    won ? "🏅" : "🌱";

    $("result-kicker").textContent =
    won ? "MISSÃO CONCLUÍDA" : "FIM DE JOGO";

    $("result-title").textContent =
    won
    ? "Você é um Guardião do Planeta!"
    : "Não desista!";

    $("result-message").textContent = message;

    $("final-score").textContent = score;

    $("continue-button").classList.add("hidden");

    $("ranking-button").classList.toggle(
        "hidden",
        !won
    );

    $("home-button").classList.remove("hidden");

    showScreen("result-screen");

}


// MOSTRAR RANKING

function showRanking() {

    clearInterval(timerId);

    const scores = JSON.parse(
        localStorage.getItem("desafioEcologicoRanking") || "[]"
    );

    const list = $("ranking-list");

    list.innerHTML = "";

    $("empty-ranking").classList.toggle(
        "hidden",
        scores.length > 0
    );

    scores.forEach((entry, index) => {

        const li = document.createElement("li");

        li.textContent =
        `${index + 1}º ${entry.name} `;

        const span = document.createElement("span");

        span.textContent =
        `${entry.score} pts`;

        li.appendChild(span);

        list.appendChild(li);

    });

    showScreen("ranking-screen");

}


// VOLTAR AO INÍCIO

function goHome() {

    clearInterval(timerId);

    $("ranking-button").classList.remove("hidden");

    $("home-button").classList.remove("hidden");

    $("continue-button").classList.remove("hidden");

    showScreen("home-screen");

}


// BOTÕES

$("start-button").addEventListener(
    "click",
    startGame
);

$("show-ranking-home").addEventListener(
    "click",
    showRanking
);

$("ranking-button").addEventListener(
    "click",
    showRanking
);

$("ranking-back").addEventListener(
    "click",
    goHome
);

$("home-button").addEventListener(
    "click",
    goHome
);

$("quit-button").addEventListener(
    "click",
    goHome
);

$("continue-button").addEventListener(
    "click",
    () => {

        phaseIndex++;

        startPhase();

    }
);


// CLICAR NAS LIXEIRAS

$("bins-grid").addEventListener(
    "click",
    (event) => {

        const button =
        event.target.closest("button[data-bin]");

        if (button) {

            chooseBin(button.dataset.bin);

        }

    }
);


// LIMPAR RANKING

$("clear-ranking").addEventListener(
    "click",
    () => {

        if (
            confirm(
                "Deseja apagar o ranking deste aparelho?"
            )
        ) {

            localStorage.removeItem(
                "desafioEcologicoRanking"
            );

            showRanking();

        }

    }
);