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

package com.mastercard.ri.atmlocations.config;

import com.mastercard.api.core.ApiConfig;
import com.mastercard.api.core.security.oauth.OAuthAuthentication;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.io.Resource;

import javax.annotation.PostConstruct;

@Configuration
@PropertySource("mastercard-api.properties")
public class MastercardApiConfig {

    private static final Logger logger = LoggerFactory.getLogger(MastercardApiConfig.class);

    @Value("${mastercard.api.consumer.key}")
    private String consumerKey;

    @Value("${mastercard.api.key.alias}")
    private String keyAlias;

    @Value("${mastercard.api.keystore.password}")
    private String keyPassword;

    @Value("${mastercard.api.p12.path}")
    private Resource p12Path;

    @Value("${mastercard.api.sandbox}")
    private boolean sandbox;

    @Value("${mastercard.api.debug}")
    private boolean debug;

    @PostConstruct
    public void setupApiConfiguration() throws Exception {
        logger.debug("setupApiConfiguration");
        logger.debug(".p12 file path = {}", p12Path.getURI());

        ApiConfig.setDebug(debug);
        ApiConfig.setSandbox(sandbox);

        ApiConfig.setAuthentication(new OAuthAuthentication(consumerKey, p12Path.getInputStream(), keyAlias, keyPassword));
    }
}
