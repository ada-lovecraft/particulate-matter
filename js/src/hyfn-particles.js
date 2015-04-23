
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

        drawCanvas.addEventListener('mousedown', mousedownHandler, false);
        drawCanvas.addEventListener('mouseup', mouseupHandler, false);
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
        var logo = [];
        var loader = new PxLoader();
        logo[0] = loader.addImage('img/hyfn-logo-small-color.png');
        //logo[1] = loader.addImage('img/logo2.png');
        //logo[2] = loader.addImage('img/logo3.png');

        loader.addCompletionListener(function() {
          for (var i = 0; i < logo.length; i++) {
            var imagedata = Proton.Util.getImageData(context, logo[i], rect);
            logoZones.push(new Proton.ImageZone(imagedata, rect.x, rect.y));
            colors = colorThief.getPalette(logo[i], 10).map(function(color) {
              return chroma(color).hex();
            });
            console.log('colors:', colors);
          }
          createProton(rect);
          tick();
        });
        loader.start();
      }

      function initBehaviours() {
        var imageWidth = 342;
        var drawScopeWidth = 710;
        rect = new Proton.Rectangle((canvas.width - imageWidth) / 2, (canvas.height - imageWidth) / 2, imageWidth, imageWidth);
        rect2 = new Proton.Rectangle((canvas.width - drawScopeWidth) / 2, 0, drawScopeWidth, canvas.height);
        var rectZone = new Proton.RectZone(rect2.x, rect2.y, rect2.width, rect2.height);
        crossBehaviour = new Proton.CrossZone(new Proton.RectZone(0,0, drawCanvas.width, drawCanvas.height), 'bound');
        randomBehaviour = new Proton.RandomDrift(10, 10, 0.05);
        repulsionBehaviour = new Proton.Repulsion(mouseObj, 0, 0);

      }

      function createProton() {
        proton = new Proton;
        emitter = new Proton.Emitter();
        emitter.rate = new Proton.Rate(new Proton.Span(10,25), .1);
        emitter.addInitialize(new Proton.Mass(1));
        emitter.addInitialize(new Proton.P(new Proton.RectZone(0,0, drawCanvas.width, drawCanvas.height)));
        emitter.addInitialize(new Proton.Life(30));
        emitter.addInitialize(new Proton.Radius(new Proton.Span(1.0, 3.0)));
        emitter.addBehaviour(new Proton.Alpha(new Proton.Span(0.25,1.0)));
        emitter.addBehaviour(new Proton.Color(colors));
        emitter.addBehaviour(randomBehaviour);
        emitter.addBehaviour(crossBehaviour);
        emitter.addBehaviour(repulsionBehaviour);
        emitter.addBehaviour(customToZoneBehaviour(logoZones));


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

            if(!mouseObj.isDown) {
              if (rootIndex % 2 != 0) {
                particle.v.clear();
                particle.Angle += particle.speed;
                var index = (rootIndex % 6 + 1) / 2 - 1;
                var x = particle.zones[0].x + particle.R * Math.cos(particle.Angle);
                var y = particle.zones[0].y + particle.R * Math.sin(particle.Angle);
                particle.p.x += (x - particle.p.x) * 0.01;
                particle.p.y += (y - particle.p.y) * 0.01;
              }
            }
          }
        }

      }

      function mousedownHandler(e) {
        console.log('down');
        mouseObj.isDown = true;
        //randomBehaviour.reset(mouseObj.x, mouseObj.y, 0 ,100, Proton.easeInOutBack);
      }

      function mouseupHandler(e) {
        console.log('up');
        mouseObj.isDown = false;
        //randomBehaviour.reset(10, 10, 0 ,100, Proton.easeInOutBack);
      }

      function mousemoveHandler(e) {

        if (e.layerX || e.layerX == 0) {
          mouseObj.x = e.layerX;
          mouseObj.y = e.layerY;
        } else if (e.offsetX || e.offsetX == 0) {
          mouseObj.x = e.offsetX;
          mouseObj.y = e.offsetY;
        }
        console.log('mouseobj:', mouseObj);
      }


      function tick() {
        requestAnimationFrame(tick);

        //stats.begin();
        proton.update();
        //stats.end();
      }

