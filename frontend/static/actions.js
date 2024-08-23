///// GLOBAL VARIABLES ////

let playerIndex = 2;
let playerNumber = 1;

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

function ReplaceElement(elementToHideId, elementToShowId)
{
	var elementToHide = document.getElementById(elementToHideId);

	elementToHide.classList.add("d-none");
	elementToHide.classList.remove("d-flex");

	if (elementToShowId !== "null")
	{
		var elementToShow = document.getElementById(elementToShowId);
		elementToShow.classList.remove("d-none");
		elementToShow.classList.add("d-flex");
	}
}

/////    FUNCTIONS TO DISPLAY HTML ELEMENTS /////

/////    FIRST CONNECTION EVENT LISTENER /////

document.addEventListener('DOMContentLoaded', function() {
	makeAuthenticatedRequest("/api/token/refresh/", {method : 'POST'})
	.then (response => {
		if (!response.ok)
		{
			ReplaceElement("buttonsContainer", "playerConnection");
			ReplaceElement("loginBackButton", "null");
		}
		return response.json()
	})
	.then(data => {
		if (data.access) {
			window.accessToken = data.access;
			console.log(window.accessToken);
			console.log('Access token saved');
		} else {
			console.error("access token not saved");
		}
	})
 });

//       OTHER DISPLAYING FUNCTIONS

function DisplayQuickPlayOptions() {
	ReplaceElement("tournamentOptions", "tournament");
	ReplaceElement("quickPlay", "quickPlayOptions");
}

function DisplayTournamentOptions() {
	ReplaceElement("quickPlayOptions", "quickPlay");
	ReplaceElement("tournament", "tournamentOptions");
}

 function ResetMenuButtons()
 {
	ReplaceElement("tournamentOptions", "tournament");
	ReplaceElement("quickPlayOptions", "quickPlay");
 }

 function DisplayPlayerConnection(playerNb)
 {
	playerNumber = playerNb;
	heading = document.getElementById("loginTitle");
	ResetMenuButtons();
	ReplaceElement("buttonsContainer", "playerConnection");
	heading.innerText = "Player " + playerIndex + " login";
 }

function BackButtonConnection()
{
	ReplaceElement("playerConnection", "buttonsContainer");
}

////// Event Listenner for Account Creation

// Select the radio buttons and the element to be displayed
const connectAccountRadio = document.getElementById('vbtn-radio1');
const createAccountRadio = document.getElementById('vbtn-radio2');
const createAccountForm = document.getElementById('confirmPasswordContainer');

// Event listener for the "Create account" radio button
createAccountRadio.addEventListener('change', function() {
	if (this.checked) {
      createAccountForm.classList.remove("d-none");
    }
});

// Event listener for the "Connect account" radio button to hide the element
connectAccountRadio.addEventListener('change', function() {
	if (this.checked) {
      createAccountForm.classList.add("d-none");
    }
});

////// Event Listenner for Customization modale

const customVictoryValue = document.getElementById('CustomVictoryValue');
const customVictoryScoreField = document.getElementById('CustomVictoryField');

customVictoryValue.addEventListener('change', function() {
	customVictoryScoreField.innerHTML = "Nombre de points pour la victoire : " + customVictoryValue.value;
});


////// Event to display colors pop-hovers in customization modal
// Ensure Bootstrap's JavaScript is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Initialize the popover when the modal is shown
    const customizationModal = document.getElementById('customizationModal');
    customizationModal.addEventListener('shown.bs.modal', function () {
        const popoverTriggerList = [].slice.call(document.querySelectorAll('.example-popover'));
        const popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
            return new bootstrap.Popover(popoverTriggerEl, {
                container: '.modal-body',
				html: true,
				content:'<div>BONJOUR AEOUWD</div>'
            });
        });
    });
});


/////        API CALLS      //////

const AccessKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzI0NDExNjA4LCJpYXQiOjE3MjQ0MDU2MDgsImp0aSI6ImFiNTUyYTI2NWMyZjRiYjliYzRjOGY0ZDE0YWQ5NTEyIiwidXNlcl9pZCI6MX0.xrn7V1NKTs_7UrEALJvhtqWF6Fu9Hp2pwm7SaqiGk5c"

function makeUnauthenticatedRequest(url, options = {}) {

	const csrfToken = getCookie('csrftoken');
	if (!csrfToken) {
		console.error('CSRF token is missing. Cannot refresh token.');
		return Promise.reject('CSRF token is missing');
	}

	options.headers = options.headers || {};
	options.headers['Accept'] = 'application/json';
	options.headers['Content-Type'] = 'application/json';
	options.headers['X-CSRFToken'] = csrfToken;
	options.credentials = 'include';

	return fetch(url, options)
	.then(response => {
		if (response.status === 401) {
			// If token has expired, refresh and retry the request
			//return refreshToken().then(() => {
				//	options.headers['Authorization'] = `Bearer ${window.accessToken}`;
				//	return fetch(url, options);
				//});
				console.log("error 401");
			}
			return response;
	});
}

function makeAuthenticatedRequest(url, options = {}) {

	const csrfToken = getCookie('csrftoken');
	if (!csrfToken) {
		console.error('CSRF token is missing. Cannot refresh token.');
		return Promise.reject('CSRF token is missing');
	}

	options.headers = options.headers || {};
	options.headers['Authorization'] = `Bearer ${window.accessToken}`;
	// options.headers['Refresh'] =
	options.headers['Accept'] = 'application/json';
	options.headers['Content-Type'] = 'application/json';
	options.headers['X-CSRFToken'] = csrfToken;
	options.credentials = 'include';

	return fetch(url, options)
	.then(response => {
		if (response.status === 401) {
			// If token has expired, refresh and retry the request
			//return refreshToken().then(() => {
				//	options.headers['Authorization'] = `Bearer ${window.accessToken}`;
				//	return fetch(url, options);
				//});
				console.log("error 401");
			}
			return response;
	});
}

	// LOGIN

function userLogin() {
	email = document.getElementById("emailInput").value;
	password = document.getElementById("passwordInput").value;
	errorMessageContainer = document.getElementById("connectionErrorMessage")

	console.log(email);
	console.log(password)

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
			throw new Error('Network response was not ok');
		}
		return response.json();
	})
	.then(data => {
		if (data.access_token) {
			window.accessToken = data.access_token;
			console.log(window.accessToken);
			console.log('Access token saved');
		} else {
			console.error("access token not saved");
		}
		ReplaceElement("playerConnection", "buttonsContainer");
	})
	.catch(error => {
		console.error('There was a problem with the fetch operation:', error);
		errorMessageContainer.innerText = "This user doesn't exist, please create an account"
	})
}

	// GET USERS //

function getUserList() {
	const userListContainer = document.getElementById('userListContainer');

	makeAuthenticatedRequest('/api/users/', {method: 'GET'})
	.then(response => {
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		return response.json(); // Parse the response as JSON
	})
	.then(JSONdata => {
		// Assuming JSONdata is an array of user objects and each user object has a 'username' field
		const usernames = JSONdata.map(user => user.username); // Extract usernames
		var responseHTML = "";
		//userListContainer.innerText = usernames.length; // Display usernames, one per line
		for (let i = 0; i < usernames.length; i++) {
			responseHTML = responseHTML + "<div class=\"row m-2\"> <div class=\"h5 col-auto\">" + usernames[i] + "</div> <div class=\"col d-flex justify-content-end\"> <button class=\"btn btn-primary\">Follow</button> </div> </div>"
		};
		userListContainer.innerHTML = "<div>" + responseHTML + "</div>";
	})
	.catch(error => {
		console.error('There was a problem with the fetch operation:', error);
		userListContainer.innerText = 'Error fetching user list';
    });
}
