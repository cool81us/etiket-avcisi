/**
 * ============================================
 * ETIKET AVCISI - Ana Script Dosyasi
 * ============================================
 * Oyunun tum mantigi, editor yonetimi, onizleme
 * ve localStorage islemleri bu dosyada bulunur.
 *
 * Moduller:
 * - App: Uygulama baslatıcı
 * - Storage: localStorage yonetimi
 * - GameState: Oyun durum yonetimi
 * - Screens: Ekran gecis yonetimi
 * - Scoring: Puanlama sistemi
 * - HintSystem: Ipucu sistemi
 * - Editor: Kod editoru yonetimi
 * - Preview: Guvenli HTML onizleme
 * - UI: Yardimci UI fonksiyonlari
 */

/* ============================================
   STORAGE MODULU
   ============================================ */
const Storage = {
    prefix: "etiketAvcisi_",

    get(key) {
        try {
            const data = localStorage.getItem(this.prefix + key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.warn("Storage okuma hatasi:", e);
            return null;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.warn("Storage yazma hatasi:", e);
            return false;
        }
    },

    remove(key) {
        localStorage.removeItem(this.prefix + key);
    },
};

/* ============================================
   UI YARDIMCI FONKSIYONLARI
   ============================================ */
const UI = {
    // Toast bildirim goster
    showToast(message, type = "info", duration = 3000) {
        const container = document.getElementById("toast-container");
        const toast = document.createElement("div");
        toast.className = `toast toast--${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add("toast--hidden");
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    // Konfeti olustur
    createConfetti(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = "";

        const colors = [
            "#e94560",
            "#00c853",
            "#ffd600",
            "#2196f3",
            "#ff9100",
            "#9c27b0",
        ];

        for (let i = 0; i < 50; i++) {
            const piece = document.createElement("div");
            piece.className = "confetti-piece";
            piece.style.left = Math.random() * 100 + "%";
            piece.style.backgroundColor =
                colors[Math.floor(Math.random() * colors.length)];
            piece.style.animationDelay = Math.random() * 2 + "s";
            piece.style.animationDuration = 2 + Math.random() * 2 + "s";
            piece.style.width = 5 + Math.random() * 10 + "px";
            piece.style.height = 5 + Math.random() * 10 + "px";
            piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "0";
            container.appendChild(piece);
        }
    },

    // HTML kacikla
    escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    },
};

/* ============================================
   OYUN DURUM YONETIMI
   ============================================ */
const GameState = {
    data: {
        playerName: "",
        currentLevel: 1,
        currentQuestion: 0,
        score: 0,
        totalScore: 0,
        lives: 5,
        streak: 0,
        maxStreak: 0,
        completedLevels: {},
        totalCorrect: 0,
        totalWrong: 0,

        // Raporlama icin yeni alanlar
        xp: 0,
        xpLevel: 1,
        lastPlayed: null,
        totalPlayTime: 0,
        sessionStartTime: null,
        badges: [],
        errorHistory: [],
        questionHistory: {},
        hintStats: { totalUsed: 0, byLevel: {}, byTag: {} },
        levelAttempts: {},
    },

    // Kayitli verileri yukle
    init() {
        const saved = Storage.get("gameState");
        if (saved) {
            this.data = { ...this.data, ...saved };
            this.migrateOldData();
        }
    },

    // Backend'den veri yukle
    async syncFromBackend() {
        if (!API.isOnline) return;
        try {
            const profile = await API.getProfile();
            if (profile.stats) {
                this.data.totalScore = profile.stats.total_score || 0;
                this.data.xp = profile.stats.xp || 0;
                this.data.xpLevel = profile.stats.xp_level || 1;
                this.data.maxStreak = profile.stats.max_streak || 0;
                this.data.totalCorrect = profile.stats.total_correct || 0;
                this.data.totalWrong = profile.stats.total_wrong || 0;
                this.data.totalPlayTime = profile.stats.total_play_time || 0;
                this.data.lastPlayed = profile.stats.last_played || null;
                this.data.badges = typeof profile.stats.badges === 'string' ? JSON.parse(profile.stats.badges || '[]') : (profile.stats.badges || []);
            }

            // Seviye ilerlemelerini yukle
            const progress = await API.getProgress();
            if (progress.progress) {
                progress.progress.forEach(p => {
                    this.data.completedLevels[p.level_id] = {
                        stars: p.stars || 0,
                        score: p.score || 0,
                        completed: !!p.completed,
                        attempts: p.attempts || 0,
                        timeSpent: p.time_spent || 0,
                        hintsUsed: p.hints_used || 0,
                        correctRate: p.correct_rate || 0,
                        xpEarned: p.xp_earned || 0,
                        lastAttempt: p.last_attempt || null
                    };
                });
            }

            // Oyuncu adini profil ile guncelle
            if (profile.user && profile.user.fullName) {
                this.data.playerName = profile.user.fullName;
            }

            this.save();
        } catch (err) {
            console.error("Backend senkronizasyon hatasi:", err);
        }
    },

    // Backend'e veri senkronize et
    async syncToBackend() {
        if (!API.isOnline) return;

        try {
            // İstatistikleri senkronize et
            await API.updateStats({
                totalScore: this.data.totalScore,
                xp: this.data.xp,
                xpLevel: this.data.xpLevel,
                maxStreak: this.data.maxStreak,
                totalCorrect: this.data.totalCorrect,
                totalWrong: this.data.totalWrong,
                totalPlayTime: this.data.totalPlayTime,
                lastPlayed: this.data.lastPlayed,
                badges: this.data.badges
            });

            // Seviye ilerlemelerini senkronize et
            for (const [levelId, levelData] of Object.entries(this.data.completedLevels)) {
                await API.updateProgress(parseInt(levelId), {
                    stars: levelData.stars || 0,
                    score: levelData.score || 0,
                    completed: levelData.completed || false,
                    attempts: levelData.attempts || 0,
                    timeSpent: levelData.timeSpent || 0,
                    hintsUsed: levelData.hintsUsed || 0,
                    correctRate: levelData.correctRate || 0,
                    xpEarned: levelData.xpEarned || 0
                });
            }
        } catch (err) {
            console.error("Backend senkronizasyon hatasi:", err);
        }
    },

    // Eski veri formatini yeni formata donustur
    migrateOldData() {
        let needsSave = false;

        if (!this.data.xp && this.data.xp !== 0) {
            this.data.xp = this.data.score || 0;
            needsSave = true;
        }
        if (!this.data.xpLevel) {
            this.data.xpLevel = this.calculateXPLevel(this.data.xp);
            needsSave = true;
        }
        if (this.data.totalScore === undefined || this.data.totalScore === null) {
            this.data.totalScore = this.data.score || 0;
            needsSave = true;
        }
        if (!this.data.lastPlayed) {
            this.data.lastPlayed = new Date().toISOString();
            needsSave = true;
        }
        if (!this.data.totalPlayTime && this.data.totalPlayTime !== 0) {
            this.data.totalPlayTime = 0;
            needsSave = true;
        }
        if (!Array.isArray(this.data.badges)) {
            this.data.badges = [];
            needsSave = true;
        }
        if (!Array.isArray(this.data.errorHistory)) {
            this.data.errorHistory = [];
            needsSave = true;
        }
        if (!this.data.questionHistory || typeof this.data.questionHistory !== "object") {
            this.data.questionHistory = {};
            needsSave = true;
        }
        if (!this.data.hintStats || typeof this.data.hintStats !== "object") {
            this.data.hintStats = { totalUsed: 0, byLevel: {}, byTag: {} };
            needsSave = true;
        }
        if (!this.data.levelAttempts || typeof this.data.levelAttempts !== "object") {
            this.data.levelAttempts = {};
            needsSave = true;
        }

        if (needsSave) this.save();
    },

    // Kaydet
    _syncTimeout: null,
    save() {
        Storage.set("gameState", this.data);
        // Backend'e senkronize et (debounced)
        if (API.isOnline) {
            if (this._syncTimeout) clearTimeout(this._syncTimeout);
            this._syncTimeout = setTimeout(() => this.syncToBackend(), 2000);
        }
    },

    // Isim islemleri
    getPlayerName() {
        return this.data.playerName;
    },

    setPlayerName(name) {
        this.data.playerName = name;
        this.save();
    },

    // Puan islemleri
    addScore(points) {
        this.data.score += points;
        this.data.totalScore += points;
        if (this.data.totalScore < 0) this.data.totalScore = 0;
        this.save();
    },

    getScore() {
        return this.data.score;
    },

    getTotalScore() {
        return this.data.totalScore || 0;
    },

    // Can islemleri
    getLives() {
        return this.data.lives;
    },

    loseLife() {
        if (this.data.lives > 0) {
            this.data.lives--;
            this.save();
        }
        return this.data.lives;
    },

    resetLives() {
        this.data.lives = 5;
        this.save();
    },

    // Streak islemleri
    incrementStreak() {
        this.data.streak++;
        if (this.data.streak > this.data.maxStreak) {
            this.data.maxStreak = this.data.streak;
        }
        this.save();
    },

    resetStreak() {
        this.data.streak = 0;
        this.save();
    },

    getStreak() {
        return this.data.streak;
    },

    // Seviye islemleri
    getCurrentLevel() {
        return this.data.currentLevel;
    },

    setCurrentLevel(level) {
        this.data.currentLevel = level;
        this.save();
    },

    getCurrentQuestion() {
        return this.data.currentQuestion;
    },

    setCurrentQuestion(q) {
        this.data.currentQuestion = q;
        this.save();
    },

    // Seviye tamamlama
    completeLevel(levelId, stars, score) {
        this.data.completedLevels[levelId] = {
            stars: Math.max(
                stars,
                this.data.completedLevels[levelId]?.stars || 0
            ),
            score: Math.max(
                score,
                this.data.completedLevels[levelId]?.score || 0
            ),
            completed: true,
        };
        this.save();
    },

    isLevelCompleted(levelId) {
        return this.data.completedLevels[levelId]?.completed || false;
    },

    getLevelStars(levelId) {
        return this.data.completedLevels[levelId]?.stars || 0;
    },

    getLevelScore(levelId) {
        return this.data.completedLevels[levelId]?.score || 0;
    },

    // Istatistikler
    addCorrect() {
        this.data.totalCorrect++;
        this.save();
    },

    addWrong() {
        this.data.totalWrong++;
        this.save();
    },

    getStats() {
        return {
            totalCorrect: this.data.totalCorrect,
            totalWrong: this.data.totalWrong,
            maxStreak: this.data.maxStreak,
            totalScore: this.data.totalScore || 0,
        };
    },

    // XP islemleri
    addXP(amount) {
        this.data.xp += amount;
        this.data.xpLevel = this.calculateXPLevel(this.data.xp);
        this.save();
    },

    getXP() {
        return this.data.xp;
    },

    getXPLevel() {
        return this.data.xpLevel;
    },

    calculateXPLevel(xp) {
        if (xp >= 12000) return 7;
        if (xp >= 8000) return 6;
        if (xp >= 5000) return 5;
        if (xp >= 3000) return 4;
        if (xp >= 1500) return 3;
        if (xp >= 500) return 2;
        return 1;
    },

    getXPProgress() {
        const xp = this.data.xp;
        const level = this.data.xpLevel;
        const thresholds = [0, 500, 1500, 3000, 5000, 8000, 12000, 20000];
        const currentMin = thresholds[level - 1] || 0;
        const currentMax = thresholds[level] || 20000;
        return Math.round(((xp - currentMin) / (currentMax - currentMin)) * 100);
    },

    // Hata kaydetme
    recordError(levelId, questionId, errorType, tagName) {
        if (!Array.isArray(this.data.errorHistory)) {
            this.data.errorHistory = [];
        }
        this.data.errorHistory.push({
            levelId,
            questionId,
            errorType,
            tagName,
            timestamp: new Date().toISOString(),
        });
        // Son 100 hatayi sakla
        if (this.data.errorHistory.length > 100) {
            this.data.errorHistory = this.data.errorHistory.slice(-100);
        }
        this.save();
        // Backend'e kaydet
        if (API.isOnline) {
            API.recordError(levelId, questionId, errorType, tagName).catch(() => {});
        }
    },

    // Soru gecmisi kaydetme
    recordQuestion(levelId, questionId, correct, tryNumber, hintUsed, timeSpent) {
        const key = `${levelId}-${questionId}`;
        if (!this.data.questionHistory) this.data.questionHistory = {};
        this.data.questionHistory[key] = {
            correct,
            tryNumber,
            hintUsed,
            timeSpent,
            timestamp: new Date().toISOString(),
        };
        this.save();
        // Backend'e kaydet
        if (API.isOnline) {
            API.recordQuestion(levelId, questionId, correct, tryNumber, hintUsed, timeSpent).catch(() => {});
        }
    },

    // Ipucu istatistikleri
    recordHintUse(levelId, tagName) {
        if (!this.data.hintStats) {
            this.data.hintStats = { totalUsed: 0, byLevel: {}, byTag: {} };
        }
        this.data.hintStats.totalUsed++;
        this.data.hintStats.byLevel[levelId] = (this.data.hintStats.byLevel[levelId] || 0) + 1;
        if (tagName) {
            this.data.hintStats.byTag[tagName] = (this.data.hintStats.byTag[tagName] || 0) + 1;
        }
        this.save();
    },

    // Seviye deneme sayisi
    recordLevelAttempt(levelId) {
        if (!this.data.levelAttempts) this.data.levelAttempts = {};
        this.data.levelAttempts[levelId] = (this.data.levelAttempts[levelId] || 0) + 1;
        this.save();
    },

    getLevelAttempts(levelId) {
        return (this.data.levelAttempts || {})[levelId] || 0;
    },

    // Süre takibi
    startSession() {
        this.data.sessionStartTime = Date.now();
        this.save();
    },

    endSession() {
        if (this.data.sessionStartTime) {
            const elapsed = Math.floor((Date.now() - this.data.sessionStartTime) / 1000);
            this.data.totalPlayTime += elapsed;
            this.data.sessionStartTime = null;
            this.save();
        }
    },

    updateLastPlayed() {
        this.data.lastPlayed = new Date().toISOString();
        this.save();
    },

    getTotalPlayTime() {
        let total = this.data.totalPlayTime || 0;
        if (this.data.sessionStartTime) {
            total += Math.floor((Date.now() - this.data.sessionStartTime) / 1000);
        }
        return total;
    },

    formatPlayTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h > 0) return `${h}sa ${m}dk`;
        return `${m}dk`;
    },

    // Rozet islemleri
    addBadge(badgeId) {
        if (!Array.isArray(this.data.badges)) this.data.badges = [];
        if (!this.data.badges.includes(badgeId)) {
            this.data.badges.push(badgeId);
            this.save();
            // Backend'e kaydet
            if (API.isOnline) {
                API.addBadge(badgeId).catch(() => {});
            }
            return true; // yeni rozet
        }
        return false; // zaten var
    },

    getBadges() {
        return this.data.badges || [];
    },

    hasBadge(badgeId) {
        return (this.data.badges || []).includes(badgeId);
    },

    // Oyunu sifirla
    reset() {
        this.data = {
            playerName: this.data.playerName,
            currentLevel: 1,
            currentQuestion: 0,
            score: 0,
            totalScore: this.data.totalScore || 0,
            lives: 5,
            streak: 0,
            maxStreak: 0,
            completedLevels: {},
            totalCorrect: 0,
            totalWrong: 0,
            xp: 0,
            xpLevel: 1,
            lastPlayed: new Date().toISOString(),
            totalPlayTime: 0,
            sessionStartTime: null,
            badges: [],
            errorHistory: [],
            questionHistory: {},
            hintStats: { totalUsed: 0, byLevel: {}, byTag: {} },
            levelAttempts: {},
        };
        this.save();
    },

    // Tamamlanmis seviye guncelleme (yeni alanlarla)
    completeLevelExtended(levelId, stars, score, correctRate, timeSpent, hintsUsed) {
        const existing = this.data.completedLevels[levelId] || {};
        this.data.completedLevels[levelId] = {
            stars: Math.max(stars, existing.stars || 0),
            score: Math.max(score, existing.score || 0),
            completed: true,
            attempts: (existing.attempts || 0) + 1,
            timeSpent: (existing.timeSpent || 0) + timeSpent,
            hintsUsed: (existing.hintsUsed || 0) + hintsUsed,
            correctRate: Math.max(correctRate, existing.correctRate || 0),
            xpEarned: (existing.xpEarned || 0) + Math.round(correctRate * 100),
            lastAttempt: new Date().toISOString(),
        };
        this.save();
    },

    getLevelData(levelId) {
        return this.data.completedLevels[levelId] || null;
    },
};

/* ============================================
   EKRAN YONETIMI
   ============================================ */
const Screens = {
    currentScreen: null,

    show(screenId) {
        // Tum ekranlari gizle
        document.querySelectorAll(".screen").forEach((s) => {
            s.classList.remove("screen--active");
            s.classList.add("screen--hidden");
        });

        // Hedef ekrani goster
        const screen = document.getElementById("screen-" + screenId);
        if (screen) {
            screen.classList.remove("screen--hidden");
            screen.classList.add("screen--active");
            this.currentScreen = screenId;

            // Ekrana gore islemler
            if (screenId === "level-select") {
                LevelSelect.render();
            } else if (screenId === "report") {
                ReportRenderer.renderStudentReport("report-content");
                BadgeSystem.checkBadges();
            }
        }
    },

    // Overlay goster/gizle
    showOverlay(overlayId) {
        const overlay = document.getElementById(overlayId);
        if (overlay) {
            overlay.classList.remove("overlay--hidden");
        }
    },

    hideOverlay(overlayId) {
        const overlay = document.getElementById(overlayId);
        if (overlay) {
            overlay.classList.add("overlay--hidden");
        }
    },
};

/* ============================================
   PUANLAMA SISTEMI
   ============================================ */
const Scoring = {
    config: {
        correctFirstTry: 100,
        correctSecondTry: 70,
        correctWithHint: 50,
        correctThirdTry: 30,
        streak3: 30,
        streak5: 75,
        streak10: 200,
        speedBonus: 50,
        hintPenalty: 20,
    },

    calculateCorrect(tryNumber, hintUsed) {
        let base = 0;
        if (hintUsed) {
            base = this.config.correctWithHint;
        } else {
            switch (tryNumber) {
                case 1:
                    base = this.config.correctFirstTry;
                    break;
                case 2:
                    base = this.config.correctSecondTry;
                    break;
                default:
                    base = this.config.correctThirdTry;
            }
        }
        return base;
    },

    calculateStreakBonus(streak) {
        if (streak >= 10) return this.config.streak10;
        if (streak >= 5) return this.config.streak5;
        if (streak >= 3) return this.config.streak3;
        return 0;
    },

    calculateXP(tryNumber, hintUsed) {
        let xp = 10;
        if (tryNumber === 1) xp += 5;
        if (!hintUsed) xp += 5;
        return xp;
    },

    onCorrect(tryNumber, hintUsed) {
        const base = this.calculateCorrect(tryNumber, hintUsed);
        const streakBonus = this.calculateStreakBonus(GameState.getStreak() + 1);
        const total = base + streakBonus;

        GameState.addScore(total);
        GameState.incrementStreak();
        GameState.addCorrect();

        const xpGain = this.calculateXP(tryNumber, hintUsed);
        GameState.addXP(xpGain);

        return { base, streakBonus, total, xpGain };
    },

    onWrong() {
        GameState.resetStreak();
        GameState.loseLife();
        GameState.addWrong();
    },
};

/* ============================================
   IPUCU SISTEMI
   ============================================ */
const HintSystem = {
    currentHint: null,

    show(hintText) {
        this.currentHint = hintText;
        const content = document.getElementById("hint-content");
        if (content) {
            content.innerHTML = `<p>${UI.escapeHtml(hintText)}</p>`;
        }
        Screens.showOverlay("hint-overlay");
    },

    useHint() {
        GameState.addScore(-Scoring.config.hintPenalty);

        const question = Game.currentLevel?.questions[Game.currentQuestionIndex];
        const tagName = Game.extractTagName ? Game.extractTagName(question) : "diger";
        GameState.recordHintUse(Game.currentLevel?.id || 0, tagName);

        Game.hintUsed = true;
        this.close();
        Screens.hideOverlay("hint-overlay");
        UI.showToast("Ipucu kullanildi! -20 puan", "warning");
    },

    close() {
        Screens.hideOverlay("hint-overlay");
        this.currentHint = null;
    },
};

/* ============================================
   SEVIYE SECIM EKRANI
   ============================================ */
const LevelSelect = {
    render() {
        const grid = document.getElementById("level-grid");
        if (!grid) {
            console.error("level-grid elementi bulunamadi!");
            return;
        }
        const playerNameEl = document.getElementById("display-player-name");
        const totalScoreEl = document.getElementById("display-total-score");

        // Oyuncu bilgilerini goster
        if (playerNameEl) {
            playerNameEl.textContent = GameState.getPlayerName();
        }
        if (totalScoreEl) {
            totalScoreEl.textContent = GameState.getTotalScore();
        }

        // Seviye kartlarini olustur
        grid.innerHTML = "";
        if (typeof LEVELS === "undefined" || !Array.isArray(LEVELS)) {
            console.error("LEVELS dizisi tanimli degil!");
            grid.innerHTML = '<p style="text-align:center;color:var(--color-text-secondary);padding:2rem;">Seviyeler yuklenemedi. Sayfayi yenileyin.</p>';
            return;
        }
        LEVELS.forEach((level) => {
            const isCompleted = GameState.isLevelCompleted(level.id);
            const stars = GameState.getLevelStars(level.id);
            const isLocked =
                level.id > 1 &&
                !GameState.isLevelCompleted(level.id - 1) &&
                !isCompleted;
            const isCurrent =
                level.id === GameState.getCurrentLevel() && !isCompleted;

            const card = document.createElement("div");
            card.className = `level-card ${
                isCompleted
                    ? "level-card--completed"
                    : isLocked
                    ? "level-card--locked"
                    : isCurrent
                    ? "level-card--current"
                    : ""
            }`;

            // Yildizlari olustur
            let starsHtml = "";
            for (let i = 0; i < 3; i++) {
                starsHtml += `<span class="star ${
                    i < stars ? "star--active" : ""
                }">&#9733;</span>`;
            }

            // Etiketleri olustur
            let tagsHtml = "";
            if (level.tags) {
                tagsHtml = level.tags
                    .map(
                        (tag) =>
                            `<span class="level-tag">${UI.escapeHtml(tag)}</span>`
                    )
                    .join("");
            }

            card.innerHTML = `
                <div class="level-card-header">
                    <span class="level-number">${level.icon || level.id}</span>
                    ${
                        isLocked
                            ? '<span class="level-lock">&#128274;</span>'
                            : ""
                    }
                </div>
                <h3 class="level-card-title">${UI.escapeHtml(level.name)}</h3>
                <p class="level-card-description">${UI.escapeHtml(
                    level.description
                )}</p>
                <div class="level-tags">${tagsHtml}</div>
                <div class="level-stars">${starsHtml}</div>
            `;

            // Tıklama olayi
            if (!isLocked) {
                card.addEventListener("click", () => {
                    Game.startLevel(level.id);
                });
                card.setAttribute("tabindex", "0");
                card.setAttribute(
                    "role",
                    "button"
                );
                card.setAttribute(
                    "aria-label",
                    `Seviye ${level.id}: ${level.name}`
                );
                card.addEventListener("keydown", (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        Game.startLevel(level.id);
                    }
                });
            }

            grid.appendChild(card);
        });
    },
};

