/**************************************************************************
  This is a library for several Adafruit displays based on ST77* drivers.

  This example works with the 1.14" TFT breakout
    ----> https://www.adafruit.com/product/4383
  The 1.3" TFT breakout
    ----> https://www.adafruit.com/product/4313
  The 1.47" TFT breakout
    ----> https://www.adafruit.com/product/5393
  The 1.54" TFT breakout
    ----> https://www.adafruit.com/product/3787
  The 1.69" TFT breakout
    ----> https://www.adafruit.com/product/5206
  The 1.9" TFT breakout
    ----> https://www.adafruit.com/product/5394
  The 2.0" TFT breakout
    ----> https://www.adafruit.com/product/4311


  Check out the links above for our tutorials and wiring diagrams.
  These displays use SPI to communicate, 4 or 5 pins are required to
  interface (RST is optional).

  Adafruit invests time and resources providing this open source code,
  please support Adafruit and open-source hardware by purchasing
  products from Adafruit!

  Written by Limor Fried/Ladyada for Adafruit Industries.

  Ported to NodeJS by Lyndel R. McGee

  MIT license, all text above must be included in any redistribution
 **************************************************************************/
'use strict';
const Adafruit_GFX_Library = require("@lynniemagoo/adafruit-gfx-library");
const delay = Adafruit_GFX_Library.Utils.sleepMs;

const BASE_PATH = "../../";
const {Adafruit_ST7789} = require(BASE_PATH + "index");


// Color definitions
const BLACK   = 0x0000;
const BLUE    = 0x001F;
const RED     = 0xF800;
const GREEN   = 0x07E0;
const CYAN    = 0x07FF;
const MAGENTA = 0xF81F;
const YELLOW  = 0xFFE0;
const WHITE   = 0xFFFF;


const {
    lcdTestPattern,
    testDrawText,
    tftPrintTest,
    testLines,
    testFastLines,
    testDrawRects,
    testFillRects,
    testFillCircles,
    testDrawCircles,
    testRoundRects,
    testTriangles,
    testMediaButtons,
    testCP437CharacterSet,
    testTextStyles,
    testDrawBitmap,
    /* exported for use with testAnimate */
    LOGO_BMP,
    LOGO_HEIGHT,
    LOGO_WIDTH,
    testAnimate // suggest only run if using a buffer-backed display such as SSD1327 or SSD1306.
} = require("../common/rgb565_common");

function createDisplayOptions(namedDisplayType) {
    let displayOptions = null;
    switch(namedDisplayType.toUpperCase()) {
        case "ADAFRUIT-3787":
        case "ADAFRUIT-4313":
            displayOptions = {
                width:240,
                height:240,
                rotation:0,
                dcGpioNb:24,  // If module requires Data/Clock GPIO, specify it (-1 is default)
                rstGpioNb:25, // If desire is to have hardware reset controlled by this module,
                              // by this module, set this value. (-1 is default)
                              // if set to -1 then will not be used.
                spiBusNumber:0,
                spiDeviceNumber:0,
                spiMaxSpeedHz:60000000
            }
            break;

        case "ADAFRUIT-4311":
            displayOptions = {
                width:240,
                height:320,
                rotation:0,
                dcGpioNb:24,  // If module requires Data/Clock GPIO, specify it (-1 is default)
                rstGpioNb:25, // If desire is to have hardware reset controlled by this module,
                              // by this module, set this value. (-1 is default)
                              // if set to -1 then will not be used.
                spiBusNumber:0,
                spiDeviceNumber:0,
                spiMaxSpeedHz:60000000
            }
            break;

        case "ADAFRUIT-4383":
            displayOptions = {
                width:135,
                height:240,
                rotation:0,
                dcGpioNb:24,  // If module requires Data/Clock GPIO, specify it (-1 is default)
                rstGpioNb:25, // If desire is to have hardware reset controlled by this module,
                              // by this module, set this value. (-1 is default)
                              // if set to -1 then will not be used.
                spiBusNumber:0,
                spiDeviceNumber:0,
                spiMaxSpeedHz:60000000
            }
            break;

        case "ADAFRUIT-5206":
            displayOptions = {
                width:280,
                height:240,
                rotation:0,
                dcGpioNb:24,  // If module requires Data/Clock GPIO, specify it (-1 is default)
                rstGpioNb:25, // If desire is to have hardware reset controlled by this module,
                              // by this module, set this value. (-1 is default)
                              // if set to -1 then will not be used.
                spiBusNumber:0,
                spiDeviceNumber:0,
                spiMaxSpeedHz:60000000
            }
            break;

        case "ADAFRUIT-5393":
            displayOptions = {
                width:320,
                height:172,
                rotation:0,
                dcGpioNb:24,  // If module requires Data/Clock GPIO, specify it (-1 is default)
                rstGpioNb:25, // If desire is to have hardware reset controlled by this module,
                              // by this module, set this value. (-1 is default)
                              // if set to -1 then will not be used.
                spiBusNumber:0,
                spiDeviceNumber:0,
                spiMaxSpeedHz:60000000
            }
            break;

        case "ADAFRUIT-5394":
            displayOptions = {
                width:320,
                height:170,
                rotation:0,
                dcGpioNb:24,  // If module requires Data/Clock GPIO, specify it (-1 is default)
                rstGpioNb:25, // If desire is to have hardware reset controlled by this module,
                              // by this module, set this value. (-1 is default)
                              // if set to -1 then will not be used.
                spiBusNumber:0,
                spiDeviceNumber:0,
                spiMaxSpeedHz:60000000
            }
            break;
        case "WAVESHARE-240-240":
            // WaveShare ST7789 requires reversal of InversionMode.
            displayOptions = {
                width:240,
                height:240,
                rotation:0,
                dcGpioNb:24,  // If module requires Data/Clock GPIO, specify it (-1 is default)
                rstGpioNb:25, // If desire is to have hardware reset controlled by this module,
                              // by this module, set this value. (-1 is default)
                              // if set to -1 then will not be used.
                spiBusNumber:0,
                spiDeviceNumber:0,
                spiMaxSpeedHz:64000000,
                reverseInversionMode:true
            }
            break;

        case "WAVESHARE-240-320":
            // WaveShare ST7789 requires reversal of InversionMode.
            displayOptions = {
                width:240,
                height:320,
                rotation:0,
                dcGpioNb:24,  // If module requires Data/Clock GPIO, specify it (-1 is default)
                rstGpioNb:25, // If desire is to have hardware reset controlled by this module,
                              // by this module, set this value. (-1 is default)
                              // if set to -1 then will not be used.
                spiBusNumber:0,
                spiDeviceNumber:0,
                spiMaxSpeedHz:64000000,
                reverseInversionMode:true
            }
            break;

        case "WAVESHARESHARE-135-240":
            // WaveShare ST7789 requires reversal of InversionMode.
            displayOptions = {
                width:135,
                height:240,
                rotation:0,
                dcGpioNb:24,  // If module requires Data/Clock GPIO, specify it (-1 is default)
                rstGpioNb:25, // If desire is to have hardware reset controlled by this module,
                              // by this module, set this value. (-1 is default)
                              // if set to -1 then will not be used.
                spiBusNumber:0,
                spiDeviceNumber:0,
                spiMaxSpeedHz:64000000,
                reverseInversionMode:true
            }
            break;

        default:
            break;
    }
    if (!displayOptions) throw new Error(`Unknown display type:${namedDisplayType}`);
    return displayOptions;
}

