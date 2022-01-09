/**
 * Demonstration of dragging and dropping both on a desktop computer and
 * on a smartphone.
 */


// Define the board container element,
const game = document.getElementById("game")

// Declare global variables that will be set according to the position
// and dimensions of this container element
let boardLeft
  , boardTop
  , boardWidth
  , boardHeight
  , offset


// PLACING THE PIECES // PLACING THE PIECES // PLACING THE PIECES //

/** Place the pieces for the start of the game.
 *  In the HTML file, every piece has a class with the following
 *  elements...
 *
 *    "piece <colour>-<type>"
 *
 *  ... where <colour> may be "black" or "white", and <typ> may be
 *  "king", "queen", "bishop", "knight", "rook" or "pawn".
 *
 * Example: "piece black-pawn"
 *
 * The placePieces function adds two more classes, one for the column
 * ("c-X") and one for the row ("r-Y"), where X is a letter from a - h
 * and Y is a number from 1 - 8.
 *
 * This is an Immediately Invoked Function Expression (IIFE):
 * https://developer.mozilla.org/en-US/docs/Glossary/IIFE
 */
;(function placePieces(){
  const pieces = Array.from(document.querySelectorAll(".piece"))
  // pieces are arranged in order in the HTML file, so their
  // index % 8 will define which column they should appear in.

  pieces.forEach(( piece, index ) => {
    const className = piece.className
    const isWhite = className.includes("white-")
    const hyphenOffset = className.indexOf("-")
    const isPawn = className.slice(hyphenOffset + 1) === "pawn"

    // Rows can be hard-coded by colour
    let row = ( isPawn )
            ? ( isWhite ? "r-2" : "r-7" )
            : ( isWhite ? "r-1" : "r-8" )

    // Column needs to be calculated from index
    let column = getClass("column", index)

    piece.classList.add(column, row)
  })
})() 


/** Called by placePieces and placePiece
 *
 * @param {String}  type is one of:
 *                 "king", "queen", "bishop", "knight", "rook". "pawn"
 * @param {integer} index has a value between 0 and 7
 *
 * @returns         a string with the format "c-X" or "r-Y", where X is
 *                  a letter from a - h and Y is a number from 1 - 8.
 */
function getClass(type, index) {
  if (type === "row") {
    return "r-" + (8 - index)
  } else {
    return "c-" + ("abcdefgh"[index % 8])
  }
}


/** Called by placePiece when a piece is moved from one square to
 *  another, to identify which classes define columns and rows.
 *
 *  Returns true for strings with the format "c-X" or "r-Y", where
 *  X is a letter from a - h and Y is i number from 1 - 8
 */
const findSquareClasses = (className) => (
  /^(r-\d|c-[abcdefgh])$/.test(className)
)


// DRAG AND DROP // DRAG AND DROP // DRAG AND DROP // DRAG AND DROP //

/**  Use event delegation to handle mouse events on the chess pieces
* https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#event_delegation
*
* Add a single event listener to the game div itself. The startDrag
* callback function will receive an event with a <target> property,
* indicating exactly which piece (or the board itself) was clicked.
*/
document.getElementById("game").addEventListener("mousedown", startDrag)
document.getElementById("game").addEventListener("touchstart",startDrag)


