/*
Paint by Paul-----
-----by Tyson Moll - https://tysonmoll.ca

*/
var canv;
var canvHeight = 0;
var padding = 96;
var logoOffset = 16;
var lerpDir = 0;
var selectionPosition = [0,0]; // Position of selection icon
let paintTools;

function preload() {

    paulPics = [loadImage('images/Paul1.png'), 
            loadImage('images/Paul2.png'),
            loadImage('images/Paul3.png')];
    paletteChip = loadImage('images/paintChip.png');
    paletteSelect = loadImage('images/paintSets.png');
    backChecker = loadImage('images/backChecker.png');
    //backChecker = loadImage('images/paintChip2.png');
    paulLogo = loadImage('images/paulPage.png');
    paulLogo2 = loadImage('images/paulPage2.png');
    stroke1 = loadImage('images/strokeSize1.png');
    stroke2 = loadImage('images/strokeSize2.png');
    stroke3 = loadImage('images/strokeSize3.png');
    strokeX = loadImage('images/strokeSize4.png');
    file1 = loadImage('images/files1.png');
    file2 = loadImage('images/files2.png');
    file3 = loadImage('images/files3.png');
    fileX = loadImage('images/files4.png');
    eyedrop1 = loadImage('images/eyedrop1.png');
    eyedrop2 = loadImage('images/eyedrop2.png');
    eyedropX = loadImage('images/eyedrop2.png');
  }

function setup() {

    canv = createCanvas();
    canv.parent('canvas');
    resetCanvas();
    paintTools = new PaintTools(padding/2 - paletteSelect.width/2, 16);
    paulText = new PaulLogo();

}

function draw() {

    // Padding Background 
    for (i=0;i<padding;i+=backChecker.width) {
        for (j=0;j<canvHeight;j+=backChecker.height) {
            image(backChecker,i,j);
        }
    }

    paintTools.drawTools();
    paulText.drawMe();

    // Drawing
    if (mouseIsPressed === true) { // Draw Action

        // Stroke Size
        strokeWeight(paintTools.strokeButton.getStrokeWeight()); 

        // Select colour
        if (mouseButton === LEFT) {
            stroke(paintTools.paintSelect[0].color); // Draw Colour
        }
        if (mouseButton === RIGHT) {
            stroke(paintTools.paintSelect[1].color);
        }

        // Paint Zone
        if (mouseX > padding) {
            // Line between previous and current point
            line(mouseX, mouseY, pmouseX, pmouseY);
        }
    }
}

function mousePressed() {

    // Paint Tools 
    paintTools.pointInsidePaintChip(mouseX,mouseY); // Paint Chips
    for (let i=0;i<paintTools.buttons.length;i++) {
        if (paintTools.buttons[i].pointInsideButton(mouseX,mouseY)) {
            paintTools.buttons[i].pushButton();
        }
    }

    for (let i=0;i<paintTools.contentIcons.length;i++) {
        paintTools.contentIcons[i].openContent();
    }
}

function mouseReleased() {

    // Release buttons
    for (let i=0;i<paintTools.buttons.length;i++) {
        if (paintTools.buttons[i].pointInsideButton(mouseX,mouseY)) {
            paintTools.buttons[i].releaseButton();
        } else {
            paintTools.buttons[i].cancelButton(); // Cancel if now outside button
        }
    }
}

