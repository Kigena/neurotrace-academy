import apiService from "./apiService";
import storageService from "./storageService";

/**
 * Auth Service
 * Manages user profiles and active session
 * Now connects to Backend API
 */

const SESSION_KEY = "neurotrace_active_session_v1";

class AuthService {
    constructor() {
        this.currentUser = null;
        this.tryRestoreSession();
    }

    /**
     * Restore session from ID
     */
    tryRestoreSession() {
        // Optimistic restore from local cache to avoid flicker
        // Real validation would happen on first API call
        const session = storageService.constructor.getGlobalItem(SESSION_KEY);
        if (session && session.user) {
            this.currentUser = session.user;
            storageService.setUserId(session.user._id || session.user.id);
            return session.user;
        }
        return null;
    }

    /**
     * Create a new user profile with email and password.
     * The password is sent over HTTPS and hashed on the server (Argon2id);
     * the browser never derives the stored credential.
     */
    async createUser(name, email, password) {
        const response = await apiService.post('/auth/register', { name, email, password });
        return this._setSession(response.user, response.token);
    }

    /**
     * Login with email and password
     */
    async login(email, password) {
        const response = await apiService.post('/auth/login', { email, password });
        return this._setSession(response.user, response.token);
    }

    /**
     * Re-validate the stored token with the server and refresh the cached
     * user (including role). Returns null and clears the session if the
     * token is missing, expired or invalid.
     */
    async refreshCurrentUser() {
        if (!localStorage.getItem('token')) {
            this.logout();
            return null;
        }
        try {
            const { user } = await apiService.get('/auth/me');
            return this._setSession(user, null);
        } catch (err) {
            if (/401|auth|token/i.test(err.message || '')) {
                this.logout();
                return null;
            }
            // Network/cold-start failure: keep the cached session for now.
            return this.currentUser;
        }
    }

    /**
     * Update the cached user after a profile edit.
     */
    updateUserInStorage(user) {
        if (!user) return;
        this._setSession({ ...user }, null);
    }

    /**
     * Internal: Set active session
     */
    _setSession(user, token) {
        // Normalize ID (Mongo uses _id)
        const userId = user._id || user.id;
        user.id = userId; // Ensure .id exists for frontend compatibility

        this.currentUser = user;
        storageService.setUserId(userId);

        // Store JWT token
        if (token) {
            localStorage.setItem('token', token);
        }

        // Save minimal session info
        storageService.constructor.setGlobalItem(SESSION_KEY, {
            userId: userId,
            user: user
        });

        return user;
    }

    /**
     * Logout
     */
    logout() {
        this.currentUser = null;
        storageService.setUserId(null);
        storageService.constructor.setGlobalItem(SESSION_KEY, null);
        localStorage.removeItem('token'); // Clear JWT token
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.currentUser;
    }
}

export default new AuthService();
