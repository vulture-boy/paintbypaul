/*
Paint by Paul-----
-----by Tyson Moll - https://tysonmoll.ca

*/
var canv;
var padding = 96;
var lerpness = 0; // used for Paul's bobbing logo
var lerpDir = 0;
var selectionPosition = [0,0]; // Position of selection icon
let paintTools;

function preload() {
    paulPic = loadImage('images/rowdyPaul.png');
    paletteChip = loadImage('images/paintChip.png');
    paletteSelect = loadImage('images/paintSets.png');
    backChecker = loadImage('images/backChecker.png');
    paulLogo = loadImage('images/paulPage.png');
    paulLogo2 = loadImage('images/paulPage2.png');
    stroke1 = loadImage('images/strokeSize1.png');
    stroke2 = loadImage('images/strokeSize2.png');
    stroke3 = loadImage('images/strokeSize3.png');
    strokeX = loadImage('images/strokeSize4.png');
  }

function setup() {

    canv = createCanvas();
    resetCanvas();
    paintTools = new PaintTools(padding/2 - paletteSelect.width/2, 16);

}

function draw() {

    // Padding Background 
    for (i=0;i<padding;i+=backChecker.width) {
        for (j=0;j<windowHeight;j+=backChecker.height) {
            image(backChecker,i,j);
        }
    }

    paintTools.drawTools();
    paulLogoBounce();

    // Drawing
    if (mouseIsPressed === true) { // Draw Action

        // Stroke Size
        strokeWeight(paintTools.strokeButton.getStrokeWeight()); 

        // Paint Zone
        if (mouseX > padding) {
            // Line between previous and current point
            line(mouseX, mouseY, pmouseX, pmouseY);
        }

        // Select colour
        if (mouseButton === LEFT) {
            stroke(paintTools.paintSelect[0].color); // Draw Colour
        }
        if (mouseButton === RIGHT) {
            stroke(paintTools.paintSelect[1].color);
        }
    }
}

function mousePressed() {


    // Paint Tools 
    paintTools.pointInsidePaintChip(mouseX,mouseY); // Paint Chips
    for (let i=0;i<paintTools.buttons.length;i++) {
        if (paintTools.buttons[i].pointInsideButton()) {
            paintTools.buttons[i].pushButton();
        }
    }
}

function mouseReleased() {

    for (let i=0;i<paintTools.buttons.length;i++) {
        if (paintTools.buttons[i].pointInsideButton()) {
            paintTools.buttons[i].releaseButton();
        } else {
            paintTools.buttons[i].cancelButton();
        }
    }
}

function paulLogoBounce() {
    // Paul's logo
    var lerpDist = windowHeight * 0.4; // distance to lerp
    var lerpPower = 0.03; // strength of lerp 
    if (lerpDir == 0) { // Move down
        if (lerpness > lerpDist/2) {
            lerpness += (lerpDist - lerpness) * lerpPower;
        } else {
            lerpness += (lerpness + 4) * lerpPower;
        }
        if (lerpness > lerpDist -2) {
            lerpDir = 1;
        }
        image(paulLogo2, windowWidth - paulLogo.width - 16, 16 + lerpness)
    } else if (lerpDir == 1) { // Move up
        if (lerpness > lerpDist/2) {
            lerpness += (lerpness - lerpDist - 4) * lerpPower;
        } else {
            lerpness += (0 - lerpness) * lerpPower;
        }
        if (lerpness < 2) {
            lerpDir = 0;
        }
        image(paulLogo, windowWidth - paulLogo.width - 16, 16 + lerpness)
    }
}

function resetCanvas() {
    var canvWidth = windowWidth //- padding * 2;
    var canvHeight = windowHeight //- padding * 2 - paintBarHeight;

    resizeCanvas(canvWidth, canvHeight);
    canv.style('display', 'block'); // remove scrollbars... not working?

    // Add a silly picture of paul (random?)

    image(paulPic,
        windowWidth/3 - paulPic.width/2 + random(windowWidth/3),
        windowHeight/3 - paulPic.height/2 + random(windowHeight/3));

}

function windowResized() {
    // Note: deletes canvas contents
    resetCanvas();
  }

class PaintChip { // Palette square of colour
    constructor(x, y, color) {
        this.changePos(x,y);
        this.width = paletteChip.width; // Size
        this.height = paletteChip.height;
        this.borderSize = round(paletteChip.width/10);
        this.color = color; // Chip's colour
    }

    changePos(x,y) {
        this.x = x;
        this.y = y;
    }

    changeColor(newColor) { // Alter this chip's colour
        this.color = newColor;
    }

    drawRect() {
        image(paletteChip, this.x, this.y);
        fill(this.color);
        noStroke();
        rect(this.x + this.borderSize, 
            this.y + this.borderSize, 
            this.width - this.borderSize*2, 
            this.height - this.borderSize*2);
    }
}

class Button {
    constructor(x,y,width,height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.pushed = false;
        this.mode = 0;
        this.modesMax = 1;
    }

    pointInsideButton(x,y) {
        // Stroke Button: Change Stroke Size
        if (withinRect(x, y, this.x, this.y, this.width, this.height)) {
                return true;
        } else {
            return false;
        }
    }
    
