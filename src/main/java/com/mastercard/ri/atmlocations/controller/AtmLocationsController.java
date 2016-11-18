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

package com.mastercard.ri.atmlocations.controller;

import com.mastercard.api.core.exception.ApiException;
import com.mastercard.api.core.model.RequestMap;
import com.mastercard.api.locations.ATMLocations;
import com.mastercard.ri.atmlocations.Constants;
import com.mastercard.ri.atmlocations.generated.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping(value = "/atms", produces = Constants.APPLICATION_JSON_UTF8_VALUE)
public class AtmLocationsController implements Constants {
    private static final Logger logger = LoggerFactory.getLogger(AtmLocationsController.class);

    @RequestMapping(method = RequestMethod.GET)
    @ResponseBody
    public Atms getAtmsByLatLng(@RequestParam(value = "pageOffset", defaultValue = "0", required = false) int pageOffset,
                                @RequestParam(value = "pageLength", defaultValue = "20", required = false) int pageLength,
                                @RequestParam("latitude") double latitude,
                                @RequestParam("longitude") double longitude,
                                @RequestParam("distanceUnit") String distanceUnit,
                                @RequestParam("postalCode") String postalCode,
                                @RequestParam("country") String country) throws ApiException {
        RequestMap map = new RequestMap();
        map.put("PageOffset", pageOffset);
        map.put("PageLength", pageLength);
        map.put("Latitude", latitude);
        map.put("Longitude", longitude);
        map.put("DistanceUnit", distanceUnit);
        map.put("PostalCode", postalCode);
        map.put("Country", country);

        ATMLocations response = ATMLocations.query(map);

        return processResponse(response);
    }

    private Atms processResponse(ATMLocations response) {

        Atms atms = new Atms();
        atms.setPageOffset(Integer.valueOf(response.get("Atms.PageOffset").toString()));
        atms.setTotalCount(Integer.valueOf(response.get("Atms.TotalCount").toString()));

        List<Map<String, Object>> list = (List<Map<String, Object>>) response.get("Atms.Atm");
        if (list != null && !list.isEmpty()) {
            List<Atm> atmList = new ArrayList<>(list.size());

            for (Map<String, Object> i : list) {
                Map<String, Object> locationMap = (Map<String, Object>) i.get("Location");
                Map<String, Object> addressMap = (Map<String, Object>) locationMap.get("Address");
                Map<String, Object> subDivisionMap = (Map<String, Object>) addressMap.get("CountrySubdivision");
                Map<String, Object> countryMap = (Map<String, Object>) addressMap.get("Country");
                Map<String, Object> pointMap = (Map<String, Object>) locationMap.get("Point");

                CountrySubdivision subdivision = new CountrySubdivision();
                subdivision.setCode((String) subDivisionMap.get("Code"));
                subdivision.setName((String) subDivisionMap.get("Name"));

                Country country = new Country();
                country.setCode((String) countryMap.get("Code"));
                country.setName((String) countryMap.get("Name"));

                Address address = new Address();
                address.setLine1((String) addressMap.get("Line1"));
                address.setLine2((String) addressMap.get("Line2"));
                address.setCity((String) addressMap.get("City"));
                address.setPostalCode((String) addressMap.get("PostalCode"));
                address.setCountrySubdivision(subdivision);
                address.setCountry(country);

                Point point = new Point();
                point.setLatitude(Double.parseDouble(pointMap.get("Latitude").toString()));
                point.setLongitude(Double.parseDouble(pointMap.get("Longitude").toString()));

                Location location = new Location();
                location.setName((String) locationMap.get("Name"));

                if (locationMap.get("Distance") != null) {
                    Double distance = Double.parseDouble(locationMap.get("Distance").toString());
                    location.setDistance(Math.round(distance * 100) / 100.0);
                }
                location.setDistanceUnit(locationMap.get("DistanceUnit").toString().toLowerCase());
                location.setAddress(address);
                location.setPoint(point);

                Atm atm = new Atm();

                atm.setHandicapAccessible("YES".equals(i.get("HandicapAccessible")));
                atm.setCamera("YES".equals(i.get("Camera")));
                atm.setAvailability((String) i.get("Availability"));
                atm.setAccessFees((String) i.get("AccessFees"));
                atm.setSharedDeposit("YES".equals(i.get("SharedDeposit")));
                atm.setSurchargeFreeAlliance("YES".equals(i.get("SurchargeFreeAlliance")));
                atm.setSupportEmv(Long.valueOf(1).equals(i.get("SupportEMV")));
                atm.setInternationalMaestroAccepted(Long.valueOf(1).equals(i.get("InternationalMaestroAccepted")));
                atm.setLocation(location);

                atmList.add(atm);
            }
            atms.setAtm(atmList);
        }

        return atms;
    }
}
