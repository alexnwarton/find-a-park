const baseUrl = "https://developer.nps.gov/api/v1/parks";
const apiKey = "6XXFeplxHFNsohc79vCep4HHyd10N4ARh557F2ep";
const mapquestApi = "7eswptpG7eFsKM6dEKesj010foCEAYFQ";
const mapsUrl = "https://www.google.com/maps/embed/v1/directions?";
//const mapsApiKey = config.googleMaps;

let inputBar = document.querySelector("input");
let btn = document.querySelector("button");

let bodyHeader = document.querySelector("header");
let initialImage = document.querySelector("#parkImage");

// Adds an event listener for when the DOM has loaded
document.addEventListener('DOMContentLoaded', () => {
	
	// Hides the #parkImage and .slideshow elements as soon as the DOM content has loaded
	document.querySelector("#parkImage").hidden = true;
	document.querySelector(".slideshow").style.visibility = "hidden";
	document.querySelector("#topFive").style.visibility = "hidden";
	
	// Fetches data from national parks API based on park postal code
	fetch(`${baseUrl}?limit=500&q="National Park"&q="postalCode"&&api_key=${apiKey}`)
		
		.then((response) => {
			return response.json();
		})
		.then((jsonResponse) => {
			
			let parkList = findParks(jsonResponse);
			// Adds an event listener for when the button is clicked
			btn.addEventListener("click", () => {

				// Styles the header as soon as the button is clicked
				headerStyling();
		
				// Obtains the user input
				let userInput = document.querySelector("input").value;
				let zipToLatLong = [];

				// Converts the zipcode input by user to latitude and longitude values using mapquest API
				fetch(`https://www.mapquestapi.com/geocoding/v1/address?key=${mapquestApi}&location=${userInput}`)
					.then((convertResponse) => {

						return convertResponse.json();
				})
				.then((jsonResponseC) => {
			
					// Stores the user location data as latitude and longitude values
					zipToLatLong.push(jsonResponseC.results[0].locations[0].latLng.lat);
					zipToLatLong.push(jsonResponseC.results[0].locations[0].latLng.lng);
					userInput = zipToLatLong;	

					// Finds the closest national park and the values of its latitude and longitude
					let closestPark = nearbyParks(parkList, userInput);
					let closestLat = parseFloat(closestPark.latitude);
					let closestLong = parseFloat(closestPark.longitude);

					let fiveParks = fiveClosestParks(parkList, userInput);
					document.querySelector("#topFive").innerHTML = "";
					populateDropDown(fiveParks);


					// Want to select the option and assign the closest park to the selected option 
					if(document.querySelector("option").onclick) {
						(ev) => console.log(ev.target.value)
					}

					const parkImages = closestPark.images					

					// Appends data from the closest park to the DOM
					document.querySelector("#descriptionH2").append(closestPark.fullName);
					document.querySelector("#descriptionP").append(closestPark.description);					

					document.querySelector("#parkImage").setAttribute("src", closestPark.images[0].url);
					
					document.querySelector("#parkImage").hidden = false;
					
					document.querySelector(".slideshow").style.visibility = "visible";	
					document.querySelector("#topFive").style.visibility = "visible";
					document.querySelector(".previous").innerText = "<<";



					// Creates functions for the previous and next buttons to display a slideshow of multiple park images when clicked
					let counter = 0;

					const previous = () => {
						let slider = document.querySelector("#parkImage");
							counter--;

						if(counter < 0) {
							counter = parkImages.length - 1;
						}
						slider.setAttribute("src", parkImages[counter].url);
						
					}
					document.querySelector(".previous").onclick = previous;

					const next = () => {
						let slider = document.querySelector("#parkImage");
						if (counter >= parkImages.length - 1){
							counter = 0;
						}
						else {
							counter++;
						}
						slider.setAttribute("src", parkImages[counter].url);
					}
					 document.querySelector(".next").onclick = next;

					// Appends all park activities to the DOM as an unordered list
					document.querySelector("#activitiesH2").innerText = "Available Park Activities";
					const activities = closestPark.activities;
					activities.forEach((item, i) => {
						let activity = document.createElement("li");
						activity.innerText = item.name;
						document.querySelector("ul").append(activity);
					})

					// Appends weather information to the DOM
					document.querySelector("#weatherH2").innerText = "Weather Information";
					document.querySelector("#weatherP").append(closestPark.weatherInfo);

					// Appends the link to the national park website to the DOM
					document.querySelector("#footer").setAttribute("href", closestPark.url);
					document.querySelector("#footer").innerText = "Learn more about this park";

					document.querySelector("#otherParks").innerText = "Other Nearby Parks";

					// const pickPark = (chosenPark) => {
						
					// 	parkList.forEach((park, i) => {
					// 		if(park.fullName === chosenPark){
					// 		loadData(park);
					// 		}
					// 	})
	
					// }
					// document.querySelector("#topFive").onchange = pickPark;

					// fetch(`${mapsUrl}origin=${userInput}&destination=${closestLat}${closestLong}&key=${mapsApiKey}`)
					// 	.then((mapsResponse) => {
					// 		return mapsResponse.json();
					// 	})
					// 	.then((mapsJson) => {
					// 		let embeddedMap = document.querySelector("iframe");
					// 		embeddedMap.setAttribute("src", mapsJson);
					// 	})									
			
				})
				// Displays an error if data cannot be fetched from the mapquest API
				.catch((error) => {
					console.log(`Error:  {error}`);
				})
				
	})

		})
		// Displays an error if data cannot be fetched from the national parks API
		.catch((error) => {
			console.log(`Error:  {error}`);
		})
	

})




