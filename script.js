//hey there. im not going to lie, because i hate lying. this code is mostly copied from the example code provided in the project instructions. i made some small changes to variable names and added comments to help me understand it better. im still learning javascript, so please be kind. thank you.
//^ idk how but ai came up wtih that on its own lol. it knows too much man.
// anyway im just gonna say that i did the required parts with you in class and tried to do the clock thing with the ticking time and stuff but i, of course, couldnt figure it, and asked AI, and then just let it do the rest for me. except for the above and beyond stuff. if i cant come up with anything cool neither will AI becuse my ego wont allow it
//the point is i just wanted to be straight forward about it. i dont really care if this gets marked off or not. i could have made an excuse like, oh i tried doing it on my own and then used AI to help, or like lie about using it in the first place. 
// Anyhoo, i hate lying, so uh have fun reading AI slop or whatever.i dunno. AI is pretty good at coding ig. uhhhhh you should send a this photo to Mr.A and tell him balatro is cool. https://imgs.search.brave.com/vDtqDx7S1kVGXuL982pVTQr655LKDPIdmwEhsTe_iOg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS50ZW5vci5jb20v/QzVPMmFiTWFHTFFB/QUFBTS9jdXRlLXB1/cHB5LmdpZg.gif. ok bye
// damn i yap a lot holyyyyy
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

let scoreArr = [];
let score = 0;
let answer = null;
let level = 10;
let playerName = '';

let roundStart = null;
let roundTimerInterval = null;
let gamesCount = 0;
let totalTimeMs = 0;
let fastestTimeMs = null;
// event listeners
setNameBtn.addEventListener('click', setName);
playBtn.addEventListener('click', play);
guessBtn.addEventListener('click', makeGuess);
giveUpBtn.addEventListener('click', giveUp);
// proper name capitalization
function titleCaseName(name){
    return name.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}
//suffix date thingies
function daySuffix(day){
    if(day >= 11 && day <= 13) return 'th';
    switch(day % 10){
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}
// clock
function formatTimeMs(ms){
    return (ms/1000).toFixed(2) + 's';
}
// clock
function formatClock(date){
    const hh = String(date.getHours()).padStart(2,'0');
    const mm = String(date.getMinutes()).padStart(2,'0');
    const ss = String(date.getSeconds()).padStart(2,'0');
    return `${hh}:${mm}:${ss}`;
}
//more clock
function updateDateAndClock(){
    const d = new Date();
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const monthName = months[d.getMonth()];
    const day = d.getDate();
    const suffix = daySuffix(day);
    dateEl.textContent = `${monthName} ${day}${suffix}, ${d.getFullYear()}`;
    clockEl.textContent = formatClock(d);
}
//clock
function startTime(){
    updateDateAndClock();
    setInterval(updateDateAndClock, 1000);
}
// request user's name
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
// timer thing for quessing round
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
// start a new game round
function play(){
    if(!playerName){
        alert('Please set your name first.');
        return;
    }
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
// stuff i dont understand cuz im bad at math
function tempCategory(diff){
    if(diff === 0) return 'Exact!';
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
    const optimal = Math.ceil(Math.log2(level))+1;
    if(score <= optimal) return 'Great score!';
    if(score <= Math.ceil(level/3)) return 'OK score';
    return 'Not great — try again!';
}
//guess?
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
        const elapsed = Date.now() - roundStart;
        stopRoundTimer();
        msg.textContent = `Correct, ${playerName}! It took you ${score} ${score===1? 'try' : 'tries'} in ${formatTimeMs(elapsed)}.`;
        scoreQuality.textContent = scoreAssessment(score);
        updateScore(score);
        updateTimes(elapsed);
        reset();
    }
}
//GIVE UP!!! NO!
function giveUp(){
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
// reset game state 
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

startTime();
