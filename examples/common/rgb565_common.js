/***************************************************
  This set of common test scripts can be used for
  RGB565 TFT displays.

  These displays use SPI to communicate, 4 or 5 pins are required to
  interface
  Adafruit invests time and resources providing this open source code,
  please support Adafruit and open-source hardware by purchasing
  products from Adafruit!

  Written by Limor Fried/Ladyada for Adafruit Industries.
  BSD license, all text above must be included in any redistribution

  Code ported to NodeJS by Lyndel R. McGee
  Original source of this code was:
  https://github.com/adafruit/Adafruit-SSD1351-library

  The Adafruit GFX Graphics core library is also required
  https://github.com/adafruit/Adafruit-GFX-Library
  Be sure to install it!
 ****************************************************/
'use strict';
const Adafruit_GFX_Library = require("@lynniemagoo/adafruit-gfx-library");
const delay = Adafruit_GFX_Library.Utils.sleepMs;
const os = require("os");

const toInt = Math.trunc,
      fMax = Math.max,
      fMin = Math.min,
      fFloor = Math.floor,
      fRandom = Math.random;

// Random Number Helper method
// See https://stackoverflow.com/questions/4959975/generate-random-number-between-two-numbers-in-javascript
function randomInteger(min, max) {
    return fFloor(fRandom() * (max - min + 1)) + min;
}

// Color definitions
const BLACK   = 0x0000;
const BLUE    = 0x001F;
const RED     = 0xF800;
const GREEN   = 0x07E0;
const CYAN    = 0x07FF;
const MAGENTA = 0xF81F;
const YELLOW  = 0xFFE0;
const WHITE   = 0xFFFF;

/**************************************************************************/
/*!
    @brief  Renders a simple test pattern on the screen
*/
/**************************************************************************/
async function lcdTestPattern(display) {
    const w = display.width(), h = display.height(),
          localColors = [RED, YELLOW, GREEN, CYAN, BLUE, MAGENTA, BLACK, WHITE];

    for(let c=0; c<8; c++) {
        await display.fillRect(0, h * c / 8, w, h / 8, localColors[c]);
    }
}

async function testLines(display, color) {
    const w = display.width(), h = display.height();
    let x, y;

    await display.fillScreen(BLACK);
    for(x=0; x < w-1; x+=6) {
        // the JS version of this display is chainable so we can chain methods
        // that modify the buffer or display.
        await display.drawLine(0, 0, x, h-1, color);
    }
    for (y=0; y < h-1; y+=6) {
        // the JS version of this display is chainable so we can chain methods
        // that modify the buffer or display.
        await display.drawLine(0, 0, w-1, y, color);
    }

    await display.fillScreen(BLACK);
    for (x=0; x < w-1; x+=6) {
        await display.drawLine(w-1, 0, x, h-1, color);
    }
    for (y=0; y < h-1; y+=6) {
        await display.drawLine(w-1, 0, 0, y, color);
    }

    await display.fillScreen(BLACK);
    for (x=0; x < w-1; x+=6) {
        await display.drawLine(0, h-1, x, 0, color);
    }
    for (y=0; y < h-1; y+=6) {
        await display.drawLine(0, h-1, w-1, y, color);
    }

    await display.fillScreen(BLACK);
    for (x=0; x < w-1; x+=6) {
        await display.drawLine(w-1, h-1, x, 0, color);
    }
    for (y=0; y < h-1; y+=6) {
        await display.drawLine(w-1, h-1, 0, y, color);
    }
}

async function testDrawText(display, text, color) {

    const previousWrap = display.getTextWrap();
    await display.setCursor(0,0)
                 .setTextWrap(true)
                 .setTextColor(color)
                 .print(text)
                 .setTextWrap(previousWrap);
}

async function testFastLines(display, color1, color2) {
    const w = display.width(), h = display.height();

    await display.fillScreen(BLACK);

    for (let y=0; y < h-1; y+=5) {
        await display.drawFastHLine(0, y, w-1, color1);
    }
    for (let x=0; x < w-1; x+=5) {
        await display.drawFastVLine(x, 0, h-1, color2);
    }
}

