/**
 * Storage Service
 * Wraps localStorage to provide user-isolated data storage
 */

class StorageService {
  constructor(userId = null) {
    this.userId = userId;
  }

  setUserId(userId) {
    this.userId = userId;
  }

  /**
   * Get a namespaced key
   */
  _getKey(key) {
    if (!this.userId) {
      throw new Error("StorageService: No userId set for isolated storage");
    }
    return `neurotrace_data_${this.userId}_${key}`;
  }

  /**
   * Save item
   */
  setItem(key, value) {
    try {
      const namespacedKey = this._getKey(key);
      localStorage.setItem(namespacedKey, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`StorageService: Failed to save ${key}`, e);
      return false;
    }
  }

  /**
   * Load item
   */
  getItem(key, defaultValue = null) {
    try {
      const namespacedKey = this._getKey(key);
      const stored = localStorage.getItem(namespacedKey);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) {
      console.error(`StorageService: Failed to load ${key}`, e);
      return defaultValue;
    }
  }

  /**
   * Remove item
   */
  removeItem(key) {
    try {
      const namespacedKey = this._getKey(key);
      localStorage.removeItem(namespacedKey);
      return true;
    } catch (e) {
      console.error(`StorageService: Failed to remove ${key}`, e);
      return false;
    }
  }

  /**
   * Global (non-user-specific) storage
   */
  static setGlobalItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`StorageService: Failed to save global ${key}`, e);
      return false;
    }
  }

  static getGlobalItem(key, defaultValue = null) {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) {
      console.error(`StorageService: Failed to load global ${key}`, e);
      return defaultValue;
    }
  }
}

export default new StorageService();