/* ============================================
   OYUN ANA MODULU
   ============================================ */
const Game = {
    currentLevel: null,
    currentQuestionIndex: 0,
    questionStartTime: 0,
    tryNumber: 0,
    hintUsed: false,
    selectedOption: null,
    isAnswered: false,

    // Secenekleri karistir (Fisher-Yates) - orijinal indeksleri dondurur
    shuffleIndices(n) {
        const indices = Array.from({ length: n }, (_, i) => i);
        for (let i = n - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        return indices;
    },

    startLevel(levelId) {
        const level = LEVELS.find((l) => l.id === levelId);
        if (!level) return;

        this.currentLevel = level;
        this.currentQuestionIndex = 0;
        GameState.setCurrentLevel(levelId);
        GameState.setCurrentQuestion(0);
        GameState.resetLives();
        GameState.resetStreak();
        // Yeni level basinda puani sifirla
        GameState.data.score = 0;
        GameState.save();

        // Sure takibi ve deneme kaydi
        GameState.startSession();
        GameState.recordLevelAttempt(levelId);
        GameState.updateLastPlayed();

        Screens.show("game");
        this.renderQuestion();
    },

    renderQuestion() {
        const level = this.currentLevel;
        if (!level) return;

        const qIndex = this.currentQuestionIndex;
        if (qIndex >= level.questions.length) {
            this.completeLevel();
            return;
        }

        const question = level.questions[qIndex];
        this.tryNumber = 0;
        this.hintUsed = false;
        this.selectedOption = null;
        this.isAnswered = false;
        this.questionStartTime = Date.now();

        // Header guncelle
        document.getElementById("game-level-name").textContent =
            level.icon + " " + level.name;
        document.getElementById("question-counter").textContent =
            `${qIndex + 1} / ${level.questions.length}`;
        document.getElementById("game-score").textContent =
            GameState.getScore();

        // Ilerleme cubugu
        const progress =
            ((qIndex) / level.questions.length) * 100;
        document.getElementById("progress-bar").style.width =
            progress + "%";

        // Can gosterimi
        this.renderLives();

        // Soru tipine gore render et
        const questionArea = document.getElementById("question-area");
        const answerArea = document.getElementById("answer-area");
        const submitBtn = document.getElementById("btn-submit-answer");

        // Buton durumunu sifirla
        submitBtn.disabled = true;
        submitBtn.textContent = "Gonder";

        switch (question.type) {
            case "multiple-choice":
                this.renderMultipleChoice(question, questionArea, answerArea);
                break;
            case "code-fill":
                this.renderCodeFill(question, questionArea, answerArea);
                break;
            case "code-write":
                // Kod yazma ekranina yonlendir
                this.openCodeEditor(question);
                return;
            case "code-fix":
                this.renderCodeFix(question, questionArea, answerArea);
                break;
            case "predict":
                this.renderPredict(question, questionArea, answerArea);
                break;
            default:
                this.renderMultipleChoice(question, questionArea, answerArea);
        }
    },

    renderLives() {
        const livesContainer = document.getElementById("lives-display");
        const lives = GameState.getLives();
        let html = "";
        for (let i = 0; i < 5; i++) {
            html += `<span class="life ${
                i >= lives ? "life--lost" : ""
            }">&#10084;</span>`;
        }
        livesContainer.innerHTML = html;
    },

    // Coktan secmeli soru
    renderMultipleChoice(question, questionArea, answerArea) {
        // Soru metni
        let html = `<p class="question-text">${UI.escapeHtml(
            question.question
        )}</p>`;

        // Varsa kod bloğu
        if (question.code && Array.isArray(question.code)) {
            html += `<div class="question-code"><pre>${question.code
                .map((line) => UI.escapeHtml(line))
                .join("\n")}</pre></div>`;
        }

        questionArea.innerHTML = html;

        // Secenekler (karisik sirada, A/B/C/D gorunen siraya gore)
        const letters = ["A", "B", "C", "D"];
        const order = this.shuffleIndices(question.options.length);
        let optionsHtml = '<div class="options-grid">';
        order.forEach((origIdx, displayPos) => {
            const opt = question.options[origIdx];
            optionsHtml += `
                <div class="option-card" data-index="${origIdx}" role="button" tabindex="0"
                     aria-label="Secenek ${letters[displayPos]}: ${UI.escapeHtml(opt)}">
                    <span class="option-letter">${letters[displayPos]}</span>
                    <span class="option-text">${UI.escapeHtml(opt)}</span>
                </div>
            `;
        });
        optionsHtml += "</div>";
        answerArea.innerHTML = optionsHtml;

        // Secenek tiklama olaylari
        answerArea.querySelectorAll(".option-card").forEach((card) => {
            const handler = () => {
                if (this.isAnswered) return;
                answerArea
                    .querySelectorAll(".option-card")
                    .forEach((c) =>
                        c.classList.remove("option-card--selected")
                    );
                card.classList.add("option-card--selected");
                this.selectedOption = parseInt(card.dataset.index);
                document.getElementById("btn-submit-answer").disabled =
                    false;
            };
            card.addEventListener("click", handler);
            card.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handler();
                }
            });
        });
    },

    // Kod doldurma sorusu
    renderCodeFill(question, questionArea, answerArea) {
        // Soru metni
        let html = `<p class="question-text">${UI.escapeHtml(
            question.question
        )}</p>`;
        questionArea.innerHTML = html;

        // Kod alani (bosluklu)
        let codeHtml =
            '<div class="code-fill-area"><div class="code-fill-line">';
        let blankIndex = 0;
        question.template.forEach((line) => {
            // Bosluklari bul ve input ile degistir
            let processedLine = line;
            if (question.blanks && blankIndex < question.blanks.length) {
                if (line.includes("____")) {
                    processedLine = line.replace(
                        "____",
                        `<input type="text" class="code-blank" data-blank="${blankIndex}" 
                                placeholder="?" maxlength="50" 
                                style="font-family: var(--font-code); font-size: 0.95rem;"
                                aria-label="Bos alan ${blankIndex + 1}">`
                    );
                    blankIndex++;
                }
            }
            // processedLine zaten HTML entity iceriyor (&lt; vb.), innerHTML ile dogrudan ekle
            codeHtml += `<div style="font-family: var(--font-code); white-space: pre;">${processedLine}</div>`;
        });
        codeHtml += "</div></div>";
        answerArea.innerHTML = codeHtml;

        // Input olaylari
        answerArea.querySelectorAll(".code-blank").forEach((input) => {
            input.addEventListener("input", () => {
                // Butonu aktif et
                const allBlanks = answerArea.querySelectorAll(".code-blank");
                const allFilled = Array.from(allBlanks).every(
                    (b) => b.value.trim() !== ""
                );
                document.getElementById("btn-submit-answer").disabled =
                    !allFilled;
            });
        });
    },

    // Kod duzeltme sorusu
    renderCodeFix(question, questionArea, answerArea) {
        let html = `<p class="question-text">${UI.escapeHtml(
            question.question
        )}</p>`;

        // Hatali kodu goster
        if (question.code && Array.isArray(question.code)) {
            html += `<div class="question-code"><pre>${question.code
                .map((line, idx) => {
                    const lineNum = (idx + 1).toString().padStart(2, " ");
                    return `<span style="color: var(--color-text-muted);">${lineNum}:</span> ${UI.escapeHtml(line)}`;
                })
                .join("\n")}</pre></div>`;
        }

        questionArea.innerHTML = html;

        // Hatalari sec
        let optionsHtml =
            '<p style="color: var(--color-text-secondary); margin-bottom: var(--space-md);">Kod kac hatali satir iceriyor?</p>';
        optionsHtml += '<div class="options-grid">';
        const maxErrors = Math.min(question.errors.length + 2, 5);
        for (let i = 1; i <= maxErrors; i++) {
            optionsHtml += `
                <div class="option-card" data-index="${i}" role="button" tabindex="0">
                    <span class="option-letter">${i}</span>
                    <span class="option-text">${i} hata</span>
                </div>
            `;
        }
        optionsHtml += "</div>";
        answerArea.innerHTML = optionsHtml;

        // Secenek tiklama
        answerArea.querySelectorAll(".option-card").forEach((card) => {
            const handler = () => {
                if (this.isAnswered) return;
                answerArea
                    .querySelectorAll(".option-card")
                    .forEach((c) =>
                        c.classList.remove("option-card--selected")
                    );
                card.classList.add("option-card--selected");
                this.selectedOption = parseInt(card.dataset.index);
                document.getElementById("btn-submit-answer").disabled =
                    false;
            };
            card.addEventListener("click", handler);
            card.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handler();
                }
            });
        });
    },

    // Tahmin sorusu
    renderPredict(question, questionArea, answerArea) {
        let html = `<p class="question-text">${UI.escapeHtml(
            question.question
        )}</p>`;

        // Kodu goster
        if (question.code && Array.isArray(question.code)) {
            html += `<div class="question-code"><pre>${question.code
                .map((line) => UI.escapeHtml(line))
                .join("\n")}</pre></div>`;
        }

        questionArea.innerHTML = html;

        // Secenekler (karisik sirada)
        const letters = ["A", "B", "C", "D"];
        const order = this.shuffleIndices(question.options.length);
        let optionsHtml = '<div class="options-grid">';
        order.forEach((origIdx, displayPos) => {
            const opt = question.options[origIdx];
            optionsHtml += `
                <div class="option-card" data-index="${origIdx}" role="button" tabindex="0">
                    <span class="option-letter">${letters[displayPos]}</span>
                    <span class="option-text">${UI.escapeHtml(opt)}</span>
                </div>
            `;
        });
        optionsHtml += "</div>";
        answerArea.innerHTML = optionsHtml;

        // Secenek tiklama
        answerArea.querySelectorAll(".option-card").forEach((card) => {
            const handler = () => {
                if (this.isAnswered) return;
                answerArea
                    .querySelectorAll(".option-card")
                    .forEach((c) =>
                        c.classList.remove("option-card--selected")
                    );
                card.classList.add("option-card--selected");
                this.selectedOption = parseInt(card.dataset.index);
                document.getElementById("btn-submit-answer").disabled =
                    false;
            };
            card.addEventListener("click", handler);
            card.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handler();
                }
            });
        });
    },

    // Cevabi kontrol et
    checkAnswer() {
        if (this.isAnswered) return;

        const question =
            this.currentLevel.questions[this.currentQuestionIndex];

        let isCorrect = false;

        if (question.type === "code-fill") {
            // Code-fill: input degerlerini blanks ile karsilastir
            const inputs = document.querySelectorAll(".code-blank");
            if (inputs.length === 0) return;

            // Buton durumunu kontrol et
            const allFilled = Array.from(inputs).every(
                (b) => b.value.trim() !== ""
            );
            if (!allFilled) return;

            this.isAnswered = true;
            this.tryNumber++;

            // Her input degerini ilgili blank ile karsilastir
            let allCorrect = true;
            inputs.forEach((input, idx) => {
                const userVal = input.value.trim().toLowerCase();
                const expected = (question.blanks[idx] || "").toLowerCase();
                if (userVal !== expected) {
                    allCorrect = false;
                    input.style.borderColor = "var(--color-error)";
                    input.style.background = "rgba(255, 23, 68, 0.15)";
                } else {
                    input.style.borderColor = "var(--color-success)";
                    input.style.background = "rgba(0, 200, 83, 0.15)";
                }
            });
            isCorrect = allCorrect;
        } else {
            // Diger soru turleri icin secenek kontrolu
            if (this.selectedOption === null) return;

            this.isAnswered = true;
            this.tryNumber++;

            switch (question.type) {
                case "multiple-choice":
                case "predict":
                    isCorrect = this.selectedOption === question.correct;
                    break;
                case "code-fix":
                    isCorrect =
                        this.selectedOption === question.errors.length;
                    break;
                default:
                    isCorrect = this.selectedOption === question.correct;
            }

            // Gorsel geri bildirim (secenekli sorular)
            const options = document.querySelectorAll(".option-card");
            options.forEach((opt) => {
                const idx = parseInt(opt.dataset.index);
                if (
                    question.type === "multiple-choice" ||
                    question.type === "predict"
                ) {
                    if (idx === question.correct) {
                        opt.classList.add("option-card--correct");
                    } else if (
                        idx === this.selectedOption &&
                        !isCorrect
                    ) {
                        opt.classList.add("option-card--wrong");
                    }
                } else if (question.type === "code-fix") {
                    if (idx === question.errors.length) {
                        opt.classList.add("option-card--correct");
                    } else if (
                        idx === this.selectedOption &&
                        !isCorrect
                    ) {
                        opt.classList.add("option-card--wrong");
                    }
                }
            });
        }

        // Süre hesapla
        const timeSpent = Math.round((Date.now() - this.questionStartTime) / 1000);

        // Soru gecmisini kaydet
        GameState.recordQuestion(
            this.currentLevel.id,
            this.currentQuestionIndex,
            isCorrect,
            this.tryNumber,
            this.hintUsed,
            timeSpent
        );

        // Sonuc
        if (isCorrect) {
            const result = Scoring.onCorrect(
                this.tryNumber,
                this.hintUsed
            );
            setTimeout(() => {
                this.showFeedback(true, result, question);
            }, 500);
        } else {
            Scoring.onWrong();

            // Hata detayini kaydet
            const errorType = this.classifyError(question);
            const tagName = this.extractTagName(question);
            GameState.recordError(
                this.currentLevel.id,
                this.currentQuestionIndex,
                errorType,
                tagName
            );

            this.renderLives();

            if (GameState.getLives() <= 0) {
                setTimeout(() => {
                    this.gameOver();
                }, 500);
            } else {
                setTimeout(() => {
                    this.showFeedback(false, null, question);
                }, 500);
            }
        }
    },

    // Hata turunu siniflandir
    classifyError(question) {
        if (question.type === "code-fill") return "yanlis-doldurma";
        if (question.type === "code-fix") return "hata-bulma";
        if (question.type === "code-write") return "kod-yazma";
        if (question.type === "predict") return "yanlis-tahmin";
        return "yanlis-secim";
    },

    // Sorudan HTML etiketini cikar
    extractTagName(question) {
        const text = (question.question || "") + " " + (question.code || []).join(" ");
        const match = text.match(/<(\w+)/);
        return match ? match[1].toLowerCase() : "diger";
    },

    // Geri bildirim goster
    showFeedback(isCorrect, result, question) {
        const overlay = document.getElementById("feedback-overlay");
        const icon = document.getElementById("feedback-icon");
        const title = document.getElementById("feedback-title");
        const message = document.getElementById("feedback-message");
        const points = document.getElementById("feedback-points");
        const explanation = document.getElementById(
            "feedback-explanation"
        );

        if (isCorrect) {
            icon.innerHTML = "&#10004;";
            icon.className = "feedback-icon feedback-icon--correct";
            title.textContent = "Dogru!";
            title.className =
                "feedback-title feedback-title--correct";
            message.textContent = "Harika is çıkardın!";
            points.innerHTML = `+${result.total} puan${
                result.streakBonus > 0
                    ? ` (Streak bonusu: +${result.streakBonus})`
                    : ""
            }`;
            points.style.display = "block";
        } else {
            icon.innerHTML = "&#10008;";
            icon.className = "feedback-icon feedback-icon--wrong";
            title.textContent = "Yanlis!";
            title.className = "feedback-title feedback-title--wrong";
            message.textContent = "Tekrar dene, yapabilirsin!";
            points.style.display = "none";
        }

        // Aciklama
        if (question.explanation) {
            explanation.innerHTML = `<strong>Aciklama:</strong> ${UI.escapeHtml(
                question.explanation
            )}`;
            explanation.style.display = "block";
        } else {
            explanation.style.display = "none";
        }

        // Buton yazisini guncelle
        const nextBtn = document.getElementById("btn-next-question");
        if (
            this.currentQuestionIndex >=
            this.currentLevel.questions.length - 1
        ) {
            nextBtn.textContent = "Sonuclari Goster";
        } else {
            nextBtn.textContent = "Sonraki Soru →";
        }

        Screens.showOverlay("feedback-overlay");
    },

    // Sonraki soruya gec
    nextQuestion() {
        Screens.hideOverlay("feedback-overlay");
        this.currentQuestionIndex++;
        GameState.setCurrentQuestion(this.currentQuestionIndex);

        // Buton durumunu sifirla
        document.getElementById("btn-submit-answer").disabled = true;

        this.renderQuestion();
    },

    // Kod editörünü aç
    openCodeEditor(question) {
        Screens.show("code-editor");

        // Süre takibini baslat
        this.questionStartTime = Date.now();

        // Gorev aciklamasini doldur
        const taskEl = document.getElementById("editor-task");
        let taskHtml = `<p class="editor-task-question">${UI.escapeHtml(
            question.question
        )}</p>`;

        if (question.requirements) {
            taskHtml += '<ul class="editor-task-requirements">';
            question.requirements.forEach((req) => {
                taskHtml += `<li>${UI.escapeHtml(req)}</li>`;
            });
            taskHtml += "</ul>";
        }

        taskEl.innerHTML = taskHtml;

        // Editoru sifirla
        const textarea = document.getElementById("code-input");
        textarea.value = "";
        Editor.updateLineNumbers();
        Preview.clear();

        // Ipucu butonunu ayarla
        document.getElementById("btn-hint-editor").onclick = () => {
            HintSystem.show(question.hint);
        };
    },

    // Kodu kontrol et (editor)
    checkCode() {
        const question =
            this.currentLevel.questions[this.currentQuestionIndex];
        if (!question || question.type !== "code-write") return;

        const code = document.getElementById("code-input").value.trim();

        // Boss mu kontrol
        if (!code) {
            UI.showToast("Lutfen kod yazin!", "warning");
            return;
        }

        let isCorrect = true;
        const validation = question.validation;

        // Zorunlu icerik kontrolu
        if (validation.mustContain) {
            for (const item of validation.mustContain) {
                if (!code.includes(item)) {
                    isCorrect = false;
                    break;
                }
            }
        }

        // Tek birini icerme kontrolu
        if (isCorrect && validation.mustContainOne) {
            const hasOne = validation.mustContainOne.some((item) =>
                code.includes(item)
            );
            if (!hasOne) {
                isCorrect = false;
            }
        }

        // Tek birini kesinlikle icerme kontrolu
        if (isCorrect && validation.mustContainOneStrict) {
            const hasOne = validation.mustContainOneStrict.some(
                (item) => code.includes(item)
            );
            if (!hasOne) {
                isCorrect = false;
            }
        }

        // Icerik kontrolu
        if (isCorrect && validation.contentCheck) {
            if (!code.includes(validation.contentCheck)) {
                isCorrect = false;
            }
        }

        // Sonuc
        this.tryNumber++;

        // Süre hesapla
        const timeSpent = Math.round((Date.now() - this.questionStartTime) / 1000);

        if (isCorrect) {
            const result = Scoring.onCorrect(
                this.tryNumber,
                this.hintUsed
            );

            // Soru gecmisini kaydet
            GameState.recordQuestion(
                this.currentLevel.id,
                this.currentQuestionIndex,
                true,
                this.tryNumber,
                this.hintUsed,
                timeSpent
            );

            UI.showToast(
                `Dogru! +${result.total} puan`,
                "success"
            );

            // Oyun ekranina don ve basariyi goster
            setTimeout(() => {
                Screens.show("game");
                this.showFeedback(true, result, question);
            }, 500);
        } else {
            Scoring.onWrong();

            // Soru gecmisini kaydet
            GameState.recordQuestion(
                this.currentLevel.id,
                this.currentQuestionIndex,
                false,
                this.tryNumber,
                this.hintUsed,
                timeSpent
            );

            // Hata detayini kaydet
            GameState.recordError(
                this.currentLevel.id,
                this.currentQuestionIndex,
                "kod-yazma",
                this.extractTagName(question)
            );

            this.renderLives();

            if (GameState.getLives() <= 0) {
                setTimeout(() => {
                    this.gameOver();
                }, 500);
            } else {
                UI.showToast("Hatali kod! Tekrar deneyin.", "error");
                // Editorde kalmaya devam et
            }
        }
    },

    // Seviyeyi tamamla
    completeLevel() {
        const level = this.currentLevel;
        const stats = GameState.getStats();
        const totalQuestions = level.questions.length;
        const correctRate = stats.totalCorrect / totalQuestions;

        // Yildiz hesapla
        let stars = 0;
        if (correctRate >= 0.9) stars = 3;
        else if (correctRate >= 0.7) stars = 2;
        else if (correctRate >= 0.5) stars = 1;

        // Süre hesapla
        const timeSpent = GameState.getTotalPlayTime();

        // Ipucu sayisini al
        const hintsUsed = (GameState.data.hintStats?.byLevel?.[level.id]) || 0;

        // Seviyeyi tamamla (genisletilmis)
        GameState.completeLevel(level.id, stars, GameState.getScore());
        GameState.completeLevelExtended(level.id, stars, GameState.getScore(), correctRate, timeSpent, hintsUsed);

        // "Ne Ogrendin?" ozetini goster (varsa)
        if (level.summary) {
            this.showSummary(level, stars, stats, totalQuestions);
        } else {
            // Ozet yoksa direk sonuc ekranina git
            this.showGameOverScreen(level, stars, stats, totalQuestions);
        }

        // Istatistikleri sifirla
        GameState.data.totalCorrect = 0;
        GameState.data.totalWrong = 0;
        GameState.save();
    },

    // "Ne Ogrendin?" ozetini goster
    showSummary(level, stars, stats, totalQuestions) {
        const titleEl = document.getElementById("summary-title");
        const contentEl = document.getElementById("summary-content");
        const statsEl = document.getElementById("summary-stats");

        // Baslik
        titleEl.textContent = level.summary.title || "Ne Ogrendin?";

        // Ogrendikleri listesi
        let listHtml = '<ul class="summary-list">';
        level.summary.items.forEach((item) => {
            listHtml += `<li>${item}</li>`;
        });
        listHtml += '</ul>';
        contentEl.innerHTML = listHtml;

        // Istatistikler
        statsEl.innerHTML = `
            <div class="summary-stat">
                <span class="summary-stat-value">${GameState.getScore()}</span>
                <span class="summary-stat-label">Puan</span>
            </div>
            <div class="summary-stat">
                <span class="summary-stat-value">${stars}</span>
                <span class="summary-stat-label">Yildiz</span>
            </div>
            <div class="summary-stat">
                <span class="summary-stat-value">${stats.totalCorrect}/${totalQuestions}</span>
                <span class="summary-stat-label">Dogru</span>
            </div>
        `;

        // Overlay'i goster
        Screens.showOverlay("summary-overlay");
    },

    // Sonuc ekranini goster
    showGameOverScreen(level, stars, stats, totalQuestions) {
        Screens.show("game-over");

        document.getElementById("game-over-message").textContent =
            `"${level.name}" seviyeyi tamamladin!`;
        document.getElementById("go-score").textContent =
            GameState.getScore();
        document.getElementById("go-stars").innerHTML =
            "&#9733;".repeat(stars) +
            "&#9734;".repeat(3 - stars);
        document.getElementById("go-correct").textContent =
            `${stats.totalCorrect}/${totalQuestions}`;

        // Konfeti
        UI.createConfetti("confetti");

        // Buton durumlari
        const hasNextLevel = LEVELS.some((l) => l.id === level.id + 1);
        document.getElementById("btn-next-level").style.display =
            hasNextLevel ? "inline-flex" : "none";
    },

    // Oyun bitti (can bitti)
    gameOver() {
        UI.showToast("Canlarin bitti! Tekrar dene.", "error");

        setTimeout(() => {
            Screens.show("game-over");
            document.getElementById("game-over-message").textContent =
                "Canlarin bitti! Tekrar dene.";
            document.getElementById("go-score").textContent =
                GameState.getScore();
            document.getElementById("go-stars").innerHTML =
                "&#9734;&#9734;&#9734;";
            document.getElementById("go-correct").textContent =
                "0/10";

            document.getElementById("btn-next-level").style.display =
                "none";

            // Istatistikleri sifirla
            GameState.data.totalCorrect = 0;
            GameState.data.totalWrong = 0;
            GameState.save();
        }, 500);
    },
};

