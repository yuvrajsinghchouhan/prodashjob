var placeSearch, autocomplete;
      var componentForm = {
      postal_code: 'short_name'
    
      };
      function initAutocomplete() {
      autocomplete = new google.maps.places.Autocomplete(
      (document.getElementById('autocomplete')),
      {types: ['geocode']});
      autocomplete.addListener('place_changed', fillInAddress);
      }
      function fillInAddress() {
      var place = autocomplete.getPlace();
      for (var component in componentForm) {
      document.getElementById(component).value = '';
      document.getElementById(component).disabled = false;
      }
      for (var i = 0; i < place.address_components.length; i++) {
      var addressType = place.address_components[i].types[0];
      if (componentForm[addressType]) {
      var val = place.address_components[i][componentForm[addressType]];
      document.getElementById(addressType).value = val;
      }
      }
      }
      function geolocate() {
      if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
      var geolocation = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
      };
      var circle = new google.maps.Circle({
      center: geolocation,
      radius: position.coords.accuracy
      });
      autocomplete.setBounds(circle.getBounds());
      });
      }
      }