//alert('he');

 /* this.auth = firebase.auth();
  this.database = firebase.database();
this.messagesRef = this.database.ref('messages');

  var setMessage = function(data) {
    var val = data.val();
    console.log(val);
    //this.displayMessage(data.key, val.name, val.text, val.photoUrl, val.imageUrl);
  }.bind(this);
  this.messagesRef.limitToLast(12).on('child_added', setMessage);
  this.messagesRef.limitToLast(12).on('child_changed', setMessage);
*/
this.auth = firebase.auth();
var provider = new firebase.auth.GoogleAuthProvider();
this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));

var targetsCount = 0;
var storedCount = 0;
var historyCount = 0;

function signIn() {
	this.auth.signInWithPopup(provider);
}

function signOut() {
  //this.auth.signOut();
  var user = firebase.auth().currentUser;
	var credential;

	// Prompt the user to re-provide their sign-in credentials

	user.reauthenticate(credential).then(function() {
	  // User re-authenticated.
	}, function(error) {
	  // An error happened.
	});
};
  
  	var geoData = {
			"type": "geojson",
			//"maxzoom": 13,
			"cluster": false,
			//"clusterRadius": 1,
			//"clusterMaxZoom": 1,
	        "data": {
	        	"cluster": true,
	        	"clusterMaxZoom": 1,
	        	"clusterRadius": 0.1,
	            "type": "FeatureCollection",
	            "features": []
	        }
		}
		var feature = {
                    "type": "Feature",
                    "properties": {},
                    "geometry": {
                        "type": "Point"
                        //"coordinates": []
                    }
                };
         var source = new mapboxgl.GeoJSONSource({
					    data: geoData.data
					});

window.onload = function() {
	



	usersCoutnerDiv = document.getElementById('users_counter');

	authBoxDiv = document.getElementById('auth');
	this.authBoxDiv.addEventListener('click', this.signIn.bind(this));
	function getData(data) {

		targetsCount = 0;
		storedCount = 0;
		historyCount = 0;
		geoData.data.features = [];
		//usersCoutnerDiv.innerHTML = "test";
		var usersData = data.val();
		usersCoutnerDiv.innerHTML = "Users count: " + Object.keys(usersData).length;
		for ( userKey in usersData ) {
			for ( placeKey in usersData[userKey]['history'] ) {
				var place = usersData[userKey]['history'][placeKey];
				var coordinates = [place.longitude, place.latitude];

				var f = JSON.parse(JSON.stringify(feature));
				f.properties = {"title": place.title, "icon": "monument", "type": "history", "latitude": place.latitude, "longitude": place.longitude};
				f.geometry.coordinates = coordinates;
				historyCount++;
				geoData.data.features.push(f);
			}
			for ( placeKey in usersData[userKey]['stored'] ) {
				var place = usersData[userKey]['stored'][placeKey];
				var coordinates = [place.longitude, place.latitude];

				var f = JSON.parse(JSON.stringify(feature));
				f.properties = {"title": place.title, "icon": "rocket", "type": "stored", "latitude": place.latitude, "longitude": place.longitude};
				f.geometry.coordinates = coordinates;
				storedCount++;
				geoData.data.features.push(f);
			}
			var place = usersData[userKey]['target'];
			if (place) {
				var coordinates = [place.longitude, place.latitude];

				var f = JSON.parse(JSON.stringify(feature));
				f.properties = {"title": place.title, "icon": "harbor", "type": "target", "latitude": place.latitude, "longitude": place.longitude};
				f.geometry.coordinates = coordinates;
				targetsCount++;
				geoData.data.features.push(f);
			}
		}
		source.setData(geoData.data);

		/*
		geoData.data.features.forEach(function(marker) {
    	// create an img element for the marker
		    var el = document.createElement('button');
		    el.className = 'marker';
		    //el.style.backgroundImage = 'url(https://placekitten.com/g/60/60/)';
		    if ( marker.properties.type == "target" ) {
		    	el.style.backgroundColor = "#f00";
		    } else if ( marker.properties.type == "stored" ) {
				el.style.backgroundColor = "#00f";
		    } else if ( marker.properties.type == "history" ) {
		    	el.style.backgroundColor = "#ccc";
		    }
		     
		    el.style.width = "10px";
		    el.style.height = "10px";

		    el.addEventListener('click', function() {
		        window.alert(marker.properties.message);
		    });

		    // add marker to map
		    new mapboxgl.Marker(el)
		        .setLngLat(marker.geometry.coordinates)
		        .addTo(map);
		});
		*/
		console.log(geoData.data.features);
		usersCoutnerDiv.innerHTML += "<br />Places count: " + geoData.data.features.length;
		usersCoutnerDiv.innerHTML += "<br />Targets count: " + targetsCount;
		usersCoutnerDiv.innerHTML += "<br />Stored count: " + storedCount;
		usersCoutnerDiv.innerHTML += "<br />History count: " + historyCount;

		
		//console.log(usersCoutnerDiv);
	}
	firebase.database().ref('places').on('value', getData);
	//firebase.database().ref('users').on('child_added', function(data) { console.log(data.val()); });

      //firebase.database().ref('messages').on('value', function(data) { console.log(data.val()); });

      map.on('load', function () {

    map.addSource("symbols", source);
		// add source as a layer and apply some styles
	    map.addLayer({
	        "id": "symbols",
	        "type": "symbol",
	        "source": "symbols",
	        "minzoom": 1,
	        "layout": {
	            "icon-image": "{icon}-15",
	            "text-field": "{type}",
	            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
	            "text-offset": [0, 0.6],
	            "text-anchor": "top"
	        },
	        "paint": {
	            //"text-color": "#eee"
	        }
	    });

    
});
}

