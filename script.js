// ---- DOM references ----
const dateEl = document.getElementById('date');
const clockEl = document.getElementById('clock');
const playBtn = document.getElementById('playBtn');
const guessBtn = document.getElementById('guessBtn');
const giveUpBtn = document.getElementById('giveUpBtn');
const msg = document.getElementById('msg');
const guess = document.getElementById('guess');
const wins = document.getElementById('wins');
const avgScore = document.getElementById('avgScore');
const tempFeedback = document.getElementById('tempFeedback');
const scoreQuality = document.getElementById('scoreQuality');
const roundTimerEl = document.getElementById('roundTimer');
const fastestTimeEl = document.getElementById('fastestTime');
const totalTimeEl = document.getElementById('totalTime');
const avgTimeEl = document.getElementById('avgTime');
const setNameBtn = document.getElementById('setNameBtn');
const playerNameInput = document.getElementById('playerName');
const greeting = document.getElementById('greeting');

const levelArr = document.getElementsByName('level');
const leaderboardEls = document.getElementsByName('leaderboard');

// ---- game state ----
let scoreArr = [];
let score = 0;
let answer = null;
let level = 10;
let playerName = '';

// timers & stats
let roundStart = null;
let roundTimerInterval = null;
let gamesCount = 0;
let totalTimeMs = 0; // ms across all games
let fastestTimeMs = null;

// event listeners
setNameBtn.addEventListener('click', setName);
playBtn.addEventListener('click', play);
guessBtn.addEventListener('click', makeGuess);
giveUpBtn.addEventListener('click', giveUp);

