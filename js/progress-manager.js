// Progress Manager for displaying download progress
(function(global) {
	'use strict';

	var ProgressManager = function(containerId) {
		this.container = null;
		this.progressBars = {};
		this.containerId = containerId || 'progress-container';
		this.init();
	};

	ProgressManager.prototype.init = function() {
		// Create container if it doesn't exist
		this.container = document.getElementById(this.containerId);
		if (!this.container) {
			this.container = document.createElement('div');
			this.container.id = this.containerId;
			this.container.className = 'progress-container';
			document.body.appendChild(this.container);
		}
	};

	ProgressManager.prototype.createProgressBar = function(fileId, fileName) {
		var self = this;
		
		// Show container when creating first progress bar
		this.show();
		
		// Create progress bar wrapper
		var wrapper = document.createElement('div');
		wrapper.className = 'progress-bar-wrapper';
		wrapper.id = 'progress-' + fileId;

		// Create file name label
		var label = document.createElement('div');
		label.className = 'progress-label';
		label.textContent = fileName;

		// Create progress bar container
		var progressContainer = document.createElement('div');
		progressContainer.className = 'progress-bar-container';

		// Create progress bar
		var progressBar = document.createElement('div');
		progressBar.className = 'progress-bar';
		progressBar.style.width = '0%';

		// Create percentage text
		var percentText = document.createElement('div');
		percentText.className = 'progress-percent';
		percentText.textContent = '0%';

		// Create status text
		var statusText = document.createElement('div');
		statusText.className = 'progress-status';
		statusText.textContent = 'Starting...';

		// Assemble elements
		progressContainer.appendChild(progressBar);
		wrapper.appendChild(label);
		wrapper.appendChild(progressContainer);
		wrapper.appendChild(percentText);
		wrapper.appendChild(statusText);

		// Add to container
		this.container.appendChild(wrapper);

		// Store references
		this.progressBars[fileId] = {
			wrapper: wrapper,
			bar: progressBar,
			percent: percentText,
			status: statusText,
			label: label
		};

		return this.progressBars[fileId];
	};

	ProgressManager.prototype.updateProgress = function(fileId, loaded, total) {
		var progressBar = this.progressBars[fileId];
		if (!progressBar) {
			return;
		}

		var percent = total > 0 ? Math.round((loaded / total) * 100) : 0;
		progressBar.bar.style.width = percent + '%';
		progressBar.percent.textContent = percent + '%';

		var loadedMB = (loaded / (1024 * 1024)).toFixed(2);
		var totalMB = (total / (1024 * 1024)).toFixed(2);
		progressBar.status.textContent = 'Downloading: ' + loadedMB + ' MB / ' + totalMB + ' MB';
	};

	ProgressManager.prototype.setStatus = function(fileId, status) {
		var progressBar = this.progressBars[fileId];
		if (!progressBar) {
			return;
		}

		progressBar.status.textContent = status;
	};

	ProgressManager.prototype.setComplete = function(fileId) {
		var progressBar = this.progressBars[fileId];
		if (!progressBar) {
			return;
		}

		progressBar.bar.style.width = '100%';
		progressBar.bar.classList.add('complete');
		progressBar.percent.textContent = '100%';
		progressBar.status.textContent = 'Complete';

		// Auto-remove after 2 seconds
		var self = this;
		setTimeout(function() {
			self.removeProgressBar(fileId);
		}, 2000);
	};

	ProgressManager.prototype.setError = function(fileId, errorMsg) {
		var progressBar = this.progressBars[fileId];
		if (!progressBar) {
			return;
		}

		progressBar.bar.classList.add('error');
		progressBar.status.textContent = 'Error: ' + errorMsg;
	};

	ProgressManager.prototype.setCached = function(fileId) {
		var progressBar = this.progressBars[fileId];
		if (!progressBar) {
			return;
		}

		progressBar.bar.style.width = '100%';
		progressBar.bar.classList.add('cached');
		progressBar.percent.textContent = 'Cached';
		progressBar.status.textContent = 'Loaded from cache';

		// Auto-remove after 1 second
		var self = this;
		setTimeout(function() {
			self.removeProgressBar(fileId);
		}, 1000);
	};

	ProgressManager.prototype.removeProgressBar = function(fileId) {
		var progressBar = this.progressBars[fileId];
		if (!progressBar) {
			return;
		}

		if (progressBar.wrapper && progressBar.wrapper.parentNode) {
			progressBar.wrapper.parentNode.removeChild(progressBar.wrapper);
		}

		delete this.progressBars[fileId];

		// Hide container if no more progress bars
		if (Object.keys(this.progressBars).length === 0) {
			this.hide();
		}
	};

	ProgressManager.prototype.clear = function() {
		var self = this;
		Object.keys(this.progressBars).forEach(function(fileId) {
			var progressBar = self.progressBars[fileId];
			if (progressBar && progressBar.wrapper && progressBar.wrapper.parentNode) {
				progressBar.wrapper.parentNode.removeChild(progressBar.wrapper);
			}
			delete self.progressBars[fileId];
		});
		// Hide container after clearing all progress bars
		this.hide();
	};

	ProgressManager.prototype.show = function() {
		if (this.container) {
			this.container.style.display = 'block';
		}
	};

	ProgressManager.prototype.hide = function() {
		if (this.container) {
			this.container.style.display = 'none';
		}
	};

	// Export to global scope
	global.ProgressManager = ProgressManager;

})(this);

