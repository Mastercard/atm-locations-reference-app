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

import com.mastercard.api.core.ApiConfig;
import com.mastercard.api.core.security.Authentication;
import com.mastercard.api.locations.SDKConfig;
import com.mastercard.ri.atmlocations.Constants;
import com.mastercard.ri.atmlocations.config.AppConfig;
import org.apache.commons.io.IOUtils;
import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockserver.client.server.MockServerClient;
import org.mockserver.junit.MockServerRule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.result.MockMvcResultHandlers;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.util.Collections;

import static org.hamcrest.CoreMatchers.is;
import static org.mockito.Mockito.mock;
import static org.mockserver.model.HttpRequest.request;
import static org.mockserver.model.HttpResponse.response;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = AppConfig.class)
@WebAppConfiguration
public class AtmLocationsControllerTest implements Constants {
    private static final String CONTENT_TYPE = "Content-Type";

    @Rule
    public MockServerRule mockServerRule = new MockServerRule(this);

    MockServerClient mockServerClient;

    @Autowired
    WebApplicationContext context;

    MockMvc mvc;

    @Before
    public void setup() throws Exception {
        mvc = MockMvcBuilders.webAppContextSetup(context).build();
        SDKConfig.setHost("http://127.0.0.1:" + mockServerRule.getPort());

        ApiConfig.setAuthentication(mock(Authentication.class));
    }

    @After
    public void cleanup() {
        mockServerClient.reset();
    }

    @Test
    public void shouldReturnAtmsWhenThereAreResults() throws Exception {
        String testJson = IOUtils.toString(getClass().getResourceAsStream("/atm-locations-test.json"));

        mockServerClient
                .when(
                        request()
                                .withMethod("GET")
                )
                .respond(
                        response()
                                .withStatusCode(HttpStatus.OK.value())
                                .withHeader(CONTENT_TYPE, APPLICATION_JSON_UTF8_VALUE)
                                .withBody(testJson)
                );

        this.mvc.perform(
                get("/atms")
                        .param("pageLength", "20")
                        .param("pageOffset", "0")
                        .param("latitude", "40.742859")
                        .param("longitude", "-74.000284")
                        .param("distanceUnit", "KILOMETER")
                        .param("postalCode", "10011")
                        .param("country", "USA")
                        .accept(APPLICATION_JSON_UTF8))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(status().isOk())
                .andExpect(content().contentType(APPLICATION_JSON_UTF8_VALUE))
                .andExpect(jsonPath("$.pageOffset", is(0)))
                .andExpect(jsonPath("$.totalCount", is(2)))
                .andExpect(jsonPath("$.atm[0].location.name", is("Sandbox ATM Location 1")))
                .andExpect(jsonPath("$.atm[0].location.distance", is(1.5)))
                .andExpect(jsonPath("$.atm[0].location.distanceUnit", is("km")))
                .andExpect(jsonPath("$.atm[0].location.address.line1", is("4420 Earnhardt Drive")))
                .andExpect(jsonPath("$.atm[0].location.address.line2", is("")))
                .andExpect(jsonPath("$.atm[0].location.address.city", is("Louisville")))
                .andExpect(jsonPath("$.atm[0].location.address.postalCode", is("107171")))
                .andExpect(jsonPath("$.atm[0].location.address.countrySubdivision.name", is("BAHBEII")))
                .andExpect(jsonPath("$.atm[0].location.address.countrySubdivision.code", is("II")))
                .andExpect(jsonPath("$.atm[0].location.address.country.name", is("BAHBEIHF")))
                .andExpect(jsonPath("$.atm[0].location.address.country.code", is("BAH")))
                .andExpect(jsonPath("$.atm[0].location.point.latitude", is(BigDecimal.valueOf(-37.806934077218514))))
                .andExpect(jsonPath("$.atm[0].location.point.longitude", is(144.97742109605883)))
                .andExpect(jsonPath("$.atm[0].handicapAccessible", is(false)))
                .andExpect(jsonPath("$.atm[0].camera", is(false)))
                .andExpect(jsonPath("$.atm[0].availability", is("UNKNOWN")))
                .andExpect(jsonPath("$.atm[0].accessFees", is("UNKNOWN")))
                .andExpect(jsonPath("$.atm[0].sharedDeposit", is(false)))
                .andExpect(jsonPath("$.atm[0].surchargeFreeAlliance", is(false)))
                .andExpect(jsonPath("$.atm[0].supportEmv", is(true)))
                .andExpect(jsonPath("$.atm[0].internationalMaestroAccepted", is(true)));
    }

