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
  Ported to NodeJs by Lyndel McGee.

  MIT license, all text above must be included in any redistribution
 **************************************************************************/

'use strict';
const Adafruit_GFX_Library = require("adafruit-gfx-library");
const Mixin_RGB565_Display_Render = Adafruit_GFX_Library.Mixins.Mixin_RBG565_Display_Render;

const {Adafruit_ST77XX} = require("./Adafruit_ST77XX.js");

const toInt = Math.trunc;

const {
ST77XX_SWRESET,
ST77XX_SLPOUT,
ST77XX_NORON,

ST77XX_INVOFF,
ST77XX_INVON,
ST77XX_DISPON,
ST77XX_CASET,
ST77XX_RASET,
ST77XX_RAMWR,

ST77XX_MADCTL,
ST77XX_COLMOD,

ST77XX_MADCTL_MY,
ST77XX_MADCTL_MX,
ST77XX_MADCTL_MV,
ST77XX_MADCTL_ML,
ST77XX_MADCTL_BGR,
ST77XX_MADCTL_MH,
ST77XX_MADCTL_RGB
} = require("./Adafruit_ST77XX_Constants.js");

const ST_CMD_DELAY = 0x80 // special signifier for command lists

const GENERIC_ST7789_INIT_SEQ_1 =  [    // Init commands for 7789 screens
    3,                                  //  3 commands in list:
    ST77XX_SWRESET,   ST_CMD_DELAY,     //  1: Software reset, no args, w/delay
      150,                              //     ~150 ms delay
    ST77XX_SLPOUT ,   ST_CMD_DELAY,     //  2: Out of sleep mode, no args, w/delay
      10,                               //      10 ms delay
    ST77XX_COLMOD , 1 + ST_CMD_DELAY,   //  3: Set color mode, 1 arg + delay:
      0x55,                             //     16-bit color
      10,                               //     10 ms delay
];

const GENERIC_ST7789_INIT_SEQ_1B =  [    // Init commands for 7789 screens
    2,                                  //  2 commands in list:
    ST77XX_CASET  , 4,                  //  1: Column addr set, 4 args, no delay:
      0x00,
      0x00,                             //     XSTART = 0
      240 >>> 8,
      240,                              //     XEND = 240
    ST77XX_RASET  , 4,                  //  2: Row addr set, 4 args, no delay:
      0x00,
      0x00,                             //     YSTART = 0
      320 >>> 8,
      320 & 0xFF,                       //     YEND = 320
];

const GENERIC_ST7789_INIT_SEQ_2 =  [    // Init commands for 7789 screens
    2,                                  //  1 commands in list:
    ST77XX_NORON  ,   ST_CMD_DELAY,     //  3: Normal display on, no args, w/delay
      10,                               //     10 ms delay
    ST77XX_DISPON ,   ST_CMD_DELAY,     //  4: Main screen turn on, no args, delay
      10                                //  10 ms delay
];

class Adafruit_ST7789 extends Mixin_RGB565_Display_Render(Adafruit_ST77XX) {

    constructor(options) {
        super(options);
        const self = this;
        //console.log("reverseInversionMode:%o", reverseInversionMode);
        // Adafruit display defaults MADCTL_VALUE to ST77XX_MADCTL_BGR.
        self.invertOnCommand = ST77XX_INVON;
        self.invertOffCommand = ST77XX_INVOFF;

        self._colstart2 = 0;
        self._rowstart2 = 0;
    }