function startDrag(event) {
  const piece = event.target

  if (!piece.classList.contains("piece")) {
    // Ignore clicks on the board itself, or on the game container div
    return
  }

  // Stop the browser from dragging a ghost image
  event.preventDefault()

  // Add a temporary class to change the piece's z-index
  piece.classList.add("dragging");


  // Get the position and dimensions of the game board just in time
  // (because the player may have resized the window). Note the use
  // of destructuring with renaming. The whole expression must be
  // wrapped in ( parentheses ) if using object literal destructuring
  // assignment separately from declaration of the variables.
  ({
    left:   boardLeft,
    top:    boardTop,
    width:  boardWidth,
    height: boardHeight
  } = game.getBoundingClientRect())

  // Calculate an offset which will be used to determine which column
  // and row to drop a dragged piece into, taking into account the 
  // position and dimensions of the board
  //
  // Find where the user clicked on the page...
  const { x, y } = getPageXY(event)
  // ... and the element's top and left.
  const { left, top } = piece.getBoundingClientRect()
  offset = { x: x - left - boardLeft, y: y - top - boardTop }


  // Define an action for when the drag action ends. This will be sent
  // in the argument to the generic startTracking function below.
  const drop = (event) => {
    // Stop dragging: call the generic function
    cancelTracking()

    // Do whatever needs to be done when the element is dropped
    placePiece(piece)
  }

  // Note: the startTracking function below will handle all the
  // dragging procedure internally. No custom drag() function is
  // needed.

  const options = {
    event
  , drop
  }

  // Remember the functions used for event listeners, so that they
  // can be removed from the element when the drag is complete.
  const cancelTracking = startTracking(options)
}


/** Called when the user drops a dragged piece
 *
 * @param {DOMElement} piece: the piece that was dragged
 */
function placePiece(piece) {
  // Remove the temporary "dragging" class that sets the z-index...
  piece.classList.remove("dragging")
  // ... and the two classes that defined the piece's previous column
  // and row
  const classList = Array.from(piece.classList)
  removeFrom(classList, findSquareClasses, true)

  // Find which column and row the mouse/finger is currently in.
  // On touchEnd, no location is provided, so this must be calculated
  // from the position to which the piece was just dragged to.
  let { x, y } = piece.getBoundingClientRect()
  x += offset.x
  y += offset.y
  const square = boardWidth / 8 // same as boardHeight / 8

  // Constrain piece to board
  x = Math.max(0, Math.min(x, boardWidth))
  y = Math.max(0, Math.min(y, boardHeight))

  // Convert this position to a column and a row.
  const column = getClass("column", Math.floor(x / square))
  const row    = getClass("row", Math.floor(y / square))
  classList.push(column, row)

  piece.className = classList.join(" ")

  // Remove the inline style that was used while dragging.
  piece.setAttribute('style', '')
}




//////////////////////////////////////////////////////////////////
// GENERIC CODE // GENERIC CODE // GENERIC CODE // GENERIC CODE //
//////////////////////////////////////////////////////////////////




/// ARRAY FUNCTIONS ///

/** Removes elements that are matched by <item> from an array. If there
 *  are no matching items, array will be left unchanged.
 *
 * @param {Array}   array
 * @param {Any}     item may be:
 *                  • a specific item to remove
 *                  • an array of items to remove
 *                  • function which will return true when called with
 *                    any item that is to be removed.
 * @param {Boolean} removeAll: if true, all entries matched by <item>
 *                  will be removed. If not, only the first such entry
 *                  will be removed.
 * @returns the integer number of removed items.
 */
function removeFrom (array, item, removeAll) {
  let removed = 0

  // If `item` is an array of items or functions, treat recursively
  if (Array.isArray(item)) {
    removed = item.reduce((excess, entry) => {
      excess += removeFrom(array, entry, removeAll)
      return excess
    }, 0)

    return removed
  }

  // If we get here, item is an individual items or function
  let index
    , found

  do {
    if (typeof item === "function") {
      index = array.findIndex(item)
    } else {
      index = array.indexOf(item)
    }

    found = !(index < 0)
    if (found) {
      array.splice(index, 1)
      removed += 1
    }
  } while (removeAll && found)

  return removed
}




// MOUSE/TOUCH EVENT FUNCTIONS ///
// https://gist.github.com/blackslate/6f77d3acd2edc2a286cff6d607cf3ce8

