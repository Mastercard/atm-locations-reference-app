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

describe('View', function() {
  'use strict';

  var expect = chai.expect;

  var view;
  var sandbox;
  var config = {
    postalCode: '10011',
    country: 'USA',
    defaultLocation: {lat: 40.742859, lng: -74.000284},
    zoomLevel: 19,
    distanceUnit: 'KILOMETER'
  };
  var markup = '<div id="fixture"> \
  <div class="atms-maps-list-container"> \
    <div id="map" class="atms-map"> \
    </div> \
    <div id="atms-list-wrapper" class="atms-list-wrapper hide"> \
      <div class="atms-list-container"> \
        <div id="atm-list" class="atms-list"> \
        </div> \
        <div id="atms-list-loading" class="atms-list-loading hide"> \
        </div> \
      </div> \
    </div> \
  </div> \
  <div id="atms-list-item-template" class="atms-list-item hide"> \
    <div class="atms-list-item-header-container"> \
      <div class="atms-list-item-header"> \
        <p class="atms-list-item-name"></p> \
        <p class="atms-list-item-distance"></p> \
      </div> \
    </div> \
    <div class="atms-list-item-details"> \
      <p class="atms-list-item-address atms-list-item-address-line1"></p> \
      <p class="atms-list-item-address atms-list-item-address-line2"></p> \
      <p class="atms-list-item-address atms-list-item-address-city"></p> \
      <hr class="atms-list-item-details-separator" /> \
      <p class="atms-list-item-details-services-header">Services</p> \
      <div class="atms-list-item-details-services-list"> \
      </div> \
    </div> \
  </div> \
  <p id="atms-list-item-details-service-template" class="atms-list-item-details-service hide"></p> \
  </div>';

  beforeEach(function() {
    sandbox = sinon.sandbox.create();

    view = new View(config);
    jQuery('body').append(markup);
  });

  afterEach(function() {
    sandbox.restore();
    jQuery('#fixture').remove();
  });

  describe('#getMaps()', function() {
    it('should get maps', function() {
      var stub = {};
      sandbox.stub(window, 'Maps').returns(stub);

      view.initMap();
      expect(view.getMaps()).to.equal(stub);
    });
  });

  describe('#initMap()', function() {
    it('should init map', function() {
      sandbox.stub(window, 'Maps');
      var callback = sandbox.stub();

      view.onMapInitialized(callback);
      view.initMap();

      expect(callback).to.have.been.calledOnce;
    });
  });

  describe('#renderCurrentLocation()', function() {
    it('should render current location', function() {
      var stub = {
        panTo: function() {},
        setCurrentLocationMarker: function() {}
      };

      sandbox.stub(stub, 'panTo');
      sandbox.stub(stub, 'setCurrentLocationMarker');
      sandbox.stub(window, 'Maps').returns(stub);

      var location = { lat: 1.11111, lng: 2.2222 };

      view.initMap();
      view.renderCurrentLocation(location);

      expect(jQuery('#atms-list-loading').text()).to.equal('Fetching ATM locations near New York, NY 10011, United States\u2026');
      expect(stub.setCurrentLocationMarker).to.have.been.calledWith(location);
      expect(stub.panTo).to.have.been.calledWith(location);
    })
  });

  describe('#addCenterChangedHandler()', function() {
    it('should add center changed handler', function() {
      var stub = {
        addCenterChangedHandler: function() {}
      };
      var callback = sandbox.stub();

      sandbox.stub(stub, 'addCenterChangedHandler');
      sandbox.stub(window, 'Maps').returns(stub);

      view.initMap();
      view.addCenterChangedHandler(callback);

      expect(stub.addCenterChangedHandler).to.have.been.calledWith(callback);
    });
  }),

  describe('#renderAtm()', function() {
    var stub = {
      addMarker: function() {}
    }

    beforeEach(function() {
      sandbox.stub(stub, 'addMarker');
      sandbox.stub(window, 'Maps').returns(stub);
    });

    it('should render ATM without services', function() {
      var atm = {
        "location":{
          "name":"TEST LOCATION 1",
          "distance":0.02,
          "distanceUnit":"kilometer",
          "address":{
            "line1":"123 STREET 1",
            "line2":null,
            "city":"TEST CITY",
            "postalCode":"10011",
            "countrySubdivision":{
              "name":null,
              "code":"AA"
            },
            "country":{
              "name":"TEST COUNTRY",
              "code":"AAA"
            }
          },
          "point":{
            "latitude":40.742759,
            "longitude":-74.000528
          }
        },
        "handicapAccessible":false,
        "camera":false,
        "availability":"UNKNOWN",
        "accessFees":"DOMESTIC",
        "sharedDeposit":false,
        "surchargeFreeAlliance":false,
        "supportEmv":false,
        "internationalMaestroAccepted":false
      };

      view.initMap();
      view.renderAtm(atm);

      expect(jQuery('#atm-list').children().length).to.equal(1);
      expect(jQuery('.atms-list-item-name').text()).to.equal('TEST LOCATION 1');
      expect(jQuery('.atms-list-item-distance').text()).to.equal('0.02 km');
      expect(jQuery('.atms-list-item-address-line1').text()).to.equal('123 STREET 1');
      expect(jQuery('.atms-list-item-address-line2').text()).to.equal('');
      expect(jQuery('.atms-list-item-address-line2').hasClass('hide')).to.be.true;
      expect(jQuery('.atms-list-item-address-city').text()).to.equal('TEST CITY, AA 10011');
      expect(jQuery('.atms-list-item-details-services-list').children().length).to.equal(1);
      expect(jQuery('.atms-list-item-details-service').text()).to.equal('None');
      expect(stub.addMarker).to.have.been.calledWith({
        lat: 40.742759,
        lng: -74.000528
      });
    });

    it('should render ATM with services', function() {
      var atm = {
        "location":{
          "name":"TEST LOCATION 1",
          "distance":0.02,
          "distanceUnit":"kilometer",
          "address":{
            "line1":"123 STREET 1",
            "line2":"TEST BUILDING",
            "city":"TEST CITY",
            "postalCode":"10011",
            "countrySubdivision":{
              "name":null,
              "code":"AA"
            },
            "country":{
              "name":"TEST COUNTRY",
              "code":"AAA"
            }
          },
          "point":{
            "latitude":40.742759,
            "longitude":-74.000528
          }
        },
        "handicapAccessible":false,
        "camera":true,
        "availability":"UNKNOWN",
        "accessFees":"DOMESTIC",
        "sharedDeposit":false,
        "surchargeFreeAlliance":false,
        "supportEmv":true,
        "internationalMaestroAccepted":false
      };

      view.initMap();
      view.renderAtm(atm);

      expect(jQuery('#atm-list').children().length).to.equal(1);
      expect(jQuery('.atms-list-item-name').text()).to.equal('TEST LOCATION 1');
      expect(jQuery('.atms-list-item-distance').text()).to.equal('0.02 km');
      expect(jQuery('.atms-list-item-address-line1').text()).to.equal('123 STREET 1');
      expect(jQuery('.atms-list-item-address-line2').text()).to.equal('TEST BUILDING');
      expect(jQuery('.atms-list-item-address-line2').hasClass('hide')).to.be.false;
      expect(jQuery('.atms-list-item-address-city').text()).to.equal('TEST CITY, AA 10011');
      expect(jQuery('.atms-list-item-details-services-list').children().length).to.equal(2);
      expect(jQuery('.atms-list-item-details-service').eq(0).text()).to.equal('Security Camera');
      expect(jQuery('.atms-list-item-details-service').eq(1).text()).to.equal('Supports EMV');
      expect(stub.addMarker).to.have.been.calledWith({
        lat: 40.742759,
        lng: -74.000528
      });
    });
  });
});