    /**************************************************************************/
    /*!
        @brief  Initialization code common to all ST7789 displays
        @param  width  Display width
        @param  height Display height
        @param  mode   SPI data mode; one of SPI_MODE0, SPI_MODE1, SPI_MODE2
                       or SPI_MODE3 (do NOT pass the numbers 0,1,2 or 3 -- use
                       the defines only, the values are NOT the same!)
    */
    /**************************************************************************/
    begin() {
        const self = this;
        // retrieve the hard-wired settings from Adafruit_GFX super class.
        const width = self.WIDTH, height = self.HEIGHT, rotation = self.rotation;
        if (width == 240 && height == 240) {
            // 1.3", 1.54" displays (right justified)
            self._rowstart = (320 - height);
            self._rowstart2 = 0;
            self._colstart = self._colstart2 = (240 - width);
        } else if (width == 135 && height == 240) {
            // 1.14" display (centered, with odd size)
            self._rowstart = self._rowstart2 = toInt((320 - height) / 2);
            // This is the only device currently supported device that has different
            // values for _colstart & _colstart2. You must ensure that the extra
            // pixel lands in _colstart and not in _colstart2
            /*
            const dw = 240 - width;
            const sr = dw >>> 1;
            self._colstart = dw - sr;
            self._colstart2 = sr;
            */
            self._colstart = toInt((240 - width + 1) / 2);
            self._colstart2 = toInt((240 - width) / 2);
        } else {
            // 1.47", 1.69, 1.9", 2.0" displays (centered)
            self._rowstart = self._rowstart2 = toInt((320 - height) / 2);
            self._colstart = self._colstart2 = toInt((240 - width) / 2);
        }
        // instead of windowWidth/windowHeight we could have used self.WIDTH/self.HEIGHT
        self.windowWidth = width;
        self.windowHeight = height;

        self._executeInitSequence(GENERIC_ST7789_INIT_SEQ_1);
        self.invertDisplay(false);
        self.setRotation(rotation);
        // FUDGE
        //self._executeInitSequence(GENERIC_ST7789_INIT_SEQ_1B);
        self.fillScreen(0x00);
        self._executeInitSequence(GENERIC_ST7789_INIT_SEQ_2);
        return self;
    }


    /**************************************************************************/
    /*!
        @brief  Override to manage the 80 pixel offset for the 7789 as buffer is 240x320 but we only have 240.
        @param  m  The index for rotation, from 0-3 inclusive
    */
    /**************************************************************************/
    setRotation(m) {
        // call super to setup everything.
        super._initRotation(m);
        const self = this, rotation = self.rotation, reverseColorOrder = self._reverseColorOrder;
        let madctl = 0, colorOrder = reverseColorOrder ? ST77XX_MADCTL_BGR :ST77XX_MADCTL_RGB; 
        //console.log("reverseColorOrder:%o", reverseColorOrder);
        switch (rotation) {
            case 0:
                madctl = ST77XX_MADCTL_MX | ST77XX_MADCTL_MY | colorOrder;
                self._xstart = self._colstart;
                self._ystart = self._rowstart;
                // instead of windowWidth/windowHeight we could have used self.WIDTH/self.HEIGHT
                self._width = self.windowWidth
                self._height = self.windowHeight;
                break;
            case 1:
                madctl = ST77XX_MADCTL_MY | ST77XX_MADCTL_MV | colorOrder;
                self._xstart = self._rowstart;
                self._ystart = self._colstart2;
                // instead of windowWidth/windowHeight we could have used self.WIDTH/self.HEIGHT
                self._height = self.windowWidth;
                self._width = self.windowHeight;
                break;
            case 2:
                madctl = colorOrder;
                self._xstart = self._colstart2;
                self._ystart = self._rowstart2;
                // instead of windowWidth/windowHeight we could have used self.WIDTH/self.HEIGHT
                self._width = self.windowWidth;
                self._height = self.windowHeight;
                break;
            case 3:
                madctl = ST77XX_MADCTL_MX | ST77XX_MADCTL_MV | colorOrder;
                self._xstart = self._rowstart2;
                self._ystart = self._colstart;
                // instead of windowWidth/windowHeight we could have used self.WIDTH/self.HEIGHT
                self._height = self.windowWidth;
                self._width = self.windowHeight;
                break;
        }
        return self.sendCommand(ST77XX_MADCTL, [madctl]);
    }
}

module.exports = {Adafruit_ST7789};