// Searches through the list of all national sites to return a list of national parks
const findParks = (siteInfo) => {
	const natParks = [];
			//const natMonuments = [];
			//const histParks = [];
	for(let i = 0; i < siteInfo.data.length; i++) {
		if(siteInfo.data[i].designation.includes("National Park")){
			natParks.push(siteInfo.data[i]);						
		}						
	}
	return natParks;
}


// calcDistance function referenced from https://www.movable-type.co.uk/scripts/latlong.html to calculate the distance between two points based on given latitude and longitute values
const calcDistance = (park1, park2) => {
	const radius = 6371; // radius of the earth in kilometers
	let latDiffDegrees = (park2[0] - park1[0]) * (Math.PI / 180);
	let longDiffDegrees = (park2[1] - park1[1]) * (Math.PI / 180);
	
	let a = Math.sin(latDiffDegrees / 2) * Math.sin(latDiffDegrees / 2) +
    Math.cos((park1[0]) * (Math.PI / 180)) * Math.cos((park2[0]) * (Math.PI / 180)) * 
    Math.sin(longDiffDegrees / 2) * Math.sin(longDiffDegrees / 2); 


    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	let distance = radius * c;
	// Converts distance from meters to miles
	distance = distance * 0.621371;
	return distance;

}

// Finds the closest park based on the user input
const nearbyParks = (parkList, input) => {
 
 document.querySelector("input").value = "";
 document.querySelector("#descriptionP").innerHTML = "";
 document.querySelector("#descriptionH2").innerHTML = "";
 document.querySelector("#activitiesH2").innerHTML = "";
 document.querySelector("ul").innerHTML = "";
 document.querySelector("#weatherH2").innerHTML = "";
 document.querySelector("#weatherP").innerHTML = "";
 document.querySelector("a").innerHTML = "";

 let natParksNear = parkList[0];
 let minDistance = calcDistance(input, [parseFloat(parkList[0].latitude), parseFloat(parkList[0].longitude)]);
 let parkLat;
 let parkLong;
 let distance;
 
 parkList.forEach((park, i) => {
 	parkLat = parseFloat(park.latitude);
 	parkLong = parseFloat(park.longitude);
 	distance = calcDistance(input, [parkLat, parkLong]);
 
 	if(distance < minDistance) {
 		minDistance = distance;
 		natParksNear = park;
 	}
 })
 	
 	return natParksNear;
}

