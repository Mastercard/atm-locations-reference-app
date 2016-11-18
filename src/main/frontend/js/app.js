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

var view = new View(config);
var presenter = new Presenter(view, config);

$(function() {
    // hide the nav bar if we are embedded in an iframe
  if (window.self !== window.top) {
    $('#navbar').addClass('hide');
  }

  $(window).resize(function() {
    if (view.getMaps()) {
      updateAtmListPosition();
    }
  });
});

function initMap() {
  view.initMap();
  updateAtmListPosition();
}

function openOverlayMenu() {
  $('#atms-container').addClass('overlay-menu-open');
}

function closeOverlayMenu() {
  $('#atms-container').removeClass('overlay-menu-open');
  google.maps.event.trigger(view.getMaps(), 'resize');
}

function updateAtmListPosition() {
  var elem = document.getElementById('atms-list-wrapper');
  var docWidth = $(document).width();
  var maps = view.getMaps();

  if (docWidth >= 900) {
    if (!maps.hasControls()) {
      maps.addControls(elem);
    }
  } else {
    if (maps.hasControls()) {
      maps.removeControls();
      $(elem).removeAttr('style').insertAfter($('#map'));
    }
  }
}
