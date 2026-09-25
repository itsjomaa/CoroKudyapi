/**
 * Coro Kudyapi - Main JavaScript
 * Handles:
 * 1. Unified Minimalist Video Player (YouTube API & HTML5)
 * 2. Mobile Responsive Navigation & Backdrop
 * 3. Accessible FAQ Accordions
 * 4. GDPR Cookie Consent Banner & Preferences Modal
 * 5. Interactive Test Contact / Audition Form
 * 6. Google Analytics 4 Consent Integration
 */

// ==========================================================================
// 1. Google Analytics 4 & Cookie Consent Management
// ==========================================================================
const COOKIE_STORAGE_KEY = 'coro_kudyapi_cookie_consent';

function getStoredConsent() {
    try {
        const stored = localStorage.getItem(COOKIE_STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch (e) {
        return null;
    }
}

function saveConsent(consent) {
    try {
        localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(consent));
    } catch (e) {
        console.warn('Storage unavailable:', e);
    }
    applyConsent(consent);
}

function applyConsent(consent) {
    if (typeof window.gtag === 'function') {
        window.gtag('consent', 'update', {
            analytics_storage: consent && consent.analytics ? 'granted' : 'denied'
        });
    }
}

function initCookieConsent() {
    const banner = document.getElementById('cookieBanner');
    const modalBackdrop = document.getElementById('cookieModal');
    const acceptAllBtn = document.getElementById('cookieAcceptAll');
    const rejectBtn = document.getElementById('cookieReject');
    const openSettingsBtns = document.querySelectorAll('[data-open-cookie-settings]');
    const savePrefBtn = document.getElementById('cookieSavePref');
    const closeModalBtn = document.getElementById('cookieCloseModal');
    const analyticsCheckbox = document.getElementById('cookiePrefAnalytics');
    const functionalCheckbox = document.getElementById('cookiePrefFunctional');

    const consent = getStoredConsent();
    const isPreferencesPage = window.location.pathname.includes('cookie-preferences.html');

    if (!consent && banner && !isPreferencesPage) {
        setTimeout(() => {
            banner.classList.add('is-visible');
        }, 600);
    } else if (consent) {
        applyConsent(consent);
    }

    if (acceptAllBtn) {
        acceptAllBtn.addEventListener('click', () => {
            saveConsent({ essential: true, analytics: true, functional: true, timestamp: new Date().toISOString() });
            if (banner) banner.classList.remove('is-visible');
        });
    }

    if (rejectBtn) {
        rejectBtn.addEventListener('click', () => {
            saveConsent({ essential: true, analytics: false, functional: false, timestamp: new Date().toISOString() });
            if (banner) banner.classList.remove('is-visible');
        });
    }

    const openModal = (e) => {
        if (e) e.preventDefault();
        const current = getStoredConsent() || { essential: true, analytics: false, functional: true };
        if (analyticsCheckbox) {
            analyticsCheckbox.checked = !!current.analytics;
        }
        if (functionalCheckbox) {
            functionalCheckbox.checked = current.functional !== false;
        }
        if (modalBackdrop) modalBackdrop.classList.add('is-visible');
    };

    const closeModal = () => {
        if (modalBackdrop) modalBackdrop.classList.remove('is-visible');
    };

    openSettingsBtns.forEach(btn => {
        btn.addEventListener('click', openModal);
    });

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalBackdrop.classList.contains('is-visible')) {
                closeModal();
            }
        });
    }

    if (savePrefBtn) {
        savePrefBtn.addEventListener('click', () => {
            const isAnalyticsAllowed = analyticsCheckbox ? analyticsCheckbox.checked : false;
            const isFunctionalAllowed = functionalCheckbox ? functionalCheckbox.checked : true;
            saveConsent({
                essential: true,
                analytics: isAnalyticsAllowed,
                functional: isFunctionalAllowed,
                timestamp: new Date().toISOString()
            });
            closeModal();
            if (banner) banner.classList.remove('is-visible');
        });
    }
}

function initCookiePreferencesPage() {
    const analyticsCheckbox = document.getElementById('pageCookieAnalytics');
    const functionalCheckbox = document.getElementById('pageCookieFunctional');
    const saveBtn = document.getElementById('pageCookieSave');
    const acceptAllBtn = document.getElementById('pageCookieAcceptAll');
    const rejectBtn = document.getElementById('pageCookieReject');
    const feedbackBanner = document.getElementById('pageFeedback');

    if (!saveBtn && !analyticsCheckbox) return;

    const showFeedback = (msg) => {
        if (!feedbackBanner) return;
        feedbackBanner.innerHTML = `<i class="fa-solid fa-circle-check" aria-hidden="true"></i> <span>${msg}</span>`;
        feedbackBanner.hidden = false;
        feedbackBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        setTimeout(() => {
            if (feedbackBanner) feedbackBanner.hidden = true;
        }, 5000);
    };

    const current = getStoredConsent() || { essential: true, analytics: false, functional: true };
    if (analyticsCheckbox) {
        analyticsCheckbox.checked = !!current.analytics;
    }
    if (functionalCheckbox) {
        functionalCheckbox.checked = current.functional !== false;
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const analytics = analyticsCheckbox ? analyticsCheckbox.checked : false;
            const functional = functionalCheckbox ? functionalCheckbox.checked : true;
            saveConsent({
                essential: true,
                analytics: analytics,
                functional: functional,
                timestamp: new Date().toISOString()
            });
            showFeedback('Your cookie preferences have been saved successfully.');
            const banner = document.getElementById('cookieBanner');
            if (banner) banner.classList.remove('is-visible');
        });
    }

    if (acceptAllBtn) {
        acceptAllBtn.addEventListener('click', () => {
            if (analyticsCheckbox) analyticsCheckbox.checked = true;
            if (functionalCheckbox) functionalCheckbox.checked = true;
            saveConsent({
                essential: true,
                analytics: true,
                functional: true,
                timestamp: new Date().toISOString()
            });
            showFeedback('All cookies have been accepted.');
            const banner = document.getElementById('cookieBanner');
            if (banner) banner.classList.remove('is-visible');
        });
    }

    if (rejectBtn) {
        rejectBtn.addEventListener('click', () => {
            if (analyticsCheckbox) analyticsCheckbox.checked = false;
            if (functionalCheckbox) functionalCheckbox.checked = false;
            saveConsent({
                essential: true,
                analytics: false,
                functional: false,
                timestamp: new Date().toISOString()
            });
            showFeedback('Non-essential cookies have been disabled.');
            const banner = document.getElementById('cookieBanner');
            if (banner) banner.classList.remove('is-visible');
        });
    }
}

