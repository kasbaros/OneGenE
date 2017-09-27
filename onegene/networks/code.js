
$(function(){

  var layoutPadding = 50;
  var aniDur = 500;
  var easing = 'linear';

  var cy;

  // get exported json from cytoscape desktop via ajax
  var graphP = $.ajax({
    url: './testing.json',
    type: 'GET',
    dataType: 'json'
  });

  // also get style via ajax
  var styleP = $.ajax({
    url: './style.cycss', // networks-style.cycss
    type: 'GET',
    dataType: 'text'
  });

  var infoTemplate = Handlebars.compile([
    '<p class="ac-name">{{name}}</p>',
    '<p class="ac-node-frel"><i class="fa fa-info-circle"></i> {{NodeTypeFormatted}} {{#if Frel}}({{Frel}}){{/if}}</p>',
    '{{#if Frel > 0.5}}<p class="ac-milk"><i class="fa fa-angle-double-right"></i> {{Milk}}</p>{{/if}}',
    /*'{{#if Country}}<p class="ac-country"><i class="fa fa-map-marker"></i> {{Country}}</p>{{/if}}',*/
    '<p class="ac-more"><i class="fa fa-external-link"></i><a target="_blank" href="https://www.ncbi.nlm.nih.gov/gene/?term={{name}}">More information</a></p>',
    '<p class="ac-more"><i class="fa fa-cloud-download" aria-hidden="true"></i><a href="4381.json" download="filename">Download Gene Data</a></p>'
  ].join(''));

  // when both graph export json and style loaded, init cy
  Promise.all([ graphP, styleP ]).then(initCy);

  var allNodes = null;
  var allEles = null;
  var lastHighlighted = null;
  var lastUnhighlighted = null;

  function getFadePromise( ele, opacity ){
    return ele.animation({
      style: { 'opacity': opacity },
      duration: aniDur
    }).play().promise();
  };

  var restoreElesPositions = function( nhood ){
    return Promise.all( nhood.map(function( ele ){
      var p = ele.data('orgPos');

      return ele.animation({
        position: { x: p.x, y: p.y },
        duration: aniDur,
        easing: easing
      }).play().promise();
    }) );
  };

  function highlight( node ){
    var oldNhood = lastHighlighted;

    var nhood = lastHighlighted = node.closedNeighborhood();
    var others = lastUnhighlighted = cy.elements().not( nhood );

    var reset = function(){
      cy.batch(function(){
        others.addClass('hidden');
        nhood.removeClass('hidden');

        allEles.removeClass('faded highlighted');

        nhood.addClass('highlighted');

        others.nodes().forEach(function(n){
          var p = n.data('orgPos');

          n.position({ x: p.x, y: p.y });
        });
      });

      return Promise.resolve().then(function(){
        if( isDirty() ){
          return fit();
        } else {
          return Promise.resolve();
        };
      }).then(function(){
        return Promise.delay( aniDur );
      });
    };

    var runLayout = function(){
      var p = node.data('orgPos');

      var l = nhood.filter(':visible').makeLayout({
        name: 'concentric',
        fit: false,
        animate: true,
        animationDuration: aniDur,
        animationEasing: easing,
        boundingBox: {
          x1: p.x - 1,
          x2: p.x + 1,
          y1: p.y - 1,
          y2: p.y + 1
        },
        avoidOverlap: true,
        concentric: function( ele ){
          if( ele.same( node ) ){
            return 2;
          } else {
            return 1;
          }
        },
        levelWidth: function(){ return 1; },
        padding: layoutPadding
      });

      var promise = cy.promiseOn('layoutstop');

      l.run();

      return promise;
    };

    var fit = function(){
      return cy.animation({
        fit: {
          eles: nhood.filter(':visible'),
          padding: layoutPadding
        },
        easing: easing,
        duration: aniDur
      }).play().promise();
    };

    var showOthersFaded = function(){
      return Promise.delay( 250 ).then(function(){
        cy.batch(function(){
          others.removeClass('hidden').addClass('faded');
        });
      });
    };

    return Promise.resolve()
      .then( reset )
      .then( runLayout )
      .then( fit )
      .then( showOthersFaded )
    ;

  }

  function isDirty(){
    return lastHighlighted != null;
  }

  function clear( opts ){
    if( !isDirty() ){ return Promise.resolve(); }

    opts = $.extend({

    }, opts);

    cy.stop();
    allNodes.stop();

    var nhood = lastHighlighted;
    var others = lastUnhighlighted;

    lastHighlighted = lastUnhighlighted = null;

    var hideOthers = function(){
      return Promise.delay( 125 ).then(function(){
        others.addClass('hidden');

        return Promise.delay( 125 );
      });
    };

    var showOthers = function(){
      cy.batch(function(){
        allEles.removeClass('hidden').removeClass('faded');
      });

      return Promise.delay( aniDur );
    };

    var restorePositions = function(){
      cy.batch(function(){
        others.nodes().forEach(function( n ){
          var p = n.data('orgPos');

          n.position({ x: p.x, y: p.y });
        });
      });

      return restoreElesPositions( nhood.nodes() );
    };

    var resetHighlight = function(){
      nhood.removeClass('highlighted');
    };

    return Promise.resolve()
      .then( resetHighlight )
      .then( hideOthers )
      .then( restorePositions )
      .then( showOthers )
    ;
  }

  function showNodeInfo( node ){
    $('#info').html( infoTemplate( node.data() ) ).show();
  }

  function hideNodeInfo(){
    $('#info').hide();
  }

  function initCy( then ){
    var loading = document.getElementById('loading');
    var expJson = then[0];
    var styleJson = then[1];
    var elements = expJson.elements;

    elements.edges.forEach(function(n){
      var data = n.data;

      data.NodeTypeFormatted = data.Frel;

      if( data.NodeTypeFormatted > 0.5 ){
        data.NodeTypeFormatted = 'God help me';
      } else if( data.NodeTypeFormatted < 0.5 ){
        data.NodeTypeFormatted = 'God is good';
      }

      n.data.orgPos = {
        x: n.position.x,
        y: n.position.y
      };
    });

    loading.classList.add('loaded');

/** The CYTOSCAPE.JS main body **/

    cy = window.cy = cytoscape({
      container: document.getElementById('cy'),
      layout: { name: 'concentric', padding: layoutPadding },
      style: [
          {selector:"core",
              style:
                  {"selection-box-color":"#AAD8FF",
                      "selection-box-border-color":"#8BB0D0",
                      "selection-box-opacity":"0.5"}},

          {selector:"node",
              style:
                  {
                      width:"mapData(score, 0, 0.006769776522008331, 30, 70)",
                      height:"mapData(score, 0, 0.006769776522008331, 20, 60)",
                      content:"data(name)","font-size":"12px",
                      'text-valign':"center",
                      'text-halign':"center",
                      'background-color':"skyblue",
                      'text-outline-color':"#555",
                      'text-outline-width':"2px",
                      color:"#fff",
                      'overlay-padding':"2px",
                      'z-index':"10",
                      shape: "roundrectangle"}},


          {selector:"node[?attr]",
              style:
                  {shape:"rectangle",
                      "background-color":"#aaa",
                      "text-outline-color":"#aaa",
                      width:"20px",
                      height:"16px",
                      "font-size":"6px",
                      "z-index":"1"}},

          {selector:"node[?query]",
              style:
                  {'background-clip':"none",
                      'background-fit':"contain"}},

          {selector:"node:selected",
              style:
                  {'border-width':"6px",
                      'border-color':"#AAD8FF",
                      'border-opacity':"0.5",
                      'background-color':"#77828C",
                      'text-outline-color':"#77828C",
                       color: "#FFFF00"}},

          {selector:"edge",
              style:
                  {'curve-style':"haystack",
                      'haystack-radius':"0.5",
                      opacity:"0.4",
                      'line-color':"#020202",
                      width:"mapData(weight, 0, 1, 1, 8)",
                      'overlay-padding':"3px"}},

          {selector:"node.unhighlighted",
              style:
                  {opacity:"0.2"}},
                  

          {selector:"edge.unhighlighted",
              style:{opacity:"0.05"}},

          {selector:".highlighted",
              style:
                  {"z-index":"999999"}},

          {selector:"node.highlighted",
              style:
                  {"border-width":"2px",
                      "border-color":"#AAD8FF",
                      "border-opacity":"0.5",
                      "background-color":"#394855",
                      "text-outline-color":"#394855",
                      "shadow-blur":"12px",
                      "shadow-color":"#000",
                      "shadow-opacity":"0.8",
                      "shadow-offset-x":"0px",
                      "shadow-offset-y":"4px"}},

          {selector:"edge.filtered",
              style:{opacity:"0"}},

          ],
      elements: elements,
      motionBlur: true,
      selectionType: 'single',
      boxSelectionEnabled: false,
      zoom:1,
    });

/** End **/


    allNodes = cy.nodes();
    allEles = cy.elements();

    cy.on('free', 'node', function( e ){
      var n = e.cyTarget;
      var p = n.position();

      n.data('orgPos', {
        x: p.x,
        y: p.y
      });
    });

    cy.on('tap', function(){
      $('#search').blur();
    });

    cy.on('select unselect', 'node', _.debounce( function(e){
      var node = cy.$('node:selected');

      if( node.nonempty() ){
        showNodeInfo( node );

        Promise.resolve().then(function(){
          return highlight( node );
        });
      } else {
        hideNodeInfo();
        clear();
      }

    }, 100 ) );

      cy.nodes().forEach(function(n){
          var g = n.data('name');

          n.qtip({
              content: [
                  {
                      name: 'GeneCard',
                      url: 'http://www.genecards.org/cgi-bin/carddisp.pl?gene=' + g
                  },
                  {
                      name: 'GeneMANIA',
                      url: 'http://genemania.org/search/human/' + g
                  }
              ].map(function( link ){
                  return '<a target="_blank" href="' + link.url + '">' + link.name + '</a>';
              }).join('<br />\n'),
              position: {
                  my: 'top center',
                  at: 'bottom center'
              },
              style: {
                  classes: 'qtip-bootstrap',
                  tip: {
                      width: 16,
                      height: 8
                  }
              }
          });
      });

  }



  var lastSearch = '';

  $('#search').typeahead({
    minLength: 2,
    highlight: true,
  },
  {
    name: 'search-dataset',
    source: function( query, cb ){
      function matches( str, q ){
        str = (str || '').toLowerCase();
        q = (q || '').toLowerCase();

        return str.match( q );
      }

      var fields = ['name', 'Frel'];

      function anyFieldMatches( n ){
        for( var i = 0; i < fields.length; i++ ){
          var f = fields[i];

          if( matches( n.data(f), query ) ){
            return true;
          }
        }

        return false;
      }

      function getData(n){
        var data = n.data();

        return data;
      }

      function sortByName(n1, n2){
        if( n1.data('name') < n2.data('name') ){
          return -1;
        } else if( n1.data('name') > n2.data('name') ){
          return 1;
        }

        return 0;
      }

      var res = allNodes.stdFilter( anyFieldMatches ).sort( sortByName ).map( getData );

      cb( res );
    },
    templates: {
      suggestion: infoTemplate
    }
  }).on('typeahead:selected', function(e, entry, dataset){
    var n = cy.getElementById(entry.id);

    cy.batch(function(){
      allNodes.unselect();

      n.select();
    });

    showNodeInfo( n );
  }).on('keydown keypress keyup change', _.debounce(function(e){
    var thisSearch = $('#search').val();

    if( thisSearch !== lastSearch ){
      $('.tt-dropdown-menu').scrollTop(0);

      lastSearch = thisSearch;
    }
  }, 50));

  $('#reset').on('click', function(){
    if( isDirty() ){
      clear();
    } else {
      allNodes.unselect();

      hideNodeInfo();

      cy.stop();

      cy.animation({
        fit: {
          eles: cy.elements(),
          padding: layoutPadding
        },
        duration: aniDur,
        easing: easing
      }).play();
    }
  });


  $('#filter').qtip({
    position: {
      my: 'top center',
      at: 'bottom center',
      adjust: {
        method: 'shift'
      },
      viewport: true
    },

    show: {
      event: 'click'
    },

    hide: {
      event: 'unfocus'
    },

    style: {
      classes: 'qtip-bootstrap qtip-filters',
      tip: {
        width: 16,
        height: 8
      }
    },

    content: $('#filters')
  });

  $('#about').qtip({
    position: {
      my: 'bottom center',
      at: 'top center',
      adjust: {
        method: 'shift'
      },
      viewport: true
    },

    show: {
      event: 'click'
    },

    hide: {
      event: 'unfocus'
    },

    style: {
      classes: 'qtip-bootstrap qtip-about',
      tip: {
        width: 16,
        height: 8
      }
    },

    content: $('#about-content')
  });
});
