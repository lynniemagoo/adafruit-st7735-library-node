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
const extractOption = Adafruit_GFX_Library.Utils.extractOption;
const {Adafruit_ST77XX} = require("./Adafruit_ST77XX.js");

const {
ST77XX_SWRESET,

ST77XX_SLPIN,
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

// some flags for initR() :(
const INITR_UNKNOWN = 0xFF;
const INITR_GREENTAB = 0x00;
const INITR_REDTAB = 0x01;
const INITR_BLACKTAB = 0x02;
const INITR_18GREENTAB = INITR_GREENTAB;
const INITR_18REDTAB = INITR_REDTAB;
const INITR_18BLACKTAB = INITR_BLACKTAB;
const INITR_144GREENTAB = 0x01;
const INITR_MINI160x80 = 0x04;
const INITR_HALLOWING = 0x05;

const INITS_UNKNOWN = 0xFF;
const INITS_MINI160x80 = 0x10;

const ST7735_TFTWIDTH_128 = 128;     // for 1.44 and mini
const ST7735_TFTWIDTH_80   = 80;     // for mini
const ST7735_TFTHEIGHT_128 = 128;    // for 1.44" display
const ST7735_TFTHEIGHT_160 = 160;    // for 1.8" and mini display

// Some register settings
const ST7735_FRMCTR1 = 0xB1;
const ST7735_FRMCTR2 = 0xB2;
const ST7735_FRMCTR3 = 0xB3;
const ST7735_INVCTR = 0xB4;
const ST7735_DISSET5 = 0xB6;

const ST7735_PWCTR1 = 0xC0;
const ST7735_PWCTR2 = 0xC1;
const ST7735_PWCTR3 = 0xC2;
const ST7735_PWCTR4 = 0xC3;
const ST7735_PWCTR5 = 0xC4;
const ST7735_VMCTR1 = 0xC5;

const ST7735_PWCTR6 = 0xFC

const ST7735_GMCTRP1 = 0xE0
const ST7735_GMCTRN1 = 0xE1

const ST_CMD_DELAY = 0x80 // special signifier for command lists


const ST7735B_INIT_SEQ_1 = [        // Init commands for 7735B screens
    17,                             // 17 commands in list:
    ST77XX_SWRESET,   ST_CMD_DELAY, //  1: Software reset, no args, w/delay
      50,                           //     50 ms delay
    ST77XX_SLPOUT,    ST_CMD_DELAY, //  2: Out of sleep mode, no args, w/delay
      255,                          //     255 = max (500 ms) delay
    ST77XX_COLMOD,  1+ST_CMD_DELAY, //  3: Set color mode, 1 arg + delay:
      0x05,                         //     16-bit color
      10,                           //     10 ms delay
    ST7735_FRMCTR1, 3+ST_CMD_DELAY, //  4: Frame rate control, 3 args + delay:
      0x00,                         //     fastest refresh
      0x06,                         //     6 lines front porch
      0x03,                         //     3 lines back porch
      10,                           //     10 ms delay
    ST77XX_MADCTL,  1,              //  5: Mem access ctl (directions), 1 arg:
      0x08,                         //     Row/col addr, bottom-top refresh (ST77XX_MADCTL_BGR)
    ST7735_DISSET5, 2,              //  6: Display settings #5, 2 args:
      0x15,                         //     1 clk cycle nonoverlap, 2 cycle gate
                                    //     rise, 3 cycle osc equalize
      0x02,                         //     Fix on VTL
    ST7735_INVCTR,  1,              //  7: Display inversion control, 1 arg:
      0x0,                          //     Line inversion
    ST7735_PWCTR1,  2+ST_CMD_DELAY, //  8: Power control, 2 args + delay:
      0x02,                         //     GVDD = 4.7V
      0x70,                         //     1.0uA
      10,                           //     10 ms delay
    ST7735_PWCTR2,  1,              //  9: Power control, 1 arg, no delay:
      0x05,                         //     VGH = 14.7V, VGL = -7.35V
    ST7735_PWCTR3,  2,              // 10: Power control, 2 args, no delay:
      0x01,                         //     Opamp current small
      0x02,                         //     Boost frequency
    ST7735_VMCTR1,  2+ST_CMD_DELAY, // 11: Power control, 2 args + delay:
      0x3C,                         //     VCOMH = 4V
      0x38,                         //     VCOML = -1.1V
      10,                           //     10 ms delay
    ST7735_PWCTR6,  2,              // 12: Power control, 2 args, no delay:
      0x11, 0x15,
    ST7735_GMCTRP1,16,              // 13: Gamma Adjustments (pos. polarity), 16 args + delay:
      0x09, 0x16, 0x09, 0x20,       //     (Not entirely necessary, but provides
      0x21, 0x1B, 0x13, 0x19,       //      accurate colors)
      0x17, 0x15, 0x1E, 0x2B,
      0x04, 0x05, 0x02, 0x0E,
    ST7735_GMCTRN1,16+ST_CMD_DELAY, // 14: Gamma Adjustments (neg. polarity), 16 args + delay:
      0x0B, 0x14, 0x08, 0x1E,       //     (Not entirely necessary, but provides
      0x22, 0x1D, 0x18, 0x1E,       //      accurate colors)
      0x1B, 0x1A, 0x24, 0x2B,
      0x06, 0x06, 0x02, 0x0F,
      10,                           //     10 ms delay
    ST77XX_CASET,   4,              // 15: Column addr set, 4 args, no delay:
      0x00, 0x02,                   //     XSTART = 2
      0x00, 0x81,                   //     XEND = 129
    ST77XX_RASET,   4,              // 16: Row addr set, 4 args, no delay:
      0x00, 0x02,                   //     XSTART = 1
      0x00, 0x81,                   //     XEND = 160
    ST77XX_NORON,     ST_CMD_DELAY, // 17: Normal display on, no args, w/delay
      10                            //     10 ms delay
];


const ST7735B_INIT_SEQ_2 = [        // Init commands for 7735B screens
    1,                              // 1 commands in list:
    ST77XX_DISPON,    ST_CMD_DELAY, // 1: Main screen turn on, no args, delay
      255                           //     255 = max (500 ms) delay
];


const ST7735R_INIT_SEQ_1 = [        // 7735R init, part 1 (red or green tab)
    15,                             // 15 commands in list:
    ST77XX_SWRESET,   ST_CMD_DELAY, //  1: Software reset, 0 args, w/delay
      150,                          //     150 ms delay
    ST77XX_SLPOUT,    ST_CMD_DELAY, //  2: Out of sleep mode, 0 args, w/delay
      255,                          //     500 ms delay
    ST7735_FRMCTR1, 3,              //  3: Framerate ctrl - normal mode, 3 arg:
      0x01, 0x2C, 0x2D,             //     Rate = fosc/(1x2+40) * (LINE+2C+2D)
    ST7735_FRMCTR2, 3,              //  4: Framerate ctrl - idle mode, 3 args:
      0x01, 0x2C, 0x2D,             //     Rate = fosc/(1x2+40) * (LINE+2C+2D)
    ST7735_FRMCTR3, 6,              //  5: Framerate - partial mode, 6 args:
      0x01, 0x2C, 0x2D,             //     Dot inversion mode
      0x01, 0x2C, 0x2D,             //     Line inversion mode
    ST7735_INVCTR,  1,              //  6: Display inversion ctrl, 1 arg:
      0x07,                         //     No inversion
    ST7735_PWCTR1,  3,              //  7: Power control, 3 args, no delay:
      0xA2,
      0x02,                         //     -4.6V
      0x84,                         //     AUTO mode
    ST7735_PWCTR2,  1,              //  8: Power control, 1 arg, no delay:
      0xC5,                         //     VGH25=2.4C VGSEL=-10 VGH=3 * AVDD
    ST7735_PWCTR3,  2,              //  9: Power control, 2 args, no delay:
      0x0A,                         //     Opamp current small
      0x00,                         //     Boost frequency
    ST7735_PWCTR4,  2,              // 10: Power control, 2 args, no delay:
      0x8A,                         //     BCLK/2,
      0x2A,                         //     opamp current small & medium low
    ST7735_PWCTR5,  2,              // 11: Power control, 2 args, no delay:
      0x8A, 0xEE,
    ST7735_VMCTR1,  1,              // 12: Power control, 1 arg, no delay:
      0x0E,
    ST77XX_INVOFF,  0,              // 13: Don't invert display, no args
    ST77XX_MADCTL,  1,              // 14: Mem access ctl (directions), 1 arg:
      0xC8,                         //     row/col addr, bottom-top refresh
    ST77XX_COLMOD,  1,              // 15: set color mode, 1 arg, no delay:
      0x05                          //     16-bit color
];


const ST7735R_INIT_SEQ_2_GREEN = [  // 7735R init, part 2 (green tab only)
    2,                              //  2 commands in list:
    ST77XX_CASET,   4,              //  1: Column addr set, 4 args, no delay:
      0x00, 0x02,                   //     XSTART = 0
      0x00, 0x7F+0x02,              //     XEND = 127
    ST77XX_RASET,   4,              //  2: Row addr set, 4 args, no delay:
      0x00, 0x01,                   //     XSTART = 0
      0x00, 0x9F+0x01               //     XEND = 159
];


const ST7735R_INIT_SEQ_2_RED = [    // 7735R init, part 2 (red tab only)
    2,                              //  2 commands in list:
    ST77XX_CASET,   4,              //  1: Column addr set, 4 args, no delay:
      0x00, 0x00,                   //     XSTART = 0
      0x00, 0x7F,                   //     XEND = 127
    ST77XX_RASET,   4,              //  2: Row addr set, 4 args, no delay:
      0x00, 0x00,                   //     XSTART = 0
      0x00, 0x9F                    //     XEND = 159
];


const ST7735R_INIT_SEQ_2_GREEN_144 = [  // 7735R init, part 2 (green 1.44 tab)
    2,                                  //  2 commands in list:
    ST77XX_CASET,   4,                  //  1: Column addr set, 4 args, no delay:
      0x00, 0x00,                       //     XSTART = 0
      0x00, 0x7F,                       //     XEND = 127
    ST77XX_RASET,   4,                  //  2: Row addr set, 4 args, no delay:
      0x00, 0x00,                       //     XSTART = 0
      0x00, 0x7F                        //     XEND = 127
];


const ST7735R_INIT_SEQ_2_GREEN_160x80 = [   // 7735R init, part 2 (mini 160x80)
    2,                                      //  2 commands in list:
    ST77XX_CASET,   4,                      //  1: Column addr set, 4 args, no delay:
      0x00, 0x00,                           //     XSTART = 0
      0x00, 0x4F,                           //     XEND = 79
    ST77XX_RASET,   4,                      //  2: Row addr set, 4 args, no delay:
      0x00, 0x00,                           //     XSTART = 0
      0x00, 0x9F                            //     XEND = 159
];


const ST7735R_INIT_SEQ_3 = [        // 7735R init, part 3 (red or green tab)
    3,                              //  4 commands in list:
    ST7735_GMCTRP1, 16      ,       //  1: Gamma Adjustments (pos. polarity), 16 args + delay:
      0x02, 0x1c, 0x07, 0x12,       //     (Not entirely necessary, but provides
      0x37, 0x32, 0x29, 0x2d,       //      accurate colors)
      0x29, 0x25, 0x2B, 0x39,
      0x00, 0x01, 0x03, 0x10,
    ST7735_GMCTRN1, 16      ,       //  2: Gamma Adjustments (neg. polarity), 16 args + delay:
      0x03, 0x1d, 0x07, 0x06,       //     (Not entirely necessary, but provides
      0x2E, 0x2C, 0x29, 0x2D,       //      accurate colors)
      0x2E, 0x2E, 0x37, 0x3F,
      0x00, 0x00, 0x02, 0x10,
    ST77XX_NORON,     ST_CMD_DELAY, //  3: Normal display on, no args, w/delay
      10                            //     10 ms delay
];


const ST7735R_INIT_SEQ_4 = [        // 7735R init, part 4 (red or green tab)
    1,                              //  1 commands in list:
    ST77XX_DISPON,    ST_CMD_DELAY, //  1: Main screen turn on, no args w/delay
      100
];


const ST7735S_INIT_SEQ_1 = [        // 7735R init, part 1 (red or green tab)
    13,                             // 15 commands in list:
    ST77XX_SWRESET,   ST_CMD_DELAY, //  1: Software reset, 0 args, w/delay
      150,                          //     150 ms delay
    ST77XX_SLPOUT,    ST_CMD_DELAY, //  2: Out of sleep mode, 0 args, w/delay
      255,                          //     500 ms delay
    ST7735_FRMCTR1, 3,              //  3: Framerate ctrl - normal mode, 3 arg:
      0x01, 0x2C, 0x2D,             //     Rate = fosc/(1x2+40) * (LINE+2C+2D)
    ST7735_FRMCTR2, 3,              //  4: Framerate ctrl - idle mode, 3 args:
      0x01, 0x2C, 0x2D,             //     Rate = fosc/(1x2+40) * (LINE+2C+2D)
    ST7735_FRMCTR3, 6,              //  5: Framerate - partial mode, 6 args:
      0x01, 0x2C, 0x2D,             //     Dot inversion mode
      0x01, 0x2C, 0x2D,             //     Line inversion mode
    ST7735_INVCTR,  1,              //  6: Display inversion ctrl, 1 arg:
      0x07,                         //     No inversion
    ST7735_PWCTR1,  3,              //  7: Power control, 3 args, no delay:
      0xA2,
      0x02,                         //     -4.6V
      0x84,                         //     AUTO mode
    ST7735_PWCTR2,  1,              //  8: Power control, 1 arg, no delay:
      0xC5,                         //     VGH25=2.4C VGSEL=-10 VGH=3 * AVDD
    ST7735_PWCTR3,  2,              //  9: Power control, 2 args, no delay:
      0x0A,                         //     Opamp current small
      0x00,                         //     Boost frequency
    ST7735_PWCTR4,  2,              // 10: Power control, 2 args, no delay:
      0x8A,                         //     BCLK/2,
      0x2A,                         //     opamp current small & medium low
    ST7735_PWCTR5,  2,              // 11: Power control, 2 args, no delay:
      0x8A, 0xEE,
    ST7735_VMCTR1,  1,              // 12: Power control, 1 arg, no delay:
      0x0E,
    ST77XX_COLMOD,  1,              // 13: set color mode, 1 arg, no delay:
      0x05                          //     16-bit color
];


const ST7735S_INIT_SEQ_2 = [        // 7735S init, part 2
    3,                              //  4 commands in list:
    ST7735_GMCTRP1, 16      ,       //  1: Gamma Adjustments (pos. polarity), 16 args + delay:
      0x02, 0x1c, 0x07, 0x12,       //     (Not entirely necessary, but provides
      0x37, 0x32, 0x29, 0x2d,       //      accurate colors)
      0x29, 0x25, 0x2B, 0x39,
      0x00, 0x01, 0x03, 0x10,
    ST7735_GMCTRN1, 16      ,       //  2: Gamma Adjustments (neg. polarity), 16 args + delay:
      0x03, 0x1d, 0x07, 0x06,       //     (Not entirely necessary, but provides
      0x2E, 0x2C, 0x29, 0x2D,       //      accurate colors)
      0x2E, 0x2E, 0x37, 0x3F,
      0x00, 0x00, 0x02, 0x10,
    ST77XX_NORON,     ST_CMD_DELAY, //  3: Normal display on, no args, w/delay
      10                            //     10 ms delay
];


const ST7735S_INIT_SEQ_3 = [        // 7735S init, part 3 
    1,                              //  1 commands in list:
    ST77XX_DISPON,    ST_CMD_DELAY, //  1: Main screen turn on, no args w/delay
      100
];


class Adafruit_ST7735 extends Mixin_RGB565_Display_Render(Adafruit_ST77XX) {

    constructor(options) {
        // This display is always 240x320 and this class does not adjust for anything other than this.
        // As a result, clone the options object and replace the width and height with our constants.
        const optionsShallow = Object.assign({}, options);
        optionsShallow["width"] = ST7735_TFTWIDTH_128;
        optionsShallow["height"] = ST7735_TFTHEIGHT_160;
        super(optionsShallow);
        const self = this;
        self._display_model = extractOption(self._options, "display_model", "st7735r").toUpperCase();
        self._init_options = extractOption(self._options, "init_options", INITR_UNKNOWN) | 0;
    }


    /**************************************************************************/
    /*!
        @brief  Initialization code common to all ST7735 displays
        @param  width  Display width
        @param  height Display height
        @param  mode   SPI data mode; one of SPI_MODE0, SPI_MODE1, SPI_MODE2
                       or SPI_MODE3 (do NOT pass the numbers 0,1,2 or 3 -- use
                       the defines only, the values are NOT the same!)
        @return  this
    */
    /**************************************************************************/
    begin() {
        // retrieve the hard-wired settings from Adafruit_GFX super class.
        const self = this,
            display_model = self._display_model,
            init_options = self._init_options;
        if (display_model === "ST7735R") {
            self._initR(init_options);
        } else if (display_model === "ST7735S") {
            self._initS(init_options);
        } else {
            self._initB();
        }
        return self;
    }


    /**************************************************************************/
    /*!
        @brief  Initialization code common to all ST7735B displays
        @return  this
    */
    /**************************************************************************/
    _initB() {
        const self = this, rotation = self.rotation;
        self._executeInitSequence(ST7735B_INIT_SEQ_1);
        self.setRotation(rotation);
        self.fillScreen(0x00);
        self._executeInitSequence(ST7735B_INIT_SEQ_2);
        return self;
    }


    /**************************************************************************/
    /*!
        @brief  Initialization code common to all ST7735R displays
        @param  initOptions  Tab color from adafruit purchase
        @return  this
    */
    /**************************************************************************/
    _initR(options) {
        const self = this, rotation = self.rotation;
        self._executeInitSequence(ST7735R_INIT_SEQ_1);

        if (options == INITR_GREENTAB) {
            self._executeInitSequence(ST7735R_INIT_SEQ_2_GREEN);
            //console.log("INITR_GREENTAB");
            self._colstart = 2;
            self._rowstart = 1;
        } else if ((options == INITR_144GREENTAB) || (options == INITR_HALLOWING)) {
            //console.log("INITR_GREENTAB || INITR_HALLOWING");
            self.HEIGHT =  self._height = ST7735_TFTHEIGHT_128;
            self.WIDTH = self._width = ST7735_TFTWIDTH_128;
            self._executeInitSequence(ST7735R_INIT_SEQ_2_GREEN_144);
            // assumes rotation is 0.
            self._colstart = 2;
            self._rowstart = 3; // For default rotation 0
        } else if (options == INITR_MINI160x80) {
            //console.log("INITR_MINI160x80");
            self.HEIGHT =  self._height = ST7735_TFTWIDTH_80;
            self.WIDTH = self._width = ST7735_TFTHEIGHT_160;
            self._executeInitSequence(ST7735R_INIT_SEQ_2_GREEN_160x80);
            self._colstart = 24;
            self._rowstart = 0;
        } else {
            //console.log("initR options:%o", options);
            // colstart, rowstart left at default '0' values
            self._executeInitSequence(ST7735R_INIT_SEQ_2_RED);
        }
        self._executeInitSequence(ST7735R_INIT_SEQ_3);

        // Black tab, change MADCTL color filter
        if ((options == INITR_BLACKTAB) || (options == INITR_MINI160x80)) {
            //console.log("INITR_BLACKTAB || INITR_MINI160x80");
            self.sendCommand(ST77XX_MADCTL, [0xC0]);
        }

        if (options == INITR_HALLOWING) {
            //console.log("INITR_HALLOWING force INITR_144GREENTAB");
            // Hallowing is simply a 1.44" green tab upside-down:
            self.tabcolor = INITR_144GREENTAB;
            // don't force rotation to be set to 2.
            // display.setRotation(2);
        } else {
            self.tabcolor = options;
        }

        self.setRotation(rotation);

        self.fillScreen(0x00);

        self._executeInitSequence(ST7735R_INIT_SEQ_4);

        return self;
    }
    
    
    /**************************************************************************/
    /*!
        @brief  Initialization code common to all ST7735S displays
        @param  initOptions  INITS_XXX OPTION
        @return  this
    */
    /**************************************************************************/
    _initS(options) {
        const self = this, rotation = self.rotation;

        self._executeInitSequence(ST7735S_INIT_SEQ_1);

        // Based on whether inversion is inverted, sent the assigned command to setup so that Black is Black and not White.
        self.sendCommand(self.invertOffCommand);

        if (options == INITS_MINI160x80) {
            // Ensure WIDTH and HEIGHT match 160 x 80 or 80 x 160 based on rotation.
            if (rotation % 2) {
                self.WIDTH = ST7735_TFTHEIGHT_160;
                self.HEIGHT =  ST7735_TFTWIDTH_80;
            } else {
                self.HEIGHT = ST7735_TFTHEIGHT_160;
                self.WIDTH = ST7735_TFTWIDTH_80;
            }
            // The GreenTab from DollaTek  
            self._colstart = 26;
            self._rowstart = 1;
        }
        
        self._executeInitSequence(ST7735S_INIT_SEQ_2);

        self.tabcolor = options;

        self.setRotation(rotation);

        self.fillScreen(0x00);

        self._executeInitSequence(ST7735S_INIT_SEQ_3);

        return self;
    }


    /**************************************************************************/
    /*!
        @brief  Set origin of (0,0) and orientation of TFT display
        @param  m  The index for rotation, from 0-3 inclusive
        @return  this
     */
    /**************************************************************************/
    setRotation(m) {
        super._initRotation(m);
        const self = this, tabcolor = self.tabcolor, rotation = self.rotation, reverseColorOrder = self._reverseColorOrder;

        // For ST7735 with GREEN TAB (including HalloWing)...
        if ((tabcolor == INITR_144GREENTAB) || (tabcolor == INITR_HALLOWING)) {
            // ..._rowstart is 3 for rotations 0&1, 1 for rotations 2&3
            self._rowstart = (rotation < 2) ? 3 : 1;
        }

        let madctl, _height, _width, colorOrder = reverseColorOrder ? ST77XX_MADCTL_BGR :ST77XX_MADCTL_RGB;

        switch (rotation) {
            case 0:
            case 2:
                _height = ST7735_TFTHEIGHT_160;
                _width = ST7735_TFTWIDTH_128;
                self._xstart = self._colstart;
                self._ystart = self._rowstart;
                break;
            case 1:
            case 3:
                // reverse width and height and self._ystart and self._xstart.
                _width = ST7735_TFTHEIGHT_160;
                _height = ST7735_TFTWIDTH_128;
                self._ystart = self._colstart;
                self._xstart = self._rowstart;
                break;
        }

        switch (rotation) {
            case 0:
                if ((tabcolor == INITR_BLACKTAB) || (tabcolor == INITR_MINI160x80)|| (tabcolor == INITS_MINI160x80)) {
                    madctl = ST77XX_MADCTL_MX | ST77XX_MADCTL_MY | colorOrder;
                } else {
                    //madctl = ST77XX_MADCTL_MX | ST77XX_MADCTL_MY | ST77XX_MADCTL_BGR;
                    madctl = ST77XX_MADCTL_MX | ST77XX_MADCTL_MY | colorOrder;
                }

                if (tabcolor == INITR_144GREENTAB) {
                    _height = ST7735_TFTHEIGHT_128;
                    _width = ST7735_TFTWIDTH_128;
                } else if ((tabcolor == INITR_MINI160x80) || (tabcolor == INITS_MINI160x80)) {
                    _height = ST7735_TFTHEIGHT_160;
                    _width = ST7735_TFTWIDTH_80;
                }
                break;
            case 1:
                if ((tabcolor == INITR_BLACKTAB) || (tabcolor == INITR_MINI160x80) || (tabcolor == INITS_MINI160x80)) {
                    madctl = ST77XX_MADCTL_MY | ST77XX_MADCTL_MV | colorOrder;
                } else {
                    //madctl = ST77XX_MADCTL_MY | ST77XX_MADCTL_MV | ST77XX_MADCTL_BGR;
                    madctl = ST77XX_MADCTL_MY | ST77XX_MADCTL_MV | colorOrder;
                }

                if (tabcolor == INITR_144GREENTAB) {
                    _width = ST7735_TFTHEIGHT_128;
                    _height = ST7735_TFTWIDTH_128;
                } else if ((tabcolor == INITR_MINI160x80) || (tabcolor == INITS_MINI160x80)) {
                    _width = ST7735_TFTHEIGHT_160;
                    _height = ST7735_TFTWIDTH_80;
                }
                break;
            case 2:
                if ((tabcolor == INITR_BLACKTAB) || (tabcolor == INITR_MINI160x80) || (tabcolor == INITS_MINI160x80)) {
                    madctl = colorOrder;
                } else {
                    //madctl = ST77XX_MADCTL_BGR;
                    madctl = colorOrder;
                }

                if (tabcolor == INITR_144GREENTAB) {
                    _height = ST7735_TFTHEIGHT_128;
                    _width = ST7735_TFTWIDTH_128;
                } else if ((tabcolor == INITR_MINI160x80) || (tabcolor == INITS_MINI160x80)) {
                    _height = ST7735_TFTHEIGHT_160;
                    _width = ST7735_TFTWIDTH_80;
                }
                break;
            case 3:
                if ((tabcolor == INITR_BLACKTAB) || (tabcolor == INITR_MINI160x80) || (tabcolor == INITS_MINI160x80)) {
                    madctl = ST77XX_MADCTL_MX | ST77XX_MADCTL_MV | colorOrder;
                } else {
                    //madctl = ST77XX_MADCTL_MX | ST77XX_MADCTL_MV | ST77XX_MADCTL_BGR;
                    madctl = ST77XX_MADCTL_MX | ST77XX_MADCTL_MV | colorOrder;
                }

                if (tabcolor == INITR_144GREENTAB) {
                    _width = ST7735_TFTHEIGHT_128;
                    _height = ST7735_TFTWIDTH_128;
                } else if ((tabcolor == INITR_MINI160x80) || (tabcolor == INITS_MINI160x80)) {
                    _width = ST7735_TFTHEIGHT_160;
                    _height = ST7735_TFTWIDTH_80;
                }
                break;
        }
        self._width = _width;
        self._height = _height;

        self.sendCommand(ST77XX_MADCTL, [madctl]);
        return self;
    }
}

module.exports = {Adafruit_ST7735};