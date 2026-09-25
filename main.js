// Coro Kudyapi - Unified Minimalist Video Player (1-Click Play for YouTube & HTML5 Video)

// Helper: Extract 11-char YouTube ID from any format (short URL, full URL, embed URL, or raw ID)
function extractYouTubeId(urlOrId) {
    if (!urlOrId) return null;
    const trimmed = urlOrId.trim();
    const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/) || trimmed.match(/^([\w-]{11})$/);
    return match ? (match[1] || match[0]) : null;
}

// Global registry of player instances
const videoInstances = [];

// Helper: Pause all other active video instances when a new one starts
function pauseAllOtherVideos(activeBox) {
    videoInstances.forEach(instance => {
        if (instance.box !== activeBox) {
            if (instance.type === 'youtube' && instance.player && typeof instance.player.pauseVideo === 'function') {
                instance.player.pauseVideo();
            } else if (instance.type === 'html5' && instance.video && !instance.video.paused) {
                instance.video.pause();
            }
            instance.box.classList.remove('is-playing');
        }
    });
}

// YouTube API readiness management
let ytApiReady = false;
const ytReadyCallbacks = [];

window.onYouTubeIframeAPIReady = function () {
    ytApiReady = true;
    ytReadyCallbacks.forEach(cb => cb());
    ytReadyCallbacks.length = 0;
};

// Dynamically inject YouTube IFrame API script
(function loadYouTubeApi() {
    if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        if (firstScriptTag && firstScriptTag.parentNode) {
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        } else {
            document.head.appendChild(tag);
        }
    }
})();

// Initialize each video box
document.querySelectorAll('.video-box').forEach((box, index) => {
    const rawYt = box.dataset.youtubeId || box.dataset.youtubeUrl;
    const ytId = extractYouTubeId(rawYt);
    const video = box.querySelector('video.video-element');
    const playBtn = box.querySelector('.play-btn');

    if (ytId) {
        // --- YOUTUBE CONTAINER: PRELOADED BEHIND POSTER (SINGLE-CLICK PLAY) ---
        // Hide dummy video element and convert poster to an <img> if needed
        if (video) {
            video.classList.add('yt-hidden');
            const posterSrc = video.getAttribute('poster');
            if (posterSrc && !box.querySelector('.video-poster')) {
                const img = document.createElement('img');
                img.className = 'video-poster';
                img.src = posterSrc;
                img.alt = box.dataset.videoTitle || 'Video poster';
                box.insertBefore(img, box.querySelector('.video-overlay'));
            }
        }

        // Create mount container for YouTube IFrame
        const mountDiv = document.createElement('div');
        mountDiv.id = `yt-player-${index}-${Math.random().toString(36).substring(2, 7)}`;
        box.prepend(mountDiv);

        const instance = {
            box,
            type: 'youtube',
            player: null,
            isReady: false,
            pendingPlay: false
        };
        videoInstances.push(instance);

        const initPlayer = () => {
            instance.player = new YT.Player(mountDiv.id, {
                videoId: ytId,
                playerVars: {
                    autoplay: 0,
                    controls: 1,
                    rel: 0,
                    playsinline: 1,
                    modestbranding: 1
                },
                events: {
                    onReady: () => {
                        instance.isReady = true;
                        if (instance.pendingPlay) {
                            instance.pendingPlay = false;
                            pauseAllOtherVideos(box);
                            instance.player.playVideo();
                            box.classList.add('is-playing');
                        }
                    },
                    onStateChange: (event) => {
                        if (event.data === YT.PlayerState.PLAYING) {
                            box.classList.add('is-playing');
                        } else if (event.data === YT.PlayerState.ENDED) {
                            box.classList.remove('is-playing');
                        }
                    }
                }
            });
        };

        if (ytApiReady) {
            initPlayer();
        } else {
            ytReadyCallbacks.push(initPlayer);
        }

        // Single integrated click handler:
        const handlePlay = (e) => {
            if (e) e.stopPropagation();
            pauseAllOtherVideos(box);
            box.classList.add('is-playing');

            if (instance.isReady && instance.player && typeof instance.player.playVideo === 'function') {
                instance.player.playVideo();
            } else {
                // If API is still finishing initialization, queue playback immediately
                instance.pendingPlay = true;
            }
        };

        if (playBtn) {
            playBtn.addEventListener('click', handlePlay);
        }

        box.addEventListener('click', (e) => {
            if (!box.classList.contains('is-playing')) {
                handlePlay(e);
            }
        });

    } else if (video) {
        // --- HTML5 LOCAL VIDEO CONTAINER ---
        const instance = {
            box,
            type: 'html5',
            video
        };
        videoInstances.push(instance);

        const hasSource = video.currentSrc || (video.querySelector('source') && video.querySelector('source').getAttribute('src'));

        const handlePlay = (e) => {
            if (e) e.stopPropagation();
            pauseAllOtherVideos(box);

            if (hasSource) {
                video.play().then(() => {
                    video.setAttribute('controls', 'true');
                    box.classList.add('is-playing');
                }).catch(err => {
                    console.log('Playback error:', err);
                });
            } else {
                box.classList.toggle('is-playing');
                if (box.classList.contains('is-playing')) {
                    video.setAttribute('controls', 'true');
                } else {
                    video.removeAttribute('controls');
                }
            }
        };

        if (playBtn) {
            playBtn.addEventListener('click', handlePlay);
        }

        box.addEventListener('click', (e) => {
            if (!box.classList.contains('is-playing')) {
                handlePlay(e);
            }
        });

        video.addEventListener('play', () => {
            box.classList.add('is-playing');
        });

        video.addEventListener('pause', () => {
            box.classList.remove('is-playing');
        });

        video.addEventListener('ended', () => {
            box.classList.remove('is-playing');
            video.removeAttribute('controls');
        });
    }
});