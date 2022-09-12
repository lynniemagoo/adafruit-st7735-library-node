/**************************************************************************
  This is a library for several Adafruit displays based on ST77* drivers.

  Works with the Adafruit 1.8" TFT Breakout w/SD card
    ----> http://www.adafruit.com/products/358
  The 1.8" TFT shield
    ----> https://www.adafruit.com/product/802
  The 1.44" TFT breakout
    ----> https://www.adafruit.com/product/2088
  as well as Adafruit raw 1.8" TFT display
    ----> http://www.adafruit.com/products/618

  Check out the links above for our tutorials and wiring diagrams.
  These displays use SPI to communicate, 4 or 5 pins are required to
  interface (RST is optional).

  Adafruit invests time and resources providing this open source code,
  please support Adafruit and open-source hardware by purchasing
  products from Adafruit!

  Written by Limor Fried/Ladyada for Adafruit Industries.
  Ported to NodeJs by Lyndel R. McGee.

  MIT license, all text above must be included in any redistribution
 **************************************************************************/

'use strict';
const ST77XX_NOP = 0x00;
const ST77XX_SWRESET = 0x01;
const ST77XX_RDDID = 0x04;
const ST77XX_RDDST = 0x09;

const ST77XX_SLPIN = 0x10;
const ST77XX_SLPOUT = 0x11;
const ST77XX_PTLON = 0x12;
const ST77XX_NORON = 0x13;

const ST77XX_INVOFF = 0x20;
const ST77XX_INVON = 0x21;
const ST77XX_DISPOFF = 0x28;
const ST77XX_DISPON = 0x29;
const ST77XX_CASET = 0x2A;
const ST77XX_RASET = 0x2B;
const ST77XX_RAMWR = 0x2C;
const ST77XX_RAMRD = 0x2E;

const ST77XX_PTLAR = 0x30;
const ST77XX_TEOFF = 0x34;
const ST77XX_TEON = 0x35;
const ST77XX_MADCTL = 0x36;
const ST77XX_COLMOD = 0x3A;

const ST77XX_MADCTL_MY = 0x80;
const ST77XX_MADCTL_MX = 0x40;
const ST77XX_MADCTL_MV = 0x20;
const ST77XX_MADCTL_ML = 0x10;
const ST77XX_MADCTL_BGR = 0x08;
const ST77XX_MADCTL_MH = 0x04;
const ST77XX_MADCTL_RGB = 0x00;

const ST77XX_RDID1 = 0xDA;
const ST77XX_RDID2 = 0xDB;
const ST77XX_RDID3 = 0xDC;
const ST77XX_RDID4 = 0xDD;

module.exports = {
ST77XX_NOP,
ST77XX_SWRESET,
ST77XX_RDDID,
ST77XX_RDDST,

ST77XX_SLPIN,
ST77XX_SLPOUT,
ST77XX_PTLON,
ST77XX_NORON,

ST77XX_INVOFF,
ST77XX_INVON,
ST77XX_DISPOFF,
ST77XX_DISPON,
ST77XX_CASET,
ST77XX_RASET,
ST77XX_RAMWR,
ST77XX_RAMRD,

ST77XX_PTLAR,
ST77XX_TEOFF,
ST77XX_TEON,
ST77XX_MADCTL,
ST77XX_COLMOD,

ST77XX_MADCTL_MY,
ST77XX_MADCTL_MX,
ST77XX_MADCTL_MV,
ST77XX_MADCTL_ML,
ST77XX_MADCTL_BGR,
ST77XX_MADCTL_MH,
ST77XX_MADCTL_RGB,

ST77XX_RDID1,
ST77XX_RDID2,
ST77XX_RDID3,
ST77XX_RDID4
};