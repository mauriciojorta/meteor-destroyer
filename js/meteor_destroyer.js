var ref = new Firebase('https://meteor-destroyer.firebaseio.com/rankings');

var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {
    //  Then we tell Phaser that we want it to scale up to whatever the browser can handle, but to do it proportionally
	if(!game.device.desktop) 
     game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
 else
	 game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.refresh();
 game.load.image('deep-space', 'assets/deep-space.jpg');
  game.load.image('floor', 'assets/platform.png');
   game.load.spritesheet('kaboom', 'assets/explosion.png', 64, 64, 23);
   game.load.image('turret', 'assets/turret.png');
   game.load.image('tower', 'assets/tower.png');
   game.load.image('bullet', 'assets/bullet.png');
   game.load.image('meteor', 'assets/meteor.png');
    game.load.image('logo', 'assets/logo.png');
   game.load.audio('fire', 'assets/fire.mp3');
   game.load.audio('explosion', 'assets/explo.mp3');
   game.load.audio('theme', 'assets/music.mp3');
}
var background;
var logo;
var tower;
var player;
var meteors;
var platforms;
var bullets;
var shoot;
var nextBullet = 0;
var fireRate = 300;
var music;
var explosion;
var gameover;
var curve = 5;
var buyhp;
var highscore = 0;
var userID;
var sentScore;
//localStorage.clear();
console.log('sentScore:' + localStorage.sentScore);
if (localStorage.sentScore != null)
{
	sentScore = localStorage.sentScore;
}
else
{
	localStorage.sentScore = false;
	sentScore = localStorage.sentScore;
}
if (localStorage.userID != null)
{
userID = localStorage.userID;
}
else
{
	localStorage.userID = '';
}

console.log('UserID :' + localStorage.userID);
if (Number(localStorage.highScore) > 0)
{
highscore = Number(localStorage.highScore);
}
else
{
	localStorage.highScore=0;
}
var newhighscore;

var hp;
var hpText;

var score;
var scoreText;

var stateText;
var loadText;
var sendText;
var bestscoresText;
var taptoplayText;
var scoreWindow;
var allSet = false;

var paused = false;

function create() {
      start_screen();
	  game.input.onDown.add(unpause, self);
}

function update() {
	if (allSet == true)
	{
		if (!this.input.activePointer.withinGame)
		{
			paused = true;
			game.paused=true;
		}

	game.physics.arcade.collide(player, platforms);	
	game.physics.arcade.overlap(bullets, meteors, destroy_meteor, null, this);
	game.physics.arcade.overlap(meteors, platforms, hit_floor, null, this);
		
	if (game.physics.arcade.angleToPointer(player) > 0 && game.physics.arcade.angleToPointer(player) < 180)
	{
	player.rotation = player.rotation;	
	}
	else
	{
	player.rotation = game.physics.arcade.angleToPointer(player);
	}
	
		game.input.onDown.add(fire, this);
	}

}

function create_meteors()
{
	var nmeteors = 3 + Math.floor((Math.random() * 4) + 1);
	    for (var i = 0; i < nmeteors; i++)
    {
        var meteor = meteors.create(i * 120  + Math.floor((Math.random() * 50) + 1) , -50, 'meteor');

        meteor.body.gravity.y = Math.floor((Math.random() * curve) + 1); 	
    }
	if (curve < 90)
	curve += 5;
	
}

function destroy_meteor(bullet, meteor)
{
	meteor.kill();
	explosion.play();
	bullet.kill();
	var explosionAnimation = explosions.getFirstExists(false);
    explosionAnimation.reset(meteor.x, meteor.y);
    explosionAnimation.play('kaboom', 30, false, true);
	score += 10;
	extra_hp();
    scoreText.text = 'Score: ' + score;	
}

function hit_floor(meteor, floor)
{
	meteor.kill();
	explosion.play();
	var explosionAnimation = explosions.getFirstExists(false);
    explosionAnimation.reset(meteor.x, meteor.y);
    explosionAnimation.play('kaboom', 30, false, true);
	hp -= 1;
	hpText.text = 'HP: ' + hp;	
	
	if (hp < 1)
    {
	game_over();
    }
	
}

function fire()
{
	if (gameover == false)
	{
	  if (game.time.now > nextBullet)
    {
        nextBullet = game.time.now + fireRate;

        var bullet = bullets.getFirstExists(false);	
        if (game.input.activePointer.y <508) //The turret must fire only if it is aimed within its angle range of its tower
		{			
		shoot.play();
        bullet.reset(player.x, player.y);
        bullet.rotation = game.physics.arcade.moveToPointer(bullet, 1000, game.input.activePointer, 500);
		}
    }
	}

}

function run_game()
{
		game.add.sprite(0, 0, 'deep-space');
	 music = game.add.audio('theme');
  music.loop = true;
  	  music.play();
	newhighscore= false;
	buyhp = 0;
	score = 0;
	hp = 3;
	gameover = false;
	game.physics.startSystem(Phaser.Physics.ARCADE);
 platforms = game.add.group();
 platforms.enableBody = true;
 var floor = platforms.create(0, game.world.height - 44, 'floor');
 floor.scale.setTo(2, 2);
 floor.body.immovable = true;
 
	shoot = game.add.audio('fire');
  bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet', 0, false);
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);
	
	tower = game.add.sprite(354, game.world.height - 92, 'tower');
	tower.enableBody = true;
	
	 player = game.add.sprite(390, game.world.height - 100, 'turret');
  game.physics.arcade.enable(player);
  player.anchor.setTo(0.4, 0.5);
  
  meteors = game.add.group();
  meteors.enableBody = true;
  
  explosions = game.add.group();

    for (var i = 0; i < 10; i++)
    {
        var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
        explosionAnimation.anchor.setTo(0.5, 0.5);
        explosionAnimation.animations.add('kaboom');
    }
	explosion = game.add.audio('explosion');
  
  scoreText = game.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });
  hpText = game.add.text(700, 16, 'HP: 3', { fontSize: '32px', fill: '#fff' });
   stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '64px Arial', fill: '#fff' });
  stateText.anchor.setTo(0.5, 0.5);
  stateText.visible = false;
  	sendText = game.add.text(3, game.world.height - 44, 'Click here to send score!', { fontSize: '32px', fill: '#ff0000' });
	sendText.visible = false;
  allSet = true;
  create_meteors();
  timer = game.time.create(false);
  timer.loop(4000, create_meteors, this);
  timer.start();
  
}

function game_over()
{
		gameover=true;
		music.stop();
		bullets.callAll('kill');
		tower.kill();
        player.kill();
        meteors.callAll('kill');
		platforms.callAll('kill');
		timer.destroy();
		curve = 5;
		set_highscore();
    if (newhighscore == false)
        stateText.text= " GAME OVER \n Highscore: " + highscore + "\n Click here to restart";
	else
		 stateText.text=" GAME OVER \n New highscore!: " + highscore + "\n Click here to restart";
        stateText.visible = true;
		stateText.inputEnabled = true;
		stateText.events.onInputUp.add(function () {
			  stateText.inputEnabled = false;
			  sendText.inputEnabled = false;
      run_game();
    });
	if (sentScore == "false" || (sentScore == "true" && newhighscore == true))
	{
		console.log("Paso por aquí");
		sendText.visible = true;
		sendText.inputEnabled = true;
		sendText.events.onInputUp.add(function () {
				  sendText.inputEnabled = false;
			create_input();
      
    });
	}

        //the "click to restart" handler
        //game.input.onTap.addOnce(run_game,this);
	
}

function extra_hp()
{
	buyhp += 10;
	if (buyhp>=1000)
	{
		hp += 1;
		hpText.text = 'HP: ' + hp;	
        buyhp = 0;		
	}
	
}

function set_highscore()
{
	if (score > highscore)
	{
		newhighscore = true;
		localStorage.highScore = score;
		highscore = Number(localStorage.highScore);
		
		console.log('Highscore :' + Number(localStorage.highScore));
	}
}

function unpause()
{
	game.paused = false;
	paused = false;
}

function start_screen()
{
	logo = game.add.sprite(0, 0, 'logo');
    logo.fixedToCamera = true;
	bestscoresText = game.add.text(280,400,'Global highscores', { font: '32px Arial', fill: '#fff' });
	taptoplayText = game.add.text(game.world.centerX-145,game.world.centerY + 10,'TAP PLAY', { font: '64px Arial', fill: '#fff' });
	taptoplayText.alpha = 0;
	taptoplayText.inputEnabled = true;
	bestscoresText.inputEnabled = true;
	bestscoresText.events.onInputUp.add(function () {
				  bestscoresText.inputEnabled = false;
			showHighscores();
      
    });
		taptoplayText.events.onInputUp.add(function () {
				  taptoplayText.inputEnabled = false;
			start_game();
      
    });
    //game.input.onDown.add(start_game, this);
	
}

function start_game()
{
	game.world.remove(taptoplayText);
	game.world.remove(bestscoresText);
	game.input.onDown.remove(start_game, this);
    logo.kill();
		loadText = game.add.text(32, 32, 'Loading', { fill: '#ffffff' });
		game.load.onLoadComplete.add(loadComplete, this);
	  game.sound.setDecodedCallback("theme", run_game, this);
}

function create_input()
{
	    $("#holder").fadeIn(800).prepend('<div  id = "form" class = "boxsombra"><div class = "closebutton"><b>X</b></div><form name="miformulario" action="" onsubmit="send_score()"><br/><b>Name</b>: <input type="text" id="nameinput" name="player_name"/><input type="submit" value="Send" class="btn btn-primary"></form></div>'); //add input box
			$(".closebutton").click(function(){
		sendText.inputEnabled = true;
		$("#holder #form").fadeOut(800).remove();
	});
}

function send_score()
{
  $("#holder").fadeOut(800).remove('#form');
	var name = document.forms["miformulario"]["player_name"].value;;
		console.log("Name: " + name);
;		if (localStorage.userID == '')
		{
          var newplayer = ref.push({name: name, score: -highscore});
		  console.log("newplayer" + newplayer);
					 localStorage.userID = newplayer.key();
					 userID = localStorage.userID;
					 localStorage.sentScore = true;
					 sentScore = localStorage.sentScore;
         
		}
		else
		{
			ref.child(userID).set({name: name, score : -highscore});
			localStorage.sentScore = true;
					 sentScore = localStorage.sentScore;
		}
 
		
	
}

function loadComplete() {

	game.world.remove(loadText);

}

function showHighscores()
{
	var highscores = "";
	var i = 1;
	var etc = false;
	var scoreRef = ref.orderByChild("score").limitToLast(20);
	$("#holder").fadeIn(800).prepend('<div class = "scrollbox" ><div class = "closebutton"><b>X</b></div></div>');
	scoreRef.on("child_added", function(snapshot) {
		highscores = i + ". " + snapshot.val().name + ": " + -snapshot.val().score + " \n";
		console.log(i + ". " + snapshot.val().name + ": " + -snapshot.val().score);
			console.log(highscores);
			if (snapshot.key() == userID)
  			$("<p>").text(highscores + "(your score)").css("font-weight","Bold").appendTo('.scrollbox');
		    else if (i <= 50 && etc == false)
				$("<p>").text(highscores).appendTo('.scrollbox');
		i++;
		if (i > 50 && etc == false)
		{
			etc = true;
			$("<p>").text("...").appendTo('.scrollbox');		
		}
    });
	console.log(highscores);
	$(".closebutton").click(function(){
		bestscoresText.inputEnabled = true;
		$("#holder .scrollbox").fadeOut(800).remove();
	});
	
	
}