/* ============================================
   KOD EDITORU MODULU
   ============================================ */
const Editor = {
    textarea: null,
    lineNumbers: null,

    init() {
        this.textarea = document.getElementById("code-input");
        this.lineNumbers = document.getElementById("line-numbers");

        if (!this.textarea) return;

        // Input olayi
        this.textarea.addEventListener("input", () => {
            this.updateLineNumbers();
            this.autoIndent();
            Preview.update(this.textarea.value);
        });

        // Tab tuşu
        this.textarea.addEventListener("keydown", (e) => {
            if (e.key === "Tab") {
                e.preventDefault();
                this.insertText("  ");
            }
            // Enter tusu - otomatik girinti
            if (e.key === "Enter") {
                // Otomatik girinti icin input event'inden sonra calisir
            }
        });

        // Scroll senkronizasyonu
        this.textarea.addEventListener("scroll", () => {
            this.lineNumbers.scrollTop = this.textarea.scrollTop;
        });
    },

    updateLineNumbers() {
        if (!this.textarea || !this.lineNumbers) return;

        const lines = this.textarea.value.split("\n").length;
        let html = "";
        for (let i = 1; i <= lines; i++) {
            html += `<div>${i}</div>`;
        }
        this.lineNumbers.innerHTML = html;
    },

    insertText(text) {
        const start = this.textarea.selectionStart;
        const end = this.textarea.selectionEnd;
        const value = this.textarea.value;

        this.textarea.value =
            value.substring(0, start) +
            text +
            value.substring(end);
        this.textarea.selectionStart = this.textarea.selectionEnd =
            start + text.length;

        this.updateLineNumbers();
        Preview.update(this.textarea.value);
    },

    autoIndent() {
        // Basit otomatik girinti
        // Enter tusuna basildiginda onceki satirin girintisini kopyala
    },

    clear() {
        if (this.textarea) {
            this.textarea.value = "";
            this.updateLineNumbers();
            Preview.clear();
        }
    },

    getCode() {
        return this.textarea ? this.textarea.value : "";
    },
};

