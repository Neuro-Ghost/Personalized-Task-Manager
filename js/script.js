// Task Manager Logic
import { db, auth } from './firebase.js'; // Import Firebase Firestore and Auth
import { setDoc, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('monday-btn').classList.add("selected-button");
    showTasks('monday'); // Show Monday's task list by default
    loadTasksFromFirebase(); // Load tasks from Firebase on page load

    // Attach event listeners to the "Add Task" buttons
    document.querySelectorAll('.add-task-btn').forEach(button => {
        button.addEventListener('click', function() {
            const day = this.getAttribute('data-day');
            addTask(day);
        });
    });

    // Add event listeners to the "Clear Tasks" buttons
    document.querySelectorAll('.clear-tasks-btn').forEach(button => {
        button.addEventListener('click', function() {
            const day = this.getAttribute('data-day');
            clearTasks(day);
        });
    });

    // Highlight selected day tasks
    document.querySelectorAll(".tab-button").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".tab-button").forEach(btn => {
                btn.classList.remove("selected-button");
            });
            button.classList.add("selected-button");
            const day = button.getAttribute("data-day");
            showTasks(day);
        });
    });
});

// ----------------- Task Functions -----------------
function createTaskElement(taskValue) {
    const li = document.createElement('li');
    li.classList.add('task-item'); // Add a class for styling
    li.textContent = taskValue;

    li.addEventListener('mouseenter', () => {
        li.setAttribute('title', 'Double-click to delete');
        li.style.cursor = 'pointer';
        li.style.transform = 'scale(1.05)';
        li.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    });

    li.addEventListener('mouseleave', () => {
        li.removeAttribute('title');
        li.style.transform = 'scale(1)';
        li.style.boxShadow = 'none';
    });

    li.addEventListener('dblclick', () => {
        li.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        li.style.transform = 'scale(0.5)';
        li.style.opacity = '0';
        setTimeout(() => {
            li.remove();
            saveTasksToFirebase();
        }, 300);
    });

    return li;
}

function addTask(day) {
    const taskInput = document.getElementById(`${day}-task-input`);
    const taskList = document.getElementById(`${day}-task-list`);
    const taskValue = taskInput.value.trim();

    if (taskValue !== "") {
        const li = createTaskElement(taskValue);
        taskList.appendChild(li);
        saveTasksToFirebase();
        taskInput.value = "";
    }
}

function showTasks(day) {
    document.querySelectorAll('.task-list').forEach(taskList => taskList.style.display = 'none');
    document.getElementById(`${day}-tasks`).style.display = 'block';
}

async function saveTasksToFirebase() {
    const allTasks = {};
    document.querySelectorAll('.task-list').forEach(list => {
        const day = list.id.split('-')[0];
        allTasks[day] = Array.from(list.querySelectorAll('li')).map(item => item.textContent);
    });

    try {
        await setDoc(doc(db, "tasks", "dailyTasks"), allTasks);
        console.log("Tasks saved to Firebase");
    } catch (error) {
        console.error("Error saving tasks to Firebase: ", error);
    }
}

async function loadTasksFromFirebase() {
    try {
        const docRef = doc(db, "tasks", "dailyTasks");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const savedTasks = docSnap.data();
            console.log("Tasks loaded from Firebase:", savedTasks);

            for (const day in savedTasks) {
                const taskList = document.getElementById(`${day}-task-list`);
                if (taskList) {
                    taskList.innerHTML = '';
                    savedTasks[day].forEach(task => {
                        const li = createTaskElement(task);
                        taskList.appendChild(li);
                    });
                }
            }
        } else {
            console.log("No tasks document found in Firebase.");
        }
    } catch (error) {
        console.error("Error loading tasks from Firebase: ", error);
    }
}

function clearTasks(day) {
    const taskList = document.getElementById(`${day}-task-list`);
    if (taskList) {
        taskList.innerHTML = '';
        saveTasksToFirebase();
    }
}

