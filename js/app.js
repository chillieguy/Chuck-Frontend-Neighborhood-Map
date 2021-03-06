"use strict";

// Global variables -  Review to see what can be eliminated or moved into a function
var infowindow;
var map;
var marker;
var center;
var breweryList;
var latOffset;
var lonOffset;

// Used to store pins on map
var mapPin = [];

// List of Breweris in Bend, OR
// gID not used in current interation
var breweryList = [
    {
        name: 'Deschutes Brewery',
        lat:44.047044, 
        lon: -121.322177,
        markerNum: 0, 
        vis: true, 
        gID: 'ChIJeYqq9dLHuFQRMWT6UYsLmPg',
    },
    {
        name: 'Cascade Lakes Brewery',
        lat: 44.041888, 
        lon: -121.332658,
        markerNum: 1, 
        vis: true, 
        gID: 'ChIJhbeWJ8XHuFQRjbHdrQVrSwk'
    },
    {
        name: 'Bend Brewing Company', 
        lat: 44.060520, 
        lon: -121.313650,
        markerNum: 2, 
        vis: true, 
        gID: 'ChIJnQPoAZ3IuFQRnr4rTZIL5dA'
    },
    {
        name: 'Silver Moon', 
        lat: 44.060341, 
        lon: -121.307833,
        markerNum: 3, 
        vis: true, 
        gID: 'ChIJ-8FzA57IuFQR17wPbPNXKcI'
    },
    {
        name: '10 Barrel', 
        lat: 44.056578, 
        lon: -121.328319,
        markerNum: 4, 
        vis: true, 
        gID: 'ChIJN6Qnj4DIuFQROlKWCbi9594'
    },
    {
        name: 'Boneyard', 
        lat: 44.054089, 
        lon: -121.308026,
        markerNum: 5, 
        vis: true, 
        gID: 'ChIJJbIq5iXGuFQRmveoZZik550'
    },
    {
        name: 'Goodlife', 
        lat: 44.050821, 
        lon: -121.330520,
        markerNum: 6, 
        vis: true, 
        gID: 'ChIJZT410tXHuFQRvRdchoO-L9g'
    },
    {
        name: 'Crux', 
        lat: 44.050923, 
        lon: -121.307869,
        markerNum: 7, 
        vis: true, 
        gID: 'ChIJCf5w6i_GuFQRzUOU2jHUp0U'
    },
    {
        name: 'Worthy', 
        lat: 44.055281, 
        lon: -121.260255,
        markerNum: 8, 
        vis: true, 
        gID: 'ChIJ92P-oArGuFQRGCrNXgzDiv8'
    },
];

/*
 * Set up Google maps and infowindow
 * Handle clicking on pin to center pin and display infowindow
 */
 var initMap = function(){
  // Map options, centered on Bend, OR
  center = new google.maps.LatLng(44.05, -121.3);
  var mapOptions = {
    zoom: 14,
    center: center,
    panControl: false,
    scaleControl: false,
    zoomControl: false
  };
  // Assign Google Map to map for easy reference
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  
  infowindow = new google.maps.InfoWindow();

  for (var i = 0; i < breweryList.length; i++) {
    marker = new google.maps.Marker({
      position: new google.maps.LatLng(breweryList[i].lat, breweryList[i].lon),
      map: map,
      title: breweryList[i].name
    }); 

    // Zoom and center selected pin then move by offset 
    google.maps.event.addListener(marker, 'click', (function(marker)  {
      return function() {
        center = marker.getPosition();
        map.panTo(center);
        map.setZoom(16);
        map.panBy(lonOffset,latOffset);
        marker.setAnimation(google.maps.Animation.BOUNCE);
        // Bounce twice and then stop
        setTimeout(function(){ marker.setAnimation(null); }, 1500);
        // Add div for infowindow to make it easier to append information 
        infowindow.setContent(marker.title+"<div id='content'></div>");
        infowindow.open(map, marker);
        // Get info for selected pin from Foursquare
        getFourSquare(marker);
      };
    })(marker));
  
    // Keep map center when resizing the window
    google.maps.event.addDomListener(window, "resize", function() {
      map.setCenter(center);
      map.panBy(lonOffset,latOffset); 
    });
  
    // Add pins to mapPin array to make easy to access
    mapPin.push(marker);
  }
};

