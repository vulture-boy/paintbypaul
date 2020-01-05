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

    paintTools.drawPaintChips();
    paulLogoBounce();

    // Drawing
    if (mouseIsPressed === true) { // Draw Action

        // Stroke Size
        strokeWeight(3); 

        // Select colour
        if (mouseButton === LEFT) {
            stroke(paintTools.paintSelect[0].color); // Draw Colour
        }
        if (mouseButton === RIGHT) {
            stroke(paintTools.paintSelect[1].color);
        }

        // If inside paint area...
        if (mouseX > padding) {
            // Line between previous and current point
            line(mouseX, mouseY, pmouseX, pmouseY);
        }

        // Check if mouse is touching a paint chip (color swap)
        paintTools.pointInsidePaintChip(mouseX,mouseY);
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
        this.x = x; // Position
        this.y = y;
        this.width = paletteChip.width; // Size
        this.height = paletteChip.height;
        this.borderSize = round(paletteChip.width/10);
        this.color = color; // Chip's colour
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

class PaintTools {
    constructor(x,y) {
        this.x = x;
        this.y = y;
        this.paintChips = []; // array of paint chips
        this.paintSelect = []; // Selected paints
        this.selectionPosition = [x,y]; // Position of selection image
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

        // Palette Chips
        for (let i=0; i< paints/columns; i++) {
            for (let j=0; j< columns; j++) {
                this.paintChips.push(new PaintChip( // Add to array
                    x+ 10 + (space + chipDim) * j, // x position
                    y+ 72 + (space + chipDim) * i, // y position
                    this.colours[i*2+j] // colour
                ));
            }
        }

        // Selection Chips
        for (let i=0;i<2;i++) {
            this.paintSelect.push(new PaintChip( // Add to array
                x + selectionPosition[0] + 14 + i*(16),
                y + selectionPosition[1] + 14+ i*(16),
                this.colours[i]
            ));
        }


    }

    drawPaintChips() {
        // Draw Palette Tools
        image(paletteSelect,this.selectionPosition[0],this.selectionPosition[1]);
        for (i=0;i<2;i++) {
            this.paintSelect[i].drawRect();
        }
        for (i=0;i<this.paintChips.length;i++) {
            this.paintChips[i].drawRect();
        }
    }

    pointInsidePaintChip(x,y) {
        // Paint Chips: Change Colour
        for (i=0;i<this.paintChips.length;i++) {
            if ((x >= this.paintChips[i].x) &&
                (x <= this.paintChips[i].x + this.paintChips[i].width) &&
                (y >= this.paintChips[i].y) &&
                (y <= this.paintChips[i].y + this.paintChips[i].height)) {

                if (mouseButton === LEFT) {
                    this.paintSelect[0].changeColor(this.paintChips[i].color);
                }
                if (mouseButton === RIGHT) {
                    this.paintSelect[1].changeColor(this.paintChips[i].color);
                }
            }
        }
        
        return
    }
}