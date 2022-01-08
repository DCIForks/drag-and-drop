# Drag and Drop Demo

This repository demonstrates how drag and drop can be implemented in both a desktop browser and on a touch screen.

It allows you to move virtual chess pieces on a virtual board but **it does play chess**. It will not limit pieces to legal chess moves. You can move pieces to any square, including squares that currently contain a piece of the same colour.

## Things to note

In the script.js file, after line 200, you can find some powerful generic functions:

* removeFrom() allows you to remove specific entries from an array
* startTracking() allows you to start a drag and drop operation
  and follow it through to completion. In this demo, the default drag
  action is used. A custom drop action is provided to snap the dragged
  chess piece into place when the mouse or touch action ends.
* detectMovement allows you to trigger one action if the user clicks 
  on a DOM element, and another if the user starts to drag it. (Not used in this demo.)

The startTracking function is triggered by mouse events on a desktop computer, and by touch events on a touch screen.
