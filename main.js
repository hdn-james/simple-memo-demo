// constants
const constants = {
	HARD: 1.2, // 1.5 for bigger interval, 1.2 interval = 1 (*)
};

const fs = require("fs");

// load mock data
let mockData = fs.readFileSync("data.json");
let mockDataJson = JSON.parse(mockData);
console.log("Mock Data!!!");

// update mock data
function updateMockData() {
	let content = JSON.stringify(mockDataJson, null, 2);
	fs.writeFile("./data.json", content, (err) => {
		if (err) {
			console.log(err);
			return;
		}
	});
	console.log("Mock Data updated!!!");
}

function getFormattedDate(date) {
	var mm = date.getMonth() + 1; // getMonth() is zero-based
	var dd = date.getDate();

	return [
		date.getFullYear(),
		(mm > 9 ? "" : "0") + mm,
		(dd > 9 ? "" : "0") + dd,
	].join("-");
}

// update day with new interval
function updateDayWithInterval(date, interval) {
	var result = new Date(date);
	result.setDate(result.getDate() + interval);

	formattedDate = getFormattedDate(result);
	return formattedDate;
}

/**
 * * to get random day if user choose "I Know this".
 * * Applies a small amount of random to prevent cards
 * * that were introduced at the same time and given the
 * * same ratings from sticking together and always coming
 * * up for review on the same day.
 * @returns random day: 1 -> 4
 */
function getRandomDay() {
	return Math.floor(Math.random() * 4) + 1;
}

/**
 * Calculate new interval and new Ease-factor for "I Know this" choice
 * @param {Int} currentInterval - current Interval
 * @param {Number} currentEF - current Ease-Factor
 *
 * * Input:
 *    - currentInterval
 *    - currentEF
 * * Process:
 *    - get random day
 *    - calculate new interval
 *      + newInterval = currentInterval * 0.6 + randomDay
 *    - calculate new Ease-Factor
 *      + increase by 15%
 * * Output:
 *    - [newEF, newInterval]
 */
function handleKnowChoiceEFactorAndInterval(currentEF, currentInterval) {
	// get random
	randomDay = getRandomDay();

	// new interval
	newInterval = Math.round(currentInterval * currentEF * 0.6 + randomDay);

	// new Ease-Factor
	// increase Ease-Factor by 15%
	newEF = currentEF * 1.15;

	return [newEF, newInterval];
}

/**
 * Calculate new interval and new Ease-Factor for "I Don't Know" choice
 * @param {Number} currentEF - current Ease-Factor
 * @param {Int} currentInterval - current interval
 *
 * * Input:
 *    - currentInterval
 *    - currentEF
 * * Process:
 *    - decrease Ease-Factor by 15%
 *    - calculate new interval
 *      + newInterval = currentInterval * 1.2 by default
 * * Output:
 *    - [newEF, newInterval]
 */
function handleDontKnowChoiceEFactorAndInterval(currentEF, currentInterval) {
	// new Ease-Factor
	// decrease Ease-Factor by 15%
	newEF = currentEF * 0.85;
	newEF = newEF > 1.3 ? newEF : 1.3;

	// new interval
	// new = current * 1.2 (*)
	newInterval = Math.round(currentInterval * constants.HARD);

	return [newEF, newInterval];
}

/**
 * "I Know This"
 * @param {string} user - username
 * @param {string} word - current word
 *
 * * Input:
 *    - username
 *    - current word
 * * Process:
 *    - get current Ease-Factor from DB
 *    - get current interval from DB
 *    - get current day from DB
 *    - get new interval and new Ease-Factor
 *    - replace currentEF, currentInterval with newEF and newInterval
 *    - update new data to DB
 * * Output:
 *    - DB updated
 */
function handleKnowChoice(user, word) {
	let usr = mockDataJson[user];
	let currentWord = usr[word];
	let currentEF = currentWord["ef"];
	let currentInterval = currentWord["interval"];
	let currentDay = currentWord["day"];

	const [newEF, newInterval] = handleKnowChoiceEFactorAndInterval(
		currentEF,
		currentInterval
	);

	currentWord["day"] = updateDayWithInterval(currentDay, newInterval);
	currentWord["interval"] = newInterval;
	currentWord["ef"] = newEF;

	updateMockData();
}

/**
 * "I Don't Know this"
 * @param {String} user: username
 * @param {String} word: current word
 *
 * * Input:
 *    - username
 *    - current word
 * * Process:
 *    - get current Ease-Factor from DB
 *    - get current interval from DB
 *    - get current day from DB
 *    - get new interval and new Ease-Factor
 *    - replace currentEF, currentInterval with newEF and newInterval
 *    - update new data to DB
 * * Output:
 *    - DB updated
 */
function handleDontKnowChoice(user, word) {
	let usr = mockDataJson[user];
	let currentWord = usr[word];
	let currentEF = currentWord["ef"];
	let currentInterval = currentWord["interval"];
	let currentDay = currentWord["day"];

	const [newEF, newInterval] = handleDontKnowChoiceEFactorAndInterval(
		currentEF,
		currentInterval
	);

	currentWord["day"] = updateDayWithInterval(currentDay, newInterval);
	currentWord["interval"] = newInterval;
	currentWord["ef"] = newEF;

	updateMockData();
}

// User choose "I Know This"
handleKnowChoice("user1", "word1");
console.log("Username: user1 - Word: word1");
console.log(mockDataJson);

// User choose "I Don't Know This"
handleDontKnowChoice("user1", "word2");
console.log("Username: user1 - Word: word2");
console.log(mockDataJson);