async function tftPrintTest(display, colors = [WHITE], loop_delay = 1) {

    await display.fillScreen(BLACK);

    await display.setCursor(0, 5)
                 .setTextColor(RED)
                 .setTextSize(1)
                 .println("Hello World!");

    await delay(1500);
    await display.setTextColor(YELLOW)
                 .setTextSize(2)
                 .println("Hello World!");

    await delay(1500);

    await display.setTextColor(BLUE)
                 .setTextSize(3)
                 .print(1234.567);

    await delay(1500);

    await display.fillScreen(BLACK);

    await display.setCursor(0, 5)
                 .setTextColor(WHITE)
                 .setTextSize(0)
                 .println("Hello World!");

    await display.setTextSize(1)
                 .setTextColor(GREEN)
                 .print(Math.PI.toFixed(6))
                 .println(" Want pi?")
                 .println(" ");

    //await display.print(8675309, HEX); // print 8,675,309 out in HEX!
    const value = 8675309;
    await display.print("0x" + value.toString(16).toUpperCase().padStart(8, "0")) // print 8,675,309 out in HEX!
                 .println(" Print HEX!")
                 .println(" ")
                 .setTextColor(WHITE)
                 .println("System has been")
                 .println("running for: ")
                 .setTextColor(MAGENTA)
                 .print(os.uptime())
                 .setTextColor(WHITE)
                 .print(" seconds.");
}


async function testDrawRects(display, color) {
    const w = display.width(), h = display.height();
    await display.fillScreen(BLACK);

    for(let x=0; x < h -1; x+=6) {
        await display.drawRect((w-1)/2 - x/2, (h-1)/2 - x/2, x, x, color);
    }
}


async function testFillRects(display, color1, color2) {
    const w = display.width(), h = display.height();
    await display.fillScreen(BLACK);

    for(let x=h-1; x>6; x-=6) {
        await display.fillRect((w-1)/2 - x/2, (h-1)/2 - x/2, x, x, color1)
                     .drawRect((w-1)/2 - x/2, (h-1)/2 - x/2, x, x, color2);
    }
}


async function testFillCircles(display, radius, color) {
    const w = display.width(), h = display.height();

    for(let x=radius; x<w-1; x+=radius*2) {
        for(let y=radius; y < h-1; y+=radius*2) {
            await display.fillCircle(x, y, radius, color)
        }
    }
}


async function testDrawCircles(display, radius, color) {
    const w = display.width(), h = display.height();

    for(let x=0; x<w-1+radius; x+=radius*2) {
        for(let y=0; y<h-1+radius; y+=radius*2) {
            await display.drawCircle(x, y, radius, color)
        }
    }
}


async function testRoundRects(display) {
    let w = display.width(), h = display.height();
    let x=0, y=0, color = 100;

    await display.fillScreen(BLACK);

    for(let i = 0 ; i <= 24; i++) {
        await display.drawRoundRect(x, y, w, h, 5, color);
        x+=2;
        y+=3;
        w-=4;
        h-=6;
        color+=1100;
        //console.log(i);
    }
}

async function testTriangles(display) {
    const ow = display.width(), oh = display.height();
    let color = RED,
        w = ow/2,
        x = oh,
        y = 0,
        z = ow;

    await display.fillScreen(BLACK);

    for(let t = 0 ; t <= 15; t+=1) {
        await display.drawTriangle(w, y, y, x, z, x, color);
        x-=4;
        y+=4;
        z-=4;
        color+=100;
    }
}


async function testMediaButtons(display) {

    await display.fillScreen(BLACK);

    // play
    await display.fillRoundRect(25, 10, 78, 60, 8, WHITE);
    await display.fillTriangle(42, 20, 42, 60, 90, 40, RED);
    await delay(500);

    // pause
    await display.fillRoundRect(25, 90, 78, 60, 8, WHITE);
    await display.fillRoundRect(39, 98, 20, 45, 5, GREEN);
    await display.fillRoundRect(69, 98, 20, 45, 5, GREEN);
    await delay(500);

    // play color
    await display.fillTriangle(42, 20, 42, 60, 90, 40, BLUE);
    await delay(50);

    // pause color
    await display.fillRoundRect(39, 98, 20, 45, 5, RED);
    await display.fillRoundRect(69, 98, 20, 45, 5, RED);

    // play color
    await display.fillTriangle(42, 20, 42, 60, 90, 40, GREEN);
}


async function testCP437CharacterSet(display, color) {

    const previousWrap = display.getTextWrap();
    const previousCP437 = display.getCP437();

    await display.fillScreen(BLACK);

    await display.setTextSize(1)                // Normal 1:1 pixel scale
                 .setTextWrap(false)
                 .setTextColor(color)   // Draw colored text
                 .setCursor(0, 0)               // Start at top-left corner
                 .setCP437(true);                  // Use full 256 char 'Code Page 437' font

    // Not all the characters will fit on the display. This is normal.
    // Library will draw what it can and the rest will be clipped.
    for(let i=0; i<256; i++) {
        // display.write will simply chain work onto the queue.
        // Don't have to await each step as this is done below with final
        // display.wait.
        if (i === 0x0A) continue;
        display.write(i);
        if ((i > 0) && (i % 21 == 0)) display.println();
    }
    // await require here to ensure that all write operations in loop have finished
    // as we did not await within the loop.
    await display.setCP437(previousCP437)
                 .setTextWrap(previousWrap);
}


