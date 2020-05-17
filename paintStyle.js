/*
Paint by Paul-----
-----by Tyson Moll - https://tysonmoll.ca

*/
var canv;
var canvWidth = 0;
var canvHeight = 0;
var padding = 96;
var logoOffset = 32;
var lerpDir = 0;
var touchTimer = 0;
var touchDelay = 500;
var adDisplayTimer = 20000;
var adDisplayReset = 25000;
var topZ = 4; // lazy var to track z layer height
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
    canv.parent('canvas'); // Assign to DOM object
    paintTools = new PaintTools(padding/2 - paletteSelect.width/2, 16);
    resetCanvas(); 
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

        // 
        spawnPaulAd();

    // Drawing
    if (mouseIsPressed === true) { // Draw Action

        if (paintTools.eyedropButton.mode === 1 && mouseX > padding) { // Eyedrop Mode
            
            pixPoint = get(mouseX,mouseY);
            pickedCol = color(pixPoint[0], pixPoint[1], pixPoint[2], pixPoint[3]);
            if (mouseButton === LEFT) {
                paintTools.paintSelect[0].color = pickedCol;
            } else if (mouseButton === RIGHT) {
                paintTools.paintSelect[2].color = pickedCol;
            }
        } else { // Drawing
            sketch();
        }
    }
}

function sketch() {
    
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

function touchStarted() { // Ensures touches work properly

    if (millis() - touchTimer > touchDelay) {
        mousePressed();
        touchTimer = millis();
    }
}

function touchEnded() {
    mouseReleased();
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

    if (paintTools.eyedropButton.mode === 1 && mouseX > padding) {
        paintTools.eyedropButton.mode = 0;
    }
}

function spawnPaulAd() {
    // Select ad to display
    if (millis() - adDisplayTimer > adDisplayReset) {
        // Open random popup window
        var randomIndex = round(random(paintTools.popups.length - 1))
        paintTools.popups[randomIndex].openWindow();

        adDisplayTimer = millis();
    } 
}

/// Re-adjusts canvas for modified dimensions (or initialization)
function resetCanvas() {

    // Determine minimum sizing

    canvWidth = max(windowWidth,paulLogo.width + padding + logoOffset) //- padding * 2;
    try {
        canvHeight = max(windowHeight,paintTools.bottom) //- padding * 2 - paintBarHeight;
    } catch {
        canvHeight = windowHeight;
    }
    
    resizeCanvas(canvWidth, canvHeight);
    canv.style('display', 'block'); // remove scrollbars... not working?

    paintTools.adjustWindows();

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

        // In box?
        if (withinRect(mouseX, mouseY, this.x, this.y, this.width, this.height)) {
            this.content.openWindow();
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
            file1.width, file1.height, file1, new Window95('musicPage')));
        this.contentIcons.push(new ContentIcon(
            x,buttonBottom + (space + file1.height),
            file1.width, file1.height, file2, new Window95('videoPage')));
        this.contentIcons.push(new ContentIcon(
            x,buttonBottom + (space + file1.height) *2,
            file1.width, file1.height, file3, new Window95('projectPage')));
        var contentIconBottom = buttonBottom 
            + (space + file1.height) *3;

        // Pop Ups
        this.popups = [];
        this.popups.push(new Window95('popup1'));
        this.popups.push(new Window95('popup2'));

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

    adjustWindows() {
        // Set windows to full, if applicable
        for (let i=0; i< this.contentIcons.length; i++) {
            this.contentIcons[i].content.checkScreenDims();
        }
    }
}

class PaulLogo {
    constructor() {
        this.width = paulLogo.width;
        this.height = paulLogo.height;
        this.lerpness = 0;
        this.lerpDir = 0;
        this.lerpDist = canvHeight * 0.3;
        this.lerpTime = 3;

        if (windowHeight > 500) { // Confirm this is worth initating
            this.lerpDown(this);
        }
        
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

class Window95 {
    constructor(domReference) {
        this.domObj = document.getElementById(domReference);
        this.domID = (' ' + this.domObj.id).slice(1);
        this.fullActive = false;
        
        this.defaultLeft = "96px";
        this.defaultRight = (' ' + this.domObj.style.right).slice(1);
        this.defaultTop = (' ' + this.domObj.style.top).slice(1);
        this.defaultWidth = (' ' + this.domObj.style.width).slice(1); 
        this.defaultMaxWidth = (' ' + this.domObj.style.widthMax).slice(1);
        this.defaultHeight = (' ' + this.domObj.style.height).slice(1); 
        this.defaultMaxHeight = (' ' + this.domObj.style.heightMax).slice(1); 
        
        /*
        this.defaultLeft = "96px";
        this.defaultRight = "60px";
        this.defaultTop = "60px";
        this.defaultMaxWidth = "720px"
        this.defaultHeight = "auto";
        */

    }

    openWindow() {
        this.domObj.style.display = "block";
        this.domObj.style.zIndex = topZ;
        topZ++

        var leftVal; 
        if (canvWidth > 750) { // Randomize window placement

            leftVal = padding + round(random(canvWidth -750));
            this.domObj.style.left = String(leftVal + "px");
        } else {
            this.domObj.style.left = String(padding + round(random(48)) + "px");
        } 
        this.defaultLeft = this.domObj.style.left;
        
        if (windowHeight > 400) { // Random window place (smaller)
            this.domObj.style.top = String(round(random(canvHeight -400))) + "px";
        } else {
            this.domObj.style.top = String(round(random(70))) + "px";
        }
        this.defaultTop = this.domObj.style.top;

        this.fullActive = false;
        this.checkScreenDims();
    }

    checkScreenDims() {
        // Check dimensions of the screen for size adjustments
        
        if (windowWidth < 750 ) {
            this.fullStyle();
        } else {
            this.normalStyle();
        }
    }

    setFull(newValue) {
        // Swap IDs for fullscreen mode
        if (!newValue) { // Disable Full Mode
            // STUB: Also check if resolution is OK
            this.fullActive = false;
            this.normalStyle();
        } else { // Enable Full Mode
            this.fullActive = true;
            this.fullStyle();
        }
    }

    normalStyle() {
        this.domObj.style.left = this.defaultLeft;
        this.domObj.style.right = "auto";
        this.domObj.style.top = this.defaultTop;
        this.domObj.style.width = this.defaultWidth;
        this.domObj.style.maxWidth = this.defaultMaxWidth;
        this.domObj.style.height = this.defaultHeight;
        this.domObj.style.maxHeight = this.defaultMaxHeight;
    }

    fullStyle() {
        this.domObj.style.left = String(padding + "px");
        this.domObj.style.right = "0px";
        this.domObj.style.top = "0px";
        var vv = windowWidth - padding;
        this.domObj.style.width = String(vv + "px");
        this.domObj.style.maxWidth = "100%";
        this.domObj.style.height = "100%";
        this.domObj.style.maxHeight = "100%";
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