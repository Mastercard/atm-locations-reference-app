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

describe('Presenter', function() {
  'use strict';

  var expect = chai.expect;

  var presenter;
  var view;
  var sandbox;
  var fakeServer;

  var config = {
    postalCode: '10011',
    country: 'USA',
    defaultLocation: {lat: 40.742859, lng: -74.000284},
    zoomLevel: 19,
    distanceUnit: 'KILOMETER'
  };

  var atms = {
    "pageOffset":0,
    "totalCount":2,
    "atm":[
      {
        "location":{
          "name":"TEST LOCATION 1",
          "distance":0.02,
          "distanceUnit":"kilometer",
          "address":{
            "line1":"111 AVENUE",
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
            "latitude":40.71000,
            "longitude":-74.000008
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
      },
      {
        "location":{
          "name":"TEST LOCATION 2",
          "distance":0.05,
          "distanceUnit":"kilometer",
          "address":{
            "line1":"222 AVENUE",
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
            "latitude":40.720000,
            "longitude":-74.00001
          }
        },
        "handicapAccessible":true,
        "camera":true,
        "availability":"ALWAYS_AVAILABLE",
        "accessFees":"DOMESTIC_AND_INTERNATIONAL",
        "sharedDeposit":false,
        "surchargeFreeAlliance":false,
        "supportEmv":false,
        "internationalMaestroAccepted":false
      }
    ]
  };

  before(function() {
    sandbox = sinon.sandbox.create();
    fakeServer = sandbox.useFakeServer();

    view = new View(config);
  });

  after(function() {
    fakeServer.restore();
    sandbox.restore();
  });

  it('should initialize and fetch ATMs', function() {
    fakeServer.respondWith('GET', /atms\?.*/g,
            [
              200,
              { "Content-Type": "application/json" },
              JSON.stringify(atms)
            ]);

    sandbox.stub(view, 'renderCurrentLocation');
    sandbox.stub(view, 'addCenterChangedHandler');
    sandbox.stub(view, 'renderAtm');
    sandbox.stub(view, 'onMapInitialized', function(callback) {
      callback();
    });

    presenter = new Presenter(view, config);

    fakeServer.respond();

    expect(view.onMapInitialized).to.have.been.calledOnce;
    expect(view.renderCurrentLocation).to.have.been.calledOnce;
    expect(view.renderCurrentLocation).to.have.been.calledWith(config.defaultLocation);
    expect(view.addCenterChangedHandler).to.have.been.calledOnce;
    expect(view.renderAtm).to.have.been.calledTwice;
  });
});
