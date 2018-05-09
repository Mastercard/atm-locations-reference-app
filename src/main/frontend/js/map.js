/*
 * Copyright 2016 MasterCard International.
 *
 * Redistribution and use in source and binary forms, with or without modification, are
 * permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list of
 * conditions and the following disclaimer in the documentation and/or other materials
 * provided with the distribution.
 * Neither the name of the MasterCard International Incorporated nor the names of its
 * contributors may be used to endorse or promote products derived from this software
 * without specific prior written permission.
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
 * SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 * IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
 * SUCH DAMAGE.
 *
 */

var Maps = (function() {
  "use strict";

  return function(domElem, zoom, center, mapLoadedCallback) {
    var currentLocationMarker = null;
    var markers = [];
    var markersBounds = new google.maps.LatLngBounds();
    var hasControls = false;

    var map = new google.maps.Map(domElem, {
      zoom: zoom,
      center: center,
      fullscreenControl: false
    });

    if (mapLoadedCallback) {
      google.maps.event.addListenerOnce(map, 'idle', mapLoadedCallback);
    }

    return {
      setCurrentLocationMarker: function(position) {
        currentLocationMarker = new google.maps.Marker({
          position: position,
          map: map,
          icon: 'images/blue_dot.png',
          zIndex: 100,
        });
      },

      addMarker: function(position, clickCallback) {
        var marker = new google.maps.Marker({
          position: position,
          map: map,
        });
        marker.addListener('click', clickCallback);
        markers.push(marker);
        markersBounds = markersBounds.extend(position);
      },

      panTo: function(position) {
        map.panTo(position);
      },

      addCenterChangedHandler: function(callback) {
        google.maps.event.addListener(map, 'idle', function() {
          var center = {
            lat: map.getCenter().lat(),
            lng: map.getCenter().lng()
          };
          if (!markersBounds.contains(center)) {
            callback();
          }
        });
      },

      hasControls: function() {
        return hasControls;
      },

      addControls: function(elem) {
        map.controls[google.maps.ControlPosition.RIGHT_TOP].push(elem);
        hasControls = true;
      },

      removeControls: function() {
        map.controls[google.maps.ControlPosition.RIGHT_TOP].clear();
        hasControls = false;
      }
    };
  };
})();
