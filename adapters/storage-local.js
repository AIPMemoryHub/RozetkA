// src/adapters/storage-local.js

class StorageLocal {
  constructor() {
    if (typeof globalThis.localStorage === 'undefined') {
      this.store = new Map();
    }
  }

  /**
   * Получить значение по ключу
   * @param {string} key
   * @returns {Promise<string|null>}
   */
  async read(key) {
    if (typeof globalThis.localStorage !== 'undefined') {
      return globalThis.localStorage.getItem(key);
    }
    return this.store.get(key) ?? null;
  }

  /**
   * Сохранить значение по ключу
   * @param {string} key
   * @param {string} value
   * @returns {Promise<void>}
   */
  async write(key, value) {
    if (typeof globalThis.localStorage !== 'undefined') {
      globalThis.localStorage.setItem(key, value);
    } else {
      this.store.set(key, value);
    }
  }

  /**
   * Удалить значение по ключу
   * @param {string} key
   * @returns {Promise<void>}
   */
  async remove(key) {
    if (typeof globalThis.localStorage !== 'undefined') {
      globalThis.localStorage.removeItem(key);
    } else {
      this.store.delete(key);
    }
  }
}

module.exports = StorageLocal;