    @Test
    public void shouldReturnNoResultsWhenThereAreNoResults() throws Exception {
        String testJson = IOUtils.toString(getClass().getResourceAsStream("/atm-locations-test-empty.json"));

        mockServerClient
                .when(
                        request()
                                .withMethod("GET")
                )
                .respond(
                        response()
                                .withStatusCode(HttpStatus.OK.value())
                                .withHeader(CONTENT_TYPE, APPLICATION_JSON_UTF8_VALUE)
                                .withBody(testJson)
                );

        this.mvc.perform(
                get("/atms")
                        .param("pageLength", "20")
                        .param("pageOffset", "0")
                        .param("latitude", "40.742859")
                        .param("longitude", "-74.000284")
                        .param("distanceUnit", "KILOMETER")
                        .param("postalCode", "10011")
                        .param("country", "USA")
                        .accept(APPLICATION_JSON_UTF8))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(status().isOk())
                .andExpect(content().contentType(APPLICATION_JSON_UTF8_VALUE))
                .andExpect(jsonPath("$.pageOffset", is(0)))
                .andExpect(jsonPath("$.totalCount", is(0)))
                .andExpect(jsonPath("$.atm", is(Collections.emptyList())));
    }

    @Test
    public void shouldReturnErrorWhenThereIsAnError() throws Exception {
        String testJson = IOUtils.toString(getClass().getResourceAsStream("/atm-locations-error-test.json"));

        mockServerClient
                .when(
                        request()
                                .withMethod("GET")
                )
                .respond(
                        response()
                                .withStatusCode(HttpStatus.UNAUTHORIZED.value())
                                .withHeader(CONTENT_TYPE, APPLICATION_JSON_UTF8_VALUE)
                                .withBody(testJson)
                );

        this.mvc.perform(
                get("/atms")
                        .param("pageLength", "20")
                        .param("pageOffset", "0")
                        .param("latitude", "40.742859")
                        .param("longitude", "-74.000284")
                        .param("distanceUnit", "KILOMETER")
                        .param("postalCode", "10011")
                        .param("country", "USA")
                        .accept(APPLICATION_JSON_UTF8))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.error[0].source", is("System")))
                .andExpect(jsonPath("$.error[0].reason", is("The oauth_consumer_key presented has not been granted access to the requested service. ERROR CODE 600")));
    }

    @Test
    public void shouldReturnAnErrorWhenInputIsIncorrect() throws Exception {
        this.mvc.perform(
                get("/atms")
                        .param("pageLength", "2a")
                        .param("pageOffset", "0")
                        .param("latitude", "40.742859")
                        .param("longitude", "-74.000284")
                        .param("distanceUnit", "KILOMETER")
                        .param("postalCode", "10011")
                        .param("country", "USA")
                        .accept(APPLICATION_JSON_UTF8))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.error[0].source", is("Input")))
                .andExpect(jsonPath("$.error[0].reason", is("Value '2a' is not of required type 'int'.")));
    }

    @Test
    public void shouldReturnAnErrorWhenRequiredInputIsMissing() throws Exception {
        this.mvc.perform(
                get("/atms")
                        .param("pageLength", "20")
                        .param("pageOffset", "0")
                        .param("latitude", "40.742859")
                        .param("longitude", "-74.000284")
                        .param("distanceUnit", "KILOMETER")
                        .param("postalCode", "10011")
                        .accept(APPLICATION_JSON_UTF8))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.error[0].source", is("Input")))
                .andExpect(jsonPath("$.error[0].reason", is("Required String parameter 'country' is not present")));
    }
}
