///// GLOBAL VARIABLES ////

let hostConnected = false;
let hostId = 0;
let playerIndex = 2;
let playerNumber = 1;
let gamesNb = 1;
let connectedUserIds = []


//Tournament of 8 : 7 games
//Tournament of 6 : 6 games
//Tournament of 4 : 3 games

///// GENERIC FUNCTION /////

function getCookie(name) {
	let cookieValue = null;
	if (document.cookie && document.cookie !== '') {
		const cookies = document.cookie.split(';');
		for (let i = 0; i < cookies.length; i++) {
			const cookie = cookies[i].trim();
			// Does this cookie string begin with the name we want?
			if (cookie.substring(0, name.length + 1) === (name + '=')) {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}
	return cookieValue;
}

function validateEmail(email) {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

/////    FIRST CONNECTION EVENT LISTENER /////

document.addEventListener('DOMContentLoaded', async function() {
	let response = await makeUnauthenticatedRequest("/api/token/refresh/", {method : 'POST'});
	if (response === 1 || (!response.ok))
	{
		document.getElementById("loginBackButton").classList.add("d-none");
		document.getElementById("playerConnection").classList.remove("d-none");
		return ;
	}
	let data = await response.json();
	if (data.access_token) {
		hostConnected = true;
		window.accessToken = data.access_token;
		makeAuthenticatedRequest("/api/user/", {method: 'GET'})
		.then(response => {
			return response.json();
		})
		.then(data => {
			hostId = data.id;
		});
		ReplaceElement("containerEmpty", "buttonsContainer");
		apiLoginLoop();
		document.getElementById("containerCustomButton").classList.remove('d-none');
		getCustomizationSettings();
		history.pushState({ page: 'home' }, 'Home', '/home');
	} else {
		console.error("access token not saved");
	}
 });

/////        API CALLS      //////

function makeUnauthenticatedRequest(url, options = {}) {

	const csrfToken = getCookie('csrftoken');
	if (!csrfToken  && (url !== "/api/login/" && url !== "/api/register/" && url !== "/api/2fa/verify/")) {
		console.error('CSRF token is missing. Cannot refresh token.');
		return 1;
	}

	options.headers = options.headers || {};
	options.headers['Accept'] = 'application/json';
	options.headers['Content-Type'] = 'application/json';
	options.headers['X-CSRFToken'] = csrfToken;
	options.credentials = 'include';

	return fetch(url, options)
	.then(response => {
		if (response.status === 401) {
				console.log("error 401");
			}
			return response;
	});
}

function makeAuthenticatedRequest(url, options = {}) {

	const csrfToken = getCookie('csrftoken');
	if (!csrfToken) {
		console.error('CSRF token is missing. Cannot refresh token.');
		return 1;
	}

	options.headers = options.headers || {};
	options.headers['Authorization'] = `Bearer ${window.accessToken}`;
	options.headers['Accept'] = 'application/json';
	options.headers['Content-Type'] = 'application/json';
	options.headers['X-CSRFToken'] = csrfToken;
	options.credentials = 'include';

	return fetch(url, options)
	.then(response => {
		if (response.status === 401) {
			return refreshToken().then(() => {
				options.headers['Authorization'] = `Bearer ${window.accessToken}`;
				return fetch(url, options);
			});
		}
		return response;
	});
}

function makeAuthenticatedFileUpload(url, options = {}) {

	const csrfToken = getCookie('csrftoken');
	if (!csrfToken) {
		console.error('CSRF token is missing. Cannot refresh token.');
		return 1;
	}

	options.headers = options.headers || {};
	options.headers['Authorization'] = `Bearer ${window.accessToken}`;
	options.headers['X-CSRFToken'] = csrfToken;
	options.credentials = 'include';

	return fetch(url, options)
	.then(response => {
		if (response.status === 401) {
			return refreshToken().then(() => {
				options.headers['Authorization'] = `Bearer ${window.accessToken}`;
				return fetch(url, options);
			});
		}
		return response;
	});
}

// REFRESH

function refreshToken()
{
	return makeUnauthenticatedRequest("/api/token/refresh/", {method : 'POST'})
	.then(response => {
		if (!response.ok) {
			console.error("Refresh token failed");
		}
		return response.json();
	})
	.then(data => {
		window.accessToken = data.access_token;
	})
	.catch(error => {
		console.error('Error refreshing token:', error);
		return Promise.reject(error);
	});
}

// LOGOUT

function disconnect() {
	makeAuthenticatedRequest("/api/logout/", {method: 'POST'});
	hostConnected = false;
	playerNumber = 1;
	playerIndex = 2;
	document.getElementById("loginBackButton").classList.add('d-none');
	document.getElementById("loginTitle").innerText = "Login";
	history.pushState({page: 'login'}, 'Login', '/login');
	backToConnexion();
}

// LOGIN & REGISTER

async function submitUserForm() {
	console.log("Player nb is : " + playerNumber);
	console.log("Player Index is : " + playerIndex);
	if(connectAccountRadio.checked)
	{
		if (!hostConnected) {
			userLogin();
		}
		else {
			let ret = await checkAdversaryCredentials();
			if (ret === false)
				return ;
			if (playerNumber === 2) {
				currentMatch.idPlayer1 = hostId;
				rmStartNodePvp();
			}
			else {
				if (playerIndex < playerNumber) {
					playerIndex++;
					document.getElementById("userForm").reset();
					document.getElementById("connectionErrorMessage").classList.add("d-none");
					document.getElementById("loginTitle").innerText = "Player " + playerIndex + " login";
				}
				else {
					playerIndex = 2;
					currentTournament.idPlayers.push(hostId);
					setCurrentMatch();
					rmStartNodePvp();
				}
			}
		}
	}
	else
	{
		if (!hostConnected) {
			userRegistration();
		}
		else {
			let ret = await createAdversaryCredentials();
			if (ret === false)
					return ;
			if (playerNumber === 2) {
				currentMatch.idPlayer1 = hostId;
				rmStartNodePvp();
			}
			else {
				if (playerIndex < playerNumber) {
					playerIndex++;
					document.getElementById("userForm").reset()
					document.getElementById("connectionErrorMessage").classList.add("d-none");
					document.getElementById("loginTitle").innerText = "Player " + playerIndex + " login";
				}
				else {
					playerIndex = 2;
					currentTournament.idPlayers.push(hostId);
					setCurrentMatch();
					rmStartNodePvp();
				}
			}
		}
	}
}

function userLogin() {
	email = document.getElementById("emailInput").value;
	password = document.getElementById("passwordInput").value;

	const data = {
		email: email,
		password: password
	};

	makeUnauthenticatedRequest("/api/login/", {
		method: 'POST',
		body: JSON.stringify(data)
	})
	.then(response => {
		if(!response.ok) {
			if (response.status === 403) {
				display2FA();
				throw new Error("2FA activated");
			}
			else if (response.status === 401) {
				throw new Error('Email or password incorect');
			}
			else if (response.status === 400) {
				throw new Error('Wrong Email format');
			}
			else if (response.status === 409) {
				throw new Error('User allready connected');
			}
		}
		return response.json();
	})
	.then(data => {
		window.accessToken = data.access_token;
		hostId = data.id;
		hostConnected = true;
		apiLoginLoop();
		ReplaceElement("playerConnection", "buttonsContainer");
		document.getElementById("containerEmpty").classList.add("d-none");
		document.getElementById("containerCustomButton").classList.remove("d-none");
	})
	.catch(error => {
		errorMessageContainer.innerText = error;
	})
}

function userRegistration() {
	email = document.getElementById('emailInput').value;
	password = document.getElementById('passwordInput').value;
	passwordComfirmation = document.getElementById('passwordConfirmationInput').value;

	const data = {
		email: email,
		username: email,
		password: password
	};
	if (!validateEmail(email)) {
		errorMessageContainer.innerText = "Please enter a valid email address";
		return;
	}
	if (password !== passwordComfirmation)
	{
		errorMessageContainer.innerText = "The passwords don't match";
		return;
	}
	makeUnauthenticatedRequest("/api/register/", {
		method: 'POST',
		body: JSON.stringify(data)
	}).then(response => {
		if(!response.ok) {
			throw new Error('Network response was not ok');
		}
		return response.json();
	}).then(data => {
		window.accessToken = data.access_token;
		hostId = data.id;
		hostConnected = true;
		apiLoginLoop();
		ReplaceElement("playerConnection", "buttonsContainer");
		document.getElementById("containerEmpty").classList.add("d-none");
		document.getElementById("containerCustomButton").classList.remove("d-none");
		makeUnauthenticatedRequest("/api/login/", {method: 'POST'});
	})
	.catch(error => {
		console.error('There was a problem with the fetch operation:', error);
		errorMessageContainer.innerText = "This user is already registered";
	})
}

async function verify2FA() {
	email = document.getElementById('emailInput').value;
	password = document.getElementById('passwordInput').value;
	token = document.getElementById('2FAinput').value;
	let response;
	input = {
		email: email,
		password: password,
		token : token,
	};
	if (!hostConnected) {
		response = await makeUnauthenticatedRequest("/api/2fa/verify/", {
			method: 'POST',
			body: JSON.stringify(input)
		});
	}
	else {
		response = await makeAuthenticatedRequest("/api/2fa/guest-verify/", {
			method: 'POST',
			body: JSON.stringify(input)
		})
	}
	if (!response.ok) {
		document.getElementById("2FAErrorMessage").innerText = "Wrong token";
		return ;
	}
	let data = await response.json();
	document.getElementById("2FAinput").value = "";
	if (hostConnected === false) {
		ReplaceElement("2FAview", "buttonsContainer");
		document.getElementById("containerEmpty").classList.add('d-none');
		document.getElementById("containerCustomButton").classList.remove('d-none');
		window.accessToken = data.access_token;
		hostConnected = true;
		hostId = data.id;
		apiLoginLoop();
	}
	else {
		console.log("inside else of 2fa verify");
		if (playerIndex < playerNumber) {
			playerIndex++;
			ReplaceElement("2FAview", "playerConnection");
			document.getElementById("userForm").reset();
			document.getElementById("connectionErrorMessage").classList.add("d-none");
			document.getElementById("loginTitle").innerText = "Player " + playerIndex + " login";
			currentTournament.idPlayers.push(data.id);
		}
		else {
			playerIndex = 2;
			if (currentTournament.active) {
				currentTournament.idPlayers.push(hostId);
				currentTournament.idPlayers.push(data.id);
				setCurrentMatch();
			}
			currentMatch.idPlayer2 = data.id;
			currentMatch.idPlayer1 = hostId;
			rmStartNodePvp();
		}
	}
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function apiLoginLoop() {
	while (hostConnected) {
		makeAuthenticatedRequest("/api/is-connect/", {method: 'GET'})
		.then(response => {
			if(!response.ok) {
				throw new Error ('Network response was not ok');
			}
			return response.json();
		}).then(data => {
			connectedUserIds = data.connected_user_ids;
		})
		await wait(5000);
		makeAuthenticatedRequest('/api/user/', {method: 'GET'})
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.json(); // Parse the response as JSON
		}).then( data => {
			getFriendsList(data);
		})
    }
}