// ----------------- Music Player Logic -----------------
document.addEventListener("DOMContentLoaded", function () {
    const loopBtn = document.getElementById("loop-btn");
    const audio = document.getElementById('audio');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const nextBtn = document.getElementById('next-btn');
    const backBtn = document.getElementById('back-btn');
    const progressBar = document.getElementById('progress-bar');
    const timeDisplay = document.getElementById('time-display');
    const currentSongDisplay = document.getElementById('current-song');
    const progressContainer = document.getElementById("progress-container");
    const musicPlayer = document.getElementById("music-player");
    const songSelector = document.getElementById("song-selector");

    const playlist = [
        { name: "enta zaalan menni", path: "assets/enta zaalan menni.mp3" },
        { name: "dream", path: "assets/dream.mp3" },
        { name: "everything, everywhere", path: "assets/everything, everywhere.mp3" },
        { name: "by my side", path: "assets/by my side.mp3" },
        { name: "tout sen va", path: "assets/tout.mp3" },
        { name: "Malik al mawt", path: "assets/malik.mp3" },
        { name: "Jalil", path: "assets/Soft Spot (Acoustic).mp3" },
        { name: "blue salvia", path: "assets/pryvt blue salvia lyrics YouTube.mp3" },
        { name: "Inazuma Sorrow", path: "assets/Inazuma Sorrow.mp3" },
        { name: "Soft Spot", path: "assets/Soft Spot (Acoustic).mp3" },
        { name: "Devil's Daughter", path: "assets/noname.mp3" },
        { name: "Cupid TwinVer", path: "assets/Cupid' (TwinVer.).mp3" },
        { name: "baby blue", path: "assets/rocco - baby blue (lyrics).mp3" },
        { name: "10'", path: "assets/Laylow 10 Lyrics YouTube.mp3" },
    ];

    let currentTrackIndex = 0;
    let isLooping = false;

    if (audio) audio.src = playlist[currentTrackIndex].path;
    if (currentSongDisplay) currentSongDisplay.textContent = playlist[currentTrackIndex].name;

    function playTrack() {
        if (!audio) return;
        audio.src = playlist[currentTrackIndex].path;
        audio.play();
        if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        if (currentSongDisplay) currentSongDisplay.textContent = playlist[currentTrackIndex].name;
        if (musicPlayer) musicPlayer.classList.add("playing");
    }

    function updateProgressBar() {
        if (!audio || !progressBar || !timeDisplay) return;
        const progress = (audio.currentTime / audio.duration) * 100 || 0;
        progressBar.style.width = progress + '%';

        const currentMinutes = Math.floor(audio.currentTime / 60);
        const currentSeconds = Math.floor(audio.currentTime % 60).toString().padStart(2, '0');
        const durationMinutes = isNaN(audio.duration) ? 0 : Math.floor(audio.duration / 60);
        const durationSeconds = isNaN(audio.duration) ? '00' : Math.floor(audio.duration % 60).toString().padStart(2, '0');
        timeDisplay.textContent = `${currentMinutes}:${currentSeconds} / ${durationMinutes}:${durationSeconds}`;
    }

    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            if (!audio) return;
            if (audio.paused) {
                audio.play();
                playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                if (musicPlayer) musicPlayer.classList.add("playing");
            } else {
                audio.pause();
                playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                if (musicPlayer) musicPlayer.classList.remove("playing");
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (playlist.length > 0) {
                currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
                playTrack();
            }
        });
    }

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (playlist.length > 0) {
                currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
                playTrack();
            }
        });
    }

    if (loopBtn) {
        loopBtn.addEventListener('click', () => {
            isLooping = !isLooping;
            if (audio) audio.loop = isLooping;
            loopBtn.classList.toggle('active', isLooping);
            loopBtn.style.color = isLooping ? '#FFF' : '';
            loopBtn.style.textShadow = isLooping ? '0 0 5px #d9c5b2, 0 0 15px #d9c5b2' : '';
        });
    }

    if (audio) {
        audio.addEventListener('timeupdate', updateProgressBar);
        audio.addEventListener('ended', () => {
            if (!isLooping && nextBtn) nextBtn.click();
            else playTrack();
        });
    }

    if (progressContainer && audio) {
        progressContainer.addEventListener('click', (e) => {
            const clickPosition = (e.offsetX / progressContainer.getBoundingClientRect().width) * audio.duration;
            audio.currentTime = clickPosition;
        });
    }

    function populateSongSelector() {
        if (!songSelector) return;
        songSelector.innerHTML = '<option value="">Select a song</option>';
        playlist.forEach((track, index) => {
            const option = document.createElement("option");
            option.value = index;
            option.textContent = track.name;
            songSelector.appendChild(option);
        });
    }

    if (songSelector) {
        songSelector.addEventListener("change", (e) => {
            const selectedIndex = e.target.value;
            if (selectedIndex !== "") {
                currentTrackIndex = parseInt(selectedIndex, 10);
                playTrack();
            }
        });
    }

    populateSongSelector();
});

// ----------------- Motivational Typing -----------------
const messages = ["I will be always be grateful that our lives crossed, meeting you was an unforgettable chapet in my life. A part of you will forever be with me..."];
let messageIndex = 0;
const typingText = document.getElementById("typing-text");

function typeMessage(message, callback) {
    let i = 0;
    if (!typingText) return;
    typingText.textContent = "";
    typingText.classList.add("visible");

    const typingInterval = setInterval(() => {
        if (i < message.length) {
            typingText.textContent += message.charAt(i);
            i++;
        } else {
            clearInterval(typingInterval);
            setTimeout(() => {
                typingText.classList.remove("visible");
                setTimeout(() => deleteMessage(callback), 500);
            }, 5000);
        }
    }, 100);
}

function deleteMessage(callback) {
    if (typingText) typingText.classList.remove("visible");
    setTimeout(callback, 500);
}

function startTypingAnimation() {
    typeMessage(messages[messageIndex], () => {
        messageIndex = (messageIndex + 1) % messages.length;
        startTypingAnimation();
    });
}

startTypingAnimation();

// ----------------- Loading Overlay -----------------
window.onload = () => {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.style.display = 'none';
    sessionStorage.removeItem('showLoading');
};

// ----------------- BG Audio Toggle -----------------
document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'bgSoundOn';
    const muteBtn = document.getElementById('mute-btn');
    const bgAudio = document.getElementById('bg-audio');
    if (!muteBtn || !bgAudio) return;

    bgAudio.volume = 0.25;

    const setBtnUI = (on) => {
        muteBtn.classList.toggle('on', on);
        muteBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
        muteBtn.innerHTML = on ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
    };

    const wasOn = localStorage.getItem(STORAGE_KEY) === 'true';
    setBtnUI(wasOn);

    if (wasOn) bgAudio.play().catch(() => {});

    muteBtn.addEventListener('click', async () => {
        try {
            if (bgAudio.paused) {
                await bgAudio.play();
                setBtnUI(true);
                localStorage.setItem(STORAGE_KEY, 'true');
            } else {
                bgAudio.pause();
                setBtnUI(false);
                localStorage.setItem(STORAGE_KEY, 'false');
            }
        } catch (err) {
            console.warn('bg-audio toggle failed:', err);
            const newState = !(bgAudio && !bgAudio.paused);
            setBtnUI(newState);
            localStorage.setItem(STORAGE_KEY, newState ? 'true' : 'false');
        }
    });
});