// ==========================================================================
// 2. Mobile Responsive Navigation
// ==========================================================================
function initMobileNav() {
    const toggleBtn = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navOverlay = document.querySelector('.nav-overlay');

    if (!toggleBtn || !navLinks) return;

    function openNav() {
        navLinks.classList.add('is-open');
        if (navOverlay) navOverlay.classList.add('is-visible');
        toggleBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    function closeNav() {
        navLinks.classList.remove('is-open');
        if (navOverlay) navOverlay.classList.remove('is-visible');
        toggleBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    toggleBtn.addEventListener('click', () => {
        const isOpen = navLinks.classList.contains('is-open');
        if (isOpen) {
            closeNav();
        } else {
            openNav();
        }
    });

    if (navOverlay) {
        navOverlay.addEventListener('click', closeNav);
    }

    // Close on navigation link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeNav);
    });

    // Close on Escape key press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
            closeNav();
            toggleBtn.focus();
        }
    });
}

// ==========================================================================
// 3. Accessible FAQ Accordions
// ==========================================================================
function initFaqAccordions() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        if (!questionBtn || !answer) return;

        questionBtn.addEventListener('click', () => {
            const isExpanded = questionBtn.getAttribute('aria-expanded') === 'true';

            // Optional: Close others for accordion behavior
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('is-open');
                    const otherBtn = otherItem.querySelector('.faq-question');
                    const otherAns = otherItem.querySelector('.faq-answer');
                    if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
                    if (otherAns) otherAns.hidden = true;
                }
            });

            if (isExpanded) {
                questionBtn.setAttribute('aria-expanded', 'false');
                answer.hidden = true;
                item.classList.remove('is-open');
            } else {
                questionBtn.setAttribute('aria-expanded', 'true');
                answer.hidden = false;
                item.classList.add('is-open');
            }
        });
    });
}

// ==========================================================================
// 4. Interactive Test Form (Contact & Audition)
// ==========================================================================
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const feedback = document.getElementById('formFeedback');
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Basic validation
        if (!form.checkValidity()) {
            if (feedback) {
                feedback.className = 'form-feedback is-error';
                feedback.textContent = 'Please fill out all required fields properly.';
            }
            return;
        }

        const nameInput = form.querySelector('[name="name"]');
        const senderName = nameInput ? nameInput.value : 'friend';

        // Submit state
        const originalText = submitBtn ? submitBtn.innerHTML : 'Send Message';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending message...';
        }

        setTimeout(() => {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }

            if (feedback) {
                feedback.className = 'form-feedback is-success';
                feedback.innerHTML = `<strong>Thank you, ${escapeHtml(senderName)}!</strong> Your message has been received. A choir coordinator will get in touch with you shortly.`;
            }

            form.reset();

            // Track form submission event if consent given
            const consent = getStoredConsent();
            if (consent && consent.analytics && typeof window.gtag === 'function') {
                window.gtag('event', 'form_submission', {
                    event_category: 'Contact',
                    event_label: 'Audition & Contact Form'
                });
            }
        }, 1200);
    });
}

function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// ==========================================================================
// 5. Unified Minimalist Video Player (YouTube & HTML5 Video)
// ==========================================================================
function extractYouTubeId(urlOrId) {
    if (!urlOrId) return null;
    const trimmed = urlOrId.trim();
    const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/) || trimmed.match(/^([\w-]{11})$/);
    return match ? (match[1] || match[0]) : null;
}

const videoInstances = [];

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

let ytApiReady = false;
const ytReadyCallbacks = [];

window.onYouTubeIframeAPIReady = function () {
    ytApiReady = true;
    ytReadyCallbacks.forEach(cb => cb());
    ytReadyCallbacks.length = 0;
};

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

function initVideoPlayers() {
    document.querySelectorAll('.video-box').forEach((box, index) => {
        const rawYt = box.dataset.youtubeId || box.dataset.youtubeUrl;
        const ytId = extractYouTubeId(rawYt);
        const video = box.querySelector('video.video-element');
        const playBtn = box.querySelector('.play-btn');

        if (ytId) {
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

            const handlePlay = (e) => {
                if (e) e.stopPropagation();
                pauseAllOtherVideos(box);
                box.classList.add('is-playing');

                if (instance.isReady && instance.player && typeof instance.player.playVideo === 'function') {
                    instance.player.playVideo();
                } else {
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
}

// ==========================================================================
// Initialization on DOM Ready
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initCookieConsent();
    initCookiePreferencesPage();
    initFaqAccordions();
    initContactForm();
    initVideoPlayers();
});