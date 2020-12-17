Pong = 
{
    Defaults:
    {
        width: 640,
        height: 480,
        wallWidth: 10,
        paddleWidth: 12,
        paddleHeight: 64,
        paddleSpeed: 1.5,
        ballSpeed: 4,
        ballAcceleration: 8,
        ballRad: 7,
        sound: true
    },

    Colors: 
    {
        courtWalls: 'white',
        ball: 'yellow',
        text: 'white',
        trail: 'white',
        guess: 'magenta',
        exact: 'lime'
    },

    Assets: /**/
    [
        "img/press1.png",
        "img/press2.png",
        "img/winner.png"
    ],

    Levels:
    [
        {aiReactionTime: 0.2, aiMaxError:  20}, // ai losing by 7 points
        {aiReactionTime: 0.4, aiMaxError:  20}, // ai losing by 6 points
        {aiReactionTime: 0.5, aiMaxError:  30}, // ai losing by 5 points
        {aiReactionTime: 0.6, aiMaxError:  40}, // ai losing by 4 points
        {aiReactionTime: 0.7, aiMaxError:  50}, // ai losing by 8 points
        {aiReactionTime: 0.8, aiMaxError:  60}, // ai losing by 3 points
        {aiReactionTime: 0.9, aiMaxError:  70}, // ai losing by 2 points
        {aiReactionTime: 0.9, aiMaxError:  80}, // ai losing by 1 points
        {aiReactionTime: 1.0, aiMaxError: 100}, // tie
        {aiReactionTime: 1.1, aiMaxError: 120}, // ai leading by 1 points
        {aiReactionTime: 1.2, aiMaxError: 140}, // ai leading by 2 points
        {aiReactionTime: 1.3, aiMaxError: 160}, // ai leading by 3 points
        {aiReactionTime: 1.4, aiMaxError: 180}, // ai leading by 4 points
        {aiReactionTime: 1.5, aiMaxError: 180}, // ai leading by 5 points
        {aiReactionTime: 1.6, aiMaxError: 200}, // ai leading by 6 points
        {aiReactionTime: 1.8, aiMaxError: 200}, // ai leading by 7 points
        {aiReactionTime: 2.0, aiMaxError: 200}  // ai leading by 8 points
    ],

    /* Pong funcitons */
    initialize: function(runner, cfg) /**/
    {
        Game.loadImages(Pong.Assets, function(assets) 
        {
            this.cfg = cfg;
            this.runner = runner;
            this.width = runner.width;
            this.height = runner.height;
            this.assets = assets;
            this.isPlaying   = false; //
            this.score = [0, 0]; //
            this.menu = Object.construct(Pong.Menu, this);
            this.court = Object.construct(Pong.Court, this);
            this.leftPaddle = Object.construct(Pong.Paddle, this);
            this.rightPaddle = Object.construct(Pong.Paddle, this, true);
            this.ball = Object.construct(Pong.Ball, this);
            this.sfx = Object.construct(Pong.SFX, this);
            this.runner.start();
        }.bind(this));
    },

    startAI: function() { this.start(0); }, //
    startOne: function() { this.start(1); }, //
    startTwo: function() { this.start(2); }, //

    start: function(pNum) /**/
    {
        if (!this.isPlaying)
        {
            this.score = [0, 0];
            this.isPlaying = true;
            this.leftPaddle.setAI(pNum < 1, this.level(0));
            this.rightPaddle.setAI(pNum < 2, this.level(1));
            this.ball.reset();
            this.sfx.start();
        }
    },

    stop: function(dialog) /**/
    {
        if (this.isPlaying)
        {
            if (!dialog || this.runner.confirm('Quit game?'))
            {
                this.isPlaying = false;
                this.leftPaddle.setAI(false);
                this.rightPaddle.setAI(false);
            }
        }
    },

    level: function(player)
    {
        return 8 + (this.score[player] - this.score[player ? 0 : 1]);
    },

    goal: function(player) /**/
    {
        this.score[player] += 1;
        this.sfx.goal();
        if (this.score[player] >= this.cfg.winpoint)
        {
            this.menu.declareWinner(player);
            this.stop();
            this.sfx.win();
        }
        else
        {
            this.ball.reset(player);
            this.leftPaddle.setLevel(this.level(0));
            this.rightPaddle.setLevel(this.level(1));
        }
    },

    update: function(dt) /**/
    {
        this.leftPaddle.update(dt, this.ball);
        this.rightPaddle.update(dt, this.ball);

        if (this.isPlaying)
        {
            var dx = this.ball.dx;
            var dy = this.ball.dy;
            
            this.ball.update(dt, this.leftPaddle, this.rightPaddle);

            /* Sound event handler */
            if (this.ball.dx < 0 && dx > 0)
                this.sfx.ping();
            else if (this.ball.dx > 0 && dx < 0)
                this.sfx.ping();
            else if (this.ball.dy * dy < 0)
                this.sfx.wall();

            /* Goal Checker */
            if (this.ball.left > this.width)
                this.goal(0);
            else if (this.ball.right < 0)
                this.goal(1);
        }
    },

    draw: function(canvas) /**/
    {
        this.court.draw(canvas, this.score[0], this.score[1]);
        this.leftPaddle.draw(canvas);
        this.rightPaddle.draw(canvas);
        this.isPlaying ? this.ball.draw(canvas) : this.menu.draw(canvas);
        if (this.cfg.legend)
            this.drawLegend(canvas);
    },

    drawLegend: function(canvas)
    {
        var offset = 0;
        this.cfg.stats ? offset = 60 : offset = 0;

        canvas.fillStyle = "Cyan";
        canvas.fillText("Prediction Box Legend", 5, this.height - 35 - offset);
        canvas.fillStyle = this.Colors.exact;
        canvas.fillText("> Real Landing Zone", 5, this.height - 25 - offset);
        canvas.fillStyle = this.Colors.guess;
        canvas.fillText("> Predicted Landing Zone", 5, this.height - 15 - offset);
    },

    onkeydown: function(key) /**/
    {
        switch(key)
        {
            case Game.KEY.ZERO: this.startAI(); break; //
            case Game.KEY.ONE: this.startOne(); break; //
            case Game.KEY.TWO: this.startTwo(); break; //
            case Game.KEY.ESC: this.stop(true); break; //
            case Game.KEY.Q: if (!this.leftPaddle.auto) this.leftPaddle.moveUp(); break;
            case Game.KEY.A: if (!this.leftPaddle.auto) this.leftPaddle.moveDown(); break;
            case Game.KEY.P: if (!this.rightPaddle.auto) this.rightPaddle.moveUp(); break;
            case Game.KEY.L: if (!this.rightPaddle.auto) this.rightPaddle.moveDown(); break;
        }
    },

    onkeyup: function(keyCode) /**/
    {
        switch(keyCode) 
        {
            case Game.KEY.Q: if (!this.leftPaddle.auto) this.leftPaddle.stopMovingUp(); break;
            case Game.KEY.A: if (!this.leftPaddle.auto) this.leftPaddle.stopMovingDown(); break;
            case Game.KEY.P: if (!this.rightPaddle.auto) this.rightPaddle.stopMovingUp(); break;
            case Game.KEY.L: if (!this.rightPaddle.auto) this.rightPaddle.stopMovingDown(); break;
        }
    },

    showStats: function(enabled) { this.cfg.stats = enabled; },
    showTrail: function(enabled) { this.cfg.trails = enabled; this.ball.footprints = []; },
    showPredictions: function(on) { this.cfg.predictions = enabled; },
    showLegend: function(enabled) { this.cfg.legend = enabled; },
    sfxEnable: function(enabled) { this.cfg.sfx = enabled; },
    setPoint: function(point) { this.cfg.winpoint = point; },

    // Menu handler. Displays the score and game text.
    Menu: /**/
    {
        initialize: function(pong) 
        {
            var leftMenu = pong.assets["img/press1.png"];
            var rightMenu = pong.assets["img/press2.png"];
            var winText = pong.assets["img/winner.png"];
            this.leftMenu = { assets: leftMenu, x: 10, y: pong.cfg.wallWidth };
            this.rightMenu = { assets: rightMenu, x: (pong.width - rightMenu.width - 10), y: pong.cfg.wallWidth };
            this.leftWin = { assets: winText, x: (pong.width/2) - winText.width - pong.cfg.wallWidth, y: 6 * pong.cfg.wallWidth };
            this.rightWin = { assets: winText, x: (pong.width/2) + pong.cfg.wallWidth, y: 6 * pong.cfg.wallWidth };
        },

        declareWinner: function(pNum) { this.winner = pNum; },

        draw: function(canvas) 
        {
            canvas.drawImage(this.leftMenu.assets, this.leftMenu.x, this.leftMenu.y);
            canvas.drawImage(this.rightMenu.assets, this.rightMenu.x, this.rightMenu.y);
            if (this.winner == 0)
                canvas.drawImage(this.leftWin.assets, this.leftWin.x, this.leftWin.y);
            else if (this.winner == 1)
                canvas.drawImage(this.rightWin.assets, this.rightWin.x, this.rightWin.y);
        }
    },

    // Game sound effects handler
    SFX:
    {
        initialize: function(pong)
        {
            this.game = pong;
            this.supportsAudio = Game.ua.hasAudio; /* Might change UA */

            if (this.supportsAudio)
            {
                this.audioAssets =
                {
                    ping: Game.createAudio("sfx/ping.wav"),
                    wall: Game.createAudio("sfx/wall.wav"),
                    goal: Game.createAudio("sfx/goal.wav"),
                    start: Game.createAudio("sfx/start.wav"),
                    win: Game.createAudio("sfx/win.wav")
                };
            }
        },

        triggerSound: function(soundEffect)
        {
            if (this.supportsAudio && this.game.cfg.sfx && this.audioAssets[soundEffect])
                this.audioAssets[soundEffect].play();
        },

        ping: function() { this.triggerSound('ping'); },
        wall: function() { this.triggerSound('wall'); },
        goal: function() { this.triggerSound('goal'); },
        start: function() { this.triggerSound('start'); },
        win: function() { this.triggerSound('win'); }
    },    

    /* Pong game objects */
    // Game court - Including the score panel
    Court: /**/
    {
        initialize: function(pong)
        {
            // Global menu properties
            var x = pong.width;
            var y = pong.height;
            var th = pong.cfg.wallWidth;

            // Walls properties
            this.th = th;
            this.courtWalls = [];
            this.courtWalls.push({x: 0, y: 0, width: x, height: th}) // Draw top walls
            this.courtWalls.push({x: 0, y: y-th, width: x, height: th}) // Draw bottom walls
            
            var maxLen = (y/(th*2));

            for(var i = 0 ; i < maxLen ; i++) // draw dashed halfway line
            {
                this.courtWalls.push({x: (x/2) - (th/2), y: (th/2) + (th*2*i), width: th, height: th});
            }
            
            // Score panel properties
            var scoreX = 3*th;
            var scoreY = 4*th;
            var scoreModifier = 0.5;
            this.leftScore = {x: scoreModifier + x/2 - 1.5*th - scoreX, y: 2*th, width: scoreX, height: scoreY};
            this.rightScore = {x: scoreModifier + x/2 - 1.5*th + scoreX, y: 2*th, width: scoreX, height: scoreY};
        },

        // Seven segment binary table
        CharacterMap: /**/
        [
            [1, 1, 1, 0, 1, 1, 1], // 0
            [0, 0, 1, 0, 0, 1, 0], // 1
            [1, 0, 1, 1, 1, 0, 1], // 2
            [1, 0, 1, 1, 0, 1, 1], // 3
            [0, 1, 1, 1, 0, 1, 0], // 4
            [1, 1, 0, 1, 0, 1, 1], // 5
            [1, 1, 0, 1, 1, 1, 1], // 6
            [1, 0, 1, 0, 0, 1, 0], // 7
            [1, 1, 1, 1, 1, 1, 1], // 8
            [1, 1, 1, 1, 0, 1, 0]  // 9
        ],

        sevenSegment: function(canvas, numval, x, y, w, h)
        {
			canvas.fillStyle = Pong.Colors.score;
			var dw = dh = this.th*4/5;
			var segments = Pong.Court.CharacterMap[numval];
			
			if (segments[0])
				canvas.fillRect(x, y, w, dh);
			if (segments[1])
				canvas.fillRect(x, y, dw, h/2);
			if (segments[2])
				canvas.fillRect(x+w-dw, y, dw, h/2);
			if (segments[3])
				canvas.fillRect(x, y + h/2 - dh/2, w, dh);
			if (segments[4])
				canvas.fillRect(x, y + h/2, dw, h/2);
			if (segments[5])
				canvas.fillRect(x+w-dw, y + h/2, dw, h/2);
			if (segments[6])
				canvas.fillRect(x, y+h-dh, w, dh);
        },

        draw: function(canvas, p1score, p2score)
        {
            canvas.fillStyle = Pong.Colors.courtWalls;

            for (var i = 0; i < this.courtWalls.length; i++)
                canvas.fillRect(this.courtWalls[i].x, this.courtWalls[i].y, this.courtWalls[i].width, this.courtWalls[i].height);
            
            this.sevenSegment(canvas, p1score, this.leftScore.x, this.leftScore.y, this.leftScore.width, this.leftScore.height);
            this.sevenSegment(canvas, p2score, this.rightScore.x, this.rightScore.y, this.rightScore.width, this.rightScore.height);
        }
    },

    //Game Paddle - To hit the ball in the Pong game
    Paddle: {
        //initialization for the paddle
        initialize: function(pong, rhs) {
            this.pong   = pong;
            this.width  = pong.cfg.paddleWidth;
            this.height = pong.cfg.paddleHeight;
            this.minY   = pong.cfg.wallWidth;
            this.maxY   = pong.height - pong.cfg.wallWidth - this.height;
            this.speed  = (this.maxY - this.minY) / pong.cfg.paddleSpeed;
            this.setpos(rhs ? pong.width - this.width - 10 : 10, this.minY + (this.maxY - this.minY)/2);
            this.setdir(0);
        },

        //setting the paddle position
        setpos: function(x, y) {
            this.x      = x;
            this.y      = y;
            this.left   = this.x;
            this.right  = this.left + this.width;
            this.top    = this.y;
            this.bottom = this.y + this.height;
        },

        //setting the paddle movement directions
        //since the paddle only moves up and down, the coordinates that will be changed is only y
        setdir: function(dy) {
            this.up   = (dy < 0 ? -dy : 0);
            this.down = (dy > 0 ?  dy : 0);
        },

        //set the AI when there is a vacancy in the player (1P or 0P)
        setAI: function (on, level) {
            //if the ai feature is turned on or only 1 player
            //the ai level will start with the initialized difficulty level
            if (on && !this.auto) {
                this.auto = true;
                this.setLevel(level);
            }
            else if (!on && this.auto) {
                this.auto = false;
                this.setdir(0);//set the paddle position to the beginning position (immobile)
            }
        },

        //set AI levels when the CPU starts to run
        setLevel: function (level) {
            if (this.auto)
                this.level = Pong.Levels[level];
        },

        //updating the paddle status when the paddle is moving
        //set the new paddle position
        update: function (dt, ball) {
            if (this.auto)
                this.paddleAI(dt, ball);

            var paddleMovement = this.down - this.up;
            if (paddleMovement != 0) {
            var new_y = this.y + (paddleMovement * dt * this.speed);//new coordinate for the paddle
            if (new_y < this.minY)
            new_y = this.minY;
            else if (new_y > this.maxY)
            new_y = this.maxY;
            this.setpos(this.x, new_y);
            }
        },

        //set the AI to the CPU player
        paddleAI: function (dt, ball) {
            //when the ball is moving away from the CPU
            //CPU paddle stops moving up and down
            if (((ball.x < this.left) && (ball.dx < 0)) || ((ball.x > this.right) && (ball.dx > 0))) {
                this.stopMovingUp();
                this.stopMovingDown();
                return;
            }

            //CPU predicts the ball movement
            this.predict(ball, dt);

            //if the CPU has done its prediction, the CPU move to the predicted position
            if (this.prediction) {
                //if the prediction is too low than the exact position
                //CPU moves the paddle up
                if (this.prediction.y < (this.top + (this.height / 2) - 5)) {
                    this.stopMovingDown();
                    this.moveUp();
                }
                //if the prediction is too high than the exact position
                //CPU moves the paddle down
                else if (this.prediction.y > (this.bottom - (this.height / 2) + 5)) {
                    this.stopMovingUp();
                    this.moveDown();
                }
                //if the prediction is almost exact in the correct position
                //CPU stops moving
                else {
                    this.stopMovingUp();
                    this.stopMovingDown();
                }
            }
        },

        //prediction function for the CPU
        predict: function (ball, dt) {
            //re-predict the ball position when the ball has changed its direction, or it has not predict the position for some interval of time
            if (this.prediction && ((this.prediction.dx * ball.dx) > 0) && ((this.prediction.dy * ball.dy) > 0) && (this.prediction.last < this.level.aiReactionTime)) {
                this.prediction.last += dt;
                return;
            }
            //checks whether the paddle is intercepting the ball
            var pt = Pong.Helper.ball_intercept(ball, { left: this.left, right: this.right, top: -10000, bottom: 10000 }, ball.dx * 10, ball.dy * 10);
            if (pt) {
                //calculating the intercept of the ball in the court
                var top = this.minY + ball.radius;
                var bottom = this.maxY + this.height - ball.radius;

                //repeatedly predict until the ball has reached the paddle's side
                while ((pt.y < top) || (pt.y > bottom)) {
                    if (pt.y < top) {
                        pt.y = top + (top - pt.y);//bounce the prediction to the top
                    }
                    else if (pt.y > bottom) {
                        pt.y = top + (bottom - top) - (pt.y - bottom)//bounce the prediction to the bottom
                    }
                }
                this.prediction = pt;
            }
            else {
                this.prediction = null;
            }

            //add the AI error movement to make the impression that the AI is guessing the ball position
            if (this.prediction) {
                this.prediction.last = 0;
                this.prediction.dx = ball.dx;
                this.prediction.dy = ball.dy;
                this.prediction.radius = ball.radius;
                this.prediction.exactX = this.prediction.x;
                this.prediction.exactY = this.prediction.y;
                var ball_closeness = (ball.dx < 0 ? ball.x - this.right : this.left - ball.x) / this.pong.width;
                var errorGuess = this.level.aiMaxError * ball_closeness;
                this.prediction.y = this.prediction.y + Game.random(-errorGuess, errorGuess);
            }
        },

        //draw the paddle object
        draw: function(canvas) {
            canvas.fillStyle = Pong.Colors.walls;
            canvas.fillRect(this.x, this.y, this.width, this.height);
            
            // Prediction Overlay handler
            if (this.prediction && this.pong.cfg.predictions) {
                canvas.strokeStyle = Pong.Colors.exact;
                canvas.strokeRect(this.prediction.x - this.prediction.radius, this.prediction.exactY - this.prediction.radius, this.prediction.radius * 2, this.prediction.radius * 2);
                canvas.strokeStyle = Pong.Colors.guess;
                canvas.strokeRect(this.prediction.x - this.prediction.radius, this.prediction.y - this.prediction.radius, this.prediction.radius * 2, this.prediction.radius * 2);
            }
        },

        moveUp: function() { this.up   = 1; },
        moveDown: function() { this.down = 1; },
        stopMovingUp: function() { this.up   = 0; },
        stopMovingDown: function() { this.down = 0; }

    },

    //Game Ball - Ball object in the Pong game that is hit by the paddle
    Ball: {
        /*Ball Class*/
        //initialization function for the ball
        initialize: function(pong) {
            this.pong = pong;
            this.radius = pong.cfg.ballRad;//determine the radius of the ball from the ball radius' data in the configuration class
            this.minX = this.radius;
            this.maxX = pong.width - this.radius;
            this.minY = pong.cfg.wallWidth + this.radius;
            this.maxY = pong.height - pong.cfg.wallWidth - this.radius;
            this.speed = (this.maxX - this.minX) / pong.cfg.ballSpeed;
            this.accel = pong.cfg.ballAcceleration;
        },

        //reset the ball speed and position during the beginning of the game or when one of the paddle is able to score a point
        //in the beginning, the ball will always starts at left side player (player = 0) and the direction is approaching right side player (player = 1)
        //if the player in the right hand side scores a ball, the ball will start in the right position
        reset: function(player) {
            this.footprints = [];
            this.setpos(player == 1 ? this.maxX : this.minX, Game.random(this.minY, this.maxY));
            this.setdir(player == 1 ? -this.speed : this.speed, this.speed);
        },

        //set the ball position during the game
        setpos: function(x, y) {
            this.x = x;
            this.y = y;
            this.left = this.x - this.radius;
            this.top = this.y - this.radius;
            this.right = this.x + this.radius;
            this.bottom = this.y + this.radius;
        },

        //set the ball direction/movements
        setdir: function (dx, dy) {
            this.dxChanged = ((this.dx < 0) != (dx < 0)); //horizontal direction change on the ball
            this.dyChanged = ((this.dy < 0) != (dy < 0)); //vertical direction change on the ball
            this.dx = dx;
            this.dy = dy;
        },

        //function for ball's trails
        trail: function () {
            if (this.pong.cfg.trails) {
                if (!this.trailCount || this.dxChanged || this.dyChanged) {
                    //inserting the coordinate of the ball to the footprint
                    this.footprints.push({ x: this.x, y: this.y });
                    //if the footprint length has reached 300, remove the footprint one by one
                    if (this.footprints.length > 25)
                        this.footprints.shift();
                    //counter to print the footprints
                    this.trailCount = 5;
                }
                //if the footprint counter is starting, reduce the counter until 0 to produce new footprint
                else {
                    this.trailCount--;
                }
            }
        },

        //updating the ball status (new position, speed, collision detection and direction)
        update: function(dt, leftPaddle, rightPaddle) {
            //determine the new position and speed of the ball
            new_pos = Pong.Helper.ball_accelerate(this.x, this.y, this.dx, this.dy, this.accel, dt);
            
            //collision detection between the ball and the top/bottom wall during the game
            if ((new_pos.dy > 0) && (new_pos.y > this.maxY)) {
                new_pos.y = this.maxY;
                new_pos.dy = -new_pos.dy;
            }
            else if ((new_pos.dy < 0) && (new_pos.y < this.minY)) {
                new_pos.y = this.minY;
                new_pos.dy = -new_pos.dy;
            }
            
            //collision detection between the ball and paddles during the game
            var paddle = (new_pos.dx < 0) ? leftPaddle : rightPaddle;
            var pt = Pong.Helper.ball_intercept(this, paddle, new_pos.nx, new_pos.ny);//determining the ball position

            if (pt) {
                switch (pt.d) {
                    case 'left':
                    case 'right':
                        new_pos.x = pt.x;
                        new_pos.dx = -new_pos.dx;
                        break;
                    case 'top':
                    case 'bottom':
                        new_pos.y = pt.y;
                        new_pos.dy = -new_pos.dy;
                        break;
                }

                // add or remove the spin if the ball is moving to the paddle
                if (paddle.up)
                    new_pos.dy = new_pos.dy * (new_pos.dy < 0 ? 0.5 : 1.5);
                else if (paddle.down)
                    new_pos.dy = new_pos.dy * (new_pos.dy > 0 ? 0.5 : 1.5);
            }
            
            //set the new position and direction for the ball after collision with the paddle/wall
            this.setpos(new_pos.x,  new_pos.y);
            this.setdir(new_pos.dx, new_pos.dy);
            this.trail();
        },
        
        draw: function(canvas) {
            var w = h = this.radius * 2;
            
            canvas.fillStyle = Pong.Colors.ball;
            canvas.beginPath();
            canvas.arc(this.x, this.y, this.radius, 0, 2*Math.PI, true);
            canvas.fill();
            canvas.closePath();
        
            //drawing the footprints of the ball
            if (this.pong.cfg.trails) {
                var maxTrail = this.footprints.length;
                canvas.strokeStyle = Pong.Colors.trail;
                for (var i = 0; i < maxTrail; i++) {
                    canvas.strokeRect(this.footprints[i].x - this.radius, this.footprints[i].y - this.radius, w, h);
                }
            }
        }
    },

    /* Game Helper Class. Contains helper functions. */

    Helper: {
        //acceleration function for the ball during the game
        ball_accelerate: function (x, y, dx, dy, accel, dt) {
            var pos_x2 = x + (dt * dx) + (accel * dt * dt * 0.5);
            var pos_y2 = y + (dt * dy) + (accel * dt * dt * 0.5);
            var dir_x2 = dx + (accel * dt) * (dx > 0 ? 1 : -1);
            var dir_y2 = dy + (accel * dt) * (dy > 0 ? 1 : -1);
            
            //returns the new position to trigger the acceleration during collision,
            //new position of the ball and new speed of the ball
            return { nx: (pos_x2 - x), ny: (pos_y2 - y), x: pos_x2, y: pos_y2, dx: dir_x2, dy: dir_y2 };
        },
        //function for AI to intercept the ball based on the line segment intersection formula (Bezier Curve)
        intercept: function (x1, y1, x2, y2, x3, y3, x4, y4, d) {
            var denominator = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));
            if (denominator != 0) {
                //find and check whether the first intersection point value is within the first line segment (t)
                var t = (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3))) / denominator;
                //if the result of t is around 0 to 1
                //continue to find and check the second intersection point
                if ((t >= 0) && (t <= 1)) {
                    //find and check whether the second intersection point is within the second line segment (u)
                    var u = (((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3))) / denominator;
                    
                    //if the result of u is around 0 to 1
                    //find the intersection point (x, y) of point t (P(t))
                    //return the intersection point (x, y) and the direction of the ball
                    if ((u >= 0) && (u <= 1)) {
                        var x = x1 + (t * (x2 - x1));
                        var y = y1 + (t * (y2 - y1));
                        return { x: x, y: y, d: d };
                    }
                }
            }
            return null;
        },
        //function to intercept the ball movement (collision detection between the ball and paddle)
        ball_intercept: function (ball, rect, nx, ny) {
            var ball_pos;
            if (nx < 0) {
                //checks whether the player 2 left edge paddle's position will intercept the ball
                //when the ball moves to the right direction (approaching paddle 2)
                ball_pos = Pong.Helper.intercept(ball.x, ball.y, 
                                                ball.x + nx, ball.y + ny,
                                                rect.right + ball.radius,
                                                rect.top - ball.radius,
                                                rect.right + ball.radius,
                                                rect.bottom + ball.radius,
                                                "right");
            }
            else if (nx > 0) {
                //checks whether the player 1 right edge paddle's position will intercept the ball
                //when the ball moves to the left deirection (approaching paddle 1)
                ball_pos = Pong.Helper.intercept(ball.x, ball.y, 
                                                ball.x + nx, ball.y + ny,
                                                rect.left - ball.radius,
                                                rect.top - ball.radius,
                                                rect.left - ball.radius,
                                                rect.bottom + ball.radius,
                                                "left");
            }
            //if the right or left edge of the paddle did not touch the ball
            //consider the top and bottom edge of the two paddles before the ball reaches the goal
            if (!ball_pos) {
                if (ny < 0) {
                    //checks whether the bottom edge of either one of the paddle intercepts the ball
                    //when the ball approaches one of the paddle
                    ball_pos = Pong.Helper.intercept(ball.x, ball.y, 
                                                    ball.x + nx, ball.y + ny,
                                                    rect.left - ball.radius,
                                                    rect.bottom + ball.radius,
                                                    rect.right + ball.radius,
                                                    rect.bottom + ball.radius,
                                                    "bottom");
                }
                else if (ny > 0) {
                    //checks whether the top edge of either one of the paddles intercepts the ball
                    //when the ball approaches one of the paddles
                    ball_pos = Pong.Helper.intercept(ball.x, ball.y, 
                                                    ball.x + nx, ball.y + ny,
                                                    rect.left - ball.radius,
                                                    rect.top - ball.radius,
                                                    rect.right + ball.radius,
                                                    rect.top - ball.radius,
                                                    "top");
                }
            }
            return ball_pos;
        }
    }
};