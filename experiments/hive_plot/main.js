// main.js

  var snap      = function(i) { return function() { return i; }; }

  var get_info  = function(data_set, format) {

    var degree  = Math.PI / 180,
        x_max   = 700,    x_off   = x_max * 0.5,
        y_max   = 700,    y_off   = y_max * 0.5;

    if (format === 'conv') {  // "conventional"
      var a_off   =   20,
          a_so    =    0,     a_st    = (120 - a_off),
          a_to    = -120,     a_ts    = (120 + a_off),
          i_rad   =   25,     o_rad   = 300;

    } else {                  // "rectangular"
      var a_so    =  -45,     a_st    = 45,
          a_to    = -135,     a_ts    = 135,
          i_rad   =   25,     o_rad   = 350;
    }

    var info  = {
      'global': {
        'selector':       ( snap(data_set) )(),
        'x_max':          x_max,      'x_off':          x_off,
        'y_max':          y_max,      'y_off':          y_off,
        'inner_radius':   i_rad,      'outer_radius':   o_rad
      },

      'axes': {}
      /*  'source':         { 'angle':  degree * a_so },
        'source-target':  { 'angle':  degree * a_st },
        'target-source':  { 'angle':  degree * a_ts },
        'target':         { 'angle':  degree * a_to }
      }*/
    };


    return info;
  };
  var set_axes = function(plot_info, nodes) {
    //console.log(111);
    var g       = plot_info.global
    var degree = Math.PI / 180;
    g.files = [];
    for(var i = 0; i < nodes.length; i++) {
      if (g.files.indexOf(nodes[i].file) < 0)
        g.files.push(nodes[i].file);
    }
    //console.log(g.files);
    for (var i = 0; i < g.files.length; i++) {
      var file = g.files[i];
      plot_info.axes[file] ={};
      plot_info.axes[file].angle = degree * (-180.0+i*360.0 / g.files.length);
      //console.log(plot_info.axes[file].angle);
    }
    //console.log(222);

  };


  var data_sets     = { '#species':   'species.json'//,                        '#demo_2':   'ze_test.json'
                        };

  var info_sets     = {};

  for (var data_set in data_sets) {

    info_sets[data_set]  = get_info(data_set, 'conv');
    var func_axes = function(nodes) {
        set_axes(info_sets[data_set], nodes);
    };

    var func_f = function() {
      var info_set  = info_sets[data_set];

      var func  = function(nodes) {
        set_axes(info_set, nodes);
        setup_plot(info_set);

        prep_data(info_set, nodes);
        setup_mouse(info_set);
        display_plot(info_set);
      };

      return func;
    };
    d3.json(data_sets[data_set], func_f() );
  }
