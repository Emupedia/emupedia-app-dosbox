// noinspection ThisExpressionReferencesGlobalObjectJS,JSUnusedLocalSymbols
(function(global) {
	var $html							= null;
	var $body							= null;
	var $window						= null;
	var $document						= null;
	var $canvas						= null;
	var $version_dropdown				= null;
	var $list_dropdown_v1				= null;
	var $list_dropdown_v2				= null;
	var $options_dropdown				= null;
	var $list_table					= null;
	var $preview						= null;
	var $start							= null;

	var dbx							= null;
	var perfect_scrollbar				= null;
	var lightslider					= null;
	var first						= true;
	var started						= false;
	var cacheManager					= null;
	var progressManager				= null;

	// noinspection JSFileReferences,JSUnresolvedFunction,JSUnresolvedVariable
	requirejs.config({
		waitSeconds: 300,
		paths: $sys.lib,
		shim: {
			bootstrap: {
				deps: ['jquery', 'popper', 'lightslider']
			},
			browserfs: {
				exports: 'BrowserFS',
				deps: ['polyfill-es6-promise'],
				init: function(es6promise) {
					window.Promise = es6promise;
				}
			},
			datatables: {
				deps: ['bootstrap']
			},
			'datatables-bootstrap4': {
				deps: ['datatables', 'datatables-editor']
			},
			'datatables-buttons-bootstrap4': {
				deps: ['datatables-buttons-colvis', 'datatables-buttons-html5', 'datatables-buttons-print']
			},
			'datatables-buttons-html5': {
				deps: ['pdfmake-fonts']
			},
			'polyfill-es6-promise': {
				exports: 'Promise'
			},
			jquery: {
				exports: 'jQuery'
			},
			'jquery-1.x': {
				exports: 'jQuery'
			},
			'jquery-2.x': {
				exports: 'jQuery'
			},
			'jquery-3.x': {
				exports: 'jQuery'
			},
			'js-dos': {
				exports: 'Dos'
			},
			lightslider: {
				deps: ['jquery']
			},
			purl: {
				deps: ['jquery']
			},
			'pdfmake-fonts': {
				exports: 'pdfMake',
				deps: ['jszip', 'pdfmake', 'moment-timezone'],
				init: function(JSZip, pdfMake, moment) {
					window.JSZip = JSZip;
					window.moment = moment;
				}
			},
			emularity: {
				deps: ['browserfs'],
				init: function(browserfs) {
					window.BrowserFS = browserfs;
				}
			},
			'moment-timezone': {
				exports: 'moment',
				deps: ['moment']
			}
		},
		map: {
			'*': {
				'datatables.net': 'datatables',
				'datatables.net-bs4': 'datatables-bootstrap4',
				'datatables.net-editor': 'datatables-editor',
				'datatables.net-buttons': 'datatables-buttons',
				'datatables.net-buttons-bs4': 'datatables-buttons-bootstrap4',
				'datatables.net-colreorder': 'datatables-colreorder',
				'datatables.net-colreorder-bs4': 'datatables-colreorder-bootstrap4',
				'datatables.net-fixedcolumns': 'datatables-fixedcolumns',
				'datatables.net-fixedcolumns-bs4': 'datatables-fixedcolumns-bootstrap4',
				'datatables.net-fixedheader': 'datatables-fixedheader',
				'datatables.net-fixedheader-bs4': 'datatables-fixedheader-bootstrap4',
				'datatables.net-responsive': 'datatables-responsive',
				'datatables.net-responsive-bs4': 'datatables-responsive-bootstrap4',
				'datatables.net-select': 'datatables-select',
				'datatables.net-select-bs4': 'datatables-select-bootstrap4',
				json: 'requirejs-json',
				text: 'requirejs-text'
			}
		}
	});

	// noinspection JSCheckFunctionSignatures,JSUnusedLocalSymbols,JSUnresolvedFunction
	requirejs([
		'jquery',
		'json!config/games-v1.json',
		'json!config/games-v2.json',
		'json!config/games-v3.json',
		'purl',
		'browserfs',
		'js-dos',
		'dropbox',
		'polyfill-es6-fetch',
		'jsonpath',
		'emularity',
		'bootstrap',
		'datatables',
		'datatables-bootstrap4',
		'datatables-buttons-bootstrap4',
		'datatables-colreorder-bootstrap4',
		'datatables-fixedcolumns-bootstrap4',
		'datatables-fixedheader-bootstrap4',
		'datatables-responsive-bootstrap4',
		'datatables-select-bootstrap4',
		'perfect-scrollbar',
		'select2'
	], function($, games_v1, games_v2, games_v3, purl, browserfs, Dos, dropbox, fetch, jp, emularity, bootstrap, dt, datatablesbs4, datatablesbuttonsbs4, datatablescolreorderbs4, datatablesfixedcolumnsbs4, datatablesfixedheaderbs4, datatablesresponsivebs4, datatablesselectbs4, PerfectScrollbar, select2) {
		$(function() {
			// noinspection JSUnusedLocalSymbols
			function format_name(name) {
				return typeof name !== 'undefined' ? name : '?';
			}

			function format_version(version) {
				return typeof version !== 'undefined' ? version : '-';
			}

			function format_bytes(bytes, decimals) {
				if (bytes === 0) {
					return '0 Bytes';
				}

				var k = 1024,
					dm = decimals <= 0 ? 0 : decimals || 2,
					sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
					i = Math.floor(Math.log(bytes) / Math.log(k));
					i = i === 1 && bytes >= 1000000 ? 2 : i;

				return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
			}

			function solve_aspect_ratio(width, height, numerator, denominator) {
				if (width !== undefined) {
					return Math.round(width / (numerator / denominator));
				} else if (height !== undefined) {
					return Math.round(height * (numerator / denominator));
				} else {
					return undefined;
				}
			}

			// noinspection DuplicatedCode
			function render_list_dropdown_v1(games) {
				var html = '';

				var i = 0;

				for (var game in games['games']) {
					var list = '';

					// noinspection JSUnfilteredForInLoop
					if (typeof games['games'][game]['clones'] !== 'undefined') {
						// noinspection JSUnfilteredForInLoop
						list += '<optgroup label="' + (typeof games['games'][game]['group'] !== 'undefined' ? games['games'][game]['group'] : (typeof games['games'][game]['description'] !== 'undefined' ? games['games'][game]['description'] : games['games'][game]['name'])) + ' (' + games['games'][game]['genre'] + ')' + '">';
						// noinspection JSUnfilteredForInLoop
						list +=		'<option value="' + i + '" data-game-id="' + games['games'][game]['id'] + '">' + games['games'][game]['name'] + ' (' + games['games'][game]['year'] + ')' + (typeof games['games'][game]['retail'] !== 'undefined' ? (games['games'][game]['retail'] === true ? ' (' + 'Retail' + ')' : '') : '') + ' (' + format_bytes(parseInt(games['games'][game]['size'], 10)) + ')</option>';

						i++;

						// noinspection JSUnfilteredForInLoop
						for (var clone in games['games'][game]['clones']) {
							// noinspection JSUnfilteredForInLoop,DuplicatedCode
							if (typeof games['games'][game]['clones'][clone]['enabled'] !== 'undefined') {
								// noinspection JSUnfilteredForInLoop
								if (games['games'][game]['clones'][clone]['enabled'] === true) {
									// noinspection JSUnfilteredForInLoop,DuplicatedCode
									list += '<option value="' + i + '" data-game-id="' + (typeof games['games'][game]['clones'][clone]['id'] !== 'undefined' ? games['games'][game]['clones'][clone]['id'] : games['games'][game]['id']) + '">' + (typeof games['games'][game]['clones'][clone]['name'] !== 'undefined' ? games['games'][game]['clones'][clone]['name'] : games['games'][game]['name']) + ' (' + (typeof games['games'][game]['clones'][clone]['year'] !== 'undefined' ? games['games'][game]['clones'][clone]['year'] : games['games'][game]['year']) + ')' + (typeof games['games'][game]['clones'][clone]['retail'] !== 'undefined' ? (games['games'][game]['clones'][clone]['retail'] === true ? ' (' + 'Retail' + ')' : '') : '') + ' (' + format_bytes(parseInt((typeof games['games'][game]['clones'][clone]['size'] !== 'undefined' ? games['games'][game]['clones'][clone]['size'] : games['games'][game]['size']), 10)) + ')</option>';
								}
							} else {
								// noinspection JSUnfilteredForInLoop,DuplicatedCode
								list += '<option value="' + i + '" data-game-id="' + (typeof games['games'][game]['clones'][clone]['id'] !== 'undefined' ? games['games'][game]['clones'][clone]['id'] : games['games'][game]['id']) + '">' + (typeof games['games'][game]['clones'][clone]['name'] !== 'undefined' ? games['games'][game]['clones'][clone]['name'] : games['games'][game]['name']) + ' (' + (typeof games['games'][game]['clones'][clone]['year'] !== 'undefined' ? games['games'][game]['clones'][clone]['year'] : games['games'][game]['year']) + ')' + (typeof games['games'][game]['clones'][clone]['retail'] !== 'undefined' ? (games['games'][game]['clones'][clone]['retail'] === true ? ' (' + 'Retail' + ')' : '') : '') + ' (' + format_bytes(parseInt((typeof games['games'][game]['clones'][clone]['size'] !== 'undefined' ? games['games'][game]['clones'][clone]['size'] : games['games'][game]['size']), 10)) + ')</option>';
							}

							i++;
						}

						list += '</optgroup>';
					} else {
						// noinspection JSUnfilteredForInLoop
						list += '<option value="' + i + '" data-game-id="' + games['games'][game]['id'] + '">' + games['games'][game]['name'] + ' (' + games['games'][game]['year'] + ')' + ' (' + games['games'][game]['genre'] + ')' + (typeof games['games'][game]['retail'] !== 'undefined' ? (games['games'][game]['retail'] === true ? ' (' + 'Retail' + ')' : '') : '') + ' (' + format_bytes(parseInt(games['games'][game]['size'], 10)) + ')</option>';

						i++;
					}

					// noinspection JSUnfilteredForInLoop
					if (typeof games['games'][game]['enabled'] !== 'undefined') {
						// noinspection JSUnfilteredForInLoop
						if (games['games'][game]['enabled'] === true) {
							html += list;
						}
					} else {
						html += list;
					}
				}

				return html;
			}

			// noinspection DuplicatedCode
			function render_list_dropdown_v2(games) {
				var html = '';

				var i = 0;

				for (var genre in games['software']['type']) {
					var list = '';

					// noinspection JSUnfilteredForInLoop
					list += '<optgroup label="' + games['software']['type'][genre]['name'] + '">';

					// noinspection JSUnfilteredForInLoop
					for (var game in games['software']['type'][genre]['games']) {
						// noinspection JSUnfilteredForInLoop
						list += '<option value="' + i + '" data-genre-index="' + genre + '" data-genre-id="' + games['software']['type'][genre]['id'] + '" data-game-index="' + game + '" data-game-id="' + games['software']['type'][genre]['games'][game]['id'] + '">' + games['software']['type'][genre]['games'][game]['name'] + (typeof games['software']['type'][genre]['games'][game]['year'] !== 'undefined' ? ' (' + games['software']['type'][genre]['games'][game]['year'] + ')' : '') + '</option>';

						i++;
					}

					list += '</optgroup>';

					html += list;
				}

				return html;
			}

			// noinspection DuplicatedCode
			function render_options_dropdown(games) {
				var versions = typeof games['versions'] !== 'undefined' ? games['versions'] : [];

				var html = '';

				var i = 0;

				for (var game in versions) {
					var list = '';

					// noinspection JSUnfilteredForInLoop
					if (typeof versions[game]['versions'] !== 'undefined') {
						// noinspection JSUnfilteredForInLoop
						list += '<optgroup label="' + (typeof versions[game]['group'] !== 'undefined' ? versions[game]['group'] : versions[game]['name']) + (typeof versions[game]['year'] !== 'undefined' ? ' (' + versions[game]['year'] + ')' : '') +'">';
						// noinspection JSUnfilteredForInLoop
						list += '<option value="' + i + '" data-game-id="' + versions[game]['id'] + '">' + versions[game]['name'] + ' (' + format_bytes(parseInt(versions[game]['size'], 10)) + ')</option>';

						i++;

						// noinspection JSUnfilteredForInLoop
						for (var version in versions[game]['versions']) {
							// noinspection JSUnfilteredForInLoop,DuplicatedCode
							if (typeof versions[game]['versions'][version]['enabled'] !== 'undefined') {
								// noinspection JSUnfilteredForInLoop
								if (versions[game]['versions'][version]['enabled'] === true) {
									// noinspection JSUnfilteredForInLoop,DuplicatedCode
									list += '<option value="' + i + '" data-game-id="' + versions[game]['versions'][version]['id'] + '">' + versions[game]['versions'][version]['name'] + ' (' + format_bytes(parseInt(versions[game]['versions'][version]['size'], 10)) + ')</option>';
								}
							} else {
								// noinspection JSUnfilteredForInLoop,DuplicatedCode
								list += '<option value="' + i + '" data-game-id="' + versions[game]['versions'][version]['id'] + '">' + versions[game]['versions'][version]['name'] + ' (' + format_bytes(parseInt(versions[game]['versions'][version]['size'], 10)) + ')</option>';
							}

							i++;
						}

						list += '</optgroup>';
					} else {
						// noinspection JSUnfilteredForInLoop
						list += '<option value="' + i + '" data-game-id="' + versions[game]['id'] + '">' + versions[game]['name'] + ' (' + format_bytes(parseInt(versions[game]['size'], 10)) + ')</option>';

						i++;
					}

					// noinspection JSUnfilteredForInLoop
					if (typeof versions[game]['enabled'] !== 'undefined') {
						// noinspection JSUnfilteredForInLoop
						if (versions[game]['enabled'] === true) {
							html += list;
						}
					} else {
						html += list;
					}
				}

				return html;
			}

			function render_list_table(games) {
				var html =	'<table>' +
								'<thead>' +
									'<tr>' +
										//'<th>ID</th>' +
										'<th class="left">Name</th>' +
										'<th>Version</th>' +
										'<th>Year</th>' +
										'<th>Genre</th>' +
										'<th>Size</th>' +
										// '<th>Developer</th>' +
										// '<th>Publisher</th>' +
										// '<th>Copyright</th>' +
										// '<th>License</th>' +
										'<th>Status</th>' +
										'<th>URL</th>' +
										'<th>GOG</th>' +
										'<th>Wiki</th>' +
										'<th>YT</th>' +
									'</tr>' +
								'</thead>' +
								'<tbody>';

				var i = 0;

				for (var game in games['games']) {
					// noinspection JSUnfilteredForInLoop,DuplicatedCode
					var list = 	//'<td>' + games['games'][game]['id'] + '</td>' +
						'<td class="left">' + games['games'][game]['name'] + '</td>' +
						'<td>' + format_version(games['games'][game]['version']) + '</td>' +
						'<td>' + games['games'][game]['year'] + '</td>' +
						'<td>' + games['games'][game]['genre'] + '</td>' +
						'<td>' + format_bytes(parseInt(games['games'][game]['size'], 10)) + '</td>' +
						// '<td>' + format_name(games['games'][game]['developer']) + '</td>' +
						// '<td>' + format_name(games['games'][game]['publisher']) + '</td>' +
						// '<td>' + format_name(games['games'][game]['copyright']) + '</td>' +
						// '<td>' + games['games'][game]['license'] + '</td>' +
						'<td>' + games['games'][game]['status'] + '</td>' +
						'<td>' + (typeof games['games'][game]['links'] !== 'undefined' ? (typeof games['games'][game]['links']['url'] !== 'undefined' ? '<a href="' + games['games'][game]['links']['url'] + '" target="_blank">Link</a>' : '-') : '-') + '</td>' +
						'<td>' + (typeof games['games'][game]['links'] !== 'undefined' ? (typeof games['games'][game]['links']['gog'] !== 'undefined' ? '<a href="' + games['games'][game]['links']['gog'] + '" target="_blank">Buy</a>' : '-') : '-') + '</td>' +
						'<td>' + (typeof games['games'][game]['links'] !== 'undefined' ? (typeof games['games'][game]['links']['wikipedia'] !== 'undefined' ? '<a href="' + games['games'][game]['links']['wikipedia'] + '" target="_blank">Link</a>' : '-') : '-') + '</td>' +
						'<td>' + (typeof games['games'][game]['links'] !== 'undefined' ? (typeof games['games'][game]['links']['youtube'] !== 'undefined' ? '<a href="' + games['games'][game]['links']['youtube'] + '" target="_blank">View</a>' : '-') : '-') + '</td>';

					// noinspection JSUnfilteredForInLoop
					html += '<tr data-index="' + i + '" data-game-id="' + games['games'][game]['id'] + '">' + list + '</tr>';

					// noinspection JSUnfilteredForInLoop
					if (typeof games['games'][game]['clones'] !== 'undefined') {
						list = '';

						i++;

						// noinspection JSUnfilteredForInLoop
						for (var clone in games['games'][game]['clones']) {
							// noinspection JSUnfilteredForInLoop,DuplicatedCode
							list = 	//'<td>' + (typeof games['games'][game]['clones'][clone]['id'] !== 'undefined' ? games['games'][game]['clones'][clone]['id'] : games['games'][game]['id']) + '</td>' +
								'<td class="left">' + (typeof games['games'][game]['clones'][clone]['name'] !== 'undefined' ? games['games'][game]['clones'][clone]['name'] : games['games'][game]['name']) + '</td>' +
								'<td>' + format_version((typeof games['games'][game]['clones'][clone]['version'] !== 'undefined' ? games['games'][game]['clones'][clone]['version'] : games['games'][game]['version'])) + '</td>' +
								'<td>' + (typeof games['games'][game]['clones'][clone]['year'] !== 'undefined' ? games['games'][game]['clones'][clone]['year'] : games['games'][game]['year']) + '</td>' +
								'<td>' + games['games'][game]['genre'] + '</td>' +
								'<td>' + format_bytes(parseInt((typeof games['games'][game]['clones'][clone]['size'] !== 'undefined' ? games['games'][game]['clones'][clone]['size'] : games['games'][game]['size']), 10)) + '</td>' +
								// '<td>' + format_name((typeof games['games'][game]['clones'][clone]['developer'] !== 'undefined' ? games['games'][game]['clones'][clone]['developer'] : games['games'][game]['developer'])) + '</td>' +
								// '<td>' + format_name((typeof games['games'][game]['clones'][clone]['publisher'] !== 'undefined' ? games['games'][game]['clones'][clone]['publisher'] : games['games'][game]['publisher'])) + '</td>' +
								// '<td>' + format_name((typeof games['games'][game]['clones'][clone]['copyright'] !== 'undefined' ? games['games'][game]['clones'][clone]['copyright'] : games['games'][game]['copyright'])) + '</td>' +
								// '<td>' + (typeof games['games'][game]['clones'][clone]['license'] !== 'undefined' ? games['games'][game]['clones'][clone]['license'] : games['games'][game]['license']) + '</td>' +
								'<td>' + (typeof games['games'][game]['clones'][clone]['status'] !== 'undefined' ? games['games'][game]['clones'][clone]['status'] : games['games'][game]['status']) + '</td>' +
								'<td>' + (typeof games['games'][game]['clones'][clone]['links'] !== 'undefined' ? (typeof games['games'][game]['clones'][clone]['links']['url'] !== 'undefined' ? '<a href="' + games['games'][game]['clones'][clone]['links']['url'] + '" target="_blank">Link</a>' : (typeof games['games'][game]['links']['url'] !== 'undefined' ? '<a href="' + games['games'][game]['links']['url'] + '" target="_blank">Link</a>' : '-')) : (typeof games['games'][game]['links'] !== 'undefined' ? (typeof games['games'][game]['links']['url'] !== 'undefined' ? '<a href="' + games['games'][game]['links']['url'] + '" target="_blank">Link</a>' : '-') : '-')) + '</td>' +
								'<td>' + (typeof games['games'][game]['clones'][clone]['links'] !== 'undefined' ? (typeof games['games'][game]['clones'][clone]['links']['gog'] !== 'undefined' ? '<a href="' + games['games'][game]['clones'][clone]['links']['gog'] + '" target="_blank">Buy</a>' : (typeof games['games'][game]['links']['gog'] !== 'undefined' ? '<a href="' + games['games'][game]['links']['gog'] + '" target="_blank">Buy</a>' : '-')) : (typeof games['games'][game]['links'] !== 'undefined' ? (typeof games['games'][game]['links']['gog'] !== 'undefined' ? '<a href="' + games['games'][game]['links']['gog'] + '" target="_blank">Buy</a>' : '-') : '-')) + '</td>' +
								'<td>' + (typeof games['games'][game]['clones'][clone]['links'] !== 'undefined' ? (typeof games['games'][game]['clones'][clone]['links']['wikipedia'] !== 'undefined' ? '<a href="' + games['games'][game]['clones'][clone]['links']['wikipedia'] + '" target="_blank">Link</a>' : (typeof games['games'][game]['links']['wikipedia'] !== 'undefined' ? '<a href="' + games['games'][game]['links']['wikipedia'] + '" target="_blank">Link</a>' : '-')) : (typeof games['games'][game]['links'] !== 'undefined' ? (typeof games['games'][game]['links']['wikipedia'] !== 'undefined' ? '<a href="' + games['games'][game]['links']['wikipedia'] + '" target="_blank">Link</a>' : '-') : '-')) + '</td>' +
								'<td>' + (typeof games['games'][game]['clones'][clone]['links'] !== 'undefined' ? (typeof games['games'][game]['clones'][clone]['links']['youtube'] !== 'undefined' ? '<a href="' + games['games'][game]['clones'][clone]['links']['youtube'] + '" target="_blank">View</a>' : (typeof games['games'][game]['links']['youtube'] !== 'undefined' ? '<a href="' + games['games'][game]['links']['youtube'] + '" target="_blank">View</a>' : '-')) : (typeof games['games'][game]['links'] !== 'undefined' ? (typeof games['games'][game]['links']['youtube'] !== 'undefined' ? '<a href="' + games['games'][game]['links']['youtube'] + '" target="_blank">View</a>' : '-') : '-')) + '</td>';

							// noinspection JSUnfilteredForInLoop
							html += '<tr data-index="' + i + '" data-game-id="' + (typeof games['games'][game]['clones'][clone]['id'] !== 'undefined' ? games['games'][game]['clones'][clone]['id'] : games['games'][game]['id']) + '">' + list + '</tr>';

							i++;
						}
					}
				}

				html += 	'</tbody>' +
						'</table>';

				return html;
			}

			// noinspection DuplicatedCode
			function render_preview(screenshots) {
				var html = '<ul class="lightslider">';

				// noinspection DuplicatedCode
				var width = solve_aspect_ratio(undefined, $preview.height(), 8, 5);
				var height = solve_aspect_ratio($preview.width(), undefined, 8, 5);

				if (width > $preview.width()) {
					width = $preview.width();
				}

				if (height > $preview.height()) {
					height = $preview.height();
				}

				for (var image in screenshots) {
					// noinspection JSUnfilteredForInLoop
					html += '<li><img width="' + width + '" height="' + height + '" alt="" draggable="false" ondragstart="return false;" src="' + screenshots[image] + '" /></li>';
				}

				html += '</ul>';

				return html;
			}

			function get_file_order(index, file, files) {
				for (var f in files) {
					// noinspection JSUnfilteredForInLoop
					if (files[f]['result']['name'] === file[index]['file']) {
						// noinspection JSUnfilteredForInLoop
						return {
							name: file[index]['file'],
							blob: files[f]['result']['fileBlob'],
							mount: file[index]['mount']
						};
					}
				}
			}

			// Helper function to download files with caching and progress tracking
			function downloadFileWithCache(path, fileName, progressId) {
				return new Promise(function(resolve, reject) {
					// Check cache first
					cacheManager.get(path).then(function(cachedData) {
						if (cachedData && cachedData.blob) {
							// File is cached, use it
							console.log('Using cached file:', path);
							progressManager.createProgressBar(progressId, fileName);
							progressManager.setCached(progressId);
							resolve({
								result: {
									name: fileName,
									fileBlob: cachedData.blob
								}
							});
						} else {
							// File not cached, download from Dropbox
							console.log('Downloading from Dropbox:', path);
							progressManager.createProgressBar(progressId, fileName);
							progressManager.setStatus(progressId, 'Connecting...');

							// Use Dropbox API with progress tracking
							var xhr = new XMLHttpRequest();
							xhr.open('POST', 'https://content.dropboxapi.com/2/files/download', true);
							xhr.setRequestHeader('Authorization', 'Bearer ' + window['DROPBOX_TOKEN']);
							xhr.setRequestHeader('Dropbox-API-Arg', JSON.stringify({ path: path }));
							xhr.responseType = 'blob';

							xhr.onprogress = function(event) {
								if (event.lengthComputable) {
									progressManager.updateProgress(progressId, event.loaded, event.total);
								}
							};

							xhr.onload = function() {
								if (xhr.status === 200) {
									var blob = xhr.response;
									var metadataHeader = xhr.getResponseHeader('Dropbox-API-Result');
									var metadata = metadataHeader ? JSON.parse(metadataHeader) : {};

									// Cache the downloaded file
									cacheManager.set(path, blob, metadata).then(function() {
										console.log('File cached successfully:', path);
									}).catch(function(error) {
										console.warn('Failed to cache file:', error);
									});

									progressManager.setComplete(progressId);
									resolve({
										result: {
											name: metadata.name || fileName,
											fileBlob: blob
										}
									});
								} else {
									progressManager.setError(progressId, 'HTTP ' + xhr.status);
									reject(new Error('Download failed: ' + xhr.status));
								}
							};

							xhr.onerror = function() {
								progressManager.setError(progressId, 'Network error');
								reject(new Error('Network error during download'));
							};

							xhr.send();
						}
					}).catch(function(error) {
						console.error('Cache check error:', error);
						// Fallback to direct download if cache check fails
						dbx.filesDownload({ path: path }).then(resolve).catch(reject);
					});
				});
			}

			function init() {
				// noinspection JSUnresolvedFunction
				$preview.hide();

				// noinspection JSUnresolvedFunction,DuplicatedCode
				if ($body.hasClass('v2')) {
					if (typeof window.ci !== 'undefined') {
						if (typeof window.ci.exit === 'function') {
							window.ci.exit();
						}
					}

					// noinspection JSUnresolvedFunction
					$list_dropdown_v2.html('').html(render_list_dropdown_v2(games_v2));
					// $list_dropdown_v2.html('').html(render_list_dropdown_v2(v1_to_v2(games_v1)));
					// noinspection JSUnresolvedFunction
					$options_dropdown.html('').html(render_options_dropdown(games_v2['software']['type'][0]['games'][0]));

					var screenshots = typeof games_v2['software']['type'][0]['games'][0]['versions'][0]['screenshots'] !== 'undefined' ? games_v2['software']['type'][0]['games'][0]['versions'][0]['screenshots'] : (typeof games_v2['software']['type'][0]['games'][0]['screenshots'] !== 'undefined' ? games_v2['software']['type'][0]['games'][0]['screenshots'] : []);
					var screenshot = typeof screenshots[0] !== 'undefined' ? screenshots[0] : '';

					if (!started && screenshot) {
						// noinspection JSUnresolvedVariable
						if ($.fn.lightSlider) {
							// noinspection JSUnresolvedFunction
							$preview.html('').html(render_preview(screenshots)).show();
						} else {
							// noinspection JSUnresolvedFunction
							$preview.css({ 'background-image': 'url(' + screenshot + ')', 'background-size': 'contain' }).show();
						}
					}

					// noinspection JSUnresolvedFunction
					$list_table.html('').html(render_list_table(games_v1));

					var $table = $list_table.find('table');

					// noinspection JSUnresolvedVariable
					if ($.fn.dataTable) {
						// noinspection JSUnresolvedVariable,JSCheckFunctionSignatures
						$.extend(true, $.fn.dataTable.defaults, {
							dom: "<'row filters'<'col-md-3'l><'col-md-6 toolbar text-center'B><'col-md-3'f>><'row'<'col-sm-12'tr>><'row panel-footer'<'col-sm-6'i><'col-sm-6'p>>",
							paging: true,
							responsive: false,
							stateSave: true,
							altEditor: false,
							select: {
								style: 'multi'
							},
							order: [[1, 'asc']],
							colReorder: {
								fixedColumnsLeft: 1
							},
							lengthMenu: [[5, 10, 15, 20, 25, 50, -1], [5, 10, 15, 20, 25, 50, 'all']],
							displayLength: -1,
							language: {
								infoPostFix: '',
								search: '',
								searchPlaceholder: 'Quick search…',
								paginate: {
									first: '<<',
									last: '>>',
									next: '>',
									previous: '<'
								}
							}
						});
						// noinspection JSUnresolvedVariable,JSCheckFunctionSignatures
						$.extend(true, $.fn.dataTable.Buttons.defaults, {
							dom: {
								container: {
									tag: 'div',
									className: 'dt-buttons btn-group'
								},
								button: {
									tag: 'button data-toggle="tooltip" data-trigger="hover" data-placement="top" data-boundary="window"',
									className: 'btn btn-sm btn-light'
								},
								collection: {
									tag: 'div',
									className: 'dt-button-collection dropdown-menu',
									button: {
										tag: 'a',
										className: 'dt-button dropdown-item',
										active: 'active',
										disabled: 'disabled'
									}
								}
							}
						});
						// noinspection JSUnresolvedVariable,DuplicatedCode
						$.fn.dataTable.render.ellipsis = function (cutoff, wordbreak, escapeHtml) {
							var esc = function (t) {
								return t
									.replace(/&/g, '&amp;')
									.replace(/</g, '&lt;')
									.replace(/>/g, '&gt;')
									.replace(/"/g, '&quot;');
							};

							// noinspection JSUnusedLocalSymbols
							return function (d, type, row) {
								// Order, search and type get the original data
								// noinspection DuplicatedCode
								if (type !== 'display') {
									return d;
								}

								if (typeof d !== 'number' && typeof d !== 'string') {
									return d;
								}

								d = d.toString(); // cast numbers

								if (d.length <= cutoff) {
									return d;
								}

								// noinspection JSDeprecatedSymbols
								var shortened = d.substr(0, cutoff - 1);

								// Find the last white space character in the string
								if (wordbreak) {
									shortened = shortened.replace(/\s(\S*)$/, '');
								}

								// Protect against uncontrolled HTML input
								if (escapeHtml) {
									shortened = esc(shortened);
								}

								return '<span class="ellipsis" title="' + esc(d) + '">' + shortened + '&#8230;</span>';
							};
						};
						// noinspection JSUnresolvedFunction,JSUnresolvedVariable
						if ($.fn.dataTable.isDataTable($table)) {
							// noinspection JSUnresolvedFunction
							$table.DataTable().destroy();
						} else {
							// noinspection JSUnresolvedFunction
							$table.DataTable();
						}
					}

					// noinspection JSUnresolvedVariable
					if ($.fn.select2) {
						// noinspection JSUnresolvedFunction,JSUnresolvedVariable
						$.fn.select2.defaults.set('theme', 'bootstrap4');

						if ($list_dropdown_v2.data('select2')) {
							$version_dropdown.select2('destroy');
							$list_dropdown_v2.select2('destroy');
							$options_dropdown.select2('destroy');
						} else {
							$version_dropdown.select2({ width: 'element', minimumResultsForSearch: -1 }).on('select2:open', function() {
								if (typeof PerfectScrollbar !== 'undefined') {
									perfect_scrollbar = new PerfectScrollbar('.select2-results__options', {});

									setTimeout(function() {
										if (perfect_scrollbar) {
											if (typeof perfect_scrollbar.update === 'function') {
												perfect_scrollbar.update();
											}
										}
									}, 10);
								}
							}).on('select2:close', function() {
								if (perfect_scrollbar) {
									// noinspection JSUnresolvedVariable
									if (typeof perfect_scrollbar.destroy === 'function') {
										// noinspection JSUnresolvedFunction
										perfect_scrollbar.destroy();
									}
								}
							});

							$list_dropdown_v2.select2({ width: 'element' }).on('select2:open', function() {
								// noinspection JSUnresolvedFunction
								$window.trigger('resize');

								if (typeof PerfectScrollbar !== 'undefined') {
									perfect_scrollbar = new PerfectScrollbar('.select2-results__options', {});

									setTimeout(function() {
										if (perfect_scrollbar) {
											if (typeof perfect_scrollbar.update === 'function') {
												perfect_scrollbar.update();
											}
										}
									}, 10);
								}
							}).on('select2:close', function() {
								if (perfect_scrollbar) {
									// noinspection JSUnresolvedVariable
									if (typeof perfect_scrollbar.destroy === 'function') {
										// noinspection JSUnresolvedFunction
										perfect_scrollbar.destroy();
									}
								}
							}).on('select2:select', function (e) {
								// noinspection JSUnresolvedVariable
								if (typeof e.params !== 'undefined') {
									// noinspection JSUnresolvedVariable
									if (typeof e.params.data !== 'undefined') {
										// noinspection JSUnresolvedVariable
										if (typeof e.params.data.element !== 'undefined') {
											// noinspection JSUnresolvedFunction
											//Router.navigate('/' + Router.getRoute() + '/' + parseInt($(e.params.data.element).val(), 10));
										}
									}
								}
							});

							$options_dropdown.select2({ width: 'element' }).on('select2:open', function() {
								if (typeof PerfectScrollbar !== 'undefined') {
									perfect_scrollbar = new PerfectScrollbar('.select2-results__options', {});

									setTimeout(function() {
										if (perfect_scrollbar) {
											if (typeof perfect_scrollbar.update === 'function') {
												perfect_scrollbar.update();
											}
										}
									}, 10);
								}
							}).on('select2:close', function() {
								if (perfect_scrollbar) {
									// noinspection JSUnresolvedVariable
									if (typeof perfect_scrollbar.destroy === 'function') {
										// noinspection JSUnresolvedFunction
										perfect_scrollbar.destroy();
									}
								}
							});
						}
					}

					// noinspection JSUnresolvedFunction
					$body.find('button').addClass('btn btn-light');
				} else {
					// noinspection JSUnresolvedFunction
					$list_dropdown_v1.html('').html(render_list_dropdown_v1(games_v1));
					// noinspection JSUnresolvedFunction
					$list_table.html('').html(render_list_table(games_v1));

					if (!started && games_v1['games'][0]['screenshots'][0]) {
						// noinspection JSUnresolvedVariable
						if ($.fn.lightSlider) {
							// noinspection JSUnresolvedFunction
							$preview.html('').html(render_preview(games_v1['games'][0]['screenshots'])).show();
						} else {
							// noinspection JSUnresolvedFunction
							$preview.css({ 'background-image': 'url(' + games_v1['games'][0]['screenshots'][0] + ')', 'background-size': 'contain' }).show();
						}
					}

					// noinspection JSUnresolvedVariable
					if ($.fn.select2) {
						if ($list_dropdown_v2.data('select2')) {
							$version_dropdown.select2('destroy');
							$list_dropdown_v2.select2('destroy');
							$options_dropdown.select2('destroy');
						}
					}
					// noinspection JSUnresolvedFunction
					$body.find('button').removeClass('btn btn-light');
				}

				// noinspection JSUnresolvedVariable
				if ($.fn.tooltip) {
					// noinspection JSUnresolvedFunction
					$body.find('[data-toggle="tooltip"], [data-toggle="dropdown"]').tooltip();
				}

				// noinspection JSUnresolvedVariable
				if ($.fn.lightSlider) {
					// noinspection JSUnresolvedFunction
					lightslider = $body.find('.lightslider').lightSlider({
						item: 1,
						gallery: true,
						loop: true,
						pager: false,
						auto: true,
						speed: 500,
						slideMargin: 0
					});
				}
			}

			function start_v1(name, file, executable, args, mode, sync, old) {
				if (typeof sync !== 'undefined') {
					if (sync === true) {
						sync = '';
					} else {
						sync = 'no';
					}
				} else {
					sync = '';
				}

				if (typeof old !== 'undefined') {
					if (old === true) {
						old = '-old';
					} else {
						old = '';
					}
				} else {
					old = '';
				}

				if (Array.isArray(file)) {
					var files = [];
					var downloadPromises = [];

					for (var f in file) {
						// noinspection JSUnfilteredForInLoop
						var filePath = '/dosbox/' + file[f]['file'];
						var fileName = file[f]['file'];
						var progressId = 'v1_' + f + '_' + Date.now();

						// noinspection JSUnfilteredForInLoop
						downloadPromises.push(
							downloadFileWithCache(filePath, fileName, progressId)
						);
					}

					Promise.all(downloadPromises).then(function(responses) {
						files = responses;
						// noinspection JSUnresolvedFunction,JSUnresolvedVariable,AmdModulesDependencies
						var emulator = new Emulator($canvas.get(0), function() {
								started = true;
								setTimeout(function() {
									// noinspection JSUnresolvedFunction
									$window.trigger('resize');
								}, 5000);
							},
							new DosBoxLoader(DosBoxLoader.emulatorJS($sys.feature.WEBASSEMBLY && mode !== 'asm' ? 'js/dosbox-' + sync + 'sync-wasm.js' : ($sys.feature.ASMJS ? 'js/dosbox-' + sync + 'sync' + old + '-asm.js' : alert('DOSBox cannot work because WebAssembly and/or ASM.JS is not supported in your browser!'))),
							DosBoxLoader.locateAdditionalEmulatorJS(function(filename) {
								if (filename === 'dosbox.html.mem') {
									return 'js/dosbox-' + sync + 'sync' + old + '.mem';
								}

								if (filename === 'dosbox.wasm') {
									return 'js/dosbox-sync.wasm';
								}

								return filename;
							}),
							DosBoxLoader.fileSystemKey(name),
							DosBoxLoader.nativeResolution(640, 480),
							DosBoxLoader.aspectRatio(640 / 480),
							DosBoxLoader.scale(1),
							DosBoxLoader.mountZip(get_file_order(0, file, files).mount, DosBoxLoader.fetchFile('OS File', URL.createObjectURL(get_file_order(0, file, files).blob))),
							DosBoxLoader.mountZip(get_file_order(1, file, files).mount, DosBoxLoader.fetchFile('Game File', URL.createObjectURL(get_file_order(1, file, files).blob))),
							DosBoxLoader.extraArgs(args),
							DosBoxLoader.startExe(executable))
						);
						emulator.start({ waitAfterDownloading: false });
					}).catch(function(error) {
						console.error('Error downloading files:', error);
					});
				} else {
					// noinspection JSUnresolvedFunction
					var filePath = '/dosbox/' + file;
					var progressId = 'v1_single_' + Date.now();

					downloadFileWithCache(filePath, file, progressId).then(function(response) {
						console.log(response);
						// noinspection JSUnresolvedFunction,JSUnresolvedVariable,AmdModulesDependencies
						var emulator = new Emulator($canvas.get(0), function() {
								started = true;
								setTimeout(function() {
									// noinspection JSUnresolvedFunction
									$window.trigger('resize');
								}, 5000);
							},
							new DosBoxLoader(DosBoxLoader.emulatorJS($sys.feature.WEBASSEMBLY && mode !== 'asm' ? 'js/dosbox-' + sync + 'sync-wasm.js' : ($sys.feature.ASMJS ? 'js/dosbox-' + sync + 'sync' + old + '-asm.js' : alert('DOSBox cannot work because WebAssembly and/or ASM.JS is not supported in your browser!'))),
							DosBoxLoader.locateAdditionalEmulatorJS(function(filename) {
								if (filename === 'dosbox.html.mem') {
									return 'js/dosbox-' + sync + 'sync' + old + '.mem';
								}

								if (filename === 'dosbox.wasm') {
									return 'js/dosbox-' + sync + 'sync.wasm';
								}

								return filename;
							}),
							DosBoxLoader.fileSystemKey(name),
							DosBoxLoader.nativeResolution(640, 480),
							DosBoxLoader.aspectRatio(640 / 480),
							DosBoxLoader.scale(1),
							DosBoxLoader.mountZip('c', DosBoxLoader.fetchFile('Game File', URL.createObjectURL(response.result.fileBlob))),
							DosBoxLoader.extraArgs(args),
							DosBoxLoader.startExe(executable))
						);
						emulator.start({ waitAfterDownloading: false });
					}).catch(function(error) {
						console.error('Error downloading file:', error);
					});
				}
			}

			function start_v2(file, args, mode, sync, cycles) {
				// noinspection JSUnresolvedFunction
				Dos($canvas.get(0), {
					cycles: cycles ? cycles : 'auto',
					wdosboxUrl: mode === 'asm' || $sys.browser.isIE ? (sync ? 'js/dosbox.js' : 'js/dosbox-nosync.js') : (sync ? 'js/wdosbox.js' : 'js/wdosbox-nosync.js'),
					autolock: true
				}).ready(function(fs, main) {
					if (Array.isArray(file)) {
						var downloadPromises = [];

						for (var f in file) {
							// noinspection JSUnfilteredForInLoop
							var filePath = '/dosbox/' + file[f]['url'];
							var fileName = file[f]['url'];
							var progressId = 'v2_' + f + '_' + Date.now();
							// Support both mountdrive and mountfolder (v2) as well as legacy mount (v1)
							var mountDrive = file[f]['mountdrive'];
							var mountFolder = file[f]['mountfolder'];
							var mountLegacy = file[f]['mount'];

							// noinspection JSUnfilteredForInLoop
							(function(drive, folder, legacy, index) {
								downloadPromises.push(
									downloadFileWithCache(filePath, fileName, progressId).then(function(response) {
										response['mountdrive'] = drive;
										response['mountfolder'] = folder;
										response['mount'] = legacy;
										response['index'] = index;
										return response;
									})
								);
							})(mountDrive, mountFolder, mountLegacy, f);
						}

						Promise.all(downloadPromises).then(function(files) {
							// Build extractAll array and prepare drive mount commands
							var extractArray = [];
							var driveCommands = [];

							// Helper function to generate a simple hash for a string
							function simpleHash(str, length) {
								var hash = 0;
								for (var j = 0; j < str.length; j++) {
									hash = ((hash << 5) - hash) + str.charCodeAt(j);
									hash = hash & hash; // Convert to 32bit integer
								}
								return Math.abs(hash).toString(36).substring(0, length); // Base36
							}

							for (var i = 0; i < files.length; i++) {
								var mountPoint;

								// Handle mountdrive: extract to a temp folder, then mount as drive
								if (files[i]['mountdrive']) {
									// Extract to a DOS-compatible folder name (8.3 format)
									var driveLetter = files[i]['mountdrive'].toUpperCase();
									// Generate a unique folder name based on file URL to avoid collisions
									// Extract filename without extension
									var fileName = file[i]['url'].split('/').pop().split('.')[0];
									// Use as much of the original name as possible (up to 6 chars for name)
									var filePrefix = fileName.substring(0, 6).toLowerCase();
									// Add drive letter as part of name (total 7-8 chars for name part)
									var folderName = filePrefix + '_' + driveLetter.toLowerCase();
									// Use 3-char hash as extension for maximum uniqueness (46,656 combinations)
									var hashExt = simpleHash(file[i]['url'], 3);
									// Use format: /XXXXXX_Y.HHH where XXXXXX is filename (up to 6 chars), Y is drive, HHH is hash (3 chars)
									// Total: 8.3 format (DOS compatible)
									var tempFolder = '/' + folderName + '.' + hashExt;
									mountPoint = tempFolder;

									// Add DOSBox MOUNT command to map this folder to a drive letter
									// This command will be prepended to the args array
									driveCommands.push('-c');
									driveCommands.push('mount ' + driveLetter + ' ' + tempFolder);
								}
								// Handle mountfolder: extract to a specific folder path
								else if (files[i]['mountfolder']) {
									mountPoint = '/' + files[i]['mountfolder'];
								}
								// Legacy mount support for backwards compatibility
								else if (files[i]['mount']) {
									mountPoint = '/' + files[i]['mount'];
								}
								// Default fallback
								else {
									mountPoint = '/';
								}

								extractArray.push({
									url: URL.createObjectURL(files[i]['result']['fileBlob']),
									mountPoint: mountPoint
								});
							}

							// Prepend drive mount commands to args
							if (driveCommands.length > 0) {
								args = driveCommands.concat(args);
							}

							// noinspection JSUnresolvedFunction
							fs.extractAll(extractArray).then(function() {
								started = true;
								main(args).then(function(ci) {
									window.ci = ci;
								});
							});
						}).catch(function(error) {
							console.error('Error downloading files:', error);
						});
					} else {
						// noinspection JSUnresolvedFunction
						var filePath = '/dosbox/' + file;
						var progressId = 'v2_single_' + Date.now();

						downloadFileWithCache(filePath, file, progressId).then(function(response) {
							console.log(response);
							// noinspection JSUnresolvedFunction,JSUnresolvedVariable
							fs.extract(URL.createObjectURL(response.result.fileBlob)).then(function() {
								started = true;
								main(args).then(function(ci) {
									window.ci = ci;
								});
							});
						}).catch(function(error) {
							console.error('Error downloading file:', error);
						});
					}
				});
			}

			// noinspection JSUnresolvedFunction
			dbx = new dropbox.Dropbox({ accessToken: window['DROPBOX_TOKEN'], fetch: fetch.fetch });

			$document			= $(document);
			$window				= $(window);
			$html				= $('html');
			$body				= $('body');
			$canvas				= $('#canvas');
			$version_dropdown	= $('.version-dropdown');
			$list_dropdown_v1	= $('.list-dropdown-v1');
			$list_dropdown_v2	= $('.list-dropdown-v2');
			$options_dropdown	= $('.options-dropdown');
			$list_table			= $('.list-table');
			$preview			= $('.preview');
			$start				= $('.start');

			// Initialize cache manager and progress manager
			if (typeof CacheManager !== 'undefined' && typeof ProgressManager !== 'undefined') {
				cacheManager = new CacheManager();
				progressManager = new ProgressManager();

				cacheManager.init().then(function() {
					console.log('Cache manager initialized successfully');
				}).catch(function(error) {
					console.warn('Cache manager initialization failed, caching will be disabled:', error);
					// Create a fallback cache manager with no-op methods
					cacheManager = {
						get: function() { return Promise.resolve(null); },
						set: function() { return Promise.resolve(); },
						has: function() { return Promise.resolve(false); }
					};
				});
			} else {
				console.warn('CacheManager or ProgressManager not available');
				// Create fallback objects
				cacheManager = {
					get: function() { return Promise.resolve(null); },
					set: function() { return Promise.resolve(); },
					has: function() { return Promise.resolve(false); }
				};
				progressManager = {
					createProgressBar: function() {},
					updateProgress: function() {},
					setStatus: function() {},
					setComplete: function() {},
					setError: function() {},
					setCached: function() {}
				};
			}

			// noinspection JSUnresolvedVariable
			if ($sys.feature.CANVAS && $sys.feature.TYPED_ARRAYS && ($sys.feature.ASMJS || $sys.feature.WEBASSEMBLY)) {
				// noinspection JSUnusedLocalSymbols
				var index_selected, genre_index_selected, game_index_selected, option_selected, game_id_selected;

				// noinspection JSUnresolvedFunction
				first = typeof $.url().param('gamev1') !== 'undefined' ? $.url().param('gamev1') : (typeof $.url().param('gamev2') !== 'undefined' ? $.url().param('gamev2') : false);

				// noinspection JSUnresolvedFunction
				if (typeof $.url().param('gamev2') !== 'undefined') {
					// noinspection JSUnresolvedFunction
					$version_dropdown.find('option').prop('selected', false).removeAttr('selected');
					// noinspection JSUnresolvedFunction
					$version_dropdown.find('option[value="v2"]').prop('selected', true).attr('selected', true);
					// noinspection JSUnresolvedFunction
					$body.removeClass('v1 v2').addClass('v2');
				}

				// noinspection JSUnresolvedFunction
				if (typeof $.url().param('gamev1') !== 'undefined') {
					// noinspection JSUnresolvedFunction
					$body.removeClass('v1 v2').addClass('v1');
				}

				init();

				if (first) {
					// noinspection JSUnresolvedFunction
					$list_table.hide();
					// noinspection JSUnresolvedFunction
					$preview.hide();
					// noinspection JSUnresolvedFunction
					$start.hide();

					// noinspection DuplicatedCode,JSUnresolvedFunction
					if ($body.hasClass('v2')) {
						// noinspection JSUnresolvedFunction
						$list_dropdown_v2.find('option').prop('selected', false).removeAttr('selected');
						// noinspection JSUnresolvedFunction
						$options_dropdown.find('option').prop('selected', false).removeAttr('selected');

						var genres = games_v2['software']['type'];
						var selgame = null;
						var selidx = 0;

						loop1:
						for (var genre in genres) {
							// noinspection JSUnfilteredForInLoop
							var games = genres[genre]['games'];
							// noinspection JSUnfilteredForInLoop
							for (var g in games) {
								// noinspection JSUnfilteredForInLoop
								if (typeof games[g]['versions'] !== 'undefined') {
									// noinspection JSUnfilteredForInLoop
									var versions1 = games[g]['versions'];
									for (var ver1 in versions1) {
										// noinspection JSUnfilteredForInLoop
										if (versions1[ver1]['id'] === first) {
											// noinspection JSUnfilteredForInLoop
											selgame = versions1[ver1];
											break loop1;
										} else {
											// noinspection JSUnfilteredForInLoop
											if (typeof versions1[ver1]['versions'] !== 'undefined') {
												// noinspection JSUnfilteredForInLoop
												var versions2 = versions1[ver1]['versions'];
												for (var ver2 in versions2) {
													// noinspection JSUnfilteredForInLoop
													if (versions2[ver2]['id'] === first) {
														// noinspection JSUnfilteredForInLoop
														selgame = versions2[ver2];
														break loop1;
													}
												}
											}
										}
									}
								}
								selidx++;
							}
						}

						// noinspection JSUnresolvedFunction
						$list_dropdown_v2.find('option[value="' + selidx + '"]').prop('selected', true).attr('selected', true).trigger('change');
						var selgenreidx = parseInt($list_dropdown_v2.find('option[value="' + selidx + '"]').data('genre-index'), 10);
						var selgameidx = parseInt($list_dropdown_v2.find('option[value="' + selidx + '"]').data('game-index'), 10);
						// noinspection JSUnresolvedFunction
						$options_dropdown.html('').html(render_options_dropdown(games_v2['software']['type'][selgenreidx]['games'][selgameidx]));
						// noinspection JSUnresolvedFunction
						$options_dropdown.find('option[data-game-id="' + first + '"]').prop('selected', true).attr('selected', true).trigger('change');

						// noinspection DuplicatedCode
						var file = typeof selgame['file'] !== 'undefined' ? selgame['file'] : '';
						var args = typeof selgame['args'] !== 'undefined' ? selgame['args'] : [];
						var executable = typeof selgame['executable'] !== 'undefined' ? selgame['executable'] : '';
						var mode = selgame['mode'];
						var sync = typeof selgame['sync'] !== 'undefined' ? selgame['sync'] : true;
						var cycles = selgame['cycles'];

						args.push('-c', executable.replace('./', ''));
						start_v2(file, args, mode, sync, cycles);
					} else {
						// noinspection JSUnresolvedFunction
						$list_dropdown_v1.find('option').prop('selected', false).removeAttr('selected');
						// noinspection JSUnresolvedFunction
						var game_selected = null;
						if (typeof $.url().param('gamev1') !== 'undefined') {
							var $option = $list_dropdown_v1.find('option[data-game-id="'+ $.url().param('gamev1') +'"]');
							if ($option.length > 0) {
								$option.prop('selected', true).attr('selected', true);
								game_selected = $option.data('game-id');
							}
						}

						// noinspection DuplicatedCode
						for (var game in games_v1['games']) {
							// noinspection JSUnfilteredForInLoop,DuplicatedCode
							if (games_v1['games'][game]['id'] === game_selected) {
								// noinspection JSUnfilteredForInLoop,DuplicatedCode
								start_v1(games_v1['games'][game]['id'], typeof games_v1['games'][game]['files'] !== 'undefined' ? games_v1['games'][game]['files'] : games_v1['games'][game]['file'], games_v1['games'][game]['executable'], games_v1['games'][game]['args'], games_v1['games'][game]['mode'], games_v1['games'][game]['sync'], games_v1['games'][game]['old']);
								break;
							} else {
								// noinspection JSUnfilteredForInLoop
								if (typeof games_v1['games'][game]['clones'] !== 'undefined') {
									// noinspection JSUnfilteredForInLoop,JSUnusedLocalSymbols
									for (var clone in games_v1['games'][game]['clones']) {
										// noinspection JSUnfilteredForInLoop,DuplicatedCode
										if (games_v1['games'][game]['clones'][clone]['id'] === game_selected) {
											// noinspection JSUnfilteredForInLoop,DuplicatedCode
											start_v1(games_v1['games'][game]['id'], (typeof games_v1['games'][game]['clones'][clone]['files'] !== 'undefined' ? games_v1['games'][game]['clones'][clone]['files'] : (typeof games_v1['games'][game]['clones'][clone]['file'] !== 'undefined' ? games_v1['games'][game]['clones'][clone]['file'] : (typeof games_v1['games'][game]['files'] !== 'undefined' ? games_v1['games'][game]['files'] : games_v1['games'][game]['file']))), (typeof games_v1['games'][game]['clones'][clone]['executable'] !== 'undefined' ? games_v1['games'][game]['clones'][clone]['executable'] : games_v1['games'][game]['executable']), (typeof games_v1['games'][game]['clones'][clone]['args'] !== 'undefined' ? games_v1['games'][game]['clones'][clone]['args'] : games_v1['games'][game]['args']), games_v1['games'][game]['clones'][clone]['mode'], (typeof games_v1['games'][game]['clones'][clone]['sync'] !== 'undefined' ? games_v1['games'][game]['clones'][clone]['sync'] : games_v1['games'][game]['sync']), (typeof games_v1['games'][game]['clones'][clone]['old'] !== 'undefined' ? games_v1['games'][game]['clones'][clone]['old'] : games_v1['games'][game]['old']));
											break;
										}
									}
								}
							}
						}
					}

					first = false;
				}

				// noinspection JSUnresolvedFunction,DuplicatedCode
				$document.off('click', '.list-table table tr').on('click', '.list-table table tr', function() {
					// noinspection JSUnresolvedFunction
					if ($body.hasClass('v2')) {

					} else {
						var $el = $(this);
						var game_selected = $el.data('game-id');

						// noinspection DuplicatedCode
						if (first) {
							first = false;

							// noinspection DuplicatedCode
							for (var game in games_v1['games']) {
								// noinspection JSUnfilteredForInLoop,DuplicatedCode
								if (games_v1['games'][game]['id'] === game_selected) {
									// noinspection JSUnresolvedFunction
									$list_table.hide();
									// noinspection JSUnresolvedFunction
									$preview.hide();
									// noinspection JSUnresolvedFunction
									$start.hide();
									// noinspection JSUnfilteredForInLoop,DuplicatedCode
									start_v1(games_v1['games'][game]['id'], typeof games_v1['games'][game]['files'] !== 'undefined' ? games_v1['games'][game]['files'] : games_v1['games'][game]['file'], games_v1['games'][game]['executable'], games_v1['games'][game]['args'], games_v1['games'][game]['mode'], games_v1['games'][game]['sync'], games_v1['games'][game]['old']);
									break;
								} else {
									// noinspection JSUnfilteredForInLoop,DuplicatedCode
									if (typeof games_v1['games'][game]['clones'] !== 'undefined') {
										// noinspection JSUnfilteredForInLoop,JSUnusedLocalSymbols,DuplicatedCode
										for (var clone in games_v1['games'][game]['clones']) {
											// noinspection JSUnfilteredForInLoop,DuplicatedCode
											if (games_v1['games'][game]['clones'][clone]['id'] === game_selected) {
												// noinspection JSUnresolvedFunction
												$list_table.hide();
												// noinspection JSUnresolvedFunction
												$preview.hide();
												// noinspection JSUnresolvedFunction
												$start.hide();
												// noinspection JSUnfilteredForInLoop,DuplicatedCode
												start_v1(games_v1['games'][game]['id'], (typeof games_v1['games'][game]['clones'][clone]['files'] !== 'undefined' ? games_v1['games'][game]['clones'][clone]['files'] : (typeof games_v1['games'][game]['clones'][clone]['file'] !== 'undefined' ? games_v1['games'][game]['clones'][clone]['file'] : (typeof games_v1['games'][game]['files'] !== 'undefined' ? games_v1['games'][game]['files'] : games_v1['games'][game]['file']))), (typeof games_v1['games'][game]['clones'][clone]['executable'] !== 'undefined' ? games_v1['games'][game]['clones'][clone]['executable'] : games_v1['games'][game]['executable']), (typeof games_v1['games'][game]['clones'][clone]['args'] !== 'undefined' ? games_v1['games'][game]['clones'][clone]['args'] : games_v1['games'][game]['args']), games_v1['games'][game]['clones'][clone]['mode'], (typeof games_v1['games'][game]['clones'][clone]['sync'] !== 'undefined' ? games_v1['games'][game]['clones'][clone]['sync'] : games_v1['games'][game]['sync']), (typeof games_v1['games'][game]['clones'][clone]['old'] !== 'undefined' ? games_v1['games'][game]['clones'][clone]['old'] : games_v1['games'][game]['old']));
												break;
											}
										}
									}
								}
							}
						} else {
							location.href = location.protocol + '//' + location.host + location.pathname + '?gamev1=' + game_selected;
						}
					}
				});
				// noinspection JSUnresolvedFunction
				$document.off('click', '.start').on('click', '.start', function () {
					$('.tooltip, .popover').remove();
					// noinspection JSUnresolvedFunction
					$('.load').trigger('click');
				});
				// noinspection JSUnresolvedFunction,DuplicatedCode
				$document.off('click', '.load').on('click', '.load', function() {
					var index_selected;

					// noinspection JSUnresolvedFunction,DuplicatedCode
					if ($body.hasClass('v2')) {
						// noinspection JSUnresolvedFunction
						var option_selected = parseInt($options_dropdown.val(), 10);
						var game_id_selected = $options_dropdown.find('option[value="' + option_selected + '"]').data('game-id');
						var genres = games_v2['software']['type'];
						var selgame = null;
						var selidx = 0;

						loop1:
						for (var genre in genres) {
							// noinspection JSUnfilteredForInLoop
							var games = genres[genre]['games'];
							// noinspection JSUnfilteredForInLoop
							for (var g in games) {
								// noinspection JSUnfilteredForInLoop
								if (typeof games[g]['versions'] !== 'undefined') {
									// noinspection JSUnfilteredForInLoop
									var versions1 = games[g]['versions'];
									for (var ver1 in versions1) {
										// noinspection JSUnfilteredForInLoop
										if (versions1[ver1]['id'] === game_id_selected) {
											// noinspection JSUnfilteredForInLoop
											selgame = versions1[ver1];
											break loop1;
										} else {
											// noinspection JSUnfilteredForInLoop
											if (typeof versions1[ver1]['versions'] !== 'undefined') {
												// noinspection JSUnfilteredForInLoop
												var versions2 = versions1[ver1]['versions'];
												for (var ver2 in versions2) {
													// noinspection JSUnfilteredForInLoop
													if (versions2[ver2]['id'] === game_id_selected) {
														// noinspection JSUnfilteredForInLoop
														selgame = versions2[ver2];
														break loop1;
													}
												}
											}
										}
									}
								}
								selidx++;
							}
						}

						var id = typeof selgame['id'] !== 'undefined' ? selgame['id'] : '';
						// noinspection DuplicatedCode
						var file = typeof selgame['file'] !== 'undefined' ? selgame['file'] : '';
						var args = typeof selgame['args'] !== 'undefined' ? selgame['args'] : [];
						var executable = typeof selgame['executable'] !== 'undefined' ? selgame['executable'] : '';
						var mode = selgame['mode'];
						var sync = typeof selgame['sync'] !== 'undefined' ? selgame['sync'] : true;
						var cycles = selgame['cycles'];

						args.push('-c', executable.replace('./', ''));

						if (first) {
							first = false;
							// noinspection JSUnresolvedFunction
							$list_table.hide();
							// noinspection JSUnresolvedFunction
							$preview.hide();
							// noinspection JSUnresolvedFunction
							$start.hide();
							start_v2(file, args, mode, sync, cycles);
						} else {
							if (typeof window.ci !== 'undefined') {
								if (typeof window.ci.exit === 'function') {
									window.ci.exit();
								}
							}
							location.href = location.protocol + '//' + location.host + location.pathname + '?gamev2=' + id;
						}
					} else {
						// noinspection JSUnresolvedFunction
						var game_selected = $list_dropdown_v1.find('option:selected').data('game-id');

						// noinspection DuplicatedCode
						if (first) {
							first = false;
							// noinspection JSUnresolvedFunction
							$list_table.hide();
							// noinspection JSUnresolvedFunction
							$preview.hide();
							// noinspection JSUnresolvedFunction
							$start.hide();
							// noinspection DuplicatedCode
							for (var game in games_v1['games']) {
								// noinspection JSUnfilteredForInLoop,DuplicatedCode
								if (games_v1['games'][game]['id'] === game_selected) {
									// noinspection JSUnfilteredForInLoop,DuplicatedCode
									start_v1(games_v1['games'][game]['id'], typeof games_v1['games'][game]['files'] !== 'undefined' ? games_v1['games'][game]['files'] : games_v1['games'][game]['file'], games_v1['games'][game]['executable'], games_v1['games'][game]['args'], games_v1['games'][game]['mode'], games_v1['games'][game]['sync'], games_v1['games'][game]['old']);
									break;
								} else {
									// noinspection JSUnfilteredForInLoop,DuplicatedCode
									if (typeof games_v1['games'][game]['clones'] !== 'undefined') {
										// noinspection JSUnfilteredForInLoop,JSUnusedLocalSymbols,DuplicatedCode
										for (var clone in games_v1['games'][game]['clones']) {
											// noinspection JSUnfilteredForInLoop,DuplicatedCode
											if (games_v1['games'][game]['clones'][clone]['id'] === game_selected) {
												// noinspection JSUnfilteredForInLoop,DuplicatedCode
												start_v1(games_v1['games'][game]['id'], (typeof games_v1['games'][game]['clones'][clone]['files'] !== 'undefined' ? games_v1['games'][game]['clones'][clone]['files'] : (typeof games_v1['games'][game]['clones'][clone]['file'] !== 'undefined' ? games_v1['games'][game]['clones'][clone]['file'] : (typeof games_v1['games'][game]['files'] !== 'undefined' ? games_v1['games'][game]['files'] : games_v1['games'][game]['file']))), (typeof games_v1['games'][game]['clones'][clone]['executable'] !== 'undefined' ? games_v1['games'][game]['clones'][clone]['executable'] : games_v1['games'][game]['executable']), (typeof games_v1['games'][game]['clones'][clone]['args'] !== 'undefined' ? games_v1['games'][game]['clones'][clone]['args'] : games_v1['games'][game]['args']), games_v1['games'][game]['clones'][clone]['mode'], (typeof games_v1['games'][game]['clones'][clone]['sync'] !== 'undefined' ? games_v1['games'][game]['clones'][clone]['sync'] : games_v1['games'][game]['sync']), (typeof games_v1['games'][game]['clones'][clone]['old'] !== 'undefined' ? games_v1['games'][game]['clones'][clone]['old'] : games_v1['games'][game]['old']));
											}
										}
									}
								}
							}
						} else {
							location.href = location.protocol + '//' + location.host + location.pathname + '?gamev1=' + game_selected;
						}
					}
				});
				// noinspection JSUnresolvedFunction
				$document.off('click', '.list').on('click', '.list', function() {
					// noinspection JSCheckFunctionSignatures
					$list_table.toggle();
				});
				// noinspection JSUnresolvedFunction
				$document.off('click', '.fullscreen').on('click', '.fullscreen', function() {
					// noinspection JSUnresolvedFunction
					if ($body.hasClass('v2')) {
						// noinspection JSUnresolvedVariable
						if (window.ci) {
							// noinspection JSUnresolvedVariable,JSDeprecatedSymbols
							window.ci.fullscreen();
						}
					} else {
						if (Module) {
							Module.requestFullscreen(true, false);
							started = true;
						}
					}
				});
				// noinspection JSUnresolvedFunction
				$document.off('change', '.list-dropdown-v1, .list-dropdown-v2').on('change', '.list-dropdown-v1, .list-dropdown-v2', function() {
					var index_selected;
					var screenshot;
					started = false;

					if (!started) {
						$start.show();

						// noinspection DuplicatedCode,JSUnresolvedFunction
						if ($body.hasClass('v2')) {
							if (typeof window.ci !== 'undefined') {
								if (typeof window.ci.exit === 'function') {
									window.ci.exit();
								}
							}

							// noinspection JSUnresolvedFunction
							index_selected = parseInt($list_dropdown_v2.val(), 10);
							var genre_index_selected = parseInt($list_dropdown_v2.find('option[value="' + index_selected + '"]').data('genre-index'), 10);
							var game_index_selected = parseInt($list_dropdown_v2.find('option[value="' + index_selected + '"]').data('game-index'), 10);
							// noinspection JSUnresolvedFunction
							$options_dropdown.html('').html(render_options_dropdown(games_v2['software']['type'][genre_index_selected]['games'][game_index_selected]));
							var screenshots = typeof games_v2['software']['type'][genre_index_selected]['games'][game_index_selected]['versions'][0]['screenshots'] !== 'undefined' ? games_v2['software']['type'][genre_index_selected]['games'][game_index_selected]['versions'][0]['screenshots'] : (typeof games_v2['software']['type'][genre_index_selected]['games'][game_index_selected]['screenshots'] !== 'undefined' ? games_v2['software']['type'][genre_index_selected]['games'][game_index_selected]['screenshots'] : []);
							screenshot = typeof screenshots[0] !== 'undefined' ? screenshots[0] : '';

							// noinspection DuplicatedCode,JSUnresolvedVariable
							if ($.fn.lightSlider) {
								// noinspection JSUnresolvedFunction
								$preview.html('').html(render_preview(screenshots)).show();
							} else {
								// noinspection JSUnresolvedFunction
								$preview.css({ 'background-image': 'url(' + screenshot + ')', 'background-size': 'contain' }).show();
							}
						} else {
							// noinspection JSUnresolvedFunction
							var game_selected = $list_dropdown_v1.find('option:selected').data('game-id');

							// noinspection DuplicatedCode
							for (var game in games_v1['games']) {
								// noinspection JSUnfilteredForInLoop,DuplicatedCode
								if (games_v1['games'][game]['id'] === game_selected) {
									// noinspection JSUnfilteredForInLoop
									if (typeof games_v1['games'][game]['screenshots'] === 'object') {
										// noinspection JSUnfilteredForInLoop
										screenshot = (typeof games_v1['games'][game]['screenshots'] === 'object' ? (typeof games_v1['games'][game]['screenshots'][0] !== 'undefined' ? games_v1['games'][game]['screenshots'][0] : '') : '');

										if (screenshot !== '') {
											// noinspection JSUnresolvedVariable
											if ($.fn.lightSlider) {
												// noinspection JSUnfilteredForInLoop,JSUnresolvedFunction
												$preview.html('').html(render_preview(games_v1['games'][game]['screenshots'])).show();
											} else {
												// noinspection JSUnfilteredForInLoop,JSUnresolvedFunction
												$preview.css({ 'background-image': 'url(' + (typeof games_v1['games'][game]['screenshots'][0] !== 'undefined' ? games_v1['games'][game]['screenshots'][0] : '') + ')', 'background-size': 'contain' }).show();
											}
										} else {
											// noinspection JSUnresolvedFunction
											$preview.hide();
										}
									} else {
										// noinspection JSUnresolvedFunction
										$preview.hide();
									}
									break;
								} else {
									// noinspection JSUnfilteredForInLoop
									if (typeof games_v1['games'][game]['clones'] !== 'undefined') {
										// noinspection JSUnfilteredForInLoop,JSUnusedLocalSymbols
										for (var clone in games_v1['games'][game]['clones']) {
											// noinspection JSUnfilteredForInLoop,DuplicatedCode
											if (games_v1['games'][game]['clones'][clone]['id'] === game_selected) {
												// noinspection JSUnfilteredForInLoop
												if (typeof games_v1['games'][game]['clones'][clone]['screenshots'] === 'object' || typeof games_v1['games'][game]['screenshots'] === 'object') {
													// noinspection JSUnfilteredForInLoop
													screenshot = (typeof games_v1['games'][game]['clones'][clone]['screenshots'] === 'object' ? (typeof games_v1['games'][game]['clones'][clone]['screenshots'][0] !== 'undefined' ? games_v1['games'][game]['clones'][clone]['screenshots'][0] : (typeof games_v1['games'][game]['screenshots'][0] !== 'undefined' ? games_v1['games'][game]['screenshots'][0] : '')) : (typeof games_v1['games'][game]['screenshots'] === 'object' ? (typeof games_v1['games'][game]['screenshots'][0] !== 'undefined' ? games_v1['games'][game]['screenshots'][0] : '') : ''));

													if (screenshot !== '') {
														// noinspection JSUnresolvedVariable
														if ($.fn.lightSlider) {
															// noinspection JSUnfilteredForInLoop
															if (typeof games_v1['games'][game]['clones'][clone]['screenshots'] === 'object') {
																// noinspection JSUnfilteredForInLoop,JSUnresolvedFunction
																$preview.html('').html(render_preview(games_v1['games'][game]['clones'][clone]['screenshots'])).show();
															} else {
																// noinspection JSUnfilteredForInLoop
																if (typeof games_v1['games'][game]['screenshots'] === 'object') {
																	// noinspection JSUnfilteredForInLoop,JSUnresolvedFunction
																	$preview.html('').html(render_preview(games_v1['games'][game]['screenshots'])).show();
																} else {
																	// noinspection JSUnresolvedFunction
																	$preview.hide();
																}
															}
														} else {
															// noinspection JSUnfilteredForInLoop,JSUnresolvedFunction
															$preview.css({ 'background-image': 'url(' + screenshot + ')', 'background-size': 'contain' }).show();
														}
													} else {
														// noinspection JSUnresolvedFunction
														$preview.hide();
													}
												} else {
													// noinspection JSUnresolvedFunction
													$preview.hide();
												}
												break;
											}
										}
									}
								}
							}
						}

						// noinspection JSUnresolvedVariable
						if ($.fn.lightSlider) {
							// noinspection JSUnresolvedFunction
							lightslider = $body.find('.lightslider').lightSlider({
								item: 1,
								gallery: true,
								loop: true,
								pager: false,
								auto: true,
								speed: 500,
								slideMargin: 0
							});
						}
					}
				});
				// noinspection JSUnresolvedFunction
				$document.off('change', '.options-dropdown').on('change', '.options-dropdown', function() {
					// noinspection DuplicatedCode,JSUnresolvedFunction
					if ($body.hasClass('v2')) {
						$start.show();

						if (typeof window.ci !== 'undefined') {
							if (typeof window.ci.exit === 'function') {
								window.ci.exit();
							}
						}

						// noinspection JSUnresolvedFunction
						var index_selected = parseInt($list_dropdown_v2.val(), 10);
						// noinspection JSUnresolvedFunction
						var option_selected = parseInt($options_dropdown.val(), 10);
						var genre_index_selected = parseInt($list_dropdown_v2.find('option[value="' + index_selected + '"]').data('genre-index'), 10);
						var game_index_selected = parseInt($list_dropdown_v2.find('option[value="' + index_selected + '"]').data('game-index'), 10);
						var game_id_selected = $options_dropdown.find('option[value="' + option_selected + '"]').data('game-id');
						var games = games_v2['software']['type'][genre_index_selected]['games'][game_index_selected];
						var screenshots = typeof games['screenshots'] !== 'undefined' ? games['screenshots'] : [];

						for (var game in games['versions']) {
							// noinspection JSUnfilteredForInLoop
							if (typeof games['versions'][game]['versions'] !== 'undefined') {
								// noinspection JSUnfilteredForInLoop
								if (typeof games['versions'][game]['versions']['length'] !== 'undefined') {
									// noinspection JSUnfilteredForInLoop
									if (parseInt(games['versions'][game]['versions']['length'], 10) > 0) {
										// noinspection JSUnfilteredForInLoop
										for (var ver in games['versions'][game]['versions']) {
											// noinspection JSUnfilteredForInLoop,DuplicatedCode
											if (games['versions'][game]['versions'][ver]['id'] === game_id_selected) {
												// noinspection JSUnfilteredForInLoop
												screenshots = typeof games['versions'][game]['versions'][ver]['screenshots'] !== 'undefined' ? games['versions'][game]['versions'][ver]['screenshots'] : (typeof games['versions'][game]['screenshots'] !== 'undefined' ? games['versions'][game]['screenshots'] : (typeof games['screenshots'] !== 'undefined' ? games['screenshots'] : []));
												break;
											}
										}
									} else {
										// noinspection JSUnfilteredForInLoop,DuplicatedCode
										if (games['versions'][game]['id'] === game_id_selected) {
											// noinspection JSUnfilteredForInLoop
											screenshots = typeof games['versions'][game]['screenshots'] !== 'undefined' ? games['versions'][game]['screenshots'] : (typeof games['screenshots'] !== 'undefined' ? games['screenshots'] : []);
											break;
										}
									}
								} else {
									// noinspection JSUnfilteredForInLoop,DuplicatedCode
									if (games['versions'][game]['id'] === game_id_selected) {
										// noinspection JSUnfilteredForInLoop
										screenshots = typeof games['versions'][game]['screenshots'] !== 'undefined' ? games['versions'][game]['screenshots'] : (typeof games['screenshots'] !== 'undefined' ? games['screenshots'] : []);
										break;
									}
								}
							} else {
								// noinspection JSUnfilteredForInLoop,DuplicatedCode
								if (games['versions'][game]['id'] === game_id_selected) {
									// noinspection JSUnfilteredForInLoop
									screenshots = typeof games['versions'][game]['screenshots'] !== 'undefined' ? games['versions'][game]['screenshots'] : (typeof games['screenshots'] !== 'undefined' ? games['screenshots'] : []);
									break;
								}
							}
						}

						// noinspection DuplicatedCode,JSUnresolvedVariable
						if ($.fn.lightSlider) {
							// noinspection JSUnresolvedFunction
							$preview.html('').html(render_preview(screenshots)).show();
							// noinspection JSUnresolvedFunction
							lightslider = $body.find('.lightslider').lightSlider({
								item: 1,
								gallery: true,
								loop: true,
								pager: false,
								auto: true,
								speed: 500,
								slideMargin: 0
							});
						} else {
							// noinspection JSUnresolvedFunction
							$preview.css({ 'background-image': 'url(' + screenshots[0] + ')', 'background-size': 'contain' }).show();
						}
					}
				});
				// noinspection JSUnresolvedFunction
				$document.off('change', '.version-dropdown').on('change', '.version-dropdown', function() {
					// noinspection JSUnresolvedFunction
					$body.removeClass('v1 v2').addClass($version_dropdown.val());
					init();
				});
				// noinspection JSUnresolvedFunction,DuplicatedCode
				$window.off('resize').on('resize', function() {
					// noinspection JSUnresolvedFunction
					$body.find('.select2-container--bootstrap4 .select2-results > .select2-results__options').css({ 'max-height': $window.height() - 57 });

					// noinspection DuplicatedCode
					var previewWidth = solve_aspect_ratio(undefined, $preview.height(), 8, 5);
					var previewHeight = solve_aspect_ratio($preview.width(), undefined, 8, 5);

					if (previewWidth > $preview.width()) {
						previewWidth = $preview.width();
					}

					if (previewHeight > $preview.height()) {
						previewHeight = $preview.height();
					}

					var canvasWidth = solve_aspect_ratio(undefined, $canvas.height(), 4, 3);

					if (canvasWidth > $canvas.width()) {
						canvasWidth = $canvas.width();
					}

					if (window.innerWidth <= canvasWidth) {
						$canvas.width('100%').height('auto');
					} else {
						$canvas.width('auto').height('100%');
					}

					$preview.find('img').width(previewWidth).height(previewHeight);

					if (lightslider) {
						if (typeof lightslider.refresh === 'function') {
							lightslider.refresh();
						}
					}
				});
				// noinspection JSUnresolvedFunction
				$window.trigger('resize');
			} else {
				alert('DOSBox cannot work because your browser is not supported!')
			}
		});
	});
} (this));