function playback(index, type) {
	if (index == -1) {
		return;
	}
	if (index == geoData.data.features.length) {
		index = 0;
	}
    var feature = geoData.data.features[index];
    if (feature.properties.type != type) {
    	playback(index+1, type);
    	return;
    }

    // Animate the map position based on camera properties
    map.flyTo({center: feature.geometry.coordinates, zoom:3, _pitch:60});
    var popup = new mapboxgl.Popup()
	        .setLngLat(feature.geometry.coordinates)
	        .setHTML(feature.properties.title)
	        .addTo(map);

    map.once('moveend', function() {
        // Duration the slide is on screen after interaction
        window.setTimeout(function() {
            // Increment index
            popup.remove();
            index = (index + 1 === geoData.data.features.length) ? 0 : index + 1;
            playback(index, type);
        }, 3000); // After callback, show the location for 3 seconds.
    });
}


map.on('click', function (e) {
    // Use queryRenderedFeatures to get features at a click event's point
    // Use layer option to avoid getting results from other layers
    var features = map.queryRenderedFeatures(e.point, { layers: ['symbols'] });
    // if there are features within the given radius of the click event,
    // fly to the location of the click event

    var feature = features[0];

    if (feature) {
        // Get coordinates from the symbol and center the map on those coordinates
        map.flyTo({center: feature.geometry.coordinates, zoom: 13});

        var popup = new mapboxgl.Popup()
	        .setLngLat(feature.geometry.coordinates)
	        .setHTML(feature.properties.title)
	        .addTo(map);
        //alert(features[0].geometry.coordinates);
        //map.zoom = 13;
    }
});

map.on('mousemove', function (e) {
    var features = map.queryRenderedFeatures(e.point, { layers: ['symbols'] });
    map.getCanvas().style.cursor = features.length ? 'pointer' : '';
});

function onAuthStateChanged(user) {
  if (user) {
  	console.log('authed', this.auth.currentUser.uid);
  	console.log(this.auth.currentUser);
    this.authBoxDiv.style.display = "none";
  } else {
  	console.log('not authed')
    this.authBoxDiv.style.display = "block";
  }
};
