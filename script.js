let currentSong = new Audio();
let songs = [];
let currfolder = "";  // No default folder

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

async function getSongs(folder) {
    currfolder = folder;
    try {
        let response = await fetch(`http://127.0.0.1:3000/${folder}/`);
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

const playMusic = (track, pause = false) => {
    currentSong.src = `http://127.0.0.1:3000/${currfolder}/` + track;
    if (!pause) {
        currentSong.play();
        document.getElementById("play").src = "icons/pause.svg";
    } else {
        document.getElementById("play").src = "icons/play.svg";
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".time").innerHTML = "00:00 / 00:00";
}

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

function main() {
    document.getElementById("play").addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            document.getElementById("play").src = "icons/pause.svg";
        } else {
            currentSong.pause();
            document.getElementById("play").src = "icons/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".time").innerHTML = `${sectomin(currentSong.currentTime)}/${sectomin(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", e => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", e => {
        document.querySelector(".left").style.left = "-120%";
    });

    document.getElementById("previous").addEventListener("click", e => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    document.getElementById("next").addEventListener("click", e => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    // Add event listener for card clicks to load songs
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async () => {
            let folder = card.dataset.folder;
            await loadSongs(folder);
        });
    });

    // Add event listener to handle song end
    currentSong.addEventListener("ended", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        } else {
            // No more songs to play
            document.getElementById("play").src = "icons/play.svg";
        }
    });

    // Add event listener to handle song upload
    document.getElementById("addSongsBtn").addEventListener("click", () => {
        document.getElementById("fileInput").click();
    });

    document.getElementById("fileInput").addEventListener("change", async (event) => {
        let files = event.target.files;
        for (let file of files) {
            await uploadSong(file);
        }
        // Reload songs after uploading new ones
        loadSongs(currfolder);
    });

    document.getElementById("home").addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

}

async function uploadSong(file) {
    let formData = new FormData();
    formData.append("file", file);

    try {
        let response = await fetch(`http://127.0.0.1:3000/upload/${currfolder}/`, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Failed to upload ${file.name}`);
        }
        console.log(`${file.name} uploaded successfully`);
    } catch (error) {
        console.error("Error uploading song:", error);
    }
}

// Initialize the main function on page load
document.addEventListener("DOMContentLoaded", main);
