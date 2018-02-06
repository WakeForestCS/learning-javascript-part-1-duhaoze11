// Global variables
   var canvas;
   var size = 400;             // Dimension of the canvas
   var boxSize = size / 4;     // Dimension of one box
   var boxHalfsize = size / 8;

   var context;
   // Model of the content in the board
   // 0 means the corresponding box is empty
   var board   = [[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]];

   // List of places in the board that are empty
   var emptyPlaces = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];


   window.onload = function () {
      canvas = document.getElementById("myCanvas");
      canvas.setAttribute("width", size);
      canvas.setAttribute("height", size);
      // Make function move() an event listener in the canvas
      window.addEventListener('keydown', move, false);

      context = canvas.getContext("2d");	// Obtain the drawing context from the canvas

      // Add two random pieces to the board to get started
      newPiece();
      newPiece();

      // Draw the board
      drawBoard();

   }

   // function move() is called when any key is pressed down
   // It responds to left, up, right, and down keys and ignores the others
   function move(event) {
       var code = event.keyCode;

       if (code == 37) {       // left
           transposeBoard();   // Transpose the board to correct orientation for processing
           processBoardUp();   // Process the board (in up direction in the screen, but in the
                               // in the first dimension in the array
           transposeBoard();   // Revert to original orientation
           drawBoard();
       }
       else if (code == 38) { // up
           processBoardUp();
           drawBoard();
       }
       else if (code == 39) {  // right
           transposeBoard();   // Requires both a transpose and flipLeftRight
           flipBoardLR();
           processBoardUp();
           flipBoardLR();      // Revert to original orientation
           transposeBoard();
           drawBoard();
       }
       else if (code == 40) {  // down
           flipBoardLR();      // Requires only a flipLeftRight
           processBoardUp();
           flipBoardLR();      // Revert to original orientation
           drawBoard();
       }

       if (isGameFinished()) {
           alert("Game over");
       }
   }

   // isGameFinished() returns true if there are no more moves possible on the board
   // or false otherwise
   function isGameFinished() {
       if (emptyPlaces.length > 0) {
          return false;    // There are still empty places
       }

       // Check the board to see if there are any consecutive numbers that can be added
       for (i = 0; i < 4; i++) {
           for (j = 0; j < 4; j++) {
               if (j < 3) {
                   if (board[i][j] == board[i][j+1])
                       return false;   // Found a match
               }
               if (i < 3) {
                   if (board[i][j] == board[i+1][j])
                       return false;   // Found a match
               }
           }
       }
       return true;
   }

   // Transpose the board from (i,j) to (j,i)
   function transposeBoard() {
       for (i = 0; i < 4; i++) {
           for (j = i+1; j < 4; j++) {
               var tmp = board[i][j];
               board[i][j] = board[j][i];
               board[j][i] = tmp;
           }
       }
   }

   // Flip the board left to right
   function flipBoardLR() {
       for (i = 0; i < 4; i++) {
           for (j = 0; j < 2; j++) {
               var tmp = board[i][j];
               board[i][j] = board[i][3 - j];
               board[i][3 - j] = tmp;
           }
       }
   }

   // processBoardUp() is called to reduce each row of the board from right to left
   // by moving all numbers to the left and replacing matching numbers with their sum.
   // E.g. [0 2 0 2] is reduced to [4 0 0 0]
   function processBoardUp() {
       emptyPlaces = [];   // Reset the emptyPlaces list

       // Process each row of the board at the time. E.g. [0 2 0 2] -> [4 0 0 0]
       for (i = 0; i < 4; i++) {
           // First remove all the zeros from row i, E.g. [0 2 0 2] => [2 2 0 0]
           j = 0;
           while (j < board[i].length) {
               if (board[i][j] == 0) {
                   board[i].splice(j, 1);
               }
               else {
                   j++;
               }
           }
           // Push zeros at the end to make sure the length of row i is still 4
           for (j = board[i].length; j < 4; j++) {
               board[i].push(0);
           }

           // Now check consecutive nonzero entries to see if they are equal and then sum and
           // remove. E.g. [2 2 0 0] -> [4 0 0 0]
           for (j = 0; j < 4; j++) {
               if (board[i][j] == board[i][j+1]) {
                   // Replace (i,j) with the sum and remove (i,j+1)
                   sumAndRemove(i, j);
               }
           }

           // Now put the indices of the empty boxes in the emptyPlaces array
           for (j = 0; j < 4; j++) {
               if (board[i][j] == 0) {
                   emptyPlaces.push(i * 4 + j);
               }
           }
       }

       // Add a new piece to the board
       newPiece();

       console.log(board);
       console.log(emptyPlaces);
   }

   // Sum board at (i,j) and then remove (i, j+1). Also a zero to the end of the row
   function sumAndRemove( i,  j) {
       board[i][j] = board[i][j] + board[i][j+1];
       board[i].splice(j + 1, 1);  // Remove entry at j+1
       board[i].push(0);           // and push a 0 to the end
   }

   // newPiece() uses random numbers to choose a value from emptyPlaces array. It then
   // puts either a 2 or a 4 in this location on the board.
   function newPiece() {
       // Choose random integer between 0 and emptyPlaces.length-1
       var index = Math.floor(Math.random() * (emptyPlaces.length));
       console.log("index = " + index);
       // Convert emptyPlaces[index] to two indices (row, col)
       row = getRow(emptyPlaces[index], 4);
       col = getCol(emptyPlaces[index], 4);
       board[row][col] = Math.ceil(Math.random() * 2) * 2;  // generate 4 or a 2
       emptyPlaces.splice(index, 1);   // remove selected box from emptyPlaces array

       console.log(board);
       console.log(emptyPlaces);

   }

   // getRow(ind, full) returns the row index from the given ind with size=full.
   // E.g. for ind = 11 and full = 4, then row is 3
   function getRow(ind, full) {
       return Math.floor(ind / full);
   }

   // getCol(ind, full) returns the column index from the given ind with size=full.
   // E.g. for ind = 11 and full = 4, then col = 3
   function getCol(ind, full) {
       return ind % full;
   }

   // drawBoard() clears the canvas and then repaints everything according to the
   // new contents in the board array
   function drawBoard() {
       // First, erase whatever is in the canvas
       context.clearRect(0, 0, canvas.width, canvas.height);

       // Draw the 4 x 4 grid
       context.beginPath();
       for (i = 0; i < 3; i++) {
           context.moveTo((i+1) * boxSize, 0);
           context.lineTo((i+1) * boxSize, size);
           context.moveTo(0, (i+1) * boxSize);
           context.lineTo(size, (i+1) * boxSize);
       }
       context.stroke();

       // Fill in the grid according to values in the board
       for (i = 0; i < 4; i++) {
           for (j = 0; j < 4; j++) {
               if (board[i][j] != 0) {
                  context.font = "30px Arial";
                  context.textAlign = "center";
                  context.fillStyle = setColor(board[i][j]);
                  context.fillRect(i * boxSize, j * boxSize, boxSize, boxSize);
                  context.stroke();
                  context.fillStyle = "#000000";
                  context.fillText(board[i][j], i * boxSize + boxHalfsize, j * boxSize + boxHalfsize);
               }
           }
       }
   }

   // Choose the color of the box relative to the value in the box
   // The colors are shades of yellow
   function setColor(value) {
       if (value ==2)
           return "#fffbe6";
       else if (value == 4)
           return "#fff7cc";
       else if (value == 8)
           return "#fff4b3";
       else if (value == 16)
           return "#fff099";
       else if (value == 32)
           return "#ffec80";
       else if (value == 64)
           return "#ffe866";
       else if (value == 128)
           return "#ffe44d";
       else if (value == 256)
           return "#ffe033";
       else if (value == 512)
           return "#ffd700";
       else if (value == 1024)
           return "#e6c300";
       else
           return "#ccad00";
   }
