/* Redmine - project management software
   Copyright (C) 2006-2017  Jean-Philippe Lang 
   
   Addition of code from Vaidik Kapoor 
   by Stephan Wenzel (C) 2018                  */

var contextMenuObserving;

function contextMenuRightClick(event) {
  var target = $(event.target);
  if (target.is('a')) {return;}
  var tr = target.closest('.hascontextmenu').first();
  if (tr.length < 1) {return;}
  event.preventDefault();
  if (!contextMenuIsSelected(tr)) {
    contextMenuUnselectAll();
    contextMenuAddSelection(tr);
    contextMenuSetLastSelected(tr);
  }
  contextMenuShow(event);
}

function contextMenuClick(event) {
  var target = $(event.target);
  var lastSelected;

  if (target.is('a') && target.hasClass('submenu')) {
    event.preventDefault();
    return;
  }
  contextMenuHide();
  if (target.is('a') || target.is('img')) { return; }
  if (event.which == 1 || (navigator.appVersion.match(/\bMSIE\b/))) {
    var tr = target.closest('.hascontextmenu').first();
    if (tr.length > 0) {
      // a row was clicked, check if the click was on checkbox
      if (target.is('input') ) {
        // a checkbox may be clicked
        if (target.prop('checked')) {
          tr.addClass('context-menu-selection');
        } else {
          tr.removeClass('context-menu-selection');
        }
 
      } else if (target.is('input') && (event.type == "touchend") ) {
        if (target.prop('checked')) {
          tr.removeClass('context-menu-selection');
        } else {
          tr.addClass('context-menu-selection');
        }
 
      } else {
        if (event.ctrlKey || event.metaKey) {
          contextMenuToggleSelection(tr);
        } else if (event.shiftKey) {
          lastSelected = contextMenuLastSelected();
          if (lastSelected.length) {
            var toggling = false;
            $('.hascontextmenu').each(function(){
              if (toggling || $(this).is(tr)) {
                contextMenuAddSelection($(this));
              }
              if ($(this).is(tr) || $(this).is(lastSelected)) {
                toggling = !toggling;
              }
            });
          } else {
            contextMenuAddSelection(tr);
          }
        } else {
          contextMenuUnselectAll();
          contextMenuAddSelection(tr);
        }
        contextMenuSetLastSelected(tr);
      }
    } else {
      // click is outside the rows
      if (target.is('a') && (target.hasClass('disabled') || target.hasClass('submenu'))) {
        event.preventDefault();
      } else if (target.is('.toggle-selection') || target.is('.ui-dialog *') || $('#ajax-modal').is(':visible')) {
        // nop
      } else {
        contextMenuUnselectAll();
      }
    }
  }
}

function contextMenuCreate() {
  if ($('#context-menu').length < 1) {
    var menu = document.createElement("div");
    menu.setAttribute("id", "context-menu");
    menu.setAttribute("style", "display:none;");
    document.getElementById("content").appendChild(menu);
  }
}

