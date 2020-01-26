(function() {
	requirejs.config({
		waitSeconds: 300,
		paths: {
			bootstrap: '../../../../js/libraries/bootstrap-4.4.1.min',
			browserfs: '../../../../js/libraries/browserfs-1.4.3.min',
			'datatables.net': '../../../../js/libraries/datatables-1.10.20.min',
			'datatables.net-bs4': '../../../../js/libraries/datatables-bootstrap4-1.10.20.min',
			'datatables.net-editor': '../../../../js/libraries/datatables-editor-1.6.7.min',
			'datatables.net-buttons': '../../../../js/libraries/datatables-buttons-1.6.1.min',
			'datatables.net-buttons-colvis': '../../../../js/libraries/datatables-buttons-colvis-1.6.1.min',
			'datatables.net-buttons-html5': '../../../../js/libraries/datatables-buttons-html5-1.6.1.min',
			'datatables.net-buttons-print': '../../../../js/libraries/datatables-buttons-print-1.6.1.min',
			'datatables.net-buttons-bs4': '../../../../js/libraries/datatables-buttons-bootstrap4-1.6.1.min',
			'datatables.net-colreorder': '../../../../js/libraries/datatables-colreorder-1.5.2.min',
			'datatables.net-colreorder-bs4': '../../../../js/libraries/datatables-colreorder-bootstrap4-1.5.2.min',
			'datatables.net-fixedcolumns': '../../../../js/libraries/datatables-fixedcolumns-3.3.0.min',
			'datatables.net-fixedcolumns-bs4': '../../../../js/libraries/datatables-fixedcolumns-bootstrap4-3.3.0.min',
			'datatables.net-fixedheader': '../../../../js/libraries/datatables-fixedheader-3.1.6.min',
			'datatables.net-fixedheader-bs4': '../../../../js/libraries/datatables-fixedheader-bootstrap4-3.1.6.min',
			'datatables.net-responsive': '../../../../js/libraries/datatables-responsive-2.2.3.min',
			'datatables.net-responsive-bs4': '../../../../js/libraries/datatables-responsive-bootstrap4-2.2.3.min',
			'datatables.net-select': '../../../../js/libraries/datatables-select-1.3.1.min',
			'datatables.net-select-bs4': '../../../../js/libraries/datatables-select-bootstrap4-1.3.1.min',
			dropbox: '../../../../js/libraries/dropbox-4.0.30.min',
			es6promise: '../../../../js/polyfills/es6-promise-auto-4.2.8.min',
			es6fetch: '../../../../js/polyfills/es6-fetch-3.0.0',
			jquery: '../../../../js/libraries/jquery-3.4.1.min',
			jsdos: '../../../../js/libraries/js-dos-6.22.59.min',
			json: '../../../../js/libraries/requirejs-json-1.0.3',
			jsonpath: '../../../../js/libraries/jsonpath-1.0.2.min',
			jszip: '../../../../js/libraries/jszip-3.2.2.min',
			'lightslider': '../../../../js/libraries/lightslider-1.1.6.min',
			emularity: '../../../../js/libraries/emularity',
			moment: '../../../../js/libraries/moment-2.24.0.min',
			'moment-timezone': '../../../../js/libraries/moment-timezone-0.5.27.min',
			pdfmake: '../../../../js/libraries/pdfmake-0.1.63.min',
			'pdfmake-fonts': '../../../../js/libraries/pdfmake-fonts-0.1.63',
			'perfect-scrollbar': '../../../../js/libraries/perfect-scrollbar-1.4.0.min',
			popper: '../../../../js/libraries/popper-1.16.0.min',
			purl: '../../../../js/libraries/purl-2.3.1',
			select2: '../../../../js/libraries/select2-4.0.12.min',
			text: '../../../../js/libraries/requirejs-text-2.0.15'
		},
		shim: {
			bootstrap: {
				deps: ['jquery', 'popper', 'lightslider']
			},
			browserfs: {
				exports: 'BrowserFS'
			},
			'datatables.net-buttons-html5': {
				deps: ['pdfmake-fonts']
			},
			es6promise: {
				exports: 'Promise'
			},
			jsdos: {
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
				exports: 'Emulator',
				deps: ['browserfs', 'es6promise'],
				init: function(browserfs, es6promise) {
					window.BrowserFS = browserfs;
					window.Promise = es6promise;
				}
			},
			'moment-timezone': {
				exports: 'moment',
				deps: ['moment']
			}
		}
	});

	requirejs([
		'jquery',
		'json!../data/database.json',
		'purl',
		'emularity',
		'jsdos',
		'dropbox',
		'es6fetch',
		'jsonpath',
		'bootstrap',
		'datatables.net',
		'datatables.net-bs4',
		'datatables.net-buttons-bs4',
		'datatables.net-colreorder-bs4',
		'datatables.net-fixedcolumns-bs4',
		'datatables.net-fixedheader-bs4',
		'datatables.net-responsive-bs4',
		'datatables.net-select-bs4',
		'perfect-scrollbar',
		'select2'
	], function($, database, purl, emularity, jsdos, dropbox, fetch, jp, bootstrap, dt, datatablesbs4, datatablesbuttonsbs4, datatablescolreorderbs4, datatablesfixedcolumnsbs4, datatablesfixedheaderbs4, datatablesresponsivebs4, datatablesselectbs4, ps, select2) {
		$(function() {
			if ($sys.feature.SYSTEM_FEATURE_CANVAS && $sys.feature.SYSTEM_FEATURE_TYPED_ARRAYS && ($sys.feature.SYSTEM_FEATURE_ASMJS || $sys.feature.SYSTEM_FEATURE_WEBASSEMBLY)) {
				console.log($sys);
				console.log(database);
				$sys.api.dumpsystem();
			} else {
				alert('DOSBox cannot work because your browser is not supported!')
			}
		});
	});
}());