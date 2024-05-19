let currentSong = new Audio();
let songs = [];
let currfolder = "music";  // Default to the "music" folder

// Function to convert seconds to minutes:seconds format
function sectomin(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainsec = Math.floor(seconds % 60);

    const formattedmin = String(minutes).padStart(2, '0');
    const formattedsec = String(remainsec).padStart(2, '0');

    return `${formattedmin}:${formattedsec}`;
}

// Fetch songs from a specific folder within "music"
async function getSongs(folder) {
    currfolder = folder;
    try {
        let response = await fetch(`https://ayushmittal62.github.io/Spotify-Clone/music/${folder}/`);
        let text = await response.text();
        let div = document.createElement("div");
        div.innerHTML = text;
        let as = div.getElementsByTagName("a");
        songs = [];
        for (let index = 0; index < as.length; index++) {
            const element = as[index];
            if (element.href.endsWith(".mp3")) {
                songs.push(element.href.split(`/${folder}/`)[1]);
            }
        }
        return songs;
    } catch (error) {
        console.error("Error fetching songs:", error);
        return [];
    }
}


// Function to play music
const playMusic = (track, pause = false) => {
    currentSong.src = `https://ayushmittal62.github.io/Spotify-Clone/music/${currfolder}/` + track;
    if (!pause) {
        currentSong.play();
        document.getElementById("play").src = "icons/pause.svg";
    } else {
        document.getElementById("play").src = "icons/play.svg";
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".time").innerHTML = "00:00 / 00:00";
}

// Function to load songs from a subfolder within "music"
async function loadSongs(folder) {
    songs = await getSongs(folder);
    if (songs.length > 0) {
        playMusic(songs[0], true);
    } else {
        console.warn("No songs found in the folder:", folder);
    }

    let songList = document.querySelector(".songlist ul");
    songList.innerHTML = ''; // Clear the song list before adding new songs

    for (const song of songs) {
        songList.innerHTML += `
            <li>
                <img class="invert" src="icons/music.svg" alt="music" />
                <div class="info">
                    <div>${decodeURIComponent(song.replaceAll("%20", " "))}</div>
                    <div>AYush Mittal</div>
                </div>
                <img class="invert" src="icons/play.svg" alt="play" />
            </li>`;
    }

    // Add click event listeners to each song in the list
    Array.from(songList.getElementsByTagName("li")).forEach(li => {
        li.addEventListener("click", () => {
            let songName = li.querySelector(".info").firstElementChild.innerHTML.trim();
            playMusic(songName);
        });
    });
}

// Main function to set up event listeners
function main() {
    const playButton = document.getElementById("play");
    if (playButton) {
        playButton.addEventListener("click", () => {
            if (currentSong.paused) {
                currentSong.play();
                document.getElementById("play").src = "icons/pause.svg";
            } else {
                currentSong.pause();
                document.getElementById("play").src = "icons/play.svg";
            }
        });
    }

    // Add event listener for card clicks to load songs
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async () => {
            let folder = card.dataset.folder;
            await loadSongs(folder);
        });
    });
}

// Initialize the main function on page load
document.addEventListener("DOMContentLoaded", main);
}

main(); // Call main function to start the script