function contextMenuShow(event) {
//  var mouse_x = event.pageX;
//  var mouse_y = event.pageY;  

  if (event.type == "touchstart") {
  
    var touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
    var mouse_x = touch.pageX;
    var mouse_y = touch.pageY;  
    var mouse_y_c = touch.clientY;  
    
  } else {
  
    var mouse_x = event.pageX;
    var mouse_y = event.pageY;  
    var mouse_y_c = event.clientY;  
  }

  var render_x = mouse_x;
  var render_y = mouse_y;
  var dims;
  var menu_width;
  var menu_height;
  var window_width;
  var window_height;
  var max_width;
  var max_height;
  var url;

  $('#context-menu').css('left', (render_x + 'px'));
  $('#context-menu').css('top', (render_y + 'px'));
  $('#context-menu').html('');

  url = $(event.target).parents('form').first().data('cm-url');
  if (url == null) {alert('no url'); return;}

  $.ajax({
    url: url,
    data: $(event.target).parents('form').first().serialize(),
    success: function(data, textStatus, jqXHR) {
      $('#context-menu').html(data);
      menu_width = $('#context-menu').width();
      menu_height = $('#context-menu').height();
      max_width = mouse_x + 2*menu_width;
      max_height = mouse_y_c + menu_height;

      if (event.type == "touchstart") {
        var ws = screen_size();
      } else {
        var ws = window_size();
      }
      window_width = ws.width;
      window_height = ws.height;

      /* display the menu above and/or to the left of the click if needed */
      if (max_width > window_width) {
       render_x -= menu_width;
       $('#context-menu').addClass('reverse-x');
      } else {
       $('#context-menu').removeClass('reverse-x');
      }

      if (max_height > window_height) {
       render_y -= menu_height;
       $('#context-menu').addClass('reverse-y');
        // adding class for submenu
        if (mouse_y_c < 325) {
          $('#context-menu .folder').addClass('down');
        }
      } else {
        // adding class for submenu
        if (window_height - mouse_y_c < 345) {
          $('#context-menu .folder').addClass('up');
        } 
        $('#context-menu').removeClass('reverse-y');
      }

      if (render_x <= 0) render_x = 1;
      if (render_y <= 0) render_y = 1;
      $('#context-menu').css('left', (render_x + 'px'));
      $('#context-menu').css('top', (render_y + 'px'));
      $('#context-menu').show();

      //if (window.parseStylesheets) { window.parseStylesheets(); } // IE
    }
  });
}

function contextMenuSetLastSelected(tr) {
  $('.cm-last').removeClass('cm-last');
  tr.addClass('cm-last');
}

function contextMenuLastSelected() {
  return $('.cm-last').first();
}

function contextMenuUnselectAll() {
  $('input[type=checkbox].toggle-selection').prop('checked', false);
  $('.hascontextmenu').each(function(){
    contextMenuRemoveSelection($(this));
  });
  $('.cm-last').removeClass('cm-last');
}

function contextMenuHide() {
  $('#context-menu').hide();
}

function contextMenuToggleSelection(tr) {
  if (contextMenuIsSelected(tr)) {
    contextMenuRemoveSelection(tr);
  } else {
    contextMenuAddSelection(tr);
  }
}

function contextMenuAddSelection(tr) {
  tr.addClass('context-menu-selection');
  contextMenuCheckSelectionBox(tr, true);
  contextMenuClearDocumentSelection();
}

function contextMenuRemoveSelection(tr) {
  tr.removeClass('context-menu-selection');
  contextMenuCheckSelectionBox(tr, false);
}

function contextMenuIsSelected(tr) {
  return tr.hasClass('context-menu-selection');
}

function contextMenuCheckSelectionBox(tr, checked) {
  tr.find('input[type=checkbox]').prop('checked', checked);
}

function contextMenuClearDocumentSelection() {
  // TODO
  if (document.selection) {
    document.selection.empty(); // IE
  } else {
    window.getSelection().removeAllRanges();
  }
}

function contextMenuInit() {
  contextMenuCreate();
  contextMenuUnselectAll();
  
  if (!contextMenuObserving) {
    $(document).click(contextMenuClick);
    $(document).contextmenu(contextMenuRightClick);
    
    $(document).longpress( contextMenuRightClick, contextMenuClick );

    contextMenuObserving = true;
  }
}

function toggleIssuesSelection(el) {
  var checked = $(this).prop('checked');
  var boxes = $(this).parents('table').find('input[name=ids\\[\\]]');
  boxes.prop('checked', checked).parents('.hascontextmenu').toggleClass('context-menu-selection', checked);
}

