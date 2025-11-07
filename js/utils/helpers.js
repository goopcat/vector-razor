// Utility Functions

function distBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function loadHighScores() {
    const scoresJson = localStorage.getItem(HS_KEY);
    let scores = scoresJson ? JSON.parse(scoresJson) : [];
    scores.sort((a, b) => b.score - a.score);
    return scores;
}

function saveHighScore(newScore) {
    let scores = loadHighScores();

    const sortedScoresCheck = [...scores].sort((a, b) => b.score - a.score);
    const isNewHighScore = sortedScoresCheck.length < 5 || newScore > (sortedScoresCheck[4]?.score || 0);

    const newEntry = { score: newScore, date: new Date().toISOString() };

    scores.push(newEntry);
    scores.sort((a, b) => b.score - a.score);

    const displayScores = scores.slice(0, 5);

    const saveableScores = displayScores.map(s => ({
        score: s.score,
        date: s.date,
    }));
    localStorage.setItem(HS_KEY, JSON.stringify(saveableScores));

    maxScore = displayScores[0]?.score || 0;

    if (isNewHighScore) {
        const actualNewEntry = displayScores.find(s => s.score === newScore && s.date === newEntry.date);
        if (actualNewEntry) {
            actualNewEntry.isNew = true;
        }
    }

    return displayScores;
}

function drawPolygon(x, y, radius, sides, color) {
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
        const angle = (i * Math.PI * 2) / sides;
        const px = x + radius * Math.cos(angle);
        const py = y + radius * Math.sin(angle);
        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }
    ctx.closePath();
    ctx.fill();
}