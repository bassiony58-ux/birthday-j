// script.js

document.addEventListener('DOMContentLoaded', () => {
    
    // --- STATE MACHINE NAV ---
    let currentSection = 'intro';
    const sections = {
        intro: document.getElementById('intro-page'),
        challenge: document.getElementById('challenge-page'),
        lock: document.getElementById('lock-page'),
        sparkle: document.getElementById('sparkle-pen-page'),
        letter: document.getElementById('letter-page'),
        stars: document.getElementById('stars-page')
    };

    function showSection(targetId) {
        currentSection = targetId;
        Object.keys(sections).forEach(key => {
            if (key === targetId) {
                sections[key].classList.add('active');
            } else {
                sections[key].classList.remove('active');
            }
        });
    }

    // --- SOUND EFFECTS ---
    const clickSfx = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav');
    const magicSfx = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav');
    clickSfx.volume = 0.4;
    magicSfx.volume = 0.5;

    // --- MUSIC CONTROL ---
    const birthdayMusic = document.getElementById('birthday-music');
    const musicToggle = document.getElementById('music-toggle');
    let isMusicPlaying = false;

    // Auto-set light theme
    document.body.classList.add('light');

    musicToggle.addEventListener('click', () => {
        if (isMusicPlaying) {
            birthdayMusic.pause();
            musicToggle.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
        } else {
            birthdayMusic.play().catch(e => console.log('Autoplay blocked', e));
            musicToggle.innerHTML = '<i class="fa-solid fa-music"></i>';
        }
        isMusicPlaying = !isMusicPlaying;
    });

    // --- AMBIENT CANVAS BACKGROUND DUST & STARS ---
    const ambientCanvas = document.getElementById('ambient-canvas');
    const actx = ambientCanvas.getContext('2d');
    let awidth, aheight;
    let ambientStars = [];

    function resizeAmbient() {
        awidth = window.innerWidth; aheight = window.innerHeight;
        ambientCanvas.width = awidth; ambientCanvas.height = aheight;
    }
    resizeAmbient();
    window.addEventListener('resize', resizeAmbient);

    class AmbientStar {
        constructor() {
            this.x = Math.random() * awidth;
            this.y = Math.random() * aheight;
            this.size = Math.random() * 1.5 + 0.5;
            this.alpha = Math.random() * 0.6 + 0.2;
            this.speed = Math.random() * 0.015 + 0.003;
            const colors = ['rgba(255, 143, 171, ', 'rgba(255, 227, 168, ', 'rgba(255, 255, 255, '];
            this.colorPrefix = colors[Math.floor(Math.random() * colors.length)];
        }
        draw() {
            actx.fillStyle = `${this.colorPrefix}${this.alpha})`;
            actx.beginPath();
            actx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            actx.fill();
        }
        update() {
            this.alpha += this.speed;
            if (this.alpha > 0.8 || this.alpha < 0.1) {
                this.speed *= -1;
            }
        }
    }
    for (let i = 0; i < 50; i++) ambientStars.push(new AmbientStar());

    // --- Occasional shooting stars, purely for wow-factor ambience ---
    let shootingStars = [];
    class ShootingStar {
        constructor() {
            this.x = Math.random() * awidth * 0.7;
            this.y = Math.random() * aheight * 0.4;
            const speed = Math.random() * 6 + 8;
            this.vx = speed; this.vy = speed * 0.55;
            this.life = 1;
            this.len = Math.random() * 60 + 60;
        }
        update() { this.x += this.vx; this.y += this.vy; this.life -= 0.02; }
        draw() {
            const tailX = this.x - this.vx * (this.len / 12);
            const tailY = this.y - this.vy * (this.len / 12);
            const grad = actx.createLinearGradient(this.x, this.y, tailX, tailY);
            grad.addColorStop(0, `rgba(255, 255, 255, ${this.life})`);
            grad.addColorStop(1, 'rgba(255, 227, 168, 0)');
            actx.strokeStyle = grad;
            actx.lineWidth = 2;
            actx.beginPath();
            actx.moveTo(this.x, this.y);
            actx.lineTo(tailX, tailY);
            actx.stroke();
        }
    }
    setInterval(() => {
        if (Math.random() < 0.35) shootingStars.push(new ShootingStar());
    }, 2600);

    // --- Cursor / touch sparkle trail ---
    let sparkles = [];
    function spawnSparkle(x, y) {
        sparkles.push({
            x, y,
            size: Math.random() * 2 + 1.5,
            alpha: 0.9,
            vy: -(Math.random() * 0.6 + 0.3),
            hue: Math.random() > 0.5 ? '255, 143, 171' : '255, 227, 168'
        });
        if (sparkles.length > 70) sparkles.shift();
    }
    window.addEventListener('pointermove', (e) => {
        if (Math.random() < 0.55) spawnSparkle(e.clientX, e.clientY);
    });

    function loopAmbient() {
        actx.clearRect(0, 0, awidth, aheight);
        ambientStars.forEach(s => { s.draw(); s.update(); });

        shootingStars.forEach(s => { s.draw(); s.update(); });
        shootingStars = shootingStars.filter(s => s.life > 0);

        sparkles.forEach(sp => {
            actx.fillStyle = `rgba(${sp.hue}, ${sp.alpha})`;
            actx.beginPath();
            actx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
            actx.fill();
            sp.y += sp.vy;
            sp.alpha -= 0.02;
        });
        sparkles = sparkles.filter(sp => sp.alpha > 0);

        requestAnimationFrame(loopAmbient);
    }
    loopAmbient();


    // --- PRE-LOGIN NAVIGATION ---
    const introNextBtn = document.getElementById('intro-next-btn');

    // --- MATRIX RAIN & COUNTDOWN EFFECT ---
    const matrixCanvas = document.getElementById('matrix-canvas');
    if (matrixCanvas) {
        const mctx = matrixCanvas.getContext('2d');
        let mwidth = window.innerWidth;
        let mheight = window.innerHeight;
        matrixCanvas.width = mwidth;
        matrixCanvas.height = mheight;
        
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*';
        const fontSize = 18;
        let columns = mwidth / fontSize;
        let drops = [];
        for (let x = 0; x < columns; x++) drops[x] = 1;
        
        function drawMatrix() {
            mctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            mctx.fillRect(0, 0, mwidth, mheight);
            mctx.fillStyle = '#ff8fab'; // Pink matrix rain
            mctx.font = fontSize + 'px monospace';
            for (let i = 0; i < drops.length; i++) {
                const text = characters.charAt(Math.floor(Math.random() * characters.length));
                mctx.fillText(text, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > mheight && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
        }
        
        let matrixInterval = setInterval(drawMatrix, 35);
        
        const sequenceEl = document.getElementById('matrix-sequence-text');
        const nextBtn = document.getElementById('intro-next-btn');
        
        if (sequenceEl && nextBtn) {
            const words = ['3', '2', '1', 'HELLO', 'JANA', 'WELCOME', 'TO', 'CHAPTER', '21'];
            let currentWord = 0;

            function showNextWord() {
                if (currentWord < words.length) {
                    sequenceEl.innerText = words[currentWord];
                    sequenceEl.style.opacity = 1;
                    clickSfx.play().catch(e=>e);
                    
                    setTimeout(() => {
                        sequenceEl.style.opacity = 0;
                        currentWord++;
                        setTimeout(showNextWord, 400); // Wait 400ms before next word
                    }, 800); // Word stays visible for 800ms
                } else {
                    sequenceEl.style.display = 'none';
                    const introBtnContainer = document.getElementById('intro-btn-container');
                    if (introBtnContainer) {
                        introBtnContainer.style.display = 'flex';
                    } else {
                        nextBtn.style.display = 'block';
                    }
                    magicSfx.play().catch(e=>e);
                }
            }

            setTimeout(showNextWord, 1000); // Start sequence after 1 second
        }

        window.addEventListener('resize', () => {
            mwidth = window.innerWidth;
            mheight = window.innerHeight;
            matrixCanvas.width = mwidth;
            matrixCanvas.height = mheight;
            columns = mwidth / fontSize;
            drops = [];
            for (let x = 0; x < columns; x++) drops[x] = 1;
        });
    }

    const introBtnContainer = document.getElementById('intro-btn-container');
    if (introBtnContainer) {
        introBtnContainer.addEventListener('click', () => {
            clickSfx.play().catch(e=>e);
            showSection('challenge');
        });
    } else if (introNextBtn) {
        introNextBtn.addEventListener('click', () => {
            clickSfx.play().catch(e=>e);
            showSection('challenge');
        });
    }

    // --- MAGICAL SEAL LOGIC ---
    const magicSealBtn = document.getElementById('magic-seal-btn');
    const sealStatus = document.getElementById('seal-status');
    const sealSvg = document.getElementById('seal-svg');

    if (magicSealBtn) {
        magicSealBtn.addEventListener('click', () => {
            magicSfx.play().catch(err=>err);
            sealSvg.style.animation = 'none';
            sealSvg.style.transform = 'scale(1.2)';
            sealSvg.style.filter = 'drop-shadow(0 0 35px rgba(255, 215, 0, 1))';
            sealStatus.textContent = 'SEAL BROKEN. PROCEEDING...';
            sealStatus.style.color = '#ffd700';

            gsap.to(magicSealBtn, { 
                rotation: 180, 
                opacity: 0, 
                duration: 1, 
                delay: 0.5,
                onComplete: () => {
                    showSection('lock');
                    // Reset
                    sealSvg.style.animation = 'pulseGlow 2s infinite alternate';
                    sealSvg.style.transform = 'scale(1)';
                    sealSvg.style.filter = 'none';
                    gsap.set(magicSealBtn, { rotation: 0, opacity: 1 });
                    sealStatus.textContent = 'TAP THE SEAL TO PROVE YOUR IDENTITY';
                    sealStatus.style.color = '#a1a1aa';
                }
            });
        });
    }


    // --- 1. BIRTHDAY LOCK SCREEN LOGIC ---
    const dots = document.querySelectorAll('.passcode-dots .dot');
    const keypadBtns = document.querySelectorAll('.keypad-btn:not(.empty)');
    const passcodeDotsContainer = document.getElementById('passcode-dots');
    const lockError = document.getElementById('lock-error');
    const lockPageContainer = document.querySelector('.phone-lock-container');
    
    let enteredPasscode = "";
    const CORRECT_PASSCODE = "01102005"; 

    keypadBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            clickSfx.play().catch(e=>e);
            
            if (btn.classList.contains('delete-btn') || btn.closest('.delete-btn')) {
                if (enteredPasscode.length > 0) {
                    enteredPasscode = enteredPasscode.slice(0, -1);
                }
            } else {
                if (enteredPasscode.length < 8) {
                    enteredPasscode += btn.innerText;
                }
            }
            updateDots();
            
            if (enteredPasscode.length === 8) {
                setTimeout(checkPasscode, 150);
            }
        });
    });

    function updateDots() {
        dots.forEach((dot, index) => {
            if (index < enteredPasscode.length) {
                dot.classList.add('filled');
            } else {
                dot.classList.remove('filled');
            }
        });
        lockError.classList.add('hidden');
    }

    function checkPasscode() {
        if (enteredPasscode === CORRECT_PASSCODE) {
            magicSfx.play().catch(e=>e);
            
            birthdayMusic.play().then(() => {
                isMusicPlaying = true;
                musicToggle.innerHTML = '<i class="fa-solid fa-music"></i>';
            }).catch(err => console.log(err));

            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ['#ff8fab', '#ffe3a8'] });

            gsap.to(lockPageContainer, {
                opacity: 0,
                y: -50,
                duration: 1,
                ease: "power2.inOut",
                onComplete: () => {
                    showSection('sparkle');
                    initVideoStage();
                }
            });
        } else {
            clickSfx.play().catch(e=>e);
            passcodeDotsContainer.classList.add('error');
            lockError.classList.remove('hidden');
            setTimeout(() => {
                passcodeDotsContainer.classList.remove('error');
                enteredPasscode = "";
                updateDots();
            }, 500);
        }
    }


    // --- 2. VIDEO MEMORY STAGE ---
    function initVideoStage() {
        const videoContainer = document.getElementById('video-container');
        const memoryVideo = document.getElementById('memory-video');
        const playBtn = document.getElementById('play-video-btn');
        const continueBtn = document.getElementById('continue-after-video-btn');
        const page = document.getElementById('sparkle-pen-page');

        if (!videoContainer || !page) {
            showSection('letter'); typeLetter(); return;
        }

        // Animate video container appearing
        videoContainer.style.zIndex = '300';
        gsap.to(videoContainer, {
            opacity: 1, scale: 1,
            duration: 1.5, ease: 'back.out(1.5)'
        });

        // Preload video cleanly
        memoryVideo.load();

        // Play Video Interaction
        playBtn.addEventListener('click', () => {
            playBtn.classList.add('hidden');
            // Pause background music so video audio is crystal clear
            if (isMusicPlaying && birthdayMusic) {
                birthdayMusic.pause();
            }
            memoryVideo.play().then(() => {
                continueBtn.classList.remove('hidden');
            }).catch(e => {
                console.log("Video play failed:", e);
                continueBtn.classList.remove('hidden');
            });
        });

        // Allow clicking directly on the video to play/pause
        memoryVideo.addEventListener('click', () => {
            if (memoryVideo.paused) {
                if (isMusicPlaying && birthdayMusic) birthdayMusic.pause();
                memoryVideo.play().catch(e=>e);
                playBtn.classList.add('hidden');
            } else {
                memoryVideo.pause();
                playBtn.classList.remove('hidden');
            }
        });

        // Show continue button when video plays
        memoryVideo.addEventListener('timeupdate', () => {
            if (memoryVideo.currentTime > 2) {
                continueBtn.classList.remove('hidden');
            }
        });

        memoryVideo.addEventListener('ended', () => {
            continueBtn.classList.remove('hidden');
            if (isMusicPlaying && birthdayMusic) {
                birthdayMusic.play().catch(e=>e);
            }
        });

        // If video fails to load, gracefully reveal continue button
        memoryVideo.addEventListener('error', (e) => {
            console.warn('Video load issue:', e);
            continueBtn.classList.remove('hidden');
        });

        // Continue to letter
        continueBtn.addEventListener('click', () => {
            memoryVideo.pause();
            // Resume background music for the letter & celebration
            if (isMusicPlaying && birthdayMusic) {
                birthdayMusic.play().catch(e=>e);
            }
            magicSfx.play().catch(e=>e);
            gsap.to(page, { opacity: 0, duration: 1, onComplete: () => {
                showSection('letter');
                typeLetter();
            }});
        });
    }


    // --- 3. ROYAL LETTER STAGE ---
    const letterText = document.getElementById('letter-text');
    const letterFooter = document.getElementById('letter-footer');
    const showStarsBtn = document.getElementById('show-stars-btn');
    const LETTER_CONTENT = "Happy 21st Birthday, Jana Mater! 🌸\n\nToday is a beautiful day because it's the day you were born. Twenty-one years of bringing light, laughter, and beauty to everyone around you. May this new chapter of your life be filled with sweet dreams, endless love, and magical moments that make your heart smile.\n\nCheers to the queen of the day! 👑";

    function typeLetter() {
        let i = 0;
        let currentText = '';
        letterText.innerHTML = '';
        function typeWriter() {
            if (i < LETTER_CONTENT.length) {
                const char = LETTER_CONTENT.charAt(i);
                currentText += (char === '\n') ? '<br>' : char;
                letterText.innerHTML = currentText + '<span class="typing-cursor">|</span>';
                i++;
                setTimeout(typeWriter, 35);
            } else {
                letterText.innerHTML = currentText;
                letterFooter.classList.remove('hidden');
            }
        }
        setTimeout(typeWriter, 800);
    }

    showStarsBtn.addEventListener('click', () => {
        clickSfx.play().catch(e=>e);
        showSection('stars');
        initStars();
    });


    // --- 4. MAGICAL GOLDEN GATE & CELEBRATION FINALE ---
    function initStars() {
        const page = document.getElementById('stars-page');
        const gate = document.getElementById('magic-gate');
        const doorLeft = document.getElementById('gate-door-left');
        const doorRight = document.getElementById('gate-door-right');
        const textDisplay = document.getElementById('stars-text-display');
        const invitation = document.getElementById('gate-invitation');
        const petalContainer = document.getElementById('entrance-petals');

        if (!page || !gate) return;

        // Generate slow-drifting background rose petals
        petalContainer.innerHTML = '';
        const petalCount = 25;
        for (let i = 0; i < petalCount; i++) {
            const petal = document.createElement('div');
            petal.className = 'entrance-petal';
            
            // Random styling for realistic variation
            const size = Math.random() * 15 + 10;
            petal.style.width = size + 'px';
            petal.style.height = size + 'px';
            petal.style.left = Math.random() * 100 + 'vw';
            petal.style.top = Math.random() * 100 + 'vh';
            
            // Varied pink shades
            const hue = 340 + Math.random() * 20;
            petal.style.background = `rgba(255, 143, 171, ${0.4 + Math.random() * 0.4})`;
            
            petalContainer.appendChild(petal);

            // Animate floating
            gsap.to(petal, {
                y: '+=100',
                x: '+=50',
                rotation: '+=180',
                opacity: Math.random() * 0.7 + 0.2,
                duration: Math.random() * 6 + 6,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            });
        }

        // Reset elements
        gate.style.opacity = '1';
        gate.style.scale = '1';
        doorLeft.style.transform = 'rotateY(0deg)';
        doorRight.style.transform = 'rotateY(0deg)';
        invitation.style.opacity = '1';
        textDisplay.style.opacity = '1';
        gsap.set(textDisplay, { y: 0, scale: 1 }); // Reset text slide up

        // Gate click event to trigger the grand reveal
        gate.addEventListener('click', () => {
            magicSfx.play().catch(e => e);

            // 1. Open doors
            doorLeft.style.transform = 'rotateY(-110deg)';
            doorRight.style.transform = 'rotateY(110deg)';

            // 2. Explode petals from gate center
            const rect = gate.getBoundingClientRect();
            const gateX = rect.left + rect.width / 2;
            const gateY = rect.top + rect.height / 2;

            for (let i = 0; i < 40; i++) {
                const p = document.createElement('div');
                p.className = 'entrance-petal';
                p.style.width = (Math.random() * 12 + 8) + 'px';
                p.style.height = (Math.random() * 12 + 8) + 'px';
                p.style.left = gateX + 'px';
                p.style.top = gateY + 'px';
                p.style.background = `rgba(255, 143, 171, ${0.8 + Math.random() * 0.2})`;
                document.body.appendChild(p);

                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * 250 + 100;
                gsap.to(p, {
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                    rotation: Math.random() * 720,
                    opacity: 0,
                    scale: 0.5,
                    duration: Math.random() * 1.5 + 1.0,
                    ease: 'power3.out',
                    onComplete: () => p.remove()
                });
            }

            // 3. Zoom-in and fade out gate & invitation text
            gsap.to(gate, {
                scale: 1.6,
                opacity: 0,
                duration: 1.5,
                ease: 'power2.inOut',
                delay: 0.2
            });

            gsap.to(invitation, {
                opacity: 0,
                y: 20,
                duration: 1.0,
                ease: 'power2.out'
            });

            // Slide the Name and Age text display to the top of the screen
            gsap.to(textDisplay, {
                y: -140,
                scale: 0.85,
                duration: 1.4,
                ease: 'power2.inOut'
            });

            // 4. Reveal Cake
            setTimeout(() => {
                const c = document.getElementById('cake-container');
                if (c) c.classList.add('show');
                spawnFloatingCelebration();
            }, 1200);
        });
    }

    // --- Interactive Cake & Confetti ---
    const cakeContainer = document.getElementById('cake-container');
    const candleFlame = document.getElementById('candle-flame');
    const blowHint = document.getElementById('blow-hint');
    const submitCakeWishBtn = document.getElementById('submit-cake-wish-btn');
    const cakeWishInput = document.getElementById('cake-wish-input');
    const wishInputWrapper = document.getElementById('wish-input-wrapper');
    let janasSecretWish = "";

    if (submitCakeWishBtn) {
        submitCakeWishBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const wishText = cakeWishInput.value.trim();
            janasSecretWish = wishText || "To a magical year of dreams coming true! ✨";
            
            magicSfx.play().catch(e=>e);
            
            // Send the wish to email
            sendWishToEmail(janasSecretWish);

            if (candleFlame) {
                candleFlame.style.pointerEvents = 'auto';
                gsap.to(candleFlame, { opacity: 1, duration: 0.5 });
            }

            if (wishInputWrapper) wishInputWrapper.style.display = 'none';
            if (blowHint) blowHint.style.display = 'block';

            confetti({ particleCount: 30, spread: 50, colors: ['#ff8fab', '#ffd700'], origin: { y: 0.7 } });
        });
    }

    function sendWishToEmail(wish) {
        fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                access_key: "c777a5d1-088a-4079-8fb9-c6f4bf12b322",
                subject: "New Birthday Wish from Jana! 🎂",
                message: `Jana made a wish: "${wish}"`
            })
        }).catch(err => console.error(err));
    }
    
    if (cakeContainer) {
        cakeContainer.addEventListener('click', () => {
            if (candleFlame && !candleFlame.classList.contains('out') && candleFlame.style.pointerEvents === 'auto') {
                candleFlame.classList.add('out');
                if (blowHint) blowHint.style.display = 'none';

                try {
                    fireConfetti();
                } catch(err) {
                    console.log(err);
                }

                // Warm shockwave flash right at the candle, for extra "wow"
                const flameRect = candleFlame.getBoundingClientRect();
                const flash = document.createElement('div');
                flash.className = 'blow-flash';
                flash.style.left = (flameRect.left + flameRect.width / 2) + 'px';
                flash.style.top = (flameRect.top + flameRect.height / 2) + 'px';
                document.body.appendChild(flash);
                gsap.fromTo(flash,
                    { scale: 0, opacity: 0.9 },
                    { scale: 6, opacity: 0, duration: 1.1, ease: 'power2.out', onComplete: () => flash.remove() }
                );

                spawnCakeBurst(flameRect);

                setTimeout(() => {
                    document.getElementById('celebration-popup').classList.add('active');
                }, 3200); 
            }
        });
    }

    // --- Close button for the final celebration popup ---
    const closeCelebrationBtn = document.getElementById('close-celebration-btn');
    if (closeCelebrationBtn) {
        closeCelebrationBtn.addEventListener('click', () => {
            clickSfx.play().catch(e => e);
            document.getElementById('celebration-popup').classList.remove('active');
        });
    }

    const replayCelebrationBtn = document.getElementById('replay-celebration-btn');
    if (replayCelebrationBtn) {
        replayCelebrationBtn.addEventListener('click', () => {
            location.reload();
        });
    }

    function spawnFloatingCelebration() {
        const page = document.getElementById('stars-page');
        if (!page) return;
        
        for (let i = 0; i < 12; i++) {
            createFloatingItem(true);
        }
        
        const celebrateInterval = setInterval(() => {
            if (currentSection !== 'stars') {
                clearInterval(celebrateInterval);
                return;
            }
            createFloatingItem(false);
        }, 550); 
    }

    function createFloatingItem(initial = false) {
        const page = document.getElementById('stars-page');
        if (!page) return;

        const elements = ['🎈', '🌹', '💖', '✨'];
        const item = document.createElement('div');
        item.className = 'floating-celebration-item';
        item.textContent = elements[Math.floor(Math.random() * elements.length)];

        const size = Math.random() * 25 + 20;
        item.style.fontSize = `${size}px`;

        item.style.left = `${Math.random() * 100}vw`;
        if (initial) {
            item.style.bottom = `${Math.random() * 100}vh`;
        } else {
            item.style.bottom = `-10vh`;
        }
        const duration = Math.random() * 8 + 6;
        item.style.animation = `floatUp ${duration}s linear forwards`;

        page.appendChild(item);

        setTimeout(() => {
            item.remove();
        }, 14000);
    }

    // Realistic radial burst: each piece flies outward from the candle at its
    // own random angle/speed/spin, like real confetti/petals scattering — not
    // a straight vertical rise, so it doesn't pile up into one clump.
    function spawnCakeBurst(originRect) {
        const page = document.getElementById('stars-page');
        if (!page || !originRect) return;

        const elements = ['🎈', '🌹', '💖', '✨', '🎉', '🥳', '🌟', '💫'];
        const originX = originRect.left + originRect.width / 2;
        const originY = originRect.top + originRect.height / 2;
        const count = 26;

        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const item = document.createElement('div');
                item.className = 'floating-celebration-item';
                item.textContent = elements[Math.floor(Math.random() * elements.length)];
                item.style.fontSize = `${Math.random() * 20 + 16}px`;
                item.style.left = `${originX}px`;
                item.style.top = `${originY}px`;
                item.style.bottom = 'auto';
                page.appendChild(item);

                // Mostly-upward cone of angles, like sparks thrown from a flame
                const angle = -Math.PI / 2 + (Math.random() * 2.2 - 1.1);
                const distance = Math.random() * 220 + 90;
                const dx = Math.cos(angle) * distance;
                const dy = Math.sin(angle) * distance;
                const riseDuration = Math.random() * 0.9 + 0.9;

                gsap.fromTo(item,
                    { x: 0, y: 0, scale: 0.3, opacity: 0, rotation: 0 },
                    {
                        x: dx, y: dy,
                        scale: Math.random() * 0.4 + 0.85,
                        opacity: 0.95,
                        rotation: Math.random() * 300 - 150,
                        duration: riseDuration,
                        ease: 'power2.out',
                        onComplete: () => {
                            // Then drift the rest of the way up and fade, like it's floating away
                            gsap.to(item, {
                                y: dy - (Math.random() * 160 + 100),
                                opacity: 0,
                                duration: Math.random() * 1.4 + 1.2,
                                ease: 'power1.in',
                                onComplete: () => item.remove()
                            });
                        }
                    }
                );
            }, i * 40);
        }
    }

    function fireConfetti() {
        if (typeof confetti !== 'function') return;
        var duration = 8 * 1000;
        var animationEnd = Date.now() + duration;
        
        var scalar = 2.5;
        var shapes = [];
        try {
            var rose = confetti.shapeFromText({ text: '🌹', scalar });
            var balloon = confetti.shapeFromText({ text: '🎈', scalar });
            var heart = confetti.shapeFromText({ text: '💖', scalar });
            var popper = confetti.shapeFromText({ text: '🎉', scalar });
            shapes = [rose, balloon, heart, popper];
        } catch(e) {
            shapes = ['circle', 'square'];
        }

        var defaults = { 
            startVelocity: 30, 
            spread: 360, 
            ticks: 80, 
            zIndex: 200,
            shapes: shapes,
            scalar: scalar
        };
        
        function randomInRange(min, max) { return Math.random() * (max - min) + min; }
        var interval = setInterval(function() {
            var timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            var particleCount = 25 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 200);
    }
});
