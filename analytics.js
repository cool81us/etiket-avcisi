const Analytics = {
    getStudentReport() {
        const data = GameState.data;
        return {
            name: data.playerName,
            score: data.totalScore || 0,
            xp: data.xp,
            xpLevel: data.xpLevel,
            lastPlayed: data.lastPlayed,
            totalPlayTime: GameState.getTotalPlayTime(),
            maxStreak: data.maxStreak,
            levelAnalysis: this.analyzeLevels(data),
            errorAnalysis: this.analyzeErrors(data),
            weakTopics: this.findWeakTopics(data),
            successRate: this.calculateSuccessRate(data),
            hintAnalysis: this.analyzeHints(data),
            overallStats: this.getOverallStats(data),
        };
    },

    analyzeLevels(data) {
        const totalLevels = typeof LEVELS !== "undefined" ? LEVELS.length : 10;
        const completedLevels = data.completedLevels || {};
        const details = [];

        if (typeof LEVELS !== "undefined") {
            LEVELS.forEach(function(level) {
                const levelData = completedLevels[level.id];
                details.push({
                    levelId: level.id,
                    levelName: level.name,
                    icon: level.icon || level.id,
                    tags: level.tags || [],
                    completed: !!(levelData && levelData.completed),
                    stars: (levelData && levelData.stars) || 0,
                    score: (levelData && levelData.score) || 0,
                    attempts: (data.levelAttempts && data.levelAttempts[level.id]) || 0,
                    timeSpent: (levelData && levelData.timeSpent) || 0,
                    hintsUsed: (levelData && levelData.hintsUsed) || 0,
                    correctRate: (levelData && levelData.correctRate) || 0,
                    xpEarned: (levelData && levelData.xpEarned) || 0,
                    lastAttempt: (levelData && levelData.lastAttempt) || null,
                });
            });
        }

        const completedCount = details.filter(function(d) { return d.completed; }).length;
        return {
            total: totalLevels,
            completed: completedCount,
            percentage: totalLevels > 0 ? Math.round((completedCount / totalLevels) * 100) : 0,
            details: details,
        };
    },

    analyzeErrors(data) {
        const errors = data.errorHistory || [];
        const errorsByTag = {};
        const errorsByType = {};
        const errorsByLevel = {};

        errors.forEach(function(err) {
            const tag = err.tagName || "diger";
            errorsByTag[tag] = (errorsByTag[tag] || 0) + 1;

            const type = err.errorType || "diger";
            errorsByType[type] = (errorsByType[type] || 0) + 1;

            const level = err.levelId || 0;
            errorsByLevel[level] = (errorsByLevel[level] || 0) + 1;
        });

        const topTags = Object.entries(errorsByTag)
            .sort(function(a, b) { return b[1] - a[1]; })
            .slice(0, 10);

        const topTypes = Object.entries(errorsByType)
            .sort(function(a, b) { return b[1] - a[1]; });

        return {
            total: errors.length,
            byTag: topTags,
            byType: topTypes,
            byLevel: errorsByLevel,
            recent: errors.slice(-10),
        };
    },

    findWeakTopics(data) {
        const weakTopics = [];
        const completedLevels = data.completedLevels || {};

        if (typeof LEVELS !== "undefined") {
            LEVELS.forEach(function(level) {
                const levelData = completedLevels[level.id];
                if (levelData && levelData.completed) {
                    const rate = levelData.correctRate || 0;
                    if (rate < 0.7) {
                        weakTopics.push({
                            levelId: level.id,
                            levelName: level.name,
                            tags: level.tags || [],
                            successRate: Math.round(rate * 100),
                            status: rate < 0.5 ? "kritik" : "orta",
                        });
                    }
                }
            });
        }

        return weakTopics.sort(function(a, b) { return a.successRate - b.successRate; });
    },

    calculateSuccessRate(data) {
        const total = (data.totalCorrect || 0) + (data.totalWrong || 0);
        if (total === 0) return 0;
        return Math.round(((data.totalCorrect || 0) / total) * 100);
    },

    analyzeHints(data) {
        return data.hintStats || { totalUsed: 0, byLevel: {}, byTag: {} };
    },

    getOverallStats(data) {
        const questionHistory = data.questionHistory || {};
        const questions = Object.values(questionHistory);
        const totalAnswered = questions.length;
        const correctAnswers = questions.filter(function(q) { return q.correct; }).length;
        const hintUsedQuestions = questions.filter(function(q) { return q.hintUsed; }).length;

        let totalTime = 0;
        questions.forEach(function(q) {
            totalTime += q.timeSpent || 0;
        });

        return {
            totalAnswered: totalAnswered,
            correctAnswers: correctAnswers,
            wrongAnswers: totalAnswered - correctAnswers,
            hintUsedQuestions: hintUsedQuestions,
            averageTimePerQuestion: totalAnswered > 0 ? Math.round(totalTime / totalAnswered) : 0,
            totalTime: totalTime,
        };
    },
};

