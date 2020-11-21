  if (!Function.prototype.bind) {
    Function.prototype.bind = function(obj) {
      var slice = Array.prototype.slice,
          args  = slice.call(arguments, 1),
          self  = this,
          nop   = function () {},
          bound = function () {
            return self.apply(this instanceof nop ? this : (obj || {}), args.concat(slice.call(arguments)));   
          };
      nop.prototype   = self.prototype;
      bound.prototype = new nop();
      return bound;
    };
  }
  
  if (!Object.create) {
    Object.create = function(base) {
      function F() {};
      F.prototype = base;
      return new F();
    }
  }
  
  if (!Object.construct) {
    Object.construct = function(base){
      var instance = Object.create(base);
      if (instance.initialize)
        instance.initialize.apply(instance, Array.prototype.slice.call(arguments, 1));
      return instance;
    }
  }
  
  if (!Object.extend) {
    Object.extend = function(destination, source) {
      for (var property in source) {
        if (source.hasOwnProperty(property))
          destination[property] = source[property];
      }
      return destination;
    };
  }
  
  Game = 
  {
    compatible: function() {
      return  Object.create &&
              Object.extend &&
              Function.bind &&
              document.addEventListener &&
              Game.ua.hasCanvas
    },
  
    start: function(id, game, cfg) {
      if (Game.compatible())
        return Object.construct(Game.Runner, id, game, cfg).game;
    },
  
    ua: function() { 
        var ua  = navigator.userAgent.toLowerCase();
        var key =        ((ua.indexOf("opera")   > -1) ? "opera"   : null);
            key = key || ((ua.indexOf("firefox") > -1) ? "firefox" : null);
            key = key || ((ua.indexOf("chrome")  > -1) ? "chrome"  : null);
            key = key || ((ua.indexOf("safari")  > -1) ? "safari"  : null);
            key = key || ((ua.indexOf("msie")    > -1) ? "ie"      : null);
  
      try {
        var re      = (key == "ie") ? "msie (\\d)" : key + "\\/(\\d\\.\\d)"
        var matches = ua.match(new RegExp(re, "i"));
        var version = matches ? parseFloat(matches[1]) : null;
      } 
      catch (e) {}
  
      return {
        full:      ua, 
        name:      key + (version ? " " + version.toString() : ""),
        version:   version,
        isFirefox: (key == "firefox"),
        isChrome:  (key == "chrome"),
        isSafari:  (key == "safari"),
        isOpera:   (key == "opera"),
        isIE:      (key == "ie"),
        hasCanvas: (document.createElement('canvas').getContext),
        hasAudio:  (typeof(Audio) != 'undefined')
      }
    }(),
  
    addEvent:    function(obj, type, fn) { obj.addEventListener(type, fn, false);    },
    removeEvent: function(obj, type, fn) { obj.removeEventListener(type, fn, false); },
  
    ready: function(fn) {
      if (Game.compatible())
        Game.addEvent(document, 'DOMContentLoaded', fn);
    },
  
    createCanvas: function() {
      return document.createElement('canvas');
    },
  
    createAudio: function(src) {
      try {
        var audio = new Audio(src);
        audio.volume = 0.1; 
        return audio;
      } 
      catch (e) {
        return null;
      }
    },
  
    loadImages: function(sources, callback) { 
      var images = {};
      var count = sources.length;
      for(var n = 0 ; n < sources.length ; n++) {
          var source = sources[n];
          var image = new image();
          images[source] = image;

          onload = function (){
            if (--count == 0) 
              callback(images); 
          }
      image.src = source;
      }
    },
  
    random: function(min, max) {
        return (min + (Math.random() * (max - min)));
    },
  
    timestamp: function() { 
        return new Date().getTime();
    },
  
    KEY: 
    {
      BACKSPACE: 8,
      TAB:       9,
      RETURN:   13,
      ESC:      27,
      SPACE:    32,
      LEFT:     37,
      UP:       38,
      RIGHT:    39,
      DOWN:     40,
      DELETE:   46,
      HOME:     36,
      END:      35,
      PAGEUP:   33,
      PAGEDOWN: 34,
      INSERT:   45,
      ZERO:     48,
      ONE:      49,
      TWO:      50,
      A:        65,
      L:        76,
      P:        80,
      Q:        81,
      TILDA:    192
    }
  } 
