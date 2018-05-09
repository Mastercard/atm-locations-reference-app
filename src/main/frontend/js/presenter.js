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

var Presenter = (function($, navigator, API) {
  'use strict';

  return function(view, config) {
    var loadingInProgress = false, maxItemsReached = false;

    var currentLocation = config.defaultLocation;

    var pageOffset = 0;
    var pageLength = 25;
    var distanceUnit = config.distanceUnit;
    var radius = config.radius;

    function init() {
      view.onMapInitialized(onMapInitialized);
    }

    function onMapInitialized() {
      fetchAtms();
      view.renderCurrentLocation(currentLocation);
      view.addCenterChangedHandler(onCenterChanged);
    }

    function onCenterChanged() {
      fetchAtms();
    }

    function fetchAtms() {
      if (loadingInProgress || maxItemsReached) {
        return;
      }
      loadingInProgress = true;

      var promise = API.getAtms(currentLocation.lat, currentLocation.lng,
        config.distanceUnit, config.postalCode, config.country, pageLength,
        pageOffset);

      promise
        .done(function(data) {
          pageOffset += pageLength;

          if (data.totalCount <= pageOffset) {
            maxItemsReached = true;
          }

          $.each(data.atm, function(index, atm) {
            view.renderAtm(atm);
          });
        })
        .always(function() {
          loadingInProgress = false;
        });
    }

    init();

    return {

    };
  };
})(window.jQuery, window.navigator, API);