async function testTextStyles(display, color1, color2) {

    // Display supports chaining and operations are added to a queue.
    // Therefore, one can do multiple operations as needed using 'dot' chaining.
    // At the end of one's work, one can simply await the display to complete all operations.

    display.setTextSize(1)                  // Normal 1:1 pixel scale
           .setTextColor(color1)     // Draw colored text
           .setCursor(0,0)                  // Start at top-left corner
           .println("Hello, world!");

    display.setTextColor(color1, color2) // Draw with background.
           .println(3.141592);

    display.setTextSize(2)             // Draw 2X-scale text
           .setTextColor(color1)
           .println("0x%s", 0xDEADBEEF.toString(16).padStart(8,"0").toUpperCase());

    // Wait for display to complete all work.
    await display;
};


async function testAnimate(display, bitmap, bitmapWidth, bitmapHeight, animateTimeMs = 30000) {
    const NUMFLAKES=10,
          // Indexes into the 'icons' array
          XPOS   = 0,
          YPOS   = 1,
          DELTAY = 2;

    const w = display.width(), h = display.height();


    let f, icons = [], color = 100;

    // Initialize 'snowflake' positions
    for(f=0; f< NUMFLAKES; f++) {
        const icon = [];
        // Create a random integer between 1 - LOGO_WIDTH and w.
        icon[XPOS]   = randomInteger(1 - LOGO_WIDTH, w);
        icon[YPOS]   = -LOGO_HEIGHT;
        // Create a random between 1 and 6.
        icon[DELTAY] = randomInteger(1, 6);
        //console.log(" x:%o", icon[XPOS]);
        //console.log(" y:%o", icon[YPOS]);
        //console.log("dy:%o", icon[DELTAY]);
        icons.push(icon);
    }
    const startTimeMs = new Date().valueOf();

    while ((new Date().valueOf() - startTimeMs) <= animateTimeMs) {
        display.fillScreen(BLACK);

        // Draw each snowflake:
        for(f=0; f< NUMFLAKES; f++) {
            //display.drawBitmap(
            display.draw1BitBitmap(icons[f][XPOS], icons[f][YPOS], bitmap, bitmapWidth, bitmapHeight, color);
            color += 1100;
        }

        await display;
        await delay(200);        // Pause for 2/10 second

        // Then update coordinates of each flake...
        for(f=0; f< NUMFLAKES; f++) {
            display.draw1BitBitmap(icons[f][XPOS], icons[f][YPOS], bitmap, bitmapWidth, bitmapHeight, BLACK);
            icons[f][YPOS] += icons[f][DELTAY];
            // If snowflake is off the bottom of the screen...
            if (icons[f][YPOS] >= h) {
                // Reinitialize to a random position, just off the top
                icons[f][XPOS]   = randomInteger(1 - LOGO_WIDTH, w);
                icons[f][YPOS]   = 0;
                icons[f][DELTAY] = randomInteger(1, 6);
            }
        }
        await display;
    }
}


async function testDrawBitmap(display, color) {
    const w = display.width(), h = display.height();

    //display.drawBitmap(
    await display.draw1BitBitmap((w  - LOGO_WIDTH ) / 2,
                                 (h - LOGO_HEIGHT) / 2,
                                 LOGO_BMP,
                                 LOGO_WIDTH,
                                 LOGO_HEIGHT, color);
    await delay(1000);
};


const LOGO_HEIGHT  = 16;
const LOGO_WIDTH   = 16;

const LOGO_BMP = [
  0b00000000, 0b11000000,
  0b00000001, 0b11000000,
  0b00000001, 0b11000000,
  0b00000011, 0b11100000,
  0b11110011, 0b11100000,
  0b11111110, 0b11111000,
  0b01111110, 0b11111111,
  0b00110011, 0b10011111,
  0b00011111, 0b11111100,
  0b00001101, 0b01110000,
  0b00011011, 0b10100000,
  0b00111111, 0b11100000,
  0b00111111, 0b11110000,
  0b01111100, 0b11110000,
  0b01110000, 0b01110000,
  0b00000000, 0b00110000
];


module.exports = {
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
};