document.addEventListener('DOMContentLoaded', () => {

    const width = 10;
    let nextRandom = 0;
    let fallSpeed = 600;
    let speedMode = 3;

    const grid = document.querySelector('.grid');
    let squares = Array.from(document.querySelectorAll('.grid div'));

    const scoreDisplay = document.querySelector('#score');
    const startBtn = document.querySelector('#start-button');

    const speedUpBtn = document.querySelector('#speedUp');
    const speedDownBtn = document.querySelector('#speedDown');
    const speedModeDisplay = document.querySelector('#speedMode');
    speedModeDisplay.innerHTML = speedMode;

    const audio = document.querySelector('#music');
    audio.volume = 0.3;
    const hardModeAudio = document.querySelector('#hard-mode-music');
    hardModeAudio.volume = 0.3;

    const openRulesBtn = document.querySelector('#open-rules');
    const closeRulesBtn = document.querySelector('#close-rules');

    const challengerModeBtn = document.querySelector('#challenger-mode-button');

    let timerId;
    let score = 0;
    let isGameOver = false;

    let colors = [
        'orange',
        'red',
        'purple',
        'green',
        'blue'
    ];

    // Tetraminoes list
    const lTetromino = [
        [1, width + 1, width * 2 + 1, 2],
        [width, width + 1, width + 2, width * 2 + 2],
        [1, width + 1, width * 2 + 1, width * 2],
        [width, width * 2, width * 2 + 1, width * 2 + 2]
    ];

    const zTetromino = [
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1],
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1]
    ];

    const tTetromino = [
        [1, width, width + 1, width + 2],
        [1, width + 1, width + 2, width * 2 + 1],
        [width, width + 1, width + 2, width * 2 + 1],
        [1, width, width + 1, width * 2 + 1]
    ];

    const oTetromino = [
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1]
    ];

    const iTetromino = [
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3],
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3]
    ];

    const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino];

    // Start position
    let currentPosition = 4;
    let currentRotation = 0;

    // Random select
    let random = Math.floor(Math.random() * theTetrominoes.length);
    let current = theTetrominoes[random][currentRotation];

    // Draw the tetramino
    function draw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.add('tetromino');
            squares[currentPosition + index].style.backgroundColor = colors[random];
        });
    }

    // Undraw the tetramino
    function undraw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.remove('tetromino');
            squares[currentPosition + index].style.backgroundColor = '';
        })
    }

    // Assign functions to keyCodes
    function control(e) {
        switch (e.keyCode) {
            case 37:
                moveLeft();
                break;
            case 38:
                rotate();
                break;
            case 39:
                moveRight();
                break;
            case 40:
                moveDown();
                break;
        }
    }
    document.addEventListener('keyup', control);

    // Move down function
    function moveDown() {
        undraw();
        currentPosition += width;
        draw();
        freeze();
    }

    // Freeze function
    function freeze() {
        if (current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
            current.forEach(index => squares[currentPosition + index].classList.add('taken'));

            // Start new tetromino fall
            random = nextRandom;
            nextRandom = Math.floor(Math.random() * theTetrominoes.length);
            current = theTetrominoes[random][currentRotation];
            currentPosition = 4;
            draw();
            displayShape();
            addScore();
            gameOver();
        }
    }

    // Move left function
    function moveLeft() {
        undraw();

        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);

        if (!isAtLeftEdge) {
            currentPosition -= 1;
        }

        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition += 1;
        }

        draw();
    }

    // Move right function
    function moveRight() {
        undraw();

        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1);

        if (!isAtRightEdge) {
            currentPosition += 1;
        }

        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition -= 1;
        }

        draw();
    }

    // Rotate the tetramino
    function rotate() {
        undraw();

        nextRotation = currentRotation + 1;
        if (nextRotation === current.length) {
            nextRotation = 0;
        }
        next = theTetrominoes[random][nextRotation];

        const isAtRight = next.some(index => (currentPosition + index) % width === width - 1);
        const isAtLeft = next.some(index => (currentPosition + index) % width === 0);
        const isCanRotate = !(isAtLeft && isAtRight);

        if (isCanRotate) {
            currentRotation++;
            if (currentRotation === current.length) {
                currentRotation = 0;
            }
        }

        current = theTetrominoes[random][currentRotation];
        draw();
    }

    // Show next tetromino
    const displaySquares = document.querySelectorAll('.mini-grid div');
    const displayWidth = 4;
    let displayIndex = 0;

    // Tetromino without rotations
    const upNextTetrominoes = [
        [1, displayWidth + 1, displayWidth * 2 + 1, 2], // lTetromino
        [0, displayWidth, displayWidth + 1, displayWidth * 2 + 1], // zTetromino
        [1, displayWidth, displayWidth + 1, displayWidth + 2], // tTetromino
        [0, 1, displayWidth, displayWidth + 1], // oTetromino
        [displayWidth, displayWidth + 1, displayWidth + 2, displayWidth + 3] // iTetromino
    ];

    // Display tetromino on mini-grid
    function displayShape() {

        displaySquares.forEach(square => {
            square.classList.remove('tetromino');
            square.style.backgroundColor = '';
        });

        upNextTetrominoes[nextRandom].forEach(index => {
            displaySquares[displayIndex + index].classList.add('tetromino');
            displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandom];
        });
    }

    // Add functionality to the button
    startBtn.addEventListener('click', () => {
        if (isGameOver) {
            location.reload();
        }

        if (timerId) {
            clearInterval(timerId);
            timerId = null;

            audio.pause();
            hardModeAudio.pause();
        } else {
            hardModeAudio.pause();
            audio.play();

            draw();

            timerId = setInterval(moveDown, fallSpeed);

            displayShape();
        }
    })

    // Add score
    function addScore() {
        for (let i = 0; i < 199; i += width) {
            const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9];

            if (row.every(index => squares[index].classList.contains('taken'))) {
                score += 10;
                scoreDisplay.innerHTML = score;

                row.forEach(index => {
                    squares[index].classList.remove('taken');
                    squares[index].classList.remove('tetromino')
                    squares[index].style.backgroundColor = '';
                });

                const squaresRemoved = squares.splice(i, width);
                squares = squaresRemoved.concat(squares);
                squares.forEach(cell => grid.appendChild(cell));
            }
        }
    }

    // Add game over
    function gameOver() {
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            scoreDisplay.innerHTML = 'Game Over';
            clearInterval(timerId);
            isGameOver = true;
            document.removeEventListener('keyup', control);
            speedUpBtn.disabled = 'true';
            speedDownBtn.disabled = 'true';
            challengerModeBtn.disabled = 'true';
        }
    }

    // Change fall speed
    function changeFallSpeed(changeSpeed) {

        if (timerId) {
            clearInterval(timerId);
            timerId = null;
            fallSpeed = changeSpeed(fallSpeed);
            timerId = setInterval(moveDown, fallSpeed);
        } else {
            fallSpeed = changeSpeed(fallSpeed);
        }

    }

    // Speed up fall speed
    speedUpBtn.addEventListener('click', () => {
        if ((speedMode + 1) <= 5) {
            speedMode++;
            speedModeDisplay.innerHTML = speedMode;

            changeFallSpeed(index => index -= 200);
        }
    });

    // Slow down fall speed
    speedDownBtn.addEventListener('click', () => {
        if ((speedMode - 1) >= 1) {
            speedMode--;
            speedModeDisplay.innerHTML = speedMode;

            changeFallSpeed(index => index += 200);
        }
    });

    // Open rules window
    openRulesBtn.addEventListener('click', () => {
        let shadow = document.querySelector('.shadow');
        let rulesBox = document.querySelector('.rules');

        shadow.style.display = 'flex';
        rulesBox.style.display = 'flex';
    });

    // Close rules window
    closeRulesBtn.addEventListener('click', () => {
        let shadow = document.querySelector('.shadow');
        let rulesBox = document.querySelector('.rules');

        shadow.style.display = 'none';
        rulesBox.style.display = 'none';
    });

    challengerModeBtn.addEventListener('click', () => {
        speedUpBtn.disabled = 'true';
        speedDownBtn.disabled = 'true';
        isGameOver = true;

        clearInterval(timerId);
        timerId = null;
        timerId = setInterval(moveDown, 1000);

        audio.pause();
        hardModeAudio.play();

        colors = [
            'red',
            'red',
            'red',
            'red',
            'red'
        ];

        document.querySelector("body").style.backgroundImage = 'radial-gradient(rgb(112, 15, 15), rgb(36, 12, 12))';
        document.querySelector('#start-button').style.backgroundImage = 'radial-gradient(rgb(112, 15, 15), rgb(36, 12, 12))';
        document.querySelector('#speedUp').style.backgroundImage = 'radial-gradient(rgb(112, 15, 15), rgb(36, 12, 12))';
        document.querySelector('#speedDown').style.backgroundImage = 'radial-gradient(rgb(112, 15, 15), rgb(36, 12, 12))';
        document.querySelector('#open-tutor').style.backgroundImage = 'radial-gradient(rgb(112, 15, 15), rgb(36, 12, 12))';
        document.querySelector('#challenger-mode-button').style.backgroundImage = 'radial-gradient(rgb(112, 15, 15), rgb(36, 12, 12))';
        document.querySelector('#open-rules').style.backgroundImage = 'radial-gradient(rgb(112, 15, 15), rgb(36, 12, 12))';

        let speedChange = Math.abs(60 - fallSpeed);
        changeFallSpeed(index => index -= speedChange);
    });

})