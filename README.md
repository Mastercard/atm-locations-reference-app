# ATM Locations Reference Implementation

This repository showcases a reference implementation for ATM Locations using APIs from [Mastercard Developers](https://developer.mastercard.com).

Try the [demo](https://www.mastercardlabs.com/ref-impl-atm-locations/).

**Note**: The demo uses live ATM locations data and therefore it is restricted to New York, NY 10011, United States.

## Frameworks / Libraries used
- [Spring Framework](https://projects.spring.io/spring-framework/) 3.2.17
- [jQuery](https://jquery.com/)  3.1.1
- [sanitize](https://jonathantneal.github.io/sanitize.css/) 4.1.0

## Requirements
- Java 7 and above
- Set up the `JAVA_HOME` environment variable to match the location of your Java installation.

## Setup
1. Create an account at [Mastercard Developers](https://developer.mastercard.com).
2. Create a new project and add `Locations` API to your project. A `.p12` file is downloaded automatically. **Note**: On Safari, the file name will be `Unknown`. Rename it to a .p12 extension.
3. Copy the downloaded `.p12` file to `src/main/resources`.
4. Open `src/main/resources/mastercard-api.properties` and configure:
  - `mastercard.api.debug` - `true` if you need console logging, otherwise `false`.
  - `mastercard.api.p12.path` - Path to keystore (.p12). Uses Spring's resource strings.
  - `mastercard.api.consumer.key` - Consumer key. Copy this from "My Keys" on your project page
  - `mastercard.api.key.alias` - Key alias. Default key alias for sandbox is `keyalias`.
  - `mastercard.api.keystore.password` - Keystore password. Default keystore password for sandbox project is `keystorepassword`.
  - `mastercard.api.sandbox` - `true` if you are using sandbox environment, otherwise `false`.
5. Get a Google Maps API key at [Google Maps APIs](https://developers.google.com/maps/documentation/javascript/get-api-key#get-an-api-key).
6. Open `src/main/resources/google-maps.properties` and configure:
  - `google.maps.api.key` - This value is automatically applied to src/main/frontend/index.html during the maven build process.

## Build and Run

> Windows: `mvnw.cmd clean tomcat7:run-war`

> Linux / Mac: `./mvnw clean tomcat7:run-war`

Open [http://localhost:9090/ref-impl-atm-locations/](http://localhost:9090/ref-impl-atm-locations/).

## Deploying to your own server

> Windows: `mvnw.cmd clean package`

> Linux / Mac: `./mvnw clean package`

Deploy `ref-impl-atm-locations.war` in `target/` directory to your container.