var BadgeSystem = {
    definitions: [
        { id: "first_step", name: "Ilk Adim", icon: "\ud83c\udf31", description: "Ilk seviyeyi tamamla" },
        { id: "fire_streak", name: "Ates Serisi", icon: "\ud83d\udd25", description: "5 soru ustuste dogru cevapla" },
        { id: "diamond_eye", name: "Elmas Goz", icon: "\ud83d\udc8e", description: "Bir seviyeyi 3 yildiz ile tamamla" },
        { id: "speed_demon", name: "Hiz Canavari", icon: "\ud83c\udfc3", description: "Bir soruyu 10 saniyede cozu" },
        { id: "error_hunter", name: "Hata Avcisi", icon: "\ud83d\udcdd", description: "10 hatayi dogru tespit et" },
        { id: "sharpshooter", name: "Keskin Nisanci", icon: "\ud83c\udfaf", description: "10 soruyu ilk denemede dogru cevapla" },
        { id: "level_master", name: "Bolum Fatihi", icon: "\ud83c\udff0", description: "5 seviyeyi tamamla" },
        { id: "puzzle_master", name: "Bulmaca Ustasi", icon: "\ud83e\udde9", description: "Tum code-write sorularini cozu" },
        { id: "data_analyst", name: "Veri Analisti", icon: "\ud83d\udcca", description: "Tum istatistikleri incele" },
        { id: "retry_master", name: "Tekrar Ustasi", icon: "\ud83d\udd04", description: "Bir seviyeyi 3 kez tekrarla" },
        { id: "time_master", name: "Zaman Ustasi", icon: "\u23f1\ufe0f", description: "30 dakikada 5 seviye" },
        { id: "scholar", name: "Ogrenci", icon: "\ud83c\udf93", description: "5 seviyeyi %80+ ile bitir" },
        { id: "champion", name: "Sampiyon", icon: "\ud83c\udfc6", description: "Tumunu 3 yildiz ile bitir" },
        { id: "hint_free", name: "Ipucsiz Kahraman", icon: "\ud83e\uddb8", description: "Bir seviyeyi ipucu kullanmadan bitir" },
        { id: "streak_master", name: "Seri Ustasi", icon: "\u26a1", description: "10 soru ustuste dogru cevapla" },
    ],

    checkBadges: function() {
        var data = GameState.data;
        var completedCount = Object.values(data.completedLevels || {}).filter(function(l) { return l.completed; }).length;

        if (completedCount >= 1) GameState.addBadge("first_step");
        if ((data.maxStreak || 0) >= 5) GameState.addBadge("fire_streak");
        if ((data.maxStreak || 0) >= 10) GameState.addBadge("streak_master");

        var hasThreeStars = Object.values(data.completedLevels || {}).some(function(l) { return l.stars >= 3; });
        if (hasThreeStars) GameState.addBadge("diamond_eye");

        var questionHistory = data.questionHistory || {};
        var firstTryCorrect = 0;
        Object.values(questionHistory).forEach(function(q) {
            if (q.correct && q.tryNumber === 1) firstTryCorrect++;
        });
        if (firstTryCorrect >= 10) GameState.addBadge("sharpshooter");

        if (completedCount >= 5) GameState.addBadge("level_master");

        var completedLevels = Object.values(data.completedLevels || {}).filter(function(l) { return l.completed; });
        var highScoreLevels = completedLevels.filter(function(l) { return (l.correctRate || 0) >= 0.8; });
        if (highScoreLevels.length >= 5) GameState.addBadge("scholar");

        var attempts = data.levelAttempts || {};
        var hasThreeAttempts = Object.values(attempts).some(function(a) { return a >= 3; });
        if (hasThreeAttempts) GameState.addBadge("retry_master");

        var totalHints = (data.hintStats && data.hintStats.totalUsed) || 0;
        if (completedCount >= 1 && totalHints === 0 && Object.keys(questionHistory).length >= 10) {
            GameState.addBadge("hint_free");
        }
    },

    getEarnedBadges: function() {
        var earned = GameState.getBadges();
        return this.definitions.filter(function(b) { return earned.includes(b.id); });
    },

    getUnearnedBadges: function() {
        var earned = GameState.getBadges();
        return this.definitions.filter(function(b) { return earned.includes(b.id) === false; });
    },
};

var ReportRenderer = {
    renderStudentReport: function(containerId) {
        var container = document.getElementById(containerId);
        if (!container) return;

        var report = Analytics.getStudentReport();
        var earnedBadges = BadgeSystem.getEarnedBadges();
        var unearnedBadges = BadgeSystem.getUnearnedBadges();

        var html = "";
        html += this.renderOverallStats(report);
        html += this.renderLevelProgress(report.levelAnalysis);
        html += this.renderErrorAnalysis(report.errorAnalysis);
        html += this.renderWeakTopics(report.weakTopics);
        html += this.renderLowPerformanceLevels(report.levelAnalysis);
        html += this.renderBadges(earnedBadges, unearnedBadges);

        container.innerHTML = html;
    },

    renderOverallStats: function(report) {
        var stats = report.overallStats;
        var playTimeFormatted = GameState.formatPlayTime(report.totalPlayTime || 0);
        var lastPlayedFormatted = this.formatDate(report.lastPlayed);

        return '<div class="report-section">' +
            '<h3 class="report-section-title">Genel Basari Durumu</h3>' +
            '<div class="stats-grid">' +
            '<div class="stat-card stat-card--primary">' +
            '<div class="stat-value">' + report.successRate + '%</div>' +
            '<div class="stat-label">Basari Orani</div>' +
            '<div class="stat-bar"><div class="stat-bar-fill" style="width: ' + report.successRate + '%"></div></div>' +
            '</div>' +
            '<div class="stat-card"><div class="stat-value">' + (report.score || 0).toLocaleString("tr-TR") + '</div><div class="stat-label">Toplam Puan</div></div>' +
            '<div class="stat-card"><div class="stat-value">' + (report.xp || 0) + '</div><div class="stat-label">XP (Seviye ' + (report.xpLevel || 1) + ')</div></div>' +
            '<div class="stat-card"><div class="stat-value">' + (report.maxStreak || 0) + '</div><div class="stat-label">En Uzun Seri</div></div>' +
            '<div class="stat-card"><div class="stat-value">' + stats.totalAnswered + '</div><div class="stat-label">Cozulen Soru</div></div>' +
            '<div class="stat-card"><div class="stat-value">' + stats.hintUsedQuestions + '</div><div class="stat-label">Ipucu Kullanilan</div></div>' +
            '<div class="stat-card"><div class="stat-value">' + playTimeFormatted + '</div><div class="stat-label">Toplam Sure</div></div>' +
            '<div class="stat-card"><div class="stat-value">' + lastPlayedFormatted + '</div><div class="stat-label">Son Oynama</div></div>' +
            '</div></div>';
    },

    renderLevelProgress: function(levelAnalysis) {
        var self = this;
        var barsHtml = levelAnalysis.details.map(function(level) {
            var percentage = Math.round(level.correctRate * 100);
            var barClass = percentage >= 70 ? "bar--success" : percentage >= 50 ? "bar--warning" : "bar--danger";
            var starsHtml = self.renderStars(level.stars);
            var statusIcon = level.completed ? (percentage >= 70 ? "\u2705" : "\u26a0\ufe0f") : "\u23f3";

            return '<div class="level-bar-row">' +
                '<div class="level-bar-label">' +
                '<span class="level-bar-icon">' + level.icon + '</span>' +
                '<span class="level-bar-name">' + level.levelName + '</span>' +
                '<span class="level-bar-stars">' + starsHtml + '</span>' +
                '</div>' +
                '<div class="level-bar-track"><div class="level-bar-fill ' + barClass + '" style="width: ' + percentage + '%"></div></div>' +
                '<div class="level-bar-value">' + percentage + '%</div>' +
                '<div class="level-bar-status">' + statusIcon + '</div>' +
                '</div>';
        }).join("");

        return '<div class="report-section">' +
            '<h3 class="report-section-title">Seviye Bazli Basari</h3>' +
            '<div class="level-bars">' + barsHtml + '</div>' +
            '<div class="report-summary">' +
            '<span class="summary-item"><span class="summary-icon">\u2705</span> Tamamlanan: ' + levelAnalysis.completed + '/' + levelAnalysis.total + '</span>' +
            '<span class="summary-item"><span class="summary-icon">\ud83d\udcca</span> Genel: %' + levelAnalysis.percentage + '</span>' +
            '</div></div>';
    },

    renderErrorAnalysis: function(errorAnalysis) {
        var self = this;
        var tagBarsHtml = errorAnalysis.byTag.map(function(pair) {
            var tag = pair[0];
            var count = pair[1];
            var percentage = errorAnalysis.total > 0 ? Math.round((count / errorAnalysis.total) * 100) : 0;
            return '<div class="error-bar-row">' +
                '<div class="error-bar-label">&lt;' + tag + '&gt;</div>' +
                '<div class="error-bar-track"><div class="error-bar-fill" style="width: ' + percentage + '%"></div></div>' +
                '<div class="error-bar-count">' + count + ' hata (%' + percentage + ')</div>' +
                '</div>';
        }).join("");

        var typeListHtml = errorAnalysis.byType.map(function(pair) {
            var type = pair[0];
            var count = pair[1];
            var typeLabel = self.getErrorTypeLabel(type);
            return '<div class="error-type-item"><span class="error-type-name">' + typeLabel + '</span><span class="error-type-count">' + count + '</span></div>';
        }).join("");

        return '<div class="report-section">' +
            '<h3 class="report-section-title">Hata Analizi</h3>' +
            '<div class="error-content">' +
            '<div class="error-tags"><h4 class="report-subtitle">En Cok Hata Yapilan Etiketler</h4>' +
            (tagBarsHtml || '<p class="text-muted">Hata bulunmuyor</p>') +
            '</div>' +
            '<div class="error-types"><h4 class="report-subtitle">Hata Kategorileri</h4>' +
            (typeListHtml || '<p class="text-muted">Hata bulunmuyor</p>') +
            '</div></div>' +
            '<div class="report-summary"><span class="summary-item"><span class="summary-icon">\u274c</span> Toplam Hata: ' + errorAnalysis.total + '</span></div>' +
            '</div>';
    },

    renderWeakTopics: function(weakTopics) {
        if (weakTopics.length === 0) {
            return '<div class="report-section">' +
                '<h3 class="report-section-title">Zorlanilani Konular</h3>' +
                '<div class="weak-topics-empty"><p>\ud83c\udfaf Tum konularda basarili gorunuyorsun!</p></div></div>';
        }

        var self = this;
        var topicsHtml = weakTopics.map(function(topic) {
            var statusClass = topic.status === "kritik" ? "topic--critical" : "topic--warning";
            var tagsHtml = topic.tags.map(function(t) { return '<span class="topic-tag">' + t + '</span>'; }).join("");

            return '<div class="weak-topic-card ' + statusClass + '">' +
                '<div class="topic-header"><span class="topic-level">Seviye ' + topic.levelId + '</span>' +
                '<span class="topic-status">' + (topic.status === "kritik" ? "Kritik" : "Orta") + '</span></div>' +
                '<div class="topic-name">' + topic.levelName + '</div>' +
                '<div class="topic-tags">' + tagsHtml + '</div>' +
                '<div class="topic-rate">Basari: %' + topic.successRate + '</div></div>';
        }).join("");

        return '<div class="report-section">' +
            '<h3 class="report-section-title">Zorlanilani Konular</h3>' +
            '<div class="weak-topics-grid">' + topicsHtml + '</div>' +
            '<div class="report-tip">\ud83d\udca1 Bu konularda tekrar yapmaniz onerilir.</div></div>';
    },

    renderLowPerformanceLevels: function(levelAnalysis) {
        var lowLevels = levelAnalysis.details.filter(function(l) { return l.completed && l.correctRate < 0.7; });
        if (lowLevels.length === 0) return "";

        var listHtml = lowLevels.map(function(level) {
            var percentage = Math.round(level.correctRate * 100);
            return '<div class="low-perf-item">' +
                '<span class="low-perf-level">' + level.icon + ' ' + level.levelName + '</span>' +
                '<span class="low-perf-rate">%' + percentage + '</span>' +
                '<span class="low-perf-attempts">' + level.attempts + ' deneme</span></div>';
        }).join("");

        return '<div class="report-section">' +
            '<h3 class="report-section-title">Tekrar Gereken Seviyeler</h3>' +
            '<div class="low-perf-list">' + listHtml + '</div>' +
            '<div class="report-tip">\ud83d\udca1 Bu seviyeleri tekrar cozerek basarinizi artirabilirsiniz.</div></div>';
    },

    renderBadges: function(earned, unearned) {
        var earnedHtml = earned.map(function(badge) {
            return '<div class="badge-item badge-item--earned"><span class="badge-icon">' + badge.icon + '</span><span class="badge-name">' + badge.name + '</span></div>';
        }).join("");

        var unearnedHtml = unearned.map(function(badge) {
            return '<div class="badge-item badge-item--unearned"><span class="badge-icon">' + badge.icon + '</span><span class="badge-name">' + badge.name + '</span></div>';
        }).join("");

        return '<div class="report-section">' +
            '<h3 class="report-section-title">Rozetler (' + earned.length + '/' + (earned.length + unearned.length) + ')</h3>' +
            '<div class="badges-grid">' + earnedHtml + unearnedHtml + '</div></div>';
    },

    renderStars: function(stars) {
        var html = "";
        for (var i = 0; i < 3; i++) {
            html += '<span class="star ' + (i < stars ? "star--active" : "") + '">&#9733;</span>';
        }
        return html;
    },

    formatDate: function(isoString) {
        if (!isoString) return "Hic oynanmadi";
        var date = new Date(isoString);
        var now = new Date();
        var diff = Math.floor((now - date) / 1000);
        if (diff < 60) return "Az once";
        if (diff < 3600) return Math.floor(diff / 60) + " dakika once";
        if (diff < 86400) return Math.floor(diff / 3600) + " saat once";
        return Math.floor(diff / 86400) + " gun once";
    },

    getErrorTypeLabel: function(type) {
        var labels = {
            "yanlis-doldurma": "Yanlis bosluk doldurma",
            "hata-bulma": "Hata tespiti",
            "kod-yazma": "Kod yazma hatasi",
            "yanlis-tahmin": "Yanlis tahmin",
            "yanlis-secim": "Yanlis secim",
            "diger": "Diger"
        };
        return labels[type] || type;
    },
};