/*
 * This is where the voodoo happens, Create a ViewModel to handle the app logic
 */
var ViewModel = function(){
  var self = this;

  // Load Google Maps based on options set in initMap
  google.maps.event.addDomListener(window, 'load', initMap);
  
  self.breweryList = ko.observableArray(breweryList);
  self.mapPin = ko.observableArray(mapPin);
  self.filter = ko.observable('');
  self.shouldShowListings = ko.observable(false),
  
  // When list is selected zoom to pin, center by offset and display infowindow
  self.showInfoWindow= function(breweryList){
    var point= mapPin[breweryList.markerNum];
    center = point.getPosition();
    map.panTo(center);
    map.setZoom(16);
    map.panBy(lonOffset,latOffset);
    infowindow.open(map, point);
    // Add div for infowindow to make it easier to append information 
    infowindow.setContent(point.title+"<div id='content'></div>");
    point.setAnimation(google.maps.Animation.BOUNCE);
    // Bounce twice and then stop
    setTimeout(function(){ point.setAnimation(null); }, 1500);
    // Get info for selected listitem from Foursquare
    getFourSquare(point); 
  };
  
  // Update what Google map pins to display
  self.filterMarkers= function(state){
    for (var i = 0; i < mapPin.length; i++) {
      mapPin[i].setMap(state);
    }
  };
  

  self.filterArray = function(filter){
    return ko.utils.arrayFilter(self.breweryList(), function(location) {
      return location.name.toLowerCase().indexOf(filter) >= 0;   
    });
  };
  
  // Display only breweries that match text in search box
  self.displaySelected = function(filteredmarkers){
    for (var i = 0; i < filteredmarkers.length; i++) {
      mapPin[filteredmarkers[i].markerNum].setMap(map);
    }
  };
  
  // Update listview to display breweriesf
  self.filterList = function(){
    var filter = self.filter().toLowerCase();
    // If not filter display all breweries
    if (!filter) {
      self.filterMarkers(map);
      return self.breweryList();
    } else {
    // If filter display only breweries that match search string
    self.filterMarkers(null);
    var filteredmarkers = [];
    filteredmarkers = self.filterArray(filter);
    self.displaySelected(filteredmarkers);
    return filteredmarkers;
    }
  };
};

// Pull information from Foursquare when listview or pin is selected
// Using pin information to populate infowindow
var getFourSquare = function(marker){
  var CLIENT_ID = '5E3QB5JQZL0UPAWZBUP35GCEJR1NMIJNPP2UVCP5C4XVQBMO';
  var CLIENT_SECRET = 'IHVGS4A0J1APCNUUT1L0CFMRDHO0NIXKMCZMU5QBXAD1MJ1R';
  var lat= marker.position.lat();
  var lon = marker.position.lng();
  var $windowContent = $('#content');
  var url = 'https://api.foursquare.com/v2/venues/search?' + 
            'client_id=' + CLIENT_ID +
            '&client_secret=' + CLIENT_SECRET +
            '&v=20130815' + 
            '&ll=' + lat + ',' + lon + 
            '&query=\'' + marker.title + '\'&limit=1';

  // Pull foursquare info from marker passed to getFourSquare function
  $.getJSON(url, function(response){
    var venue = response.response.venues[0];
    var venueLoc = venue.contact.formattedPhone;
    var venueTwitter = venue.contact.twitter;
    var venueUrl = venue.url;
    
    // Append foursquare info to infowindow
    // Left in js file till I decide if I want to keep Foursquare
    $windowContent.append('<p>Phone: ' + venueLoc + '</p>');
    $windowContent.append('<p>Twitter: @'+ venueTwitter + '</p>');
    $windowContent.append('<p>Website: '+ venueUrl + '</p>');
   })
  // Small warning if not able to pull info
  .error(function(e){
    $windowContent.text('FOURSQUARE info could not be fetched');
  });
};

// Init the ViewModel and get the Knockout party started
ko.applyBindings(new ViewModel());

// Used by panBy() to move selected pin down and to the right
latOffset = window.screen.height * -0.2;
lonOffset = window.screen.width * -0.15;