async function main() {
    const displayType = "ADAFRUIT-3787";
    //const displayType = "WAVESHARE-240-240";
    const displayOptions = createDisplayOptions(displayType);
    const display = new Adafruit_ST7789(displayOptions);
    console.log("SPI Modes:", Adafruit_ST7789.SPI_MODES);
    console.log("SPI Defaults:", Adafruit_ST7789.SPI_DEFAULTS);

    // Startup display - same as original adafruit begin() but options specified in the constructor.
    await display.startup();
    await delay(1000);

    let count = 4,
        rotation = 0,
        step_delay = 2000;

    while (count--) {
        await display.setRotation(rotation);
        console.log("rotation:%d", rotation);

        await display.fillScreen(BLACK);
        await lcdTestPattern(display);
        await delay(step_delay);

        await display.invertDisplay(true);
        await delay(step_delay);
        await display.invertDisplay(false);
        await delay(step_delay);

        await display.fillScreen(BLACK);
        await testCP437CharacterSet(display, CYAN);
        await delay(step_delay);

        await display.fillScreen(BLACK);
        await testDrawText(display,
                           "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
                           "Curabitur adipiscing ante sed nibh tincidunt feugiat. " +
                           "Maecenas enim massa, fringilla sed malesuada et, malesuada " +
                           "sit amet turpis. Sed porttitor neque ut ante pretium vitae " +
                           "malesuada nunc bibendum. Nullam aliquet ultrices massa eu hendrerit. " +
                           "Ut sed nisi lorem. In vestibulum purus a tortor imperdiet posuere. ", WHITE);
        await delay(step_delay);

        await display.fillScreen(BLACK);
        await testTextStyles(display, BLUE, WHITE);
        await delay(step_delay);

        await tftPrintTest(display);
        await delay(step_delay);

        await display.drawPixel(display.width()/2, display.height()/2, GREEN);
        await delay(step_delay);

        await display.fillScreen(BLACK);
        await testDrawBitmap(display, GREEN);
        await delay(step_delay);

        await testLines(display, YELLOW);
        await delay(step_delay);

        await testFastLines(display, RED, BLUE);
        await delay(step_delay);

        await testDrawRects(display, GREEN);
        await delay(step_delay);

        await testFillRects(display, YELLOW, MAGENTA);
        await delay(step_delay);

        await display.fillScreen(BLACK);
        await testFillCircles(display, 10, BLUE);
        await testDrawCircles(display, 10, WHITE);
        await delay(step_delay);

        await testRoundRects(display);
        await delay(step_delay);

        await testTriangles(display);
        await delay(step_delay);

        //await testMediaButtons(display);
        //await delay(step_delay);

        // Do 10 seconds of animation. - only run this on a buffer-backed display (SSD1327, SSD1306) or canvas.
        //await testAnimate(display, LOGO_BMP, LOGO_WIDTH, LOGO_HEIGHT, 10000);

        rotation +=1;
    }
    await delay(1000);
    await display.setRotation(0);
    await display.shutdown();
}
main();
