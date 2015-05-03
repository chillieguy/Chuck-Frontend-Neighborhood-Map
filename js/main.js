var infowindow;
var map;
var marker;
var center;
var breweryList;

var breweryList = [
  {
      name: 'Deschutes Brewery',
      lat: 44.047044, 
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

var mapInit = function(){
  center = new google.maps.LatLng(44.05, -121.3);
  var mapOptions = {
    zoom: 13,
    center: center
  };
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  infowindow = new google.maps.InfoWindow();
  for (var i = 0; i < breweryList.length; i++) {
    marker = new google.maps.Marker({
      position: new google.maps.LatLng(breweryList[i].lat, breweryList[i].lon),
      map: map,
      title: breweryList[i].name
    }); 

    google.maps.event.addListener(marker, 'click', (function(marker)  {
      return function() {
        infowindow.setContent(marker.title+"<div id='content'></div>");
        infowindow.open(map, marker);
        setTimeout(function(){ marker.setAnimation(null); }, 750);
        getFourSquare(marker);                     
      }
    })(marker));
    markers.push(marker);
  };
}

var ViewModel = function(){
  var self = this;
  self.locations= ko.observableArray(breweryList);
  self.markers=ko.observableArray(breweryList);
  self.filter= ko.observable('');
  
  self.OpenInfoWindow= function(locations){
    var point= markers[locations.markerNum];
    infowindow.open(map, point);
    infowindow.setContent(point.title+"<div id='content'></div>");
    point.setAnimation(google.maps.Animation.DROP);
    setTimeout(function(){ point.setAnimation(null); }, 750);
    getFourSquare(point);
  }

  self.showOrHideMarkers= function(state){
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(state);
    };
  }

  self.filterArray = function(filter){
    return ko.utils.arrayFilter(self.locations(), function(location) {
      return location.name.toLowerCase().indexOf(filter) >= 0;   
    });
  }

  self.displaySelected = function(filteredmarkers){
    for (var i = 0; i < filteredmarkers.length; i++) {
      markers[filteredmarkers[i].markerNum].setMap(map);
    }
  }

  self.filterList = function(){
    var filter = self.filter().toLowerCase();
    if (!filter) {
      self.showOrHideMarkers(map);
      return self.locations();
    } else {
    self.showOrHideMarkers(null);
    var filteredmarkers = [];
    filteredmarkers = self.filterArray(filter);
    self.displaySelected(filteredmarkers);
    return filteredmarkers;
    }
  }
}

var getFourSquare = function(marker){
  var lat= marker.position.lat();
  var lon = marker.position.lng();
  var $windowContent = $('#content');
  /* the foursquare tips api url */
  var url = 'htttps://api.foursquare.com/v2/venues/search?client_id=' +
            'NFLHHJ350PG5BFEFQB2AZY2CJ3TUCUYR3Q14QPL5L35JT4WR' +
            '&client_secret=WDNBZ4J3BISX15CF1MYOBHBP2RUSF2YSRLVPZ3F' +
            '4WZUYZGWR&v=20130815' + '&ll=' + lat + ',' +
            lon + '&query=\'' + marker.title + '\'&limit=1';

  $.getJSON(url, function(response){
    var venue = response.response.venues[0];
    var venueLoc = venue.contact.formattedPhone;
    var venueAddress = venue.location.formattedAddress;
    //var venuePhotoPrefix = venue.categories[0].icon.prefix+'bg'+'_64';
    //var venuePhoto = venuePhotoPrefix + venue.categories[0].icon.suffix;
    
    //$windowContent.append('<p>'+venueLoc+'</p>');
    //$windowContent.append('<p>'+venueAddress+'</p>');
    //$windowContent.append('<img src="'+ venuePhoto+'">');
   
   })
  .error(function(e){
    $windowContent.text('Content could not be loaded');
  });
}

google.maps.event.addDomListener(window, 'load', mapInit);
ko.applyBindings(new ViewModel());