function window_size() {
  var w;
  var h;
  if (window.innerWidth) {
    w = window.innerWidth;
    h = window.innerHeight;
  } else if (document.documentElement) {
    w = document.documentElement.clientWidth;
    h = document.documentElement.clientHeight;
  } else {
    w = document.body.clientWidth;
    h = document.body.clientHeight;
  }
  return {width: w, height: h};
}

function screen_size() {
  var w;
  var h;

    w = screen.width;
    h = screen.height;

  return {width: w, height: h};
}

$(document).ready(function(){
  contextMenuInit();
  $('input[type=checkbox].toggle-selection').on('change', toggleIssuesSelection);
});

// Stephan Wenzel java script von - https://github.com/vaidik/jquery-longpress.git

/**
 * Longpress is a jQuery plugin that makes it easy to support long press
 * events on mobile devices and desktop borwsers.
 *
 * @name longpress
 * @version 0.1.2
 * @requires jQuery v1.2.3+
 * @author Vaidik Kapoor
 * @license MIT License - http://www.opensource.org/licenses/mit-license.php
 *
 * For usage and examples, check out the README at:
 * http://github.com/vaidik/jquery-longpress/
 *
 * Copyright (c) 2008-2013, Vaidik Kapoor (kapoor [*dot*] vaidik -[at]- gmail [*dot*] com)
 */

(function($) {
    $.fn.longpress = function(longCallback, shortCallback, duration) {
        if (typeof duration === "undefined") {
            duration = 500;
        }

        return this.each(function() {
            var $this = $(this);

            // to keep track of how long something was pressed
            var mouse_down_time;
            var timeout;

            // mousedown callback
            function mousedown_callback(e) {
                mouse_down_time = new Date().getTime();
                var context = $(this);

                // set a timeout to call the longpress callback when time elapses
                timeout = setTimeout(function() {
                    if (typeof longCallback === "function") {
                        longCallback.call(context, e, "long_mouse");
                    } else {
                        $.error('Callback required for long press. You provided: ' + typeof longCallback);
                    }
                }, duration);
            }

            // mouseup callback
            function mouseup_callback(e) {
                var press_time = new Date().getTime() - mouse_down_time;
                if (press_time < duration) {
                    // cancel the timeout
                    clearTimeout(timeout);

                    // call the shortCallback if provided
                    if (typeof shortCallback === "function") {
                        shortCallback.call($(this), e);
                    } else if (typeof shortCallback === "undefined") {
                        ;
                    } else {
                        $.error('Optional callback for short press should be a function.');
                    }
                }
            }

            // touchstart callback
            function touchstart_callback(e) {
                mouse_down_time = new Date().getTime();
                var context = $(this);

                // set a timeout to call the longpress callback when time elapses
                timeout = setTimeout(function() {
                    if (typeof longCallback === "function") {
                        longCallback.call(context, e, "long_touch");
                    } else {
                        $.error('Callback required for long press. You provided: ' + typeof longCallback);
                    }
                }, duration);
            }

            //  touchend callback
            function touchend_callback(e) {
                var press_time = new Date().getTime() - mouse_down_time;
                if (press_time < duration) {
                    // cancel the timeout
                    clearTimeout(timeout);

                    // call the shortCallback if provided
                    if (typeof shortCallback === "function") {
                        shortCallback.call($(this), e);
                    } else if (typeof shortCallback === "undefined") {
                        ;
                    } else {
                        $.error('Optional callback for short press should be a function.');
                    }
                }
            }
                        // cancel long press event if the finger or mouse was moved
            function move_callback(e) {
                clearTimeout(timeout);
            }

            // Browser Support

//           $this.on('mousedown',  mousedown_callback); 
//           $this.on('mouseup',    mouseup_callback); 
//           $this.on('mousemove',  move_callback);
//           $this.on('touchstart', touchstart_callback); 
 

             // Mobile Support
             $this.on('touchstart', touchstart_callback); 
             $this.on('touchend',   touchend_callback); 
             $this.on('touchmove',  move_callback);
        });
    };
}(jQuery));