/**
 * DETECT MOVEMENT
 * ---------------
 * Sometimes you want a simple click to perform one action and a drag
 * on the same element to perform a different action. You can create two
 * methods, (say) startDrag() and clickAction(), and use the following
 * function (plus the functions below) to determine which of the two
 * actions will be triggered.
 *
 *  const checkForDrag = (event) => {
 *    event.preventDefault()
 *
 *    detectMovement(event, 10, 250) //
 *    .then(
 *      () => startDrag(event) // use same event to start drag action
 *     )
 *    .catch(clickAction)
 *  }
 *
 * startDrag will be called if the mouse or touch point moves 10 pixels
 * or more within 250 milliseconds. clickAction will be called if there
 * is no movement within this time, or if the mouse/touch pressure is
 * released before this time.
 *
 * SET TRACKED EVENTS
 * ------------------
 * When dragging an element, you generally want one function to be
 * called for any movement, and another to be triggered when the element
 * is dropped. You don't want to have to create separate code for
 * mouse events and touch events, even if these events generate
 * the current x and y positions in different ways.
 *
 * The startTracking() function allows you to provide a starting
 * event (mouseDown or touchStart) and two functions that should be
 * called: one for mousemove|touchmove and the other for mouseup|
 * touchend.
 *
 * X and Y COORDINATES
 * -------------------
 * You can use getPageXY() to get the current mouse position or the
 * position of the first touch point, without worrying about whether
 * the input is from a mouse or a touch screen.
 *
 * let dragMe = <your draggable element>
 *   , cancelTracking // set to function to stop dragging
 *
 * const drop = () => {
 *   canceTracking()
 *   // Do whatever needs to be done when the element is dropped
 * }
 *
 * const startDrag = (event) => {
 *   const options = {
 *     event
 *   , drop
 *   }
 *
 *   // Store the callback functions to remove the event listeners
 *   // from the element when the drag is complete.
 *   cancelTracking = startTracking(options)
 * }
 *
 * const checkForDrag = (event) => {
 *   event.preventDefault()
 *
 *   detectMovement(event, 16)
 *   .then(() => startDrag(event) )
 *   .catch(clickAction)
 * }
 *
 * ===============================================================
 * NOTE FOR REACT USERS CREATING WEB APPS FOR TOUCH SCREEN DEVICES
 * ===============================================================
 * React refuses to add non-passive (cancellable) event listeners for
 * touchstart. With a passive event listener, the whole page is likely
 * to move at the same time as the dragged element, which is probably
 * not what you want.
 *
 * As a result, you should NOT use React to pass an onTouchStart
 * function the same way that you would pass an onMouseDown function to
 *  your draggable element.
 *
 * Instead, you need to apply your touchstart event listener directly
 * to the DOM element that you want to drag with useEffect, as shown
 * below.
 *
 * const dragRef = useRef()
 *
 * return (
 *   <main>
 *     <div
 *       onMouseDown={checkForDrag}
 *       ref={dragRef}
 *     />
 *   </main>
 * );
 *
 * useEffect(() => {
 *   dragMe = dragRef.current
 *   dragMe.addEventListener("touchstart", checkForDrag, false)
 * })
 */

 const getPageXY = (event) => {
  if (event.targetTouches && event.targetTouches.length) {
    event = event.targetTouches[0] || {}
  }

  return { x: event.pageX, y: event.pageY }
}



/**
 * Returns a promise which will be:
 * * resolved if the mouse or touch moves more than triggerDelta
 *   pixels in any direction
 * * rejected if the mouse is released or the touch gesture ends before
 *   moving that far, or if <timeOut> number of milliseconds elapses
 *   before any movement occurs.
 *
 * @param  {event}  event should be a mousedown or touchstart event
 * @param  {number} triggerDelta should be the number of pixels of
 *                          movement that will resolve the promise
 * @param  {number} timeOut may be a number of milliseconds. Defaults
 *                          to 250. Use 0 for no timeOut rejection.
 *
 * @return  {promise}
 */
const detectMovement = (event, triggerDelta, timeOut) => {
  const trigger2 = triggerDelta * triggerDelta
  timeOut = isNaN(timeOut) ? 250 : Math.abs(timeOut)

  function movementDetected(resolve, reject) {
    const { x: startX, y: startY } = getPageXY(event)
    const options = { event, drag, drop }
    const cancelTracking = startTracking(options)

    // Check if the mouse/touch has moved more than triggerDelta
    // pixels in any direction, and resolve promise if so.
    function drag(event) {
      const { x, y } = getPageXY(event)
      const deltaX = startX - x
      const deltaY = startY - y
      const delta2 = (deltaX * deltaX + deltaY * deltaY)

      if (delta2 > trigger2) {
        cancelTracking()
        resolve()
      }
    }

    // Reject promise if the mouse is released before the mouse/touch
    // moved triggerDelta pixels in any direction.
    function drop() {
      cancelTracking()
      reject("release")
    }

    if (timeOut) {
      setTimeout(() => reject("timeOut"), timeOut)
    }
  }

  return new Promise(movementDetected)
}