function resetCanvas() {

    // Determine minimum sizing

    var canvWidth = max(windowWidth,paulLogo.width + padding + logoOffset) //- padding * 2;
    try {
        canvHeight = max(windowHeight,paintTools.bottom) //- padding * 2 - paintBarHeight;
    } catch {
        canvHeight = windowHeight;
    }
    
    resizeCanvas(canvWidth, canvHeight);
    canv.style('display', 'block'); // remove scrollbars... not working?

    // Add a silly picture of paul (random?)

    var newPaul = round(random(paulPics.length-1)) // Pick a random Paul
    image(paulPics[newPaul], // Draw the Paul
        windowWidth/3 - paulPics[newPaul].width/2 + random(windowWidth/3),
        windowHeight/3 - paulPics[newPaul].height/2 + random(windowHeight/3));

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

class ToolItem {
    constructor(x,y,width,height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}

class ContentIcon extends ToolItem {
    constructor(x,y,width,height,newImage,content) {
        super(x,y,width,height);
        this.myImage = newImage;
        this.content = content; // STUB

        // Jig effect variables
        this.jigTick = round(random()); 
        this.jig= 0;
        this.jigTime = millis();
        this.jigTimeMax = 250;
        this.jiggleVal = -1; // Value to jiggle
    }

    drawIcon() {
        image(fileX,this.x +2,this.y+2);
        image(this.myImage,this.x + this.jig,this.y + this.jig); // Shadow
        this.jiggle();
    }

    openContent() {
        var myElement = document.getElementById(this.content);

        // Stroke Button: Change Stroke Size
        if (withinRect(mouseX, mouseY, this.x, this.y, this.width, this.height)) {
                myElement.style.display = "block"
        }
    }

    jiggle() {

        if (millis() - this.jigTime > this.jigTimeMax) {
            this.jig += this.jiggleVal;
            this.jig += this.jiggleVal;
            this.jigTick++
            this.jigTime = millis();
            if (this.jigTick ==2) {
                this.jiggleVal *= -1;
                this.jigTick = 0;
            }
        } 
    }
}

class Button extends ToolItem {
    constructor(x,y,width,height) {
        super(x,y,width,height);
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

    cancelButton() {
        this.pushed = false;
    }

    releaseButton() {
        this.cancelButton();
        this.mode += 1;
        if (this.mode > this.modesMax) {
            this.mode = 0;
        }
    }
}

class StrokeButton extends Button {
    constructor(x,y,width,height) {
        super(x,y,width,height);
        this.mode = 1;
        this.modesMax = 2;
        this.strokeWeights = [3,8,16];
    }

    drawButton() {
        if (this.pushed == true) {
            image(strokeX,this.x,this.y)
        } else {
            if (this.mode === 0) {
                image(stroke1,this.x,this.y);
            } else if (this.mode === 1) {
                image(stroke2,this.x,this.y);
            } else if (this.mode === 2) {
                image(stroke3,this.x,this.y);
            }
        }
    }

    getStrokeWeight() {
        return this.strokeWeights[this.mode];
    }
}

class EyedropperButton extends Button {
    constructor(x,y,width,height) {
        super(x,y,width,height);
    }

    drawButton() {
        if (this.pushed == true) { // Pushed down
            image(eyedropX,this.x,this.y)
        } else {
            if (this.mode === 0) { // Unselected
                image(eyedrop1,this.x,this.y);
            } else if (this.mode === 1) { // Eyedropper Mode
                image(eyedrop2,this.x,this.y);
            }
        }
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
            this.jigTime = millis();
            this.jigTimeMax = 500;
            this.jiggleVal = 2; // Value to jiggle

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
        var palChipsBottom = // Bottom of Palette Chips
            (y + palOffsetY + (space + chipDim) * (paints/columns)); 


        // Buttons
        this.buttons = [];
        this.strokeButton = new StrokeButton( // Stroke Button
            x,y + palChipsBottom, stroke1.width, stroke1.height)
        this.buttons.push(this.strokeButton);
        this.eyedropButton = new EyedropperButton(
            x,y + palChipsBottom + this.strokeButton.height + space,
            eyedrop1.width, eyedrop1.height);
        this.buttons.push(this.eyedropButton);
        var buttonBottom = this.eyedropButton.y + this.eyedropButton.height + 16;

        // Content Icons
        this.contentIcons = [];
        this.contentIcons.push(new ContentIcon(
            x,buttonBottom,
            file1.width, file1.height, file1, 'musicPage'));
        this.contentIcons.push(new ContentIcon(
            x,buttonBottom + (space + file1.height),
            file1.width, file1.height, file2, 'videoPage'));
        this.contentIcons.push(new ContentIcon(
            x,buttonBottom + (space + file1.height) *2,
            file1.width, file1.height, file3, 'projectPage'));
        var contentIconBottom = buttonBottom 
            + (space + file1.height) *3;

        // Determine bottom dimension
        this.bottom = space + contentIconBottom + 16;
    }

    drawTools() {
        // Draw Palette Tools
        this.jiggle();
        image(paletteSelect,this.selectionPosition[0],this.selectionPosition[1]);
        for (let i=0;i<this.paintSelect.length;i++) { // Draw selection chips
            this.paintSelect[i].drawRect();
        }
        for (let i=0;i<this.paintChips.length;i++) {
            this.paintChips[i].drawRect();
        }
        for (let i=0; i<this.buttons.length;i++) {
            this.buttons[i].drawButton();
        }
        for (let i=0; i<this.contentIcons.length;i++) {
            this.contentIcons[i].drawIcon();
        }
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

        if (millis() - this.jigTime > this.jigTimeMax) { // Timer 1
            this.jig += this.jiggleVal;
            for (let i=0; i< this.paintChips.length; i++) {
                this.paintChips[i].changePos(
                    this.paintChips[i].x,
                    this.paintChips[i].y + this.jiggleVal - 2 * this.jiggleVal * (i%2))
            }
            this.jiggleVal *= -1;
            this.jigTime = millis();
        }
    }
}

class PaulLogo {
    constructor() {
        this.width = paulLogo.width;
        this.height = paulLogo.height;
        this.lerpness = 0;
        this.lerpDir = 0;
        this.lerpDist = canvHeight * 0.5;
        this.lerpTime = 3;

        this.lerpDown(this);
    }

    lerpDown(obj) {
        this.lerpDir =1;
        TweenLite.to(this, this.lerpTime, {lerpness:this.lerpDist, 
            ease:Power2.easeInOut, onComplete:function(){obj.lerpUp(obj)}});
    }

    lerpUp(obj) {
        this.lerpDir=0;
        TweenLite.to(this, this.lerpTime, {lerpness:0, 
            ease:Power2.easeInOut, onComplete:function(){obj.lerpDown(obj)}});
    }

    drawMe() {
        var myX = windowWidth - paulLogo.width - logoOffset;
        var myY = logoOffset + this.lerpness;
        if (lerpDir == 1) {
            image(paulLogo,myX, myY);
        } else if (lerpDir == 0) {
            image(paulLogo2,myX, myY);
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