// ---- utilities ----
function titleCaseName(name){
    // Trim, collapse spaces, title case each word
    return name.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

function daySuffix(day){
    if(day >= 11 && day <= 13) return 'th';
    switch(day % 10){
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}

function formatTimeMs(ms){
    // return seconds with two decimals
    return (ms/1000).toFixed(2) + 's';
}

function formatClock(date){
    const hh = String(date.getHours()).padStart(2,'0');
    const mm = String(date.getMinutes()).padStart(2,'0');
    const ss = String(date.getSeconds()).padStart(2,'0');
    return `${hh}:${mm}:${ss}`;
}

function updateDateAndClock(){
    const d = new Date();
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const monthName = months[d.getMonth()];
    const day = d.getDate();
    const suffix = daySuffix(day);
    dateEl.textContent = `${monthName} ${day}${suffix}, ${d.getFullYear()}`;
    clockEl.textContent = formatClock(d);
}

function startTime(){
    updateDateAndClock();
    setInterval(updateDateAndClock, 1000);
}

// ---- game functions ----
function setName(){
    const raw = playerNameInput.value || '';
    const cleaned = raw.trim();
    if(!cleaned){
        alert('Please enter a name to play.');
        return;
    }
    playerName = titleCaseName(cleaned);
    greeting.textContent = `Hello, ${playerName}!`; 
    setNameBtn.disabled = true;
    playerNameInput.disabled = true;
    playBtn.disabled = false;
    msg.textContent = `${playerName}, select a level and press Play`;
}

function startRoundTimer(){
    roundStart = Date.now();
    if(roundTimerInterval) clearInterval(roundTimerInterval);
    roundTimerInterval = setInterval(()=>{
        const elapsed = Date.now() - roundStart;
        roundTimerEl.textContent = 'Round: ' + formatTimeMs(elapsed);
    }, 100);
}

function stopRoundTimer(){
    if(roundTimerInterval) clearInterval(roundTimerInterval);
    roundTimerInterval = null;
}

function play(){
    if(!playerName){
        alert('Please set your name first.');
        return;
    }
    // lock controls
    playBtn.disabled = true;
    guessBtn.disabled = false;
    guess.disabled = false;
    giveUpBtn.disabled = false;
    for(let i=0;i<levelArr.length;i++){
        levelArr[i].disabled = true;
        if(levelArr[i].checked) level = parseInt(levelArr[i].value,10);
    }
    answer = Math.floor(Math.random()*level) + 1;
    score = 0;
    msg.textContent = `${playerName}, guess a number between 1 and ${level}`;
    guess.value = '';
    tempFeedback.textContent = '';
    scoreQuality.textContent = '';
    startRoundTimer();
}

function tempCategory(diff){
    if(diff === 0) return 'Exact!';
    // thresholds relative to level
    const small = Math.max(1, Math.round(level * 0.03));
    const hot = Math.max(1, Math.round(level * 0.05));
    const warm = Math.max(1, Math.round(level * 0.1));
    const cool = Math.max(1, Math.round(level * 0.25));
    if(diff <= small) return 'Scorching hot!';
    if(diff <= hot) return 'Very hot';
    if(diff <= warm) return 'Warm';
    if(diff <= cool) return 'Cool';
    return 'Cold';
}

function scoreAssessment(score){
    // lower is better. Use logarithmic expectation as rough target
    const optimal = Math.ceil(Math.log2(level))+1; // rough expected guesses
    if(score <= optimal) return 'Great score!';
    if(score <= Math.ceil(level/3)) return 'OK score';
    return 'Not great — try again!';
}

function makeGuess(){
    const userGuess = parseInt(guess.value,10);
    if(isNaN(userGuess) || userGuess < 1 || userGuess > level){
        msg.textContent = `${playerName}, invalid guess — enter a number between 1 and ${level}`;
        return;
    }
    score++;
    const diff = Math.abs(userGuess - answer);
    const tempMsg = tempCategory(diff);
    tempFeedback.textContent = `Temperature: ${tempMsg}`;
    if(userGuess < answer){
        msg.textContent = `${playerName}, too low...`;
    } else if(userGuess > answer){
        msg.textContent = `${playerName}, too high...`;
    } else {
        // correct
        const elapsed = Date.now() - roundStart;
        stopRoundTimer();
        msg.textContent = `Correct, ${playerName}! It took you ${score} ${score===1? 'try' : 'tries'} in ${formatTimeMs(elapsed)}.`;
        scoreQuality.textContent = scoreAssessment(score);
        updateScore(score);
        updateTimes(elapsed);
        reset();
    }
}

function giveUp(){
    // set score to range (level) as requested
    score = level;
    stopRoundTimer();
    const elapsed = Date.now() - roundStart;
    msg.textContent = `${playerName}, you gave up. The correct number was ${answer}. Your score has been set to ${score}.`;
    tempFeedback.textContent = '';
    scoreQuality.textContent = 'Gave up';
    updateScore(score);
    updateTimes(elapsed);
    reset();
}

function reset(){
    playBtn.disabled = false;
    guessBtn.disabled = true;
    guess.disabled = true;
    giveUpBtn.disabled = true;
    guess.value = '';
    answer = null;
    for(let i=0;i<levelArr.length;i++){
        levelArr[i].disabled = false;
    }
    roundTimerEl.textContent = 'Round: 0.00s';
}

function updateScore(finalScore){
    // record the final score for leaderboard/stats
    scoreArr.push(finalScore);
    scoreArr.sort((a,b)=>a-b);
    wins.textContent = 'Total wins: ' + scoreArr.length;
    let sum = 0;
    for(let i=0;i<scoreArr.length;i++){
        sum += scoreArr[i];
        if(i < leaderboardEls.length){
            leaderboardEls[i].textContent = scoreArr[i];
        }
    }
    const avg = sum / scoreArr.length;
    avgScore.textContent = 'Average Guesses: ' + avg.toFixed(2);
}

function updateTimes(elapsedMs){
    gamesCount += 1;
    totalTimeMs += elapsedMs;
    if(fastestTimeMs === null || elapsedMs < fastestTimeMs) fastestTimeMs = elapsedMs;
    fastestTimeEl.textContent = 'Fastest: ' + (fastestTimeMs ? formatTimeMs(fastestTimeMs) : '-');
    totalTimeEl.textContent = 'Total time (all games): ' + formatTimeMs(totalTimeMs);
    avgTimeEl.textContent = 'Average time/game: ' + formatTimeMs(totalTimeMs / gamesCount);
}

// initialize display
startTime();
