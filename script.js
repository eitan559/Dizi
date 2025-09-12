const colorsByLevel = [
    ['אדום', 'כחול', 'ירוק', 'צהוב'], // שלב 1
    ['אדום', 'כחול', 'ירוק', 'צהוב', 'שחור', 'לבן'], // שלב 2
    ['אדום', 'כחול', 'ירוק', 'צהוב', 'שחור', 'לבן', 'סגול', 'כתום'] // שלב 3
];
const colorFiles = {
    'אדום': 'red.mp3',
    'כחול': 'blue.mp3',
    'ירוק': 'green.mp3',
    'צהוב': 'yellow.mp3',
    'שחור': 'black.mp3',
    'לבן': 'white.mp3',
    'סגול': 'purple.mp3',
    'כתום': 'orange.mp3'
};
const colorStyles = {
    'אדום': '#ff4d4d',
    'כחול': '#4d4dff',
    'ירוק': '#4dff4d',
    'צהוב': '#ffff4d',
    'שחור': '#000000',
    'לבן': '#ffffff',
    'סגול': '#800080',
    'כתום': '#ffa500'
};
const colorAudio = document.getElementById('color-audio');
const feedbackAudio = document.getElementById('feedback-audio');
const feedback = document.getElementById('feedback');
const speechBubble = document.getElementById('speech-bubble');
const scoreValue = document.getElementById('score-value');
const mistakes = document.getElementById('mistakes');
const level = document.getElementById('current-level');
const timeLeft = document.getElementById('time-left');
const gameOverScreen = document.getElementById('game-over');
const gameOverText = document.getElementById('game-over-text');
const restartButton = document.getElementById('restart-button');
const nextLevelButton = document.getElementById('next-level-button');
const loginScreen = document.getElementById('login-screen');
const gameContainer = document.getElementById('game-container');
const usernameInput = document.getElementById('username');
const startGameButton = document.getElementById('start-game');
const usernameDisplay = document.getElementById('username-display');
const confettiCanvas = document.getElementById('confetti-canvas');
let correctColor, score = 0, mistakeCount = 0, currentLevel = 0, timeLimit = 8000;
let gameActive = false, timerInterval, username = '', buttons = [];

startGameButton.addEventListener('click', () => {
    username = usernameInput.value.trim() || 'שחקן אנונימי';
    if (username) {
        usernameDisplay.textContent = username;
        loginScreen.style.display = 'none';
        gameContainer.style.display = 'flex';
        gameContainer.style.opacity = '1';
        startNextLevel();
    }
});

function startNextLevel() {
    if (currentLevel >= colorsByLevel.length) {
        gameOverScreen.style.display = 'flex';
        gameOverText.textContent = `${username}, סיימת את כל השלבים! כל הכבוד!`;
        confetti({
            particleCount: 200,
            spread: 70,
            origin: { y: 0.6 }
        });
        return;
    }
    currentLevel++;
    score = 0;
    mistakeCount = 0;
    timeLimit = 8000 - (currentLevel - 1) * 1500; // זמן קצר יותר בכל שלב
    scoreValue.textContent = score;
    mistakes.textContent = mistakeCount;
    level.textContent = `${currentLevel} / ${colorsByLevel.length}`;
    updateColorButtons();
    gameActive = true;
    startNewRound();
}

function updateColorButtons() {
    const currentColors = colorsByLevel[currentLevel - 1];
    const topRow = document.getElementById('top-row');
    const bottomRow = document.getElementById('bottom-row');
    topRow.innerHTML = '';
    bottomRow.innerHTML = '';
    buttons = []; // איפוס מערך הכפתורים

    currentColors.forEach((color, index) => {
        const button = document.createElement('button');
        button.className = 'color-button';
        button.setAttribute('data-color', color);
        button.style.backgroundColor = colorStyles[color];
        if (index < Math.ceil(currentColors.length / 2)) {
            topRow.appendChild(button);
        } else {
            bottomRow.appendChild(button);
        }
        buttons.push(button); // הוספת הכפתור למערך
    });

    // הוספת אירועים לכפתורים החדשים
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            if (!gameActive) return;
            const selectedColor = button.getAttribute('data-color');
            if (selectedColor === correctColor) {
                score++;
                scoreValue.textContent = score;
                feedback.textContent = 'נכון! כל הכבוד!';
                speechBubble.style.display = 'none';
                clearInterval(timerInterval);
                feedbackAudio.src = 'correct.mp3';
                feedbackAudio.play().catch(() => {});
                if (score < 5) {
                    setTimeout(startNewRound, 1000);
                } else {
                    checkGameOver();
                }
            } else {
                mistakeCount++;
                mistakes.textContent = mistakeCount;
                feedback.textContent = 'טעות! נסה שוב.';
                feedbackAudio.src = 'wrong.mp3';
                feedbackAudio.play().catch(() => {});
                checkGameOver();
            }
        });
    });
}

function startNewRound() {
    if (!gameActive) return;
    const currentColors = colorsByLevel[currentLevel - 1];
    correctColor = currentColors[Math.floor(Math.random() * currentColors.length)];
    colorAudio.src = colorFiles[correctColor];
    colorAudio.play();
    speechBubble.textContent = `${username}, בחר ${correctColor}!`;
    speechBubble.style.display = 'block';
    feedback.textContent = '';
    let timeRemaining = timeLimit / 1000;
    timeLeft.textContent = timeRemaining;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeRemaining--;
        timeLeft.textContent = timeRemaining;
        if (timeRemaining <= 0 && gameActive) {
            clearInterval(timerInterval);
            mistakeCount++;
            mistakes.textContent = mistakeCount;
            feedback.textContent = 'הזמן נגמר! נסה שוב.';
            feedbackAudio.src = 'wrong.mp3';
            feedbackAudio.play().catch(() => {});
            checkGameOver();
        }
    }, 1000);
}

function checkGameOver() {
    if (score >= 5) {
        gameActive = false;
        clearInterval(timerInterval);
        gameOverScreen.style.display = 'flex';
        gameOverText.textContent = `${username}, עברת את השלב ${currentLevel}! כל הכבוד!`;
        feedbackAudio.src = 'correct.mp3';
        feedbackAudio.play().catch(() => {});
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
        if (currentLevel < colorsByLevel.length) {
            nextLevelButton.style.display = 'block';
            restartButton.style.display = 'none';
        } else {
            nextLevelButton.style.display = 'none';
        }
    } else if (mistakeCount >= 3) {
        gameActive = false;
        clearInterval(timerInterval);
        gameOverScreen.style.display = 'flex';
        gameOverText.textContent = `${username}, הפסדת בשלב ${currentLevel}! נסה שוב!`;
        feedbackAudio.src = 'wrong.mp3';
        feedbackAudio.play().catch(() => {});
        nextLevelButton.style.display = 'none';
    }
}

nextLevelButton.addEventListener('click', () => {
    gameOverScreen.style.display = 'none';
    startNextLevel();
});

restartButton.addEventListener('click', () => {
    score = 0;
    mistakeCount = 0;
    currentLevel = 0;
    scoreValue.textContent = score;
    mistakes.textContent = mistakeCount;
    level.textContent = currentLevel;
    gameOverScreen.style.display = 'none';
    gameContainer.style.display = 'none';
    loginScreen.style.display = 'flex';
    usernameInput.value = '';
    gameActive = false;
});