    pushButton() {
        this.pushed = true;
    }

    releaseButton() {
        cancelButton()
        this.mode++;
        if (this.mode > this.modesMax) {
            this.mode = 0;
        }
    }

    cancelButton() {
        this.pushed = false;
    }
}

class StrokeButton extends Button {
    constructor(x,y,width,height) {
        super(x,y,width,height);
        this.modesMax = 2;
        this.strokeWeights = [3,6,10];
    }

    drawButton() {
        if (this.pushed == true) {

        } else if (this.mode == 0) {
            image(stroke1,this.x,this.y);
        } else if (this.mode == 1) {
            image(stroke2,this.x,this.y);
        } else if (this.mode == 2) {
            image(stroke3,this.x,this.y);
        }
    }

    getStrokeWeight() {
        return this.strokeWeights[this.mode];
    }
}

class PaintTools {
    constructor(x,y) {
        this.x = x;
        this.y = y;
 
        this.colours = [color('#0f0905'), color('#e4f6e4'), color('#4f6ac4'),
            color('#ccc566'), color('#e4f6e9'), color('#c144ba'),
            color('#85c247'), color('#995f33'), color('#301745'),
            color('#85c7d6'), color('#857f90'), color('#cb2a68'),
            color('#297a76'), color('#b3291d'), color('#dddddd')];

        // Pixel Spacing
        var space = paletteChip.width/5; // Space between chips
        var chipDim = paletteChip.width; // Size of a chip
        var paints = 14; // Number of paints to use
        var columns = 2; // Number of columns of paints
            // Jig effect variables
            this.jig = 8; 
            this.jigTime = 0;
            this.jigTimeMax = 30;

        // Selection Chips
        this.paintSelect = []; // Selected paints
        this.selectionPosition = [x,y]; // Position of selection image
        for (let i=0;i<2;i++) {
            this.paintSelect.push(new PaintChip( // Add to array
                x + selectionPosition[0] + 14 + i*(16),
                y + selectionPosition[1] + 14+ i*(16),
                this.colours[i]
            ));
        }

        // Palette Chips
        var palOffsetX = 10;
        var palOffsetY = 72;
        this.paintChips = []; // array of paint chips
        for (let i=0; i< paints/columns; i++) {
            for (let j=0; j< columns; j++) {
                this.paintChips.push(new PaintChip( // Add to array
                    x+ palOffsetX + (space + chipDim) * j, // x position
                    y+ palOffsetY + (space + chipDim) * i + this.jig*j, // y position
                    this.colours[i*2+j] // colour
                ));
            }
        }
        this.PalChipsBottom = // Bottom of Palette Chips
            (y + palOffsetY + (space + chipDim) * (paints/columns) 
            + paletteChip.height); 


        // Buttons
        this.buttons = [];
        this.strokeButton = new StrokeButton(x,y + this.PalChipsBottom + 8, stroke1.width, stroke1.height)
        this.buttons.push(this.strokeButton);
    }

    drawTools() {
        // Draw Palette Tools
        this.jiggle();
        image(paletteSelect,this.selectionPosition[0],this.selectionPosition[1]);
        for (i=0;i<this.paintSelect.length;i++) { // Draw selection chips
            this.paintSelect[i].drawRect();
        }
        for (i=0;i<this.paintChips.length;i++) {
            this.paintChips[i].drawRect();
        }
        this.strokeButton.drawButton();
    }

    pointInsidePaintChip(x,y) {
        // Paint Chips: Change Colour
        for (i=0;i<this.paintChips.length;i++) {
            if (withinRect(x,y,this.paintChips[i].x, this.paintChips[i].y, 
                this.paintChips[i].width, this.paintChips[i].height)) {

                if (mouseButton === LEFT) {
                    this.paintSelect[0].changeColor(this.paintChips[i].color);
                }
                if (mouseButton === RIGHT) {
                    this.paintSelect[1].changeColor(this.paintChips[i].color);
                }
            }
        }
    }

    jiggle() {
        var jiggleVal = 2
        this.jigTime++

        if (this.jigTime == 0) { // Timer 1
            this.jig += jiggleVal;
            for (let i=0; i< this.paintChips.length; i++) {
                this.paintChips[i].changePos(
                    this.paintChips[i].x,
                    this.paintChips[i].y + jiggleVal - 2 * jiggleVal * (i%2))
            }
        }

        if (this.jigTime == this.jigTimeMax) { // Timer 2
            this.jig -= jiggleVal;
            this.jigTime = -1*this.jigTimeMax;
            for (let i=0; i< this.paintChips.length; i++) {
                this.paintChips[i].changePos(
                    this.paintChips[i].x,
                    this.paintChips[i].y - jiggleVal + 2 * jiggleVal * (i%2))
            }
        }
    }
}

// SUPPORT FUNCTIONS
function withinRect(px, py, rx, ry, rw, rh) { // Check if a point is inside a rectangle
    if ((px >= rx) && (px <= rx+rw) && (py >= ry) && (py <= ry+rh)) {
        return true;
    } else {
        return false;
    }
}