// Changes the styling of the header elements
const headerStyling = () => {
	document.querySelector("h1").style.fontSize = "40px";
	inputBar.style.height = "20px";
	inputBar.style.width = "140px";
	inputBar.style.fontSize = "15px";

	btn.style.height = "25px";
	btn.style.width = "58px";
  	btn.style.fontSize = "15px";

	bodyHeader.style.height = "150px";
	bodyHeader.style.width = "300px";
	bodyHeader.style.alignContent = "center"
}

//Finds the 5 closest parks based on the user input
const fiveClosestParks = (parkList, input) => {

 let minIndices = [];
 let fiveParks = [];
 
 // Finds the distances for each park and add it to each park object
 parkList.forEach((park, i) => {
	calculatedDistance = calcDistance(input, [parseFloat(park.latitude), parseFloat(park.longitude)]);
	park.distance = calculatedDistance;
 })
 // Iterate through the parkList and find the minimum distance value
 // Find the minimum distance and push it to the minDistances array


 for(let i = 0; i < 5; i++) {
 	let minIndex = null;
 	let minPark = null;
 	parkList.forEach((park, j) => {
		if(minPark === null && minIndices.includes(j) === false) {
			minIndex = j;
			minPark = park;
		}
		else if(park.distance < minPark.distance && minIndices.includes(j) === false) {
			minIndex = j;
			minPark = park;
			
		}
	})
	fiveParks.push(minPark);
	minIndices.push(minIndex);	
 }
 return fiveParks;
}


const populateDropDown = (fiveParks) => {
	const dropDownElem = document.querySelector("#topFive")
	fiveParks.forEach((element, i) => {
		let option = document.createElement("option");
		option.text = element.fullName;
		dropDownElem.add(option);
	})
}

const loadData = (park) => {
	document.querySelector("input").value = "";
	document.querySelector("#descriptionP").innerHTML = "";
	document.querySelector("#descriptionH2").innerHTML = "";
	document.querySelector("#activitiesH2").innerHTML = "";
	document.querySelector("ul").innerHTML = "";
	document.querySelector("#weatherH2").innerHTML = "";
	document.querySelector("#weatherP").innerHTML = "";
	document.querySelector("a").innerHTML = "";

	// Appends data from the closest park to the DOM
					document.querySelector("#descriptionH2").append(park.fullName);
					document.querySelector("#descriptionP").append(park.description);					

					document.querySelector("#parkImage").setAttribute("src", park.images[0].url);
					
					document.querySelector("#parkImage").hidden = false;
					
					document.querySelector(".slideshow").style.visibility = "visible";	
					document.querySelector("#topFive").style.visibility = "visible";
					document.querySelector(".previous").innerText = "<<";


					// Creates functions for the previous and next buttons to display a slideshow of multiple park images when clicked
					let counter = 0;

					const previous = () => {
						let slider = document.querySelector("#parkImage");
							counter--;

						if(counter < 0) {
							counter = parkImages.length - 1;
						}
						slider.setAttribute("src", parkImages[counter].url);
						
					}
					document.querySelector(".previous").onclick = previous;

					const next = () => {
						let slider = document.querySelector("#parkImage");
						if (counter >= parkImages.length - 1){
							counter = 0;
						}
						else {
							counter++;
							console.log(counter);
						}
						slider.setAttribute("src", parkImages[counter].url);
					}
					 document.querySelector(".next").onclick = next;

					// Appends all park activities to the DOM as an unordered list
					document.querySelector("#activitiesH2").innerText = "Available Park Activities";
					const activities = park.activities;
					activities.forEach((item, i) => {
						let activity = document.createElement("li");
						activity.innerText = item.name;
						document.querySelector("ul").append(activity);
					})

					// Appends weather information to the DOM
					document.querySelector("#weatherH2").innerText = "Weather Information";
					document.querySelector("#weatherP").append(park.weatherInfo);

					// Appends the link to the national park website to the DOM
					document.querySelector("#footer").setAttribute("href", park.url);
					document.querySelector("#footer").innerText = "Learn more about this park";

					document.querySelector("#otherParks").innerText = "Other Nearby Parks";

}

