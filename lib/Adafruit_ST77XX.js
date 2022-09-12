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
const Adafruit_GFX_Library = require("@lynniemagoo/adafruit-gfx-library");
const Adafruit_SPITFT = Adafruit_GFX_Library.Display.Adafruit_SPITFT;
const delay = Adafruit_GFX_Library.Utils.sleepMs;


const {
ST77XX_SLPIN,
ST77XX_SLPOUT,

ST77XX_INVOFF,
ST77XX_INVON,

ST77XX_DISPOFF,
ST77XX_DISPON,

ST77XX_CASET,
ST77XX_RASET,

ST77XX_RAMWR,

ST77XX_TEOFF,
ST77XX_TEON
} = require("./Adafruit_ST77XX_Constants.js");

const ST_CMD_DELAY = 0x80 // special signifier for command lists


class Adafruit_ST77XX extends Adafruit_SPITFT {

    constructor(options) {
        super(options);

        const self = this;
        self.invertOnCommand = ST77XX_INVON;
        self.invertOffCommand = ST77XX_INVOFF;

        self._colstart = 0;
        self._rowstart = 0;
    }


    /**************************************************************************/
    /*!
        @brief  Companion code to the initialization tables. Reads and issues
                a series of LCD commands stored in byte array.
        @param  values  Flash memory array with commands and data to send
        @return  this
    */
    /**************************************************************************/
    _executeInitSequence(values) {
        const self = this;

        let numCommands, cmd, numArgs, delayRequired, ms, cmdData;
        let index = 0;

        numCommands = values[index++];// Number of commands to follow
        while (numCommands--) {              // For each command...
            cmd = values[index++];       // Read command
            numArgs = values[index++];   // Number of args to follow
            delayRequired = numArgs & ST_CMD_DELAY;       // If hibit set, delay follows args
            numArgs &= ~ST_CMD_DELAY;          // Mask out delay bit
            cmdData = numArgs ? values.slice(index, index + numArgs) : null;
            self.sendCommand(cmd, cmdData);
            index += numArgs;

            if (delayRequired) {
                ms = values[index++]; // Read post-command delay time (ms)
                if (ms == 0xFF)
                    ms = 500; // If 255, delay for 500 ms
                const doWork = async _ => {
                    await delay(ms);
                }
                self._chain(doWork);
            }
        }
        return self;
    }


    /**************************************************************************/
    /*!
        @brief  SPI displays set an address window rectangle for blitting pixels
        @param  x  Top left corner x coordinate
        @param  y  Top left corner x coordinate
        @param  w  Width of window
        @param  h  Height of window
        @return  this
    */
    /**************************************************************************/
    setAddrWindow(x, y, w, h) {
        const self = this;
        const _xstart = self._xstart, _ystart = self._ystart,
                x0 = x + _xstart,
                x1 = x0 + w - 1,
                y0 = y + _ystart,
                y1 = y0 + h - 1;
        //console.log("x0:%d x1:%d y0:%d y1:%d", x0, x1, y0, y1);
        self.sendCommand(ST77XX_CASET, [(x0 >>> 8) & 0xFF, x0 & 0xFF, (x1 >>> 8) & 0xFF, x1 & 0xFF]);
        self.sendCommand(ST77XX_RASET, [(y0 >>> 8) & 0xFF, y0 & 0xFF, (y1 >>> 8) & 0xFF, y1 & 0xFF]);
        self.sendCommand(ST77XX_RAMWR); // write to RAM
        return self;
    }


    /**************************************************************************/
    /*!
        @brief  Set origin of (0,0) of display with offsets
        @param  col  The offset from 0 for the column address
        @param  row  The offset from 0 for the row address
        @return  this
    */
    /**************************************************************************/
    setColRowStart(col, row) {
        const self = this;
        self._colstart = col;
        self._rowstart = row;
        return this;
    }


    /**************************************************************************/
    /*!
        @brief  Change whether display is on or off
        @param  enable True if you want the display ON, false OFF
        @return  this (result of sendCommand)
    */
    /**************************************************************************/
    enableDisplay(enable) {
        return this.sendCommand(!!enable ? ST77XX_DISPON : ST77XX_DISPOFF);
    }


    /**************************************************************************/
    /*!
        @brief  Change whether TE pin output is on or off
        @param  enable True if you want the TE pin ON, false OFF
        @return  this (result of sendCommand)
    */
    /**************************************************************************/
    enableTearing(enable) {
        return this.sendCommand(!!enable ? ST77XX_TEON : ST77XX_TEOFF);
    }


    /**************************************************************************/
    /*!
        @brief  Change whether sleep mode is on or off
        @param  enable True if you want sleep mode ON, false OFF
        @return  this (result of sendCommand)
    */
    /**************************************************************************/
    enableSleep(enable) {
        return this.sendCommand(!!enable ? ST77XX_SLPIN : ST77XX_SLPOUT);
    }
}

module.exports = {Adafruit_ST77XX};