/**
 * @param {DOMElement} element
 * @returns  element's closest parent which has a position other than
 *           static
 */
const getNonStaticParent = (element) => {
  let parent
  while (element.tagName !== "BODY" && (parent = element.parentNode)) {
    const style = getComputedStyle(parent)
    if (style.getPropertyValue("position") !== "static") {
      break
    }

    element = parent
  }

  return parent
}



/**
 * If no drag function is supplied, move the target (or its parent)
 * with the mouse or touch
 *
 * @param {MouseEvent | TouchEvent} event
 * @param {String?} selector
 *                  If selector is a string, it will be used to find
 *                  the closest matching parent (or the target itself)
 *                  as the element to drag
 * @param {Objec?}  offset
 *                  If offset is an object with the format
 *                  { x: <Number>, y: <Number> }, then it will be used
 *                  for defining the offset from the drag point to the
 *                  top left of the dragged element.
 * @returns         a function in a closure, which knows which target
 *                  and offset to use
 */
const defaultDragAction = (event, selector, offset) => {
  const target = (typeof selector === "string")
               ? event.target.closest(selector) // select an ancestor
               : event.target

  const offsetGiven = typeof offset === "object"
                   && !isNaN(offset.x)
                   && !isNaN(offset.y)

  if (!offsetGiven) {
    // Move target relative to its closest non-static parent
    const fix = getNonStaticParent(target)
    const { left: fixLeft, top: fixTop } = fix.getBoundingClientRect()
    const { x, y } = getPageXY(event)
    const { left, top } = target.getBoundingClientRect()
    offset = { x: left - fixLeft - x , y: top - fixTop - y }
  }

  const drag = (event) => {
    const { x, y } = getPageXY(event)
    target.style.left = (offset.x + x )+ "px"
    target.style.top =  (offset.y + y )+ "px"
  }

  return drag
}



// The prevent default function needs to be outside startTracking
// so that the exact same listener function (rather than a duplicate)
// can be  removed later.
const noDefault = (event) => event.preventDefault()



/**
 * Starts a drag and drop operation, and follows it through to the end.
 *
 * @param {Object}
 *          event: may be either a MouseDown event or a TouchStart event
 *           drag: may be a custom function to call for dragging. If
 *                 not, a generic function will be used. It may also be
 *                 a CSS selector to define which parent of the clicked
 *                 target should be dragged.
 *           drop: a callback function that will be called when the
 *                 dragging stops
 *         offset: may be an object of the form { x: Number, y: Number}
 *                 to be used by the defaultDragAction function.
 *
 * @returns a function to call to cancelTracking
 */
function startTracking({ event, drag, drop, offset }) {
  const body = document.body
  const dragOption = { passive: false } // capture is false by default

  let move
  , end

  if (event.type === "touchstart") {
    move  = "touchmove"
    end   = "touchend"
  } else {
    move  = "mousemove"
    end   = "mouseup"
  }

  switch (typeof drag) {
    case "function":
      // Use the custom function
    break
    default: // case "string":
      drag = defaultDragAction(event, drag, offset)
    break
  }

  body.addEventListener(move, drag, false)
  body.addEventListener(end, drop, false)
  // Prevent the page scrolling during drag, on touch devices
  document.addEventListener("touchstart", noDefault, dragOption)

  const cancelTracking = () => {
    body.removeEventListener(move, drag, false)
    body.removeEventListener(end, drop, false)
    // Restore page scrolling on touch devices now that drag is over
    document.removeEventListener("touchstart", noDefault)
  }

  return cancelTracking
}