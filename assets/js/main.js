let map, infoWindow, service;

function initMap() {

    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -23.5552, lng: -46.6569 },
        zoom: 12
    });
    // Create the search box and link it to the UI element.
    const input = document.getElementById("pac-input");
    const searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    // Bias the SearchBox results towards current map's viewport.
    map.addListener("bounds_changed", () => {
        searchBox.setBounds(map.getBounds());
    });

    let markers = [];
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener("places_changed", () => {
        const places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }
        // Clear out the old markers.
        markers.forEach(marker => {
            marker.setMap(null);
        });
        markers = [];
        // For each place, get the icon, name and location.
        const bounds = new google.maps.LatLngBounds();
        places.forEach(place => {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }
            const icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };
            // Create a marker for each place.
            markers.push(
                new google.maps.Marker({
                    map,
                    icon,
                    title: place.name,
                    position: place.geometry.location
                })
            );

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    });


    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };


                map.setCenter(pos);
                weatherBalloon(pos.lat, pos.lng);

            },
            () => {
                handleLocationError(true, infoWindow, map.getCenter());
            }
        );

    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }



    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setPanel(document.getElementById("right-panel"))
    directionsRenderer.setMap(map);
    document.getElementById("submitDirection").addEventListener("click", () => {
        calculateAndDisplayRoute(directionsService, directionsRenderer)
    });



    document.getElementById("fecharRota").addEventListener("click", () => {
        $("#right-panel").fadeOut("slow", function () {
            $("#floating-panel").css("justify-content", "flex-start")
        });

    });




}



function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
        browserHasGeolocation
            ? "Error: The Geolocation service failed."
            : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(map);
}

function calculateAndDisplayRoute(directionsService, directionsRenderer) {
    directionsService.route(
        {
            origin: {
                query: document.getElementById("start").value
            },
            destination: {
                query: document.getElementById("end").value
            },
            travelMode: google.maps.TravelMode.DRIVING
        },
        (response, status) => {
            if (status === "OK") {
                directionsRenderer.setDirections(response);
                $("#floating-panel").css("justify-content", "space-between")
                $("#right-panel").fadeIn("slow", function () {

                });

            } else {
                window.alert("Directions request failed due to " + status);
            }
        }
    );
}




//PARTE DE OUTRA API

function weatherBalloon(lat, lon) {

    var key = 'ChaveAqui';
    fetch("https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&lang=pt_br&appid=" + key)
        .then(function (resp) { return resp.json() }) // Convert data to json
        .then(function (data) {
            drawWeather(data);

        })
        .catch(function () {
            // catch any errors
        });
}

function drawWeather(d) {

    var celcius = Math.round(parseFloat(d.main.temp) - 273.15);
    var fahrenheit = Math.round(((parseFloat(d.main.temp) - 273.15) * 1.8) + 32);

    var url = urlSwitcher(parseInt(d.weather[0].id))

var description=d.weather[0].description.split(" ");
var descriptionFormated="";

for(var i=0;i<description.length;i++){

    descriptionFormated+=`${toCamelCase(description[i])} `
}
    document.getElementById('description').innerHTML =descriptionFormated

    document.getElementById('temp').innerHTML = celcius + '&deg;';

    temperatureColor(celcius)

    document.getElementById('location').innerHTML = d.name;


    dragElement(document.getElementById("draggable-box"));
    $("#draggable-box").fadeIn();


    let img = document.getElementById("img-weather");
    img.src = url;
}

function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    if (document.getElementById(elmnt.id + "header")) {
        // if present, the header is where you move the DIV from:
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}


function urlSwitcher(code) {

    
    var t = "d"
    stamp = new Date();
    var hours;
 
    hours = stamp.getHours();

    if (hours >= 12) {
        t = "n";
    }
    else {
        t = "d";
    }


    if (code >= 200 && code <= 232) {
        return "http://openweathermap.org/img/wn/11" + t + "@2x.png"
    }
    if (code >= 300 && code <= 321) {
        return "http://openweathermap.org/img/wn/09" + t + "@2x.png"
    }
    if (code >= 500 && code <= 531) {
        if (code >= 500 && code <= 504) {
            return "http://openweathermap.org/img/wn/10" + t + "@2x.png"
        }
        if (code == 511) {
            return "http://openweathermap.org/img/wn/13" + t + "@2x.png"
        }
        if (code >= 520 && code <= 531) {
            return "http://openweathermap.org/img/wn/09" + t + "@2x.png"
        }
    }

    if (code >= 600 && code <= 622) {
        return "http://openweathermap.org/img/wn/50" + t + "@2x.png"
    }
    if (code >= 701 && code <= 781) {
        return "http://openweathermap.org/img/wn/13" + t + "@2x.png"
    }

    if (code == 800) {
        return "http://openweathermap.org/img/wn/01" + t + "@2x.png"
    }
    if (code == 802) {
        return "http://openweathermap.org/img/wn/03" + t + "@2x.png"
    }
    if (code == 801) {
        return "http://openweathermap.org/img/wn/02" + t + "@2x.png"
    }
    if (code >= 803 && code <= 804) {
        return "http://openweathermap.org/img/wn/04" + t + "@2x.png"
    }

    return "http://openweathermap.org/img/wn/02" + t + "@2x.png"
}


function temperatureColor(temp) {

  
    let temperature = $("#temp")
    if (temp <= 15) {
        temperature.css("color", "#00BFFF")
    } else {
        if (temp > 15 && temp < 25) {
            temperature.css("color", "#008000")
        } else {
            temperature.css("color", "#FF0000")
        }
    }
}

function toCamelCase(str) {
    return str.toLowerCase().replace(/(?:(^.)|(\s+.))/g, function(match) {
        return match.charAt(match.length-1).toUpperCase();
    });
}