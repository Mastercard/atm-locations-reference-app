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

var View = (function($, document) {
  'use strict';

  var services = [
    'handicapAccessible',
    'camera',
    'sharedDeposit',
    'surchargeFreeAlliance',
    'supportEmv',
    'internationalMaestroAccepted'
  ];
  var servicesDescription = [
    'Handicap Accessible',
    'Security Camera',
    'Shared Deposit',
    'Surcharge Free Alliance',
    'Supports EMV',
    'International Maestro Accepted'
  ];

  return function(config) {
    var atmTemplate;
    var serviceItemTemplate;

    var maps;
    var onMapInitializedCallback;

    function showLoadingIndicator(textToShow) {
      $('#atms-list-loading')
        .removeClass('hide')
        .html(textToShow + '&hellip;');
    }

    function hideLoadingIndicator() {
      $('#atms-list-loading')
        .html('')
        .addClass('hide');
    }

    function createAtmServiceItem(text) {
      var serviceItem = serviceItemTemplate
        .clone()
        .removeAttr('id')
        .removeClass('hide')
        .html(text);

      return serviceItem;
    }

    function panToMarker(elem) {
      var atm = elem.data();
      maps.panTo({lat: atm.location.point.latitude, lng: atm.location.point.longitude});
    }

    function expandAtmNode(elem, scrollIntoView) {
      $('.atms-list-item-details')
        .slideUp()
        .parents('.atms-list-item')
        .removeClass('atms-list-item-selected');

      elem
        .addClass('atms-list-item-selected')
        .find('.atms-list-item-details')
        .slideDown(function() {
          if (scrollIntoView) {
            $('.atms-list-container').animate({
              scrollTop: elem.offset().top - elem.parent().offset().top + elem.parent().scrollTop()
            });
          }
        });
    }

    return {
      getMaps: function() {
        return maps;
      },

      initMap: function() {
        maps = new Maps(document.getElementById('map'),
          config.zoomLevel,
          config.defaultLocation,
          function() {
            $('#atms-list-wrapper').removeClass('hide');
          }
        );

        atmTemplate = $('#atms-list-item-template');
        serviceItemTemplate = $('#atms-list-item-details-service-template');

        if (onMapInitializedCallback) {
          onMapInitializedCallback();
        }
      },

      onMapInitialized: function(callback) {
        onMapInitializedCallback = callback;
      },

      renderCurrentLocation: function(location) {
        showLoadingIndicator('Fetching ATM locations near New York, NY 10011, United States');
        maps.setCurrentLocationMarker(location);
        maps.panTo(location);
      },

      addCenterChangedHandler: function(callback) {
        maps.addCenterChangedHandler(callback);
      },

      renderAtm: function(atm) {
        hideLoadingIndicator();

        var atmListElem = $('#atm-list');

        var address = atm.location.address;
        var distanceUnit = atm.location.distanceUnit.toUpperCase() === 'KILOMETER' ?
          'km' : atm.location.distanceUnit;
        var distance = atm.location.distance + ' ' + distanceUnit;

        // render ATM data into DOM
        var atmItem = atmTemplate
          .clone()
          .removeAttr('id')
          .removeClass('hide');

        // store atm data into node
        atmItem.data(atm);

        // render atm information
        atmItem.find('.atms-list-item-name')
          .html(atm.location.name);

        atmItem.find('.atms-list-item-distance')
          .html(distance);

        atmItem.find('.atms-list-item-address-line1')
          .html(address.line1);

        // hide address line 2 if there is no data
        var line2Node = atmItem.find('.atms-list-item-address-line2')
          .html(address.line2);
        if (!address.line2) {
          line2Node.addClass('hide');
        }

        atmItem.find('.atms-list-item-address-city')
          .html(address.city + ", " + address.countrySubdivision.code + " " + address.postalCode);

        // add services information
        var serviceItemHolder = atmItem.find('.atms-list-item-details-services-list');
        services.forEach(function(service, index) {
          if (atm[service]) {
            var serviceItem = createAtmServiceItem(servicesDescription[index]);

            serviceItemHolder.append(serviceItem);
          }
        });
        if (!serviceItemHolder.children().length) {
          serviceItemHolder.append(createAtmServiceItem('None'));
        }

        // add click listener to expand the node to show details and
        // to pan to appropriate marker on the map
        atmItem.find('.atms-list-item-header-container')
          .click(function(event) {
            var target = $(event.currentTarget);
            var node = target.parents('.atms-list-item');
              expandAtmNode(node);
              panToMarker(node);
          });

        atmListElem.append(atmItem);

        var position = {
          lat: atm.location.point.latitude,
          lng: atm.location.point.longitude,
        };

        // create google maps marker
        maps.addMarker(position, function() {
          maps.panTo(this.getPosition());

          // scroll to the dom node
          expandAtmNode(atmItem, true);
        });
      }
    };
  };
})(window.jQuery, window.document);
