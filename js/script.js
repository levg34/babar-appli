var notif_enabled = true
var notif_interval = 10
var hours_finish = 16
var minutes_finish = 30
var _stop = _stop || false;
var _intervalId = _intervalId || 0

function secondsToHms(d) {
	d = Number(d)
	var h = Math.floor(d / 3600)
	var m = Math.floor(d % 3600 / 60)
	var s = Math.floor(d % 3600 % 60)
	return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s)
}

function time() {
	var remain = 0
	var _initial = new Date()
	var _final = new Date()
	_final.setHours(hours_finish)
	_final.setMinutes(minutes_finish)
	_final.setSeconds(0)
	remain = (_final - _initial) / 1000

	return remain
}

function notif(showNotif) {
	showNotif = showNotif && notif_enabled

	var message = secondsToHms(time()) + ' remaining.'

	if (time() > 0) {
		var options = {
			body: message,
			icon: 'http://www.angelfire.com/art/babar/images/ft.gif'
		}
		if (showNotif) var notification = new Notification('Not yet...', options);
	} else {
		message = 'It\'s time to go!'
		var options = {
			body: message,
			icon: 'https://www.yvelines.fr/wp-content/uploads/2016/Babar-Wallpapers.jpg'
		}
		if (showNotif) var notification = new Notification('Babar', options);
	}

	document.getElementById('time').innerText = message
}

function notifyMe() {
	// Voyons si le navigateur supporte les notifications
	if (!('Notification' in window)) {
		if (notif_enabled) alert('Ce navigateur ne supporte pas les notifications desktop')
		notif_enabled = false
		document.getElementById('notif_enabled').setAttribute('disabled', '')
		document.getElementById('notif_enabled').checked = false
		var use_notifs = document.getElementsByClassName('using_notifs')
		for (var i = 0; i < use_notifs.length; ++i) {
			use_notifs[i].style.display = 'none'
		}
	}

	// Voyons si l'utilisateur est OK pour recevoir des notifications
	else if (Notification.permission === 'granted') {
		// Si c'est ok, créons une notification
		notif(true)
	}

	// Sinon, nous avons besoin de la permission de l'utilisateur
	// Note : Chrome n'implémente pas la propriété statique permission
	// Donc, nous devons vérifier s'il n'y a pas 'denied' à la place de 'default'
	else if (Notification.permission !== 'denied' && notif_enabled) {
		Notification.requestPermission(function(permission) {

			// Quelque soit la réponse de l'utilisateur, nous nous assurons de stocker cette information
			if (!('permission' in Notification)) {
				Notification.permission = permission;
			}

			// Si l'utilisateur est OK, on crée une notification
			if (permission === 'granted') {
				notif(true)
			}
		});
	}

	// Comme ça, si l'utlisateur a refusé toute notification, et que vous respectez ce choix,
	// il n'y a pas besoin de l'ennuyer à nouveau.
}

function start() {
	_stop = false
	var before_start = document.getElementsByClassName('before_start')
	for (var i = 0; i < before_start.length; ++i) {
		before_start[i].setAttribute('disabled', '')
	}
	var after_start = document.getElementsByClassName('after_start')
	for (var i = 0; i < after_start.length; ++i) {
		after_start[i].removeAttribute('disabled')
	}
	notif_interval = document.getElementById('notif_interval').value
	hours_finish = document.getElementById('hours_finish').value
	minutes_finish = document.getElementById('minutes_finish').value
	toggleNotifs()
	saveParams()
	;(function() {
		if (!_stop) {
			notifyMe();
			var EPSILON=2
			var rem = time() % (notif_interval * 60)
			if (rem<EPSILON) {
				setTimeout(arguments.callee, notif_interval * 1000 * 60)
			} else {
				setTimeout(arguments.callee, rem * 1000)
			}
		}
	})();
	_intervalId = setInterval(notif, 500);
}

function stop() {
	_stop = true
	var after_start = document.getElementsByClassName('after_start')
	for (var i = 0; i < after_start.length; ++i) {
		after_start[i].setAttribute('disabled', '')
	}
	var before_start = document.getElementsByClassName('before_start')
	for (var i = 0; i < before_start.length; ++i) {
		before_start[i].removeAttribute('disabled')
	}
	clearInterval(_intervalId);
	document.getElementById('time').innerText = '';
}

function toggleNotifs() {
	if (!('Notification' in window)) {
		if (document.getElementById('notif_enabled').checked) alert('Ce navigateur ne supporte pas les notifications desktop')
		notif_enabled = false
		document.getElementById('notif_enabled').setAttribute('disabled', '')
		document.getElementById('notif_enabled').checked = false
		var use_notifs = document.getElementsByClassName('using_notifs')
		for (var i = 0; i < use_notifs.length; ++i) {
			use_notifs[i].style.display = 'none'
		}
	} else {
		notif_enabled = document.getElementById('notif_enabled').checked
		if (notif_enabled) {
			var use_notifs = document.getElementsByClassName('using_notifs')
			for (var i = 0; i < use_notifs.length; ++i) {
				use_notifs[i].removeAttribute('style')
			}
		} else {
			var use_notifs = document.getElementsByClassName('using_notifs')
			for (var i = 0; i < use_notifs.length; ++i) {
				use_notifs[i].style.display = 'none'
			}
		}
	}
}

function disableNotifs() {
	document.getElementById('notif_enabled').checked = false
	toggleNotifs()
	Cookies.set('notif_enabled', notif_enabled)
}

function saveParams() {
	Cookies.set('notif_enabled', notif_enabled)
	Cookies.set('notif_interval', notif_interval)
	Cookies.set('hours_finish', hours_finish)
	Cookies.set('minutes_finish', minutes_finish)
	Cookies.set('params', 'true')
}

function loadParams() {
	if (Cookies.get('params')=='true') {
		notif_enabled = (Cookies.get('notif_enabled')=='true')
		notif_interval = Cookies.set('notif_interval')
		hours_finish = Cookies.set('hours_finish')
		minutes_finish = Cookies.set('minutes_finish')
		
		document.getElementById('notif_enabled').checked = notif_enabled
		toggleNotifs()
		document.getElementById('notif_interval').value = notif_interval
		document.getElementById('hours_finish').value = hours_finish
		document.getElementById('minutes_finish').value = minutes_finish
	}
}