
var proton;
      var canvas;
      var drawCanvas;
      var context;
      var renderer;
      var stats;
      var logoZone;
      var emitter;
      var rect, rect2;
      var repulsionBehaviour, crossBehaviour;
      var mouseObj;
      var rootIndex = 1;
      var colors = [];
      var particleImage = 'img/particle.png';;

      var colorThief = new ColorThief();

      var ColorSchemes = {
        BlueJayFeather: {
          threeColorBlack: '#1F1F20',
          blueJayBlue: '#2B4C7E',
          blueJayAccent: '#567EBB',
          blueJayGray: '#606D80',
          blueJayWhite: '#DCE0E6'
        }
      };

      Main();
      function Main() {
        canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        context = canvas.getContext('2d');
        drawCanvas = document.getElementById('testCanvas');
        drawCanvas.width = window.innerWidth;
        drawCanvas.height = window.innerHeight;

        mouseObj = {
          x: canvas.width / 2,
          y: canvas.height / 2
        };

        //drawCanvas.addEventListener('mousedown', mousedownHandler, false);
        //drawCanvas.addEventListener('mouseup', mouseupHandler, false);
        drawCanvas.addEventListener('mousemove', mousemoveHandler, false);
        //addStats();


        initBehaviours();
        loadImage();
      }

      function addStats() {
        stats = new Stats();
        stats.setMode(2);
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';
        document.getElementById('container').appendChild(stats.domElement);
      }

      function loadImage() {
        logoZones = [];

        var loader = new PxLoader();
        var logo = loader.addImage('img/hyfn-logo-long.png');

        loader.addCompletionListener(function() {
            var imagedata = Proton.Util.getImageData(context, logo, rect);
            logoZones.push(new Proton.ImageZone(imagedata, rect.x, rect.y));
            colors = chroma(colorThief.getColor(logo)).hex();
            createProton(rect);
            tick();
        });
        loader.start();
      }

      function initBehaviours() {
        var imageWidth = 800;
        var imageHeight = 306;
        var drawScopeWidth = 800;
        rect = new Proton.Rectangle((canvas.width - imageWidth) / 2, (canvas.height - imageHeight) / 2, imageWidth, imageHeight);
        rect2 = new Proton.Rectangle((canvas.width - drawScopeWidth) / 2, 0, drawScopeWidth, canvas.height);
        var rectZone = new Proton.RectZone(rect2.x, rect2.y, rect2.width, rect2.height);

        randomBehaviour = new Proton.RandomDrift(3, 3, 0.5);
        repulsionBehaviour = new Proton.Repulsion(mouseObj, 50, 50);

      }

      function createProton() {
        proton = new Proton;
        emitter = new Proton.Emitter();
        emitter.rate = new Proton.Rate(new Proton.Span(5,15), .1);
        emitter.addInitialize(new Proton.Mass(1));
        emitter.addInitialize(new Proton.ImageTarget(particleImage, 32, 32));
        emitter.addInitialize(new Proton.P(new Proton.RectZone(0,0, drawCanvas.width, drawCanvas.height)));
        emitter.addInitialize(new Proton.Life(45));

        emitter.addBehaviour(new Proton.Alpha(1.0, .1));
        emitter.addBehaviour(new Proton.Color(colors));
        emitter.addBehaviour(new Proton.Scale(0.25, 1.0));
        //emitter.addBehaviour(randomBehaviour);

        emitter.addBehaviour(customToZoneBehaviour(logoZones));
        emitter.addBehaviour(repulsionBehaviour);


        emitter.emit();
        proton.addEmitter(emitter);

        renderer = new Proton.Renderer('webgl', proton, drawCanvas);
        renderer.createImageData(rect2);
        renderer.blendFunc('SRC_ALPHA', 'ONE');
        renderer.start();
      }

      function customToZoneBehaviour(zones) {
        return {
          initialize : function(particle) {
            particle.R = Math.random() * 10;
            particle.Angle = Math.random() * Math.PI * 2;
            particle.speed = Math.random() * (-1.5) + 0.75;
            particle.zones = zones.map(function(zone) { return zone.getPosition().clone(); });
          },

          applyBehaviour : function(particle) {
              if (rootIndex % 2 != 0) {
               // particle.v.clear();
                particle.Angle += particle.speed;
                var index = (rootIndex % 6 + 1) / 2 - 1;
                var x = particle.zones[0].x + particle.R * Math.cos(particle.Angle);
                var y = particle.zones[0].y + particle.R * Math.sin(particle.Angle);
                particle.p.x += (x - particle.p.x) * 0.02;
                particle.p.y += (y - particle.p.y) * 0.02;
              }
          }
        }

      }

      function mousedownHandler(e) {
        mouseObj.isDown = true;
        repulsionBehaviour.reset(mouseObj,5, 10);
      }

      function mouseupHandler(e) {
        mouseObj.isDown = false;
        repulsionBehaviour.reset(mouseObj, 0,0);
      }

      function mousemoveHandler(e) {

        if (e.layerX || e.layerX == 0) {
          mouseObj.x = e.layerX;
          mouseObj.y = e.layerY;
        } else if (e.offsetX || e.offsetX == 0) {
          mouseObj.x = e.offsetX;
          mouseObj.y = e.offsetY;
        }

      }


      function tick() {
        requestAnimationFrame(tick);

        //stats.begin();
        proton.update();
        //stats.end();
      }

