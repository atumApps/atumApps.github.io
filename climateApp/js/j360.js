/**
 * j360 jQuery plugin
 * author     Stable Flow
 * copyright  (c) 2009-2010 by StableFlow
 * link       http://www.stableflow.com/downloads/jquery-plugins/360-degrees-product-view/
 *
 * Version: 1.0.0 (12/13/2010)
 * Requires: jQuery v1.3+
 *
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 */
(function($){
    $.fn.j360 = function(options) {
        var defaults = {
            clicked: false,
            currImg: 1
        }
        var options = jQuery.extend(defaults, options);
        return this.each(function() {
            var $obj = jQuery(this);
            var aImages = {};
            $obj.css({
                // 'margin-left' : 'auto',
                // 'margin-right' : 'auto',
                // 'width': 'auto',
                'object-fit': 'contain',
                'text-align' : 'center',
                'overflow' : 'hidden',
            });
            // $obj.prepend('<img src="/images/loader.gif" class="loader" style="margin-top:' + ($obj.height()/2 - 15) + 'px" />');

            $overlay = $obj.clone(true);
            $overlay.html('<img src="loader.gif" class="loader" style="margin-top:' + ($obj.height()/2 - 15) + 'px" />');
            $overlay.attr('id', 'view_overlay');
            $overlay.css({
                'position' : 'absolute',
                'z-index': '5',
                'top' : $obj.offset().top,
                'left' : $obj.offset().left,
                'background' : '#fff',
                'width' : '90%'
            });
            $obj.after($overlay);
            // $obj.after('<div id="colors_ctrls"></div>');
            // jQuery('#colors_ctrls').css({
            //     'width' : $obj.width(),
            //     'position' : 'absolute',
            //     'z-index': '5',
            //     'top' : $obj.offset().top + $obj.height - 50,
            //     'left' : $obj.offset().left
            // });

            var imageTotal = 0;
            jQuery('img', $obj).each(function() {
                aImages[++imageTotal] = jQuery(this).attr('src');
                preload(jQuery(this).attr('src'));
            })
            var imageCount = 0;
            jQuery('.preload_img').load(function() {
                if (imageCount == 719) {
                    // console.log("All loaded??")
                    document.getElementById("loader").style.visibility = "hidden";
                    document.getElementById("figure-container").style.visibility = "visible";
                }
                if (++imageCount == imageTotal) {
                    $overlay.animate({
                        'filter' : 'alpha(Opacity=0)',
                        'opacity' : 0
                    }, 500);
                    // console.log("INITIAL IMAGE", imageOffset, aImages[imageOffset + 1], aImages)
                    $obj.html('<img src="' + aImages[1] + '" class="myImg" />');
                    // $obj.html('<img src="' + 'foggy.jpg' + '" class="myImg" />');
                    // document.getElementById("loader").style.visibility = "hidden";
                    // document.getElementById("figure-container").style.visibility = "visible";

                    $overlay.bind('mousedown touchstart', function(e) {
                        // console.log(e.type, "triggered")
                        // if (e.type == "touchstart") {
                        //     // options.currPosX = window.event.touches[0].pageX;
                        //     options.currPosX = e.pageX;
                        // } else {
                        //     options.currPosX = e.pageX;
                        // }

                        if(e.type.includes(`touch`)) {
                            const { touches, changedTouches } = e.originalEvent ?? e;
                            const touch = touches[0] ?? changedTouches[0];
                            options.currPosX = touch.pageX;
                        } else if (e.type.includes(`mouse`)) {
                            options.currPosX = e.clientX;
                        }

                        options.clicked = true;
                        return false;
                    });
                    jQuery(document).bind('mouseup touchend', function() {
                        options.clicked = false;
                    });
                    jQuery(document).bind('mousemove touchmove refresh', function(e) {
                        const clickedOverride = (sessionStorage.getItem("clickedOverride") === "true");
                        // console.log(e.type, "triggered")
                        if (options.clicked || clickedOverride) {
                            // console.log(e.type, "clicked triggered")
                            var pageX;
                            // if (e.type == "touchmove") {
                            //     // pageX = window.event.targetTouches[0].pageX;
                            //     console.log("TEST", pageX, e)
                            //     pageX = e.pageX;
                            // } else {
                            //     pageX = e.pageX;
                            // }

                            if(e.type.includes(`touch`)) {
                                const { touches, changedTouches } = e.originalEvent ?? e;
                                const touch = touches[0] ?? changedTouches[0];
                                pageX = touch.pageX;
                                // y = touch.pageY;
                            } else if (e.type.includes(`mouse`)) {
                                pageX = e.clientX;
                                // y = e.clientY;
                            }

                            const maxImages = 90;
                            const nEndYears = 2;
                            const nHemi = 2;
                            const modelIndex = sessionStorage.getItem("modelIndex");
                            const timeIndex = sessionStorage.getItem("timeIndex");
                            const hemiIndex = sessionStorage.getItem("hemiIndex");
                            const imageOffset = modelIndex * maxImages * nEndYears * hemispheres.length + timeIndex * maxImages * nHemi + hemiIndex * maxImages;

                            var width_step = 4;
                            if ((Math.abs(options.currPosX - pageX) >= width_step) || clickedOverride) {
                                if (clickedOverride) {
                                    // Don't update the image index
                                } else if (options.currPosX - pageX >= width_step) {
                                    options.currImg++;
                                    if (options.currImg >= maxImages) {
                                        options.currImg = options.currImg - maxImages;
                                    }
                                } else {
                                    options.currImg--;
                                    while (options.currImg < 0) {
                                        options.currImg += maxImages
                                    }
                                }
                                options.currPosX = pageX;

                                sessionStorage.setItem("clickedOverride", false);
                                document.getElementById("product").style.filter = "";
                                $obj.html('<img src="' + aImages[options.currImg + imageOffset + 1] + '" class="myImg" />');
                            }
                        }
                    });
                }
            });

            // if (jQuery.browser.msie || jQuery.browser.mozilla || jQuery.browser.opera || jQuery.browser.safari ) {
                jQuery(window).resize(function() {
                    onresizeFunc($obj, $overlay);
                });
            // } else {
                var supportsOrientationChange = "onorientationchange" in window,
                orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";
                window.addEventListener(orientationEvent, function() {
                    onresizeFunc($obj, $overlay);
                }, false);
            // }
            onresizeFunc($obj, $overlay)

        });
    };
})(jQuery)

function onresizeFunc($obj, $overlay) {
    /*
	$obj.css({
        'margin-top' : $(document).height()/2 - 150
    });*/
    $overlay.css({
        'margin-top' : 0,
        'top' : $obj.offset().top,
        'left' : $obj.offset().left
    });

    // jQuery('#colors_ctrls').css({
    //     'top' : $obj.offset().top + $obj.height - 50,
    //     'left' : $obj.offset().left
    // });
}

function preload(image) {
    if (typeof document.body == "undefined") return;
    
    try {
        var div = document.createElement("div");
        var s = div.style;
        s.position = "absolute";
        s.top = s.left = 0;
        s.width = "100%"
        s.visibility = "hidden";
        document.body.appendChild(div);
        div.innerHTML = "<img class=\"preload_img\" src=\"" + image + "\" />";
    } catch(e) {
    // Error. Do nothing.
    }
}