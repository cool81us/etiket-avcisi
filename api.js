/* ============================================
   API SERVIS KATMANI
   Backend ile iletisim icin kullanilir
   ============================================ */
const API = {
    baseUrl: '/api',
    token: null,
    user: null,
    isOnline: false,

    // Sayfa yuklendiginde localStorage'dan token bilgisini yukle
    init() {
        this.token = localStorage.getItem('etiketAvcisi_token');
        const userStr = localStorage.getItem('etiketAvcisi_user');
        if (userStr) {
            try { this.user = JSON.parse(userStr); } catch (e) { this.user = null; }
        }
        this.isOnline = !!this.token;
    },

    // Token'i sakla
    setAuth(token, user) {
        this.token = token;
        this.user = user;
        this.isOnline = true;
        localStorage.setItem('etiketAvcisi_token', token);
        localStorage.setItem('etiketAvcisi_user', JSON.stringify(user));
    },

    // Token'i temizle
    clearAuth() {
        this.token = null;
        this.user = null;
        this.isOnline = false;
        localStorage.removeItem('etiketAvcisi_token');
        localStorage.removeItem('etiketAvcisi_user');
    },

    // HTTP istegi gonder
    async request(method, endpoint, data) {
        const url = this.baseUrl + endpoint;
        const headers = { 'Content-Type': 'application/json' };
        if (this.token) {
            headers['Authorization'] = 'Bearer ' + this.token;
        }

        const options = { method, headers };
        if (data && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Bilinmeyen hata');
            }

            return result;
        } catch (err) {
            if (err.message === 'Failed to fetch') {
                throw new Error('Sunucuya baglanamadi. Internet baglantinizi kontrol edin.');
            }
            throw err;
        }
    },

    // ==================== AUTH ====================

    async register(username, email, password, fullName, role) {
        const result = await this.request('POST', '/auth/register', {
            username, email, password, fullName, role
        });
        this.setAuth(result.token, result.user);
        return result;
    },

    async login(username, password) {
        const result = await this.request('POST', '/auth/login', { username, password });
        this.setAuth(result.token, result.user);
        return result;
    },

    async getMe() {
        return await this.request('GET', '/auth/me');
    },

    logout() {
        this.clearAuth();
    },

    // ==================== STUDENT ====================

    async getProfile() {
        return await this.request('GET', '/student/profile');
    },

    async getProgress() {
        return await this.request('GET', '/student/progress');
    },

    async updateProgress(levelId, data) {
        return await this.request('PUT', '/student/progress/' + levelId, data);
    },

    async getStats() {
        return await this.request('GET', '/student/stats');
    },

    async updateStats(data) {
        return await this.request('PUT', '/student/stats', data);
    },

    async recordError(levelId, questionId, errorType, tagName) {
        return await this.request('POST', '/student/errors', {
            levelId, questionId, errorType, tagName
        });
    },

    async getErrors() {
        return await this.request('GET', '/student/errors');
    },

    async recordQuestion(levelId, questionId, correct, tryNumber, hintUsed, timeSpent) {
        return await this.request('POST', '/student/questions', {
            levelId, questionId, correct, tryNumber, hintUsed, timeSpent
        });
    },

    async getQuestions() {
        return await this.request('GET', '/student/questions');
    },

    async recordHintUse(levelId, tagName) {
        return await this.request('POST', '/student/hints', { levelId, tagName });
    },

    async addBadge(badgeId) {
        return await this.request('POST', '/student/badges', { badgeId });
    },

    async getBadges() {
        return await this.request('GET', '/student/badges');
    },

    // ==================== TEACHER ====================

    async getStudents() {
        return await this.request('GET', '/teacher/students');
    },

    async getStudentDetail(id) {
        return await this.request('GET', '/teacher/students/' + id);
    },

    async getStudentProgress(id) {
        return await this.request('GET', '/teacher/students/' + id + '/progress');
    },

    async getClassStats() {
        return await this.request('GET', '/teacher/stats');
    },

    // ==================== QUESTIONS (override) ====================

    async getQuestionOverrides() {
        return await this.request('GET', '/questions/overrides');
    },

    async updateQuestion(levelId, questionId, question) {
        return await this.request('PUT', '/questions/overrides', {
            levelId, questionId, question
        });
    },

    async createQuestion(levelId, question) {
        return await this.request('POST', '/questions/overrides', {
            levelId, question
        });
    },

    async deleteQuestion(levelId, questionId, isNew) {
        return await this.request('DELETE', '/questions/overrides', {
            levelId, questionId, isNew
        });
    },

    async resetQuestions(levelId) {
        const endpoint = levelId
            ? '/questions/overrides/reset?levelId=' + levelId
            : '/questions/overrides/reset';
        return await this.request('DELETE', endpoint);
    }
};

// Sayfa yuklendiginde API'yi baslat
API.init();
