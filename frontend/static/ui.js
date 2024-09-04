function ReplaceElement(elementToHideId, elementToShowId)
{

	if (elementToHideId !== "null") {
		var elementToHide = document.getElementById(elementToHideId);
		elementToHide.classList.add("d-none");
		elementToHide.classList.remove("d-flex");
	}

	if (elementToShowId !== "null")	{
		var elementToShow = document.getElementById(elementToShowId);
		elementToShow.classList.remove("d-none");
		elementToShow.classList.add("d-flex");
	}
}

/////    FUNCTIONS TO DISPLAY HTML ELEMENTS /////

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
	document.getElementById("loginBackButton").classList.remove("d-none");
	document.getElementById("userForm").reset();
	heading.innerText = "Player " + playerIndex + " login";

 }

function BackButtonConnection()
{
	playerIndex = 2;
	ReplaceElement("playerConnection", "buttonsContainer");
}

function DisplayGame()
{
	document.getElementById("containerCustomButton").classList.add("d-none");
	document.getElementById("containerTitle").classList.add("d-none");
	ReplaceElement("playerConnection", "gameContainer");
}

function DisplayWinnerMenu() {
	document.getElementById("scorePlayer1").innerText = 0;
	document.getElementById("scorePlayer2").innerText = 0;
	ReplaceElement("gameContainer", "endOfGame");
}

function backButtonEOG() {
	document.getElementById("containerCustomButton").classList.remove("d-none");
	document.getElementById("containerTitle").classList.remove("d-none");
	ReplaceElement("endOfGame", "buttonsContainer");
	playerIndex = 2;
	currentTournament.idPlayers.reset();
}

function replayButtonEOG() {
	ReplaceElement("endOfGame", "gameContainer");
}


////// Event Listenner for Account Creation

// Select the radio buttons and the element to be displayed
const connectAccountRadio = document.getElementById('vbtn-radio1');
const createAccountRadio = document.getElementById('vbtn-radio2');
const createAccountForm = document.getElementById('confirmPasswordContainer');
const errorMessageContainer = document.getElementById("connectionErrorMessage");


// Event listener for the "Create account" radio button
createAccountRadio.addEventListener('change', function() {
	if (this.checked) {
		errorMessageContainer.innerText = "";
		createAccountForm.classList.remove("d-none");
    }
});

// Event listener for the "Connect account" radio button to hide the element
connectAccountRadio.addEventListener('change', function() {
	if (this.checked) {
		errorMessageContainer.innerText = "";
		createAccountForm.classList.add("d-none");
    }
});

////// Event Listenner for Customization modale

const customVictoryValue = document.getElementById('CustomVictoryValue');
const customVictoryScoreField = document.getElementById('CustomVictoryField');

customVictoryValue.addEventListener('change', function() {
	customVictoryScoreField.innerHTML = "Nombre de points pour la victoire : " + customVictoryValue.value;
});
