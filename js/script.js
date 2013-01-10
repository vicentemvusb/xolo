$(function(){
	$('#control').knobKnob({
		snap : 10,
		value: 154,
		turn : function(ratio){
			// Update the dom only when the number of active bars
			// changes, instead of on every move
		}
	});

	$( "#accordion" ).accordion({
		clearStyle: true,
		autoHeight: false,
		collapsible: true
	});		

	$( "#dialog" ).hide();	

	$( "#txtSpacing" ).spinner({ min: -5, max: 20 });
	
	$( "#aliasSpacing" ).spinner({ min: -5, max: 20 });
});
