(function($) {
	
	var pos;
	var timer = null;
	var counter = 0;

	$("#color_slider_left").live("click", function() {
		pos = $("#patterns").position().left;
		counter = 0;

		startAnimation("left");		
	});

	$("#color_slider_right").live("click", function() {
		pos = $("#patterns").position().left;
		counter = 0;

		startAnimation("right");		
	});

	startAnimation = function(d) {		
		stopAnimation();
		if(d == "left") timer = setInterval(function() { movetoleft(); }, 1);
		else timer = setInterval(function() { movetoright(); }, 1);
	};

	stopAnimation = function() {		
		if(timer != null) {
			clearInterval(timer);
            timer = null;				
		}
	};

	movetoleft = function(){	
		if(pos >= 0) {
			pos = 0;
			$("#patterns").css({ left: pos});
			stopAnimation();
			return;
		} else {
			if(counter >= 2) {
				stopAnimation();
				return;
			} else {
				counter++;
				pos += 31;
				$("#patterns").css({ left: pos});
			}
		}
	};

	movetoright = function(){
		var w = $("#patterns").width();
		if(pos <= 270 - w) {
			pos = 270 - w;
			$("#patterns").css({ left: pos});
			stopAnimation();			
			return;
		} else {
			if(counter >= 2) {
				stopAnimation();				
				return;
			} else {				
				counter++;
				pos -= 31;								
				$("#patterns").css({ left: pos});
			}
		}		
	};

})(jQuery);