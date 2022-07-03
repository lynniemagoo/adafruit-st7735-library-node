'use strict';
const LIB_LOCATION = "./lib/";

const Adafruit_ST7735_Module = require(LIB_LOCATION + "Adafruit_ST7735.js");
const Adafruit_ST7789_Module = require(LIB_LOCATION + "Adafruit_ST7789.js");
const Adafruit_ST77XX_Module = require(LIB_LOCATION + "Adafruit_ST77XX.js");
const Adafruit_ST77XX_Constants = require(LIB_LOCATION + "Adafruit_ST77XX_Constants.js");

module.exports = {...Adafruit_ST7735_Module, ...Adafruit_ST7789_Module , ...Adafruit_ST77XX_Module, Adafruit_ST77XX_Constants};