/* ============================================
   GUVENLI HTML ONIZLEME
   ============================================ */
const Preview = {
    iframe: null,

    init() {
        this.iframe = document.getElementById("preview-frame");
    },

    update(code) {
        if (!this.iframe || !code) return;

        // Guvenli kod olustur
        const safeCode = this.sanitize(code);

        const fullHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { 
            font-family: Arial, sans-serif; 
            padding: 16px;
            margin: 0;
            line-height: 1.6;
            color: #333;
            background: #fff;
        }
        h1, h2, h3, h4, h5, h6 { margin-top: 0; }
        img { max-width: 100%; height: auto; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        form { margin: 16px 0; }
        label { display: block; margin-bottom: 4px; font-weight: bold; }
        input, textarea, select { 
            display: block;
            width: 100%;
            max-width: 300px;
            padding: 8px;
            margin-bottom: 12px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        button { 
            padding: 8px 16px;
            background: #e94560;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        hr { border: none; border-top: 1px solid #ccc; margin: 16px 0; }
        a { color: #e94560; }
    </style>
</head>
<body>
    ${safeCode}
</body>
</html>`;

        this.iframe.srcdoc = fullHTML;
    },

    clear() {
        if (this.iframe) {
            this.iframe.srcdoc = "";
        }
    },

    // Guvenlik: Tehlikeli icerikleri temizle
    sanitize(code) {
        let clean = code;

        // 1. Script etiketlerini kaldir
        clean = clean.replace(
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            ""
        );
        // Tek basina script acma etiketlerini de kaldir
        clean = clean.replace(/<script\b[^>]*>/gi, "");

        // 2. Event handler'lari kaldir
        clean = clean.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "");
        clean = clean.replace(/\son\w+\s*=\s*[^\s>]*/gi, "");

        // 3. javascript: URI'lerini kaldir
        clean = clean.replace(/href\s*=\s*["']javascript:/gi, 'href="#"');
        clean = clean.replace(/src\s*=\s*["']javascript:/gi, 'src=""');

        // 4. iframe embed'leri kaldir
        clean = clean.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, "");
        clean = clean.replace(/<iframe\b[^>]*>/gi, "");

        // 5. object ve embed'leri kaldir
        clean = clean.replace(/<object\b[^>]*>[\s\S]*?<\/object>/gi, "");
        clean = clean.replace(/<embed\b[^>]*>/gi, "");

        // 6. base etiketini kaldir
        clean = clean.replace(/<base\b[^>]*>/gi, "");

        return clean;
    },
};

/* ============================================
   UYGULAMA BASLATICI
   ============================================ */
const App = {
    init() {
        // Oyun durumunu yukle
        GameState.init();

        // Editor ve preview'i baslat
        Editor.init();
        Preview.init();

        // Buton olaylarini kur
        this.setupEventListeners();

        // Menu partikullerini olustur
        this.createMenuParticles();

        // Isim girdisini kontrol et
        const savedName = GameState.getPlayerName();
        if (savedName) {
            document.getElementById("player-name-input").value =
                savedName;
            document.getElementById("btn-continue-name").disabled =
                false;
        }

        // Auth UI'yi guncelle
        try {
            this.updateAuthUI();
        } catch (e) {
            console.warn("Auth UI guncellenemedi:", e);
        }

        // Backend'de oturum aciksa soru override'larini yukle
        if (API.isOnline) {
            QuestionOverrides.loadAndApply().then(() => {
                if (Screens.currentScreen === "level-select") {
                    LevelSelect.render();
                }
            });
        }

        console.log("Etiket Avcisi baslatildi!");
    },

    updateAuthUI() {
        const authButtons = document.getElementById("menu-auth-buttons");
        const authUser = document.getElementById("menu-auth-user");
        const userNameEl = document.getElementById("display-auth-user-name");

        if (API.isOnline && API.user) {
            authButtons.style.display = "none";
            authUser.style.display = "flex";
            userNameEl.textContent = API.user.fullName || API.user.username;
        } else {
            authButtons.style.display = "flex";
            authUser.style.display = "none";
        }
    },

    setupEventListeners() {
        // ---- ANA MENU ----
        document
            .getElementById("btn-start")
            .addEventListener("click", () => {
                const savedName = GameState.getPlayerName();
                if (savedName) {
                    Screens.show("level-select");
                } else {
                    Screens.show("player-name");
                }
            });

        document
            .getElementById("btn-how-to-play")
            .addEventListener("click", () => {
                document
                    .getElementById("modal-how-to-play")
                    .classList.remove("modal--hidden");
            });

        // Modal kapatma
        document
            .getElementById("modal-backdrop-htp")
            .addEventListener("click", () => {
                document
                    .getElementById("modal-how-to-play")
                    .classList.add("modal--hidden");
            });

        document
            .querySelectorAll(".modal-close")
            .forEach((btn) => {
                btn.addEventListener("click", () => {
                    document
                        .getElementById("modal-how-to-play")
                        .classList.add("modal--hidden");
                });
            });

        // ---- OYUNCU ADI ----
        document
            .getElementById("btn-back-menu")
            .addEventListener("click", () => {
                Screens.show("menu");
            });

        document
            .getElementById("player-name-input")
            .addEventListener("input", (e) => {
                const name = e.target.value.trim();
                document.getElementById(
                    "btn-continue-name"
                ).disabled = name.length < 2;
            });

        document
            .getElementById("player-name-input")
            .addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    const name = e.target.value.trim();
                    if (name.length >= 2) {
                        this.savePlayerName(name);
                    }
                }
            });

        document
            .getElementById("btn-continue-name")
            .addEventListener("click", () => {
                const name = document
                    .getElementById("player-name-input")
                    .value.trim();
                if (name.length >= 2) {
                    this.savePlayerName(name);
                }
            });

        document
            .getElementById("btn-random-name")
            .addEventListener("click", () => {
                const names = [
                    "Kod_Avcisi",
                    "Etiket_Ustasi",
                    "HTML_Hero",
                    "Dijital_Kesif",
                    "Pixel_Savasci",
                    "Kod_Laboratuvari",
                    "Web_Kahramani",
                    "Byte_Bilge",
                    "CSS_Cengaveri",
                    "Script_Sihirbazi",
                ];
                const random =
                    names[Math.floor(Math.random() * names.length)];
                document.getElementById("player-name-input").value =
                    random;
                document.getElementById(
                    "btn-continue-name"
                ).disabled = false;
            });

        document
            .querySelectorAll(".name-suggestion")
            .forEach((btn) => {
                btn.addEventListener("click", () => {
                    const name = btn.dataset.name;
                    document.getElementById(
                        "player-name-input"
                    ).value = name;
                    document.getElementById(
                        "btn-continue-name"
                    ).disabled = false;
                });
            });

        // ---- SEVIYE SECIM ----
        document
            .getElementById("btn-back-from-levels")
            .addEventListener("click", () => {
                // Menuye donerken puani sifirla
                GameState.data.score = 0;
                GameState.save();
                Screens.show("menu");
            });

        // ---- RAPOR EKRANI ----
        document
            .getElementById("btn-open-report")
            .addEventListener("click", () => {
                Screens.show("report");
            });

        document
            .getElementById("btn-back-from-report")
            .addEventListener("click", () => {
                Screens.show("level-select");
            });

        document
            .getElementById("btn-export-csv")
            .addEventListener("click", () => {
                ReportExporter.exportCSV();
            });

        document
            .getElementById("btn-export-print")
            .addEventListener("click", () => {
                window.print();
            });

        // ---- OYUN EKRANI ----
        document
            .getElementById("btn-exit-game")
            .addEventListener("click", () => {
                if (confirm("Oyundan cikmak istedigine emin misin?")) {
                    Screens.show("level-select");
                }
            });

        document
            .getElementById("btn-submit-answer")
            .addEventListener("click", () => {
                Game.checkAnswer();
            });

        document
            .getElementById("btn-hint")
            .addEventListener("click", () => {
                const question =
                    Game.currentLevel?.questions[
                        Game.currentQuestionIndex
                    ];
                if (question?.hint) {
                    HintSystem.show(question.hint);
                }
            });

        // ---- KOD EDITORU ----
        document
            .getElementById("btn-back-to-game")
            .addEventListener("click", () => {
                Screens.show("game");
            });

        document
            .getElementById("btn-clear-code")
            .addEventListener("click", () => {
                if (
                    confirm(
                        "Kodu sifirlamak istedigine emin misin?"
                    )
                ) {
                    Editor.clear();
                }
            });

        document
            .getElementById("btn-check-code")
            .addEventListener("click", () => {
                Game.checkCode();
            });

        // ---- FEEDBACK OVERLAY ----
        document
            .getElementById("btn-next-question")
            .addEventListener("click", () => {
                Game.nextQuestion();
            });

        // ---- IPUCU OVERLAY ----
        document
            .getElementById("btn-close-hint")
            .addEventListener("click", () => {
                HintSystem.close();
            });

        document
            .getElementById("btn-use-hint")
            .addEventListener("click", () => {
                HintSystem.useHint();
            });

        document
            .getElementById("btn-close-hint-btn")
            .addEventListener("click", () => {
                HintSystem.close();
            });

        // ---- NE OGRENDIN? OZET ----
        document
            .getElementById("btn-continue-to-results")
            .addEventListener("click", () => {
                Screens.hideOverlay("summary-overlay");
                // Mevcut seviyeyi al ve sonuc ekranini goster
                const level = Game.currentLevel;
                const stats = GameState.getStats();
                const totalQuestions = level.questions.length;
                const correctRate = stats.totalCorrect / totalQuestions;
                let stars = 0;
                if (correctRate >= 0.9) stars = 3;
                else if (correctRate >= 0.7) stars = 2;
                else if (correctRate >= 0.5) stars = 1;
                Game.showGameOverScreen(level, stars, stats, totalQuestions);
            });

        // ---- OYUN BITIS ----
        document
            .getElementById("btn-next-level")
            .addEventListener("click", () => {
                const nextLevelId =
                    Game.currentLevel.id + 1;
                const nextLevel = LEVELS.find(
                    (l) => l.id === nextLevelId
                );
                if (nextLevel) {
                    Game.startLevel(nextLevelId);
                } else {
                    Screens.show("all-complete");
                }
            });

        document
            .getElementById("btn-retry-level")
            .addEventListener("click", () => {
                Game.startLevel(Game.currentLevel.id);
            });

        document
            .getElementById("btn-back-to-levels")
            .addEventListener("click", () => {
                Screens.show("level-select");
            });

        // ---- TUM OYUN BITTI ----
        document
            .getElementById("btn-replay-all")
            .addEventListener("click", () => {
                GameState.reset();
                Screens.show("level-select");
            });

        document
            .getElementById("btn-back-menu-final")
            .addEventListener("click", () => {
                Screens.show("menu");
            });

        // ---- GIRIS/KAYIT ----
        const safeBind = (id, event, handler) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener(event, handler);
        };

        safeBind("btn-show-login", "click", () => Screens.show("login"));
        safeBind("btn-show-register", "click", () => Screens.show("register"));
        safeBind("btn-back-from-login", "click", () => Screens.show("menu"));
        safeBind("btn-back-from-register", "click", () => Screens.show("menu"));
        safeBind("btn-goto-register", "click", () => Screens.show("register"));
        safeBind("btn-goto-login", "click", () => Screens.show("login"));
        safeBind("btn-logout", "click", () => {
            API.logout();
            App.updateAuthUI();
            UI.showToast("Cikis yapildi.", "success");
            Screens.show("menu");
        });
        safeBind("btn-back-from-teacher", "click", () => Screens.show("menu"));
        safeBind("btn-teacher-refresh", "click", () => TeacherDashboard.load());

        // ---- OGRETMEN SEKMELERI ----
        const teacherTabs = document.getElementById("teacher-tabs");
        if (teacherTabs) {
            teacherTabs.addEventListener("click", (e) => {
                const tab = e.target.closest(".teacher-tab");
                if (!tab) return;
                TeacherDashboard.currentTab = tab.dataset.tab;
                TeacherDashboard.load();
            });
        }

        // ---- SORU EDITOR BUTONLARI ----
        safeBind("btn-close-question-editor", "click", () => TeacherDashboard.closeEditor());
        safeBind("btn-cancel-question", "click", () => TeacherDashboard.closeEditor());
        safeBind("btn-save-question", "click", () => TeacherDashboard.saveQuestion());

        // Overlay disini tiklayinca kapat
        const qEditorOverlay = document.getElementById("question-editor-overlay");
        if (qEditorOverlay) {
            qEditorOverlay.addEventListener("click", (e) => {
                if (e.target === qEditorOverlay) TeacherDashboard.closeEditor();
            });
        }

        // ---- OGRETMEN ICERIK DELEGASYONU ----
        const teacherContent = document.getElementById("teacher-content");
        if (teacherContent) {
            teacherContent.addEventListener("click", (e) => {
                const btn = e.target.closest("[data-action]");
                if (!btn) return;
                const action = btn.dataset.action;

                if (action === "add-question") {
                    TeacherDashboard.openNewQuestion(TeacherDashboard.selectedLevelId);
                } else if (action === "edit-question") {
                    TeacherDashboard.openEditor(
                        TeacherDashboard.selectedLevelId,
                        parseInt(btn.dataset.qid)
                    );
                } else if (action === "delete-question") {
                    TeacherDashboard.deleteQuestion(
                        TeacherDashboard.selectedLevelId,
                        parseInt(btn.dataset.qid),
                        btn.dataset.isnew === "1"
                    );
                } else if (action === "reset-level") {
                    TeacherDashboard.resetLevel();
                }
            });
        }

        const loginForm = document.getElementById("login-form");
        if (loginForm) loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const username = document.getElementById("login-username").value.trim();
            const password = document.getElementById("login-password").value;
            if (!username || !password) return;

            try {
                await API.login(username, password);
                await GameState.syncFromBackend();
                await QuestionOverrides.loadAndApply();
                UI.showToast("Giris basarili!", "success");
                App.updateAuthUI();
                if (API.user.role === "teacher") {
                    Screens.show("teacher");
                    TeacherDashboard.load();
                } else {
                    Screens.show("level-select");
                }
            } catch (err) {
                UI.showToast(err.message, "error");
            }
        });

        const registerForm = document.getElementById("register-form");
        if (registerForm) {
            // Rol degisince davet kodu alanini goster/gizle
            const roleSelect = document.getElementById("register-role");
            const inviteGroup = document.getElementById("register-invite-group");
            if (roleSelect && inviteGroup) {
                roleSelect.addEventListener("change", () => {
                    inviteGroup.style.display = roleSelect.value === "teacher" ? "block" : "none";
                });
            }

            registerForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                const fullName = document.getElementById("register-fullname").value.trim();
                const username = document.getElementById("register-username").value.trim();
                const email = document.getElementById("register-email").value.trim();
                const password = document.getElementById("register-password").value;
                const role = document.getElementById("register-role").value;
                const inviteCode = document.getElementById("register-invite-code").value.trim();
                if (!fullName || !username || !email || !password) return;

                if (role === "teacher" && !inviteCode) {
                    UI.showToast("Ogretmen kaydi icin davet kodu gerekli!", "warning");
                    return;
                }

                try {
                    await API.register(username, email, password, fullName, role, inviteCode);
                    await QuestionOverrides.loadAndApply();
                    UI.showToast("Kayit basarili!", "success");
                    App.updateAuthUI();
                    if (role === "teacher") {
                        Screens.show("teacher");
                        TeacherDashboard.load();
                    } else {
                        Screens.show("level-select");
                    }
                } catch (err) {
                    UI.showToast(err.message, "error");
                }
            });
        }

        // ---- KLAVYE KISAYOLLARI ----
        document.addEventListener("keydown", (e) => {
            // Escape tusu - overlay'lari kapat
            if (e.key === "Escape") {
                Screens.hideOverlay("feedback-overlay");
                Screens.hideOverlay("hint-overlay");
                // Soru editoru aciksa onu da kapat
                const qEditor = document.getElementById("question-editor-overlay");
                if (qEditor && !qEditor.classList.contains("overlay--hidden")) {
                    TeacherDashboard.closeEditor();
                }
            }

            // Enter tusu - feedback overlay'de sonraki soru
            if (
                e.key === "Enter" &&
                !document
                    .getElementById("feedback-overlay")
                    .classList.contains("overlay--hidden")
            ) {
                Game.nextQuestion();
            }
        });
    },

    savePlayerName(name) {
        GameState.setPlayerName(name);
        Screens.show("level-select");
        UI.showToast(`Hosgeldin, ${name}!`, "success");
    },

    createMenuParticles() {
        const container = document.getElementById("particles");
        if (!container) return;

        const codeSnippets = [
            "<html>",
            "<body>",
            "<h1>",
            "<p>",
            "<a>",
            "<img>",
            "<div>",
            "<span>",
            "<ul>",
            "<li>",
            "<table>",
            "<form>",
            "<input>",
            "<br>",
            "<hr>",
            "<title>",
            "<head>",
            "<!DOCTYPE>",
        ];

        for (let i = 0; i < 15; i++) {
            const particle = document.createElement("div");
            particle.className = "particle";
            particle.textContent =
                codeSnippets[
                    Math.floor(Math.random() * codeSnippets.length)
                ];
            particle.style.left = Math.random() * 100 + "%";
            particle.style.animationDelay = Math.random() * 15 + "s";
            particle.style.animationDuration =
                15 + Math.random() * 10 + "s";
            container.appendChild(particle);
        }
    },
};

/* ============================================
   OGRETMEN DASHBOARD MODULU
   ============================================ */
/* ============================================
   SORU OVERRIDE (OGRETMEN OZELLESTIRME)
   ============================================ */
const QuestionOverrides = {
    applied: false,
    originals: null,
    _overrides: [],

    // Orijinal sorularin snapshot'ini al (ilk cagrida)
    snapshotOriginals() {
        if (this.originals || typeof LEVELS === "undefined") return;
        this.originals = {};
        LEVELS.forEach((level) => {
            this.originals[level.id] = {};
            level.questions.forEach((q) => {
                this.originals[level.id][q.id] = JSON.parse(JSON.stringify(q));
            });
        });
    },

    // Backend'den override'lari yukle ve LEVELS'e uygula
    async loadAndApply() {
        if (!API.isOnline) return;
        try {
            const result = await API.getQuestionOverrides();
            this.apply(result.overrides || []);
        } catch (err) {
            console.warn("Soru override yuklenemedi:", err);
        }
    },

    // Override'lari LEVELS uzerine uygula (idempotent)
    apply(overrides) {
        if (typeof LEVELS === "undefined" || !Array.isArray(overrides)) return;
        this.snapshotOriginals();

        // Once orijinallere don (tekrar uygulamada cakismayi onle)
        if (this.originals) {
            LEVELS.forEach((level) => {
                const orig = this.originals[level.id];
                if (orig) {
                    level.questions = Object.keys(orig)
                        .map((k) => JSON.parse(JSON.stringify(orig[k])));
                    level.questions.sort((a, b) => a.id - b.id);
                }
            });
        }

        overrides.forEach((o) => {
            const level = LEVELS.find((l) => l.id === o.levelId);
            if (!level) return;

            if (o.isDeleted) {
                level.questions = level.questions.filter((q) => q.id !== o.questionId);
            } else if (o.isNew) {
                const exists = level.questions.some((q) => q.id === o.questionId);
                if (!exists && o.question) {
                    level.questions.push(JSON.parse(JSON.stringify(o.question)));
                    level.questions.sort((a, b) => a.id - b.id);
                }
            } else {
                const idx = level.questions.findIndex((q) => q.id === o.questionId);
                if (idx >= 0 && o.question) {
                    level.questions[idx] = JSON.parse(JSON.stringify(o.question));
                } else if (o.question) {
                    level.questions.push(JSON.parse(JSON.stringify(o.question)));
                    level.questions.sort((a, b) => a.id - b.id);
                }
            }
        });

        this._overrides = overrides;
        this.applied = true;
    },

    getOverrides() {
        return this._overrides || [];
    },

    isEdited(levelId, questionId) {
        return this.getOverrides().some(
            (o) => o.levelId === levelId && o.questionId === questionId && !o.isNew && !o.isDeleted
        );
    },

    isNew(levelId, questionId) {
        return this.getOverrides().some(
            (o) => o.levelId === levelId && o.questionId === questionId && o.isNew
        );
    },

    // Yeni soru icin benzersiz ID oner
    nextQuestionId(levelId) {
        const level = LEVELS.find((l) => l.id === levelId);
        if (!level || !level.questions.length) return 1;
        return Math.max(...level.questions.map((q) => q.id)) + 1;
    },
};

/* ============================================
   OGRETMEN PANELI
   ============================================ */
const TeacherDashboard = {
    currentTab: "students",
    selectedLevelId: 1,
    editing: null, // { levelId, questionId, isNew, question }

    async load() {
        // Sekmeleri guncelle
        document.querySelectorAll("#teacher-tabs .teacher-tab").forEach((tab) => {
            tab.classList.toggle("teacher-tab--active", tab.dataset.tab === this.currentTab);
        });

        if (this.currentTab === "questions") {
            await this.loadQuestionsTab();
        } else {
            await this.loadStudentsTab();
        }
    },

    async loadStudentsTab() {
        const container = document.getElementById("teacher-content");
        if (!container) return;

        container.innerHTML = '<p style="text-align:center;color:var(--color-text-secondary);">Yukleniyor...</p>';

        try {
            const stats = await API.getClassStats();
            const students = await API.getStudents();

            let html = '';

            html += '<div class="teacher-stats-grid">';
            html += '<div class="teacher-stat-card"><div class="teacher-stat-value">' + stats.totalStudents + '</div><div class="teacher-stat-label">Toplam Ogrenci</div></div>';
            html += '<div class="teacher-stat-card"><div class="teacher-stat-value">' + stats.averageScore + '</div><div class="teacher-stat-label">Ortalama Puan</div></div>';
            html += '<div class="teacher-stat-card"><div class="teacher-stat-value">' + stats.averageXp + '</div><div class="teacher-stat-label">Ortalama XP</div></div>';
            html += '</div>';

            html += '<h3 style="margin-bottom:var(--space-md);">Ogrenciler</h3>';
            if (students.students.length === 0) {
                html += '<p style="color:var(--color-text-secondary);">Henuz kayitli ogrenci yok.</p>';
            } else {
                html += '<div class="student-list">';
                students.students.forEach(function(s) {
                    const lastPlayed = s.last_played ? new Date(s.last_played).toLocaleDateString('tr-TR') : 'Hic oynanmadi';
                    html += '<div class="student-card" data-student-id="' + s.id + '">';
                    html += '<div class="student-info">';
                    html += '<span class="student-name">' + UI.escapeHtml(s.full_name || s.username) + '</span>';
                    html += '<span class="student-meta">' + s.completedLevels + '/10 seviye tamamlandi | Son oynama: ' + lastPlayed + '</span>';
                    html += '</div>';
                    html += '<span class="student-score">' + (s.total_score || 0) + ' puan</span>';
                    html += '</div>';
                });
                html += '</div>';
            }

            container.innerHTML = html;
        } catch (err) {
            container.innerHTML = '<p style="color:var(--color-error);text-align:center;">Veriler yuklenemedi: ' + UI.escapeHtml(err.message) + '</p>';
        }
    },

    async loadQuestionsTab() {
        const container = document.getElementById("teacher-content");
        if (!container) return;

        // Override'lari tazele
        await QuestionOverrides.loadAndApply();

        if (typeof LEVELS === "undefined" || !Array.isArray(LEVELS)) {
            container.innerHTML = '<p style="color:var(--color-error);">Seviyeler yuklenemedi.</p>';
            return;
        }

        // Secili seviye gecerli mi?
        if (!LEVELS.some((l) => l.id === this.selectedLevelId)) {
            this.selectedLevelId = LEVELS[0].id;
        }

        const level = LEVELS.find((l) => l.id === this.selectedLevelId);

        let html = '';

        // Arac cubugu: seviye secici
        html += '<div class="question-toolbar">';
        html += '<select id="question-level-select" class="text-input" aria-label="Seviye Sec">';
        LEVELS.forEach((l) => {
            const selected = l.id === this.selectedLevelId ? ' selected' : '';
            html += '<option value="' + l.id + '"' + selected + '>' + l.icon + ' Seviye ' + l.id + ': ' + UI.escapeHtml(l.name) + ' (' + l.questions.length + ' soru)</option>';
        });
        html += '</select>';
        html += '<button class="btn btn--primary btn--small" data-action="add-question">+ Yeni Soru</button>';
        html += '</div>';

        // Soru listesi
        html += '<div class="question-list">';
        if (level.questions.length === 0) {
            html += '<p style="color:var(--color-text-secondary);text-align:center;padding:1rem;">Bu seviyede soru yok.</p>';
        } else {
            level.questions.forEach((q) => {
                const isNew = QuestionOverrides.isNew(level.id, q.id);
                const isEdited = QuestionOverrides.isEdited(level.id, q.id);

                html += '<div class="question-item">';
                html += '<div class="question-item-info">';
                html += '<div class="question-item-meta">';
                html += '<span class="question-type-badge">' + UI.escapeHtml(q.type) + '</span>';
                html += '<span style="font-size:0.75rem;color:var(--color-text-secondary);">#' + q.id + '</span>';
                if (isNew) html += '<span class="question-badge-new">Yeni</span>';
                if (isEdited) html += '<span class="question-badge-edited">Duzenlenmis</span>';
                html += '</div>';
                html += '<div class="question-item-text" title="' + UI.escapeHtml(q.question) + '">' + UI.escapeHtml(q.question) + '</div>';
                html += '</div>';
                html += '<div class="question-item-actions">';
                html += '<button class="btn btn--ghost btn--small" data-action="edit-question" data-qid="' + q.id + '">Duzenle</button>';
                html += '<button class="btn btn--ghost btn--small" data-action="delete-question" data-qid="' + q.id + '" data-isnew="' + (isNew ? 1 : 0) + '" style="color:var(--color-error);">Sil</button>';
                html += '</div>';
                html += '</div>';
            });
        }
        html += '</div>';

        // Alt aksiyonlar
        html += '<div class="question-actions-bar">';
        html += '<button class="btn btn--ghost btn--small" data-action="reset-level">Bu Seviyeyi Orijinaline Don</button>';
        html += '</div>';

        container.innerHTML = html;

        // Seviye secici olayi
        const select = document.getElementById("question-level-select");
        if (select) {
            select.addEventListener("change", () => {
                this.selectedLevelId = parseInt(select.value);
                this.loadQuestionsTab();
            });
        }
    },

    // ---- EDITOR ----

    openEditor(levelId, questionId) {
        const level = LEVELS.find((l) => l.id === levelId);
        if (!level) return;
        const question = level.questions.find((q) => q.id === questionId);
        if (!question) return;

        this.editing = {
            levelId,
            questionId,
            isNew: QuestionOverrides.isNew(levelId, questionId),
            question: JSON.parse(JSON.stringify(question)),
        };

        document.getElementById("question-editor-title").textContent =
            "Soru #" + questionId + " Duzenle";
        this.renderEditorBody();
        Screens.showOverlay("question-editor-overlay");
    },

    openNewQuestion(levelId) {
        const newId = QuestionOverrides.nextQuestionId(levelId);
        this.editing = {
            levelId,
            questionId: newId,
            isNew: true,
            question: {
                id: newId,
                type: "multiple-choice",
                question: "",
                code: null,
                options: ["", "", "", ""],
                correct: 0,
                hint: "",
                explanation: "",
            },
        };

        document.getElementById("question-editor-title").textContent = "Yeni Soru Ekle";
        this.renderEditorBody();
        Screens.showOverlay("question-editor-overlay");
    },

    closeEditor() {
        Screens.hideOverlay("question-editor-overlay");
        this.editing = null;
    },

    renderEditorBody() {
        const body = document.getElementById("question-editor-body");
        if (!body || !this.editing) return;

        const q = this.editing.question;
        const isCodeFill = q.type === "code-fill";

        let html = '';

        // Soru tipi
        html += '<div class="q-form-group">';
        html += '<label for="q-type">Soru Tipi</label>';
        html += '<select id="q-type">';
        const types = [
            ["multiple-choice", "Coktan Secmeli"],
            ["code-fill", "Kod Doldurma"],
            ["code-write", "Kod Yazma"],
            ["code-fix", "Kod Duzeltme"],
            ["predict", "Tahmin Et"],
        ];
        types.forEach(([val, label]) => {
            const sel = q.type === val ? ' selected' : '';
            html += '<option value="' + val + '"' + sel + '>' + label + '</option>';
        });
        html += '</select>';
        html += '</div>';

        // Soru metni
        html += '<div class="q-form-group">';
        html += '<label for="q-question">Soru Metni</label>';
        html += '<textarea id="q-question" rows="2" placeholder="Soru metni...">' + UI.escapeHtml(q.question || "") + '</textarea>';
        html += '</div>';

        // Tipe ozel alanlar
        html += '<div id="q-type-specific" class="q-type-specific">';
        html += this.renderTypeSpecific(q, isCodeFill);
        html += '</div>';

        // Ipucu
        html += '<div class="q-form-group">';
        html += '<label for="q-hint">Ipucu</label>';
        html += '<textarea id="q-hint" rows="2" placeholder="Ogrenciye ipucu...">' + UI.escapeHtml(q.hint || "") + '</textarea>';
        html += '</div>';

        // Aciklama
        html += '<div class="q-form-group">';
        html += '<label for="q-explanation">Aciklama (cevaptan sonra gosterilir)</label>';
        html += '<textarea id="q-explanation" rows="2" placeholder="Dogru cevabin aciklamasi...">' + UI.escapeHtml(q.explanation || "") + '</textarea>';
        html += '</div>';

        body.innerHTML = html;

        // Tip degisince alanlari yenile
        const typeSelect = document.getElementById("q-type");
        if (typeSelect) {
            typeSelect.addEventListener("change", () => {
                const newType = typeSelect.value;
                this.editing.question.type = newType;
                // Tipe gore varsayilan soru yapisi kur
                this.editing.question = this.normalizeQuestionStructure(this.editing.question, newType);
                const specific = document.getElementById("q-type-specific");
                if (specific) {
                    specific.innerHTML = this.renderTypeSpecific(this.editing.question, newType === "code-fill");
                    this.bindDynamicEditorEvents();
                }
            });
        }

        this.bindDynamicEditorEvents();
    },

    normalizeQuestionStructure(q, type) {
        const base = {
            id: q.id,
            type,
            question: q.question || "",
            hint: q.hint || "",
            explanation: q.explanation || "",
        };

        if (type === "multiple-choice" || type === "predict") {
            return {
                ...base,
                code: Array.isArray(q.code) ? q.code : null,
                options: Array.isArray(q.options) && q.options.length >= 2
                    ? q.options
                    : ["", "", "", ""],
                correct: typeof q.correct === "number" ? q.correct : 0,
            };
        }

        if (type === "code-fill") {
            return {
                ...base,
                template: Array.isArray(q.template) ? q.template : [""],
                blanks: Array.isArray(q.blanks) ? q.blanks : [""],
            };
        }

        if (type === "code-write") {
            return {
                ...base,
                requirements: Array.isArray(q.requirements) ? q.requirements : [],
                validation: q.validation && typeof q.validation === "object"
                    ? q.validation
                    : { mustContain: [] },
            };
        }

        if (type === "code-fix") {
            return {
                ...base,
                code: Array.isArray(q.code) ? q.code : [""],
                errors: Array.isArray(q.errors) && q.errors.length > 0
                    ? q.errors
                    : [{ line: 1, description: "", fix: "" }],
            };
        }

        return base;
    },

    renderTypeSpecific(q, isCodeFill) {
        let html = '';

        if (q.type === "multiple-choice" || q.type === "predict") {
            // Kod (opsiyonel)
            html += '<div class="q-form-group">';
            html += '<label for="q-code">Kod Bloğu (opsiyonel, satir satir)</label>';
            html += '<textarea id="q-code" rows="3" placeholder="Bos birakabilirsiniz">' + UI.escapeHtml(Array.isArray(q.code) ? q.code.join("\n") : "") + '</textarea>';
            html += '</div>';

            // Secenekler
            html += '<div class="q-form-group">';
            html += '<label>Secenekler</label>';
            html += '<div class="q-options-list">';
            const letters = ["A", "B", "C", "D"];
            for (let i = 0; i < 4; i++) {
                const optVal = Array.isArray(q.options) ? (q.options[i] || "") : "";
                const checked = q.correct === i ? ' checked' : '';
                html += '<div class="q-option-row">';
                html += '<input type="radio" name="q-correct" value="' + i + '"' + checked + ' aria-label="Dogru cevap ' + letters[i] + '">';
                html += '<span class="q-option-letter">' + letters[i] + '</span>';
                html += '<input type="text" id="q-option-' + i + '" value="' + UI.escapeHtml(optVal) + '" placeholder="Secenek ' + letters[i] + '">';
                html += '</div>';
            }
            html += '</div>';
            html += '<p class="hint-text">Dogru cevabi isaretleyin</p>';
            html += '</div>';
        }

        if (q.type === "code-fill") {
            // Gosterim: entity'leri coz, kaydete tekrar encode et
            const displayTemplate = (Array.isArray(q.template) ? q.template : [])
                .map((line) => this.decodeEntities(line))
                .join("\n");

            html += '<div class="q-form-group">';
            html += '<label for="q-template">Kod Sablonu (satir satir, ____ bosluklari)</label>';
            html += '<textarea id="q-template" rows="8" placeholder="<html>&#10;  <____>&#10;</html>">' + UI.escapeHtml(displayTemplate) + '</textarea>';
            html += '<p class="hint-text">Bosluklar icin ____ kullanin. Sirasiyla blanks ile eslesir.</p>';
            html += '</div>';

            html += '<div class="q-form-group">';
            html += '<label for="q-blanks">Bosluk Cevaplari (virgul ile ayirin)</label>';
            html += '<input type="text" id="q-blanks" value="' + UI.escapeHtml((Array.isArray(q.blanks) ? q.blanks : []).join(", ")) + '" placeholder="head, body">';
            html += '</div>';
        }

        if (q.type === "code-write") {
            const v = q.validation || {};

            html += '<div class="q-form-group">';
            html += '<label for="q-requirements">Gereksinimler (satir satir, ogrenciye gosterilir)</label>';
            html += '<textarea id="q-requirements" rows="3" placeholder="<html> etiketi olmalı">' + UI.escapeHtml((Array.isArray(q.requirements) ? q.requirements : []).join("\n")) + '</textarea>';
            html += '</div>';

            html += '<div class="q-form-group">';
            html += '<label for="q-mustcontain">Zorunlu Icerikler (satir satir)</label>';
            html += '<textarea id="q-mustcontain" rows="3" placeholder="&lt;!DOCTYPE html&gt;">' + UI.escapeHtml((Array.isArray(v.mustContain) ? v.mustContain : []).join("\n")) + '</textarea>';
            html += '<p class="hint-text">Kodda bunlarin tamami bulunmali</p>';
            html += '</div>';

            html += '<div class="q-form-group">';
            html += '<label for="q-mustcontainone">En Az Biri (satir satir, ops.)</label>';
            html += '<textarea id="q-mustcontainone" rows="2" placeholder="<head>&#10;<body>">' + UI.escapeHtml((Array.isArray(v.mustContainOne) ? v.mustContainOne : []).join("\n")) + '</textarea>';
            html += '</div>';

            html += '<div class="q-form-group">';
            html += '<label for="q-contentcheck">Icerik Kontrolu (ops.)</label>';
            html += '<input type="text" id="q-contentcheck" value="' + UI.escapeHtml(v.contentCheck || "") + '" placeholder="Merhaba">';
            html += '<p class="hint-text">Kodda bu metin bulunmali</p>';
            html += '</div>';
        }

        if (q.type === "code-fix") {
            html += '<div class="q-form-group">';
            html += '<label for="q-fixcode">Hatali Kod (satir satir)</label>';
            html += '<textarea id="q-fixcode" rows="6" placeholder="<html>&#10;<body>">' + UI.escapeHtml((Array.isArray(q.code) ? q.code : []).join("\n")) + '</textarea>';
            html += '</div>';

            html += '<div class="q-form-group">';
            html += '<label>Hatalar</label>';
            html += '<div class="q-errors-list" id="q-errors-list">';
            (Array.isArray(q.errors) ? q.errors : []).forEach((err, idx) => {
                html += '<div class="q-error-row" data-err-idx="' + idx + '">';
                html += '<input type="number" class="q-err-line" value="' + (err.line || 1) + '" min="1" aria-label="Satir numarasi">';
                html += '<input type="text" class="q-err-desc" value="' + UI.escapeHtml(err.description || "") + '" placeholder="Hata aciklamasi">';
                html += '<input type="text" class="q-err-fix" value="' + UI.escapeHtml(err.fix || "") + '" placeholder="Duzeltme">';
                html += '<button type="button" class="q-error-remove" data-action="remove-error" aria-label="Hatayi sil">&#10005;</button>';
                html += '</div>';
            });
            html += '</div>';
            html += '<button type="button" class="btn btn--ghost btn--small q-add-error-btn" data-action="add-error">+ Hata Ekle</button>';
            html += '</div>';
        }

        return html;
    },

    decodeEntities(str) {
        const div = document.createElement("div");
        div.innerHTML = str;
        return div.textContent || "";
    },

    encodeEntities(str) {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    },

    bindDynamicEditorEvents() {
        const body = document.getElementById("question-editor-body");
        if (!body) return;

        body.querySelectorAll('[data-action="add-error"]').forEach((btn) => {
            btn.addEventListener("click", () => this.addErrorRow());
        });

        body.querySelectorAll('[data-action="remove-error"]').forEach((btn) => {
            btn.addEventListener("click", () => {
                const row = btn.closest(".q-error-row");
                if (row) row.remove();
            });
        });
    },

    addErrorRow() {
        const list = document.getElementById("q-errors-list");
        if (!list) return;
        const idx = list.children.length;
        const row = document.createElement("div");
        row.className = "q-error-row";
        row.dataset.errIdx = idx;
        row.innerHTML =
            '<input type="number" class="q-err-line" value="1" min="1" aria-label="Satir numarasi">' +
            '<input type="text" class="q-err-desc" placeholder="Hata aciklamasi">' +
            '<input type="text" class="q-err-fix" placeholder="Duzeltme">' +
            '<button type="button" class="q-error-remove" data-action="remove-error" aria-label="Hatayi sil">&#10005;</button>';
        list.appendChild(row);
        row.querySelector('[data-action="remove-error"]').addEventListener("click", () => row.remove());
    },

    // Form verilerini topla ve kaydet
    async saveQuestion() {
        if (!this.editing) return;

        const type = document.getElementById("q-type").value;
        const questionText = document.getElementById("q-question").value.trim();
        const hint = document.getElementById("q-hint").value.trim();
        const explanation = document.getElementById("q-explanation").value.trim();

        if (!questionText) {
            UI.showToast("Soru metni gerekli!", "warning");
            return;
        }

        const q = {
            id: this.editing.questionId,
            type,
            question: questionText,
            hint,
            explanation,
        };

        if (type === "multiple-choice" || type === "predict") {
            const options = [];
            for (let i = 0; i < 4; i++) {
                const el = document.getElementById("q-option-" + i);
                if (el && el.value.trim()) options.push(el.value.trim());
            }
            if (options.length < 2) {
                UI.showToast("En az 2 secenek gerekli!", "warning");
                return;
            }
            const correctEl = document.querySelector('input[name="q-correct"]:checked');
            let correct = correctEl ? parseInt(correctEl.value) : 0;
            if (correct >= options.length) correct = 0;

            const codeEl = document.getElementById("q-code");
            const codeVal = codeEl ? codeEl.value.trim() : "";
            q.code = codeVal ? codeVal.split("\n") : null;
            q.options = options;
            q.correct = correct;
        }

        if (type === "code-fill") {
            const templateEl = document.getElementById("q-template");
            const blanksEl = document.getElementById("q-blanks");
            const rawTemplate = templateEl ? templateEl.value : "";
            const blanks = (blanksEl ? blanksEl.value : "")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);

            const templateLines = rawTemplate.split("\n").filter((l, i, arr) => {
                // son bos satiri atla
                return !(i === arr.length - 1 && l === "");
            });

            const blankCount = templateLines.join("\n").split("____").length - 1;
            if (blankCount !== blanks.length) {
                UI.showToast("____ sayisi (" + blankCount + ") blanks sayisiyla (" + blanks.length + ") eslesmeli!", "warning");
                return;
            }

            // Entity'lere encode et (levels.js formati)
            q.template = templateLines.map((l) => this.encodeEntities(l));
            q.blanks = blanks;
        }

        if (type === "code-write") {
            const reqEl = document.getElementById("q-requirements");
            const mustEl = document.getElementById("q-mustcontain");
            const oneEl = document.getElementById("q-mustcontainone");
            const contentEl = document.getElementById("q-contentcheck");

            const requirements = reqEl ? reqEl.value.split("\n").map((s) => s.trim()).filter(Boolean) : [];
            const mustContain = mustEl ? mustEl.value.split("\n").map((s) => s.trim()).filter(Boolean) : [];
            const mustContainOne = oneEl ? oneEl.value.split("\n").map((s) => s.trim()).filter(Boolean) : [];
            const contentCheck = contentEl ? contentEl.value.trim() : "";

            if (mustContain.length === 0 && !contentCheck) {
                UI.showToast("En az bir zorunlu icerik veya icerik kontrolu gerekli!", "warning");
                return;
            }

            q.requirements = requirements;
            q.validation = { mustContain };
            if (mustContainOne.length > 0) q.validation.mustContainOne = mustContainOne;
            if (contentCheck) q.validation.contentCheck = contentCheck;
        }

        if (type === "code-fix") {
            const codeEl = document.getElementById("q-fixcode");
            const codeLines = codeEl ? codeEl.value.split("\n").filter((l, i, arr) => !(i === arr.length - 1 && l === "")) : [];

            const errors = [];
            document.querySelectorAll("#q-errors-list .q-error-row").forEach((row) => {
                const line = parseInt(row.querySelector(".q-err-line").value) || 1;
                const description = row.querySelector(".q-err-desc").value.trim();
                const fix = row.querySelector(".q-err-fix").value.trim();
                if (description) {
                    errors.push({ line, description, fix: fix || "Duzeltilecek" });
                }
            });

            if (codeLines.length === 0) {
                UI.showToast("Hatali kod satiri gerekli!", "warning");
                return;
            }
            if (errors.length === 0) {
                UI.showToast("En az bir hata tanimi gerekli!", "warning");
                return;
            }

            q.code = codeLines;
            q.errors = errors;
        }

        try {
            if (this.editing.isNew) {
                await API.createQuestion(this.editing.levelId, q);
                UI.showToast("Yeni soru eklendi!", "success");
            } else {
                await API.updateQuestion(this.editing.levelId, this.editing.questionId, q);
                UI.showToast("Soru guncellendi!", "success");
            }

            this.closeEditor();
            await QuestionOverrides.loadAndApply();
            await this.loadQuestionsTab();
        } catch (err) {
            UI.showToast(err.message, "error");
        }
    },

    async deleteQuestion(levelId, questionId, isNew) {
        const msg = isNew
            ? "Bu yeni soruyu silmek istediginize emin misiniz?"
            : "Bu soruyu silmek istediginize emin misiniz? (Orijinal soru gizlenir)";
        if (!confirm(msg)) return;

        try {
            await API.deleteQuestion(levelId, questionId, isNew);
            UI.showToast("Soru silindi.", "success");
            await QuestionOverrides.loadAndApply();
            await this.loadQuestionsTab();
        } catch (err) {
            UI.showToast(err.message, "error");
        }
    },

    async resetLevel() {
        if (!confirm("Bu seviyedeki tum degisiklikler orijinal haline dondurulecek. Emin misiniz?")) return;

        try {
            await API.resetQuestions(this.selectedLevelId);
            UI.showToast("Seviye orijinaline donduruldu.", "success");
            await QuestionOverrides.loadAndApply();
            await this.loadQuestionsTab();
        } catch (err) {
            UI.showToast(err.message, "error");
        }
    },
};

/* ============================================
   DISA AKTARMA MODULU
   ============================================ */
const ReportExporter = {
    exportCSV() {
        const report = Analytics.getStudentReport();
        const rows = [
            ["Metrik", "Deger"],
            ["Ogrenci Adi", report.name],
            ["Toplam Puan", report.score],
            ["XP", report.xp],
            ["XP Seviyesi", report.xpLevel],
            ["Basari Orani (%)", report.successRate],
            ["En Uzun Seri", report.maxStreak],
            ["Toplam Sure (dk)", Math.round((report.totalPlayTime || 0) / 60)],
            ["Son Oynama", report.lastPlayed || "-"],
            [],
            ["Seviye", "Tamamlandi", "Yildiz", "Basari (%)", "Deneme", "Ipucu", "Sure (dk)"],
        ];

        report.levelAnalysis.details.forEach((level) => {
            rows.push([
                `${level.levelName}`,
                level.completed ? "Evet" : "Hayir",
                level.stars,
                Math.round(level.correctRate * 100),
                level.attempts,
                level.hintsUsed,
                Math.round((level.timeSpent || 0) / 60),
            ]);
        });

        rows.push([]);
        rows.push(["Hata Analizi"]);
        rows.push(["Etiket", "Hata Sayisi"]);
        report.errorAnalysis.byTag.forEach(([tag, count]) => {
            rows.push([`<${tag}>`, count]);
        });

        rows.push([]);
        rows.push(["Zorlanilani Konular"]);
        rows.push(["Seviye", "Konu", "Basari (%)", "Durum"]);
        report.weakTopics.forEach((topic) => {
            rows.push([
                `Seviye ${topic.levelId}`,
                topic.levelName,
                topic.successRate,
                topic.status,
            ]);
        });

        const csvContent = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `basari-raporu-${report.name || "ogrenci"}-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        UI.showToast("CSV dosyasi indirildi!", "success");
    },
};

/* ============================================
   UYGULAMAYI BASLAT
   ============================================ */
document.addEventListener("DOMContentLoaded", () => {
    App.init();
});
