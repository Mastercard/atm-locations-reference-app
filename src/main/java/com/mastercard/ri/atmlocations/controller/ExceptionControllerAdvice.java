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
import com.mastercard.ri.atmlocations.generated.model.Error;
import com.mastercard.ri.atmlocations.generated.model.Errors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.TypeMismatchException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class ExceptionControllerAdvice {
    private static final Logger logger = LoggerFactory.getLogger(ExceptionControllerAdvice.class);

    @ExceptionHandler(ApiException.class)
    public ResponseEntity handleApiException(ApiException ex) {
        return handleThrowable(ex);
    }

    @ExceptionHandler(TypeMismatchException.class)
    protected ResponseEntity handleTypeMismatch(TypeMismatchException ex) {
        logger.error(ex.toString(), ex);

        Error error = new Error();
        error.setSource("Input");
        error.setReason("Value '" + ex.getValue() + "' is not of required type '" + ex.getRequiredType().getSimpleName() + "'.");

        Errors errors = new Errors();
        errors.addErrorItem(error);

        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    protected ResponseEntity handleMissingRequestParameter(MissingServletRequestParameterException ex) {
        logger.error(ex.toString(), ex);

        Error error = new Error();
        error.setSource("Input");
        error.setReason(ex.getMessage());

        Errors errors = new Errors();
        errors.addErrorItem(error);

        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Throwable.class)
    public ResponseEntity handleThrowable(Throwable ex) {
        logger.error(ex.toString(), ex);

        Error error = new Error();
        error.setSource("System");
        error.setReason(ex.getMessage());

        Errors errors = new Errors();
        errors.addErrorItem(error);

        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }
}
