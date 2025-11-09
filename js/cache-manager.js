// Cache Manager for Dropbox files using IndexedDB
(function(global) {
	'use strict';

	var CacheManager = function() {
		this.dbName = 'DropboxFileCache';
		this.dbVersion = 1;
		this.storeName = 'files';
		this.db = null;
		this.initPromise = null;
		this.isReady = false;
	};

	CacheManager.prototype.init = function() {
		var self = this;
		
		// Return existing init promise if already initializing
		if (self.initPromise) {
			return self.initPromise;
		}
		
		// Return resolved promise if already initialized
		if (self.isReady && self.db) {
			return Promise.resolve();
		}
		
		self.initPromise = new Promise(function(resolve, reject) {
			if (!window.indexedDB) {
				reject(new Error('IndexedDB not supported'));
				return;
			}

			var request = indexedDB.open(self.dbName, self.dbVersion);

			request.onerror = function(event) {
				console.error('IndexedDB error:', event.target.error);
				self.initPromise = null;
				reject(event.target.error);
			};

			request.onsuccess = function(event) {
				self.db = event.target.result;
				self.isReady = true;
				resolve();
			};

			request.onupgradeneeded = function(event) {
				var db = event.target.result;
				if (!db.objectStoreNames.contains(self.storeName)) {
					var objectStore = db.createObjectStore(self.storeName, { keyPath: 'path' });
					objectStore.createIndex('path', 'path', { unique: true });
					objectStore.createIndex('timestamp', 'timestamp', { unique: false });
				}
			};
		});
		
		return self.initPromise;
	};

	CacheManager.prototype.get = function(path) {
		var self = this;
		
		// Ensure database is initialized
		return self.init().then(function() {
			return new Promise(function(resolve, reject) {
				if (!self.db) {
					reject(new Error('Database not initialized'));
					return;
				}

				var transaction = self.db.transaction([self.storeName], 'readonly');
				var objectStore = transaction.objectStore(self.storeName);
				var request = objectStore.get(path);

				request.onsuccess = function(event) {
					var result = event.target.result;
					if (result) {
						console.log('Cache hit for:', path);
						resolve(result);
					} else {
						console.log('Cache miss for:', path);
						resolve(null);
					}
				};

				request.onerror = function(event) {
					console.error('Error getting cached file:', event.target.error);
					reject(event.target.error);
				};
			});
		}).catch(function(error) {
			console.warn('Cache get failed:', error);
			return null; // Return null on error instead of rejecting
		});
	};

	CacheManager.prototype.set = function(path, blob, metadata) {
		var self = this;
		
		// Ensure database is initialized
		return self.init().then(function() {
			return new Promise(function(resolve, reject) {
				if (!self.db) {
					reject(new Error('Database not initialized'));
					return;
				}

				var transaction = self.db.transaction([self.storeName], 'readwrite');
				var objectStore = transaction.objectStore(self.storeName);
				
				var data = {
					path: path,
					blob: blob,
					metadata: metadata || {},
					timestamp: Date.now()
				};

				var request = objectStore.put(data);

				request.onsuccess = function(event) {
					console.log('File cached successfully:', path);
					resolve();
				};

				request.onerror = function(event) {
					console.error('Error caching file:', event.target.error);
					reject(event.target.error);
				};
			});
		}).catch(function(error) {
			console.warn('Cache set failed:', error);
			return Promise.resolve(); // Resolve silently on error
		});
	};

	CacheManager.prototype.has = function(path) {
		var self = this;
		return new Promise(function(resolve, reject) {
			self.get(path).then(function(result) {
				resolve(!!result);
			}).catch(function(error) {
				reject(error);
			});
		});
	};

	CacheManager.prototype.delete = function(path) {
		var self = this;
		
		// Ensure database is initialized
		return self.init().then(function() {
			return new Promise(function(resolve, reject) {
				if (!self.db) {
					reject(new Error('Database not initialized'));
					return;
				}

				var transaction = self.db.transaction([self.storeName], 'readwrite');
				var objectStore = transaction.objectStore(self.storeName);
				var request = objectStore.delete(path);

				request.onsuccess = function(event) {
					console.log('File removed from cache:', path);
					resolve();
				};

				request.onerror = function(event) {
					console.error('Error deleting cached file:', event.target.error);
					reject(event.target.error);
				};
			});
		}).catch(function(error) {
			console.warn('Cache delete failed:', error);
			return Promise.resolve(); // Resolve silently on error
		});
	};

	CacheManager.prototype.clear = function() {
		var self = this;
		
		// Ensure database is initialized
		return self.init().then(function() {
			return new Promise(function(resolve, reject) {
				if (!self.db) {
					reject(new Error('Database not initialized'));
					return;
				}

				var transaction = self.db.transaction([self.storeName], 'readwrite');
				var objectStore = transaction.objectStore(self.storeName);
				var request = objectStore.clear();

				request.onsuccess = function(event) {
					console.log('Cache cleared');
					resolve();
				};

				request.onerror = function(event) {
					console.error('Error clearing cache:', event.target.error);
					reject(event.target.error);
				};
			});
		}).catch(function(error) {
			console.warn('Cache clear failed:', error);
			return Promise.resolve(); // Resolve silently on error
		});
	};

	CacheManager.prototype.getAll = function() {
		var self = this;
		
		// Ensure database is initialized
		return self.init().then(function() {
			return new Promise(function(resolve, reject) {
				if (!self.db) {
					reject(new Error('Database not initialized'));
					return;
				}

				var transaction = self.db.transaction([self.storeName], 'readonly');
				var objectStore = transaction.objectStore(self.storeName);
				var request = objectStore.getAll();

				request.onsuccess = function(event) {
					resolve(event.target.result);
				};

				request.onerror = function(event) {
					console.error('Error getting all cached files:', event.target.error);
					reject(event.target.error);
				};
			});
		}).catch(function(error) {
			console.warn('Cache getAll failed:', error);
			return []; // Return empty array on error
		});
	};

	CacheManager.prototype.getCacheSize = function() {
		var self = this;
		return new Promise(function(resolve, reject) {
			self.getAll().then(function(items) {
				var totalSize = 0;
				items.forEach(function(item) {
					if (item.blob && item.blob.size) {
						totalSize += item.blob.size;
					}
				});
				resolve(totalSize);
			}).catch(function(error) {
				reject(error);
			});
		});
	};

	// Export to global scope
	global.CacheManager = CacheManager;

})(this);

