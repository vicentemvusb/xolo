var base, tshirt, tshirt1, tshirt2, tshirtlayer;
var global_shirtid;
var outercolor, innercolor;
var canvas;
var selectedDesign;
var dataXML;
var isDefault = true;
var isAddAlias = false;
var process_name;
var tablecolor_name;
var server_url = ""

var tableColorArray = new Array();
var colorChargeArray = new Array();
var innerSideColors = new Array();
var isInner = 0;
var colorMode = "";

var SHIRT_WIDTH = 300;
var SHIRT_HEIGHT = 300;
var BASE_WIDTH = 360;
var BASE_HEIGHT = 560;

var SIDE_ID = new Array("front", "back", "left", "right");

var bounds = ({
	x: 0,
	y: 0,
	width: 0,
	height: 0
});

var shirtPoint = ({
	x: 0,
	y: 0
});

var shirtlayers = [];
var faceData = [];
var currentFaceIndex = 0;
var designCount = 0;

window.onload = function () {
	if (isCanvasSupported()) {
		init();
	} else {
		$("#alertpopup").fadeIn();
	}
};
function isCanvasSupported() {
	var elem = document.createElement("canvas");
	return !! (elem.getContext && elem.getContext("2d"));
}
function FaceVO() {
	this.object;
	this.faceIndex = 0;
	this.position;
}
function init() {
	$("#root").show();
	$(document).keydown(function (e) {
		if (e.which == 46) {
			removeDesign();
		}
	});
	addCanvas();
	loadAssets();
	//addFileAPI();
}
function addCanvas() {
	canvas = new fabric.Canvas("container");
	var $ = function (id) {
		return document.getElementById(id);
	};
	canvas.observe({
		'object:moving': updateControls,
		'object:scaling': updateControls,
		'object:resizing': updateControls
	});
	canvas.observe({
		'object:selected': onTargetSelected
	});
	canvas.observe({
		'selection:cleared': onTargetDeselected
	});
}
function updateControls() {
	var activeObject = canvas.getActiveObject();
	constrainToBounds(activeObject);
	setSliders(activeObject);
	setFaceData(canvas.getActiveObject());
}
function onTargetSelected() {
	$("#targetboundary").show();
}
function onTargetDeselected() {
	$("#targetboundary").hide();
}
function loadAssets() {
	$.ajax({
		type: "GET",
		url: server_url + "data/data.xml",
		dataType: "xml",
		success: xmlParser
	});
}
function xmlParser(xml) {
    dataXML = xml;
    
    $(dataXML).find($("#prdt_kind").val()).each(function () {
		$(this).find("product").each(function () {
			var shirtid = $(this).attr("id");
			var imagename = $(this).attr("name");
			var imagepath = server_url + $(this).attr("thumb");            
			var label = $(this).attr("name");
			$("#tshirtlist").append("<li><img id=\"" + shirtid + "\" title=\"" + imagename + "\" class=\"tshirtitem\" src=\"" + imagepath + "\"/></li>");
		});
	});
    
    $(dataXML).find("depart").each(function() {
        if($(this).attr("id") == $("#art_kind").val()) {
			$(this).find("kind").each(function() {
				if($(this).attr("id") == $("#art_part").val()) {
					$(this).find("design").each(function() {
						var imagepath = server_url + $(this).attr("thumb");
						var id = $(this).attr("id");
						var label = $(this).attr("name");
					
						$("#artlist").append("<li><img class=\"designitem\" id=\"" + id + "\" title=\"" + label + "\" src=\"" + imagepath + "\"/><div class=\"label\">" + label + "</div></li>");
					});
				}
			});
		}
    });

	$(dataXML).find("settings").each(function() {
		$(this).find("process").each(function() {
			$(this).find("item").each(function() {
				if($(this).attr("id") == "1") {
					process_name = $(this).attr("name");
					$(this).find("table").each(function() {
						$(this).find("item").each(function() {
							var id = $(this).attr("id");
							var name = $(this).attr("name");
							var color = '#' + $(this).attr("hex");
							tableColorArray[id] = color;
							$("#table_colors").append("<li class=\"tablecolor\" id=\"" + id + "\" title=\"" + name + "\" style=\"background: " + color + " no-repeat;\"></li>");
						});
					});
					$(this).find("charges").each(function() {
						$(this).find("item").each(function() {
							var value = $(this).attr("value");
							var charge = $(this).attr("charge");							
							colorChargeArray[value] = charge;
						});
					});
				}
			});
		}); 
	});

	changeFontList($('#fontselect').val());

	/*
	$(dataXML).find("text").each(function () {
		var fontfamily = $(this).attr("fontfamily");
		$("#textlist").append("<div class=\"font\" id=\"txtitem\" style=\"font-family: " + fontfamily + "\"><a>" + fontfamily + "</a></div>");
	});
	*/

	var colorcount = 0;

	base = new Kinetic.Stage({
		container: "base",
		width: BASE_WIDTH,
		height: BASE_HEIGHT
	});

	shirtPoint.x = BASE_WIDTH / 2 - SHIRT_WIDTH / 2;
	shirtPoint.y = BASE_HEIGHT / 2 - SHIRT_HEIGHT / 2 - 40;

	$("#artlist").jScrollPane({
		autoReinitialise: true
	});
	$(".txtlist").jScrollPane({
		autoReinitialise: true
	});	
	isDefault = true;
	if($var.indexOf("design") != -1) {
		var id = $var.split("=")[1];
		var url = server_url + "designer/retrieve.php";
		$.post( 
			url,
			{
				frmid: id
			}, 
			function( xml ) {				
				outercolor = $(xml).find('color').text();
				innercolor = $(xml).find('innercolor').text();

				var shirtid = $(xml).find('product').text();

				global_shirtid = shirtid;

				//startRenderBg();

				//loadBackground(shirtid, 0, function() {
					showMessageDlg("Loading product image data...", "Loading...");
					addTshirt(shirtid, 0, function() {	
						hideMessageDlg();

						var items = [];
						$(xml).find('items').each(function() {
							$(this).find('item').each(function() {
								items.push($(this));							
							});
						});
						processDesignItem(items, 0, function() {
							currentFaceIndex = 0;
							showObjectsForFace();
						});
					});					
				//});
			}
		);
	} else if($var.indexOf("product") != -1) {
		var shirtid = $var.split("=")[1];

		global_shirtid = shirtid;

		getProductColor(shirtid, function() {
			//startRenderBg();

			//loadBackground(shirtid, 0, function() {
				showMessageDlg("Loading product image data...", "Loading...");
				addTshirt(shirtid, 0, function() {
					hideMessageDlg();
				});
			//});
		});		
	} else {
		var shirtid = $(dataXML).find("startpid").text();

		global_shirtid = shirtid;

		getProductColor(shirtid, function() {
			//startRenderBg();

			//loadBackground(shirtid, 0, function() {
				showMessageDlg("Loading product image data...", "Loading...");
				addTshirt(shirtid, 0, function() {
					hideMessageDlg();
				});
			//});
		});
	}
	if($var.indexOf("gallery") != -1) {
		var id = $var.split("=")[1];
		addGalleryWithOnlyID($(dataXML), id);
	}
	listenItemEvents();
	$("#tshirtlist").jScrollPane();
	$("#scaleslider").slider({
		value: 100,
		min: 1,
		max: 50,
		slide: function (event, ui) {			
			var activeObject = canvas.getActiveObject();
            if(activeObject != null) {
				$("#preloader").show();
			    activeObject.setScaleX(ui.value / 100);
			    activeObject.setScaleY(ui.value / 100);
			    constrainToBounds(activeObject);
			    canvas.renderAll();
				//renderingDesign();
				$("#preloader").hide();
            }
		}
	});    
}


$("#prdt_kind").live("change", function() {
	changeProductList();
});

function processDesignItem(items, index, callback) {
	if(items.length == index) {
		if(callback) callback();
		return;
	}

	var size = $(items[index]).attr('size').split(';');
	var flip = $(items[index]).attr('flip').split(';');
	var rect = $(items[index]).attr('rectangle').split(';');
	var style = $(items[index]).attr('style').split(';');

	var itemOptions = {};

	itemOptions.scaleX = size[0];
	itemOptions.scaleY = size[1];
	itemOptions.flipX = !(flip[0]);
	itemOptions.flipY = !(flip[1]);
	itemOptions.left = parseFloat(rect[0]);
	itemOptions.top = parseFloat(rect[1]);	
	itemOptions.width = parseFloat(rect[2]);
	itemOptions.height = parseFloat(rect[3]);
	itemOptions.angle = parseInt(rect[4]);	

	var faceIndex = 0;

	if($(items[index]).attr('side') == 'front') faceIndex = 0;
	else if($(items[index]).attr('side') == 'back') faceIndex = 1;
	else if($(items[index]).attr('side') == 'left') faceIndex = 2;
	else if($(items[index]).attr('side') == 'right') faceIndex = 3;

	if($(items[index]).attr('type') == 'image') {		

		var originalColors = [];
		var currentColors = [];			

		if($(items[index]).attr('color') != "") {				
			originalColors[0] = '000000';
			currentColors[0] = $(items[index]).attr('color');
		} else if($(items[index]).attr('colors') != "") {
			var colors = $(items[index]).attr('colors').split(';');									
			for(var i=0; i<colors.length; i+=2) {
				originalColors.push(colors[i]);
				currentColors.push(colors[i+1]);					
			}
		}			

		itemOptions.originalColors = originalColors;
		itemOptions.currentColors = currentColors;
		itemOptions.isUploadedImage = !!style[0];

		addGallery($(items[index]).attr('source'), faceIndex, itemOptions, function() {
			processDesignItem(items, index+1, callback);
		});
	} else if($(items[index]).attr('type') == 'text') {		
		itemOptions.fontFamily = style[0];
		itemOptions.fontSize = parseInt(style[1]);
		itemOptions.isBorder = !!style[2];
		if(itemOptions.isBorder) itemOptions.borderColor = style[3];
		itemOptions.strokeWidth = parseInt(style[4]);
		itemOptions.letterSpacing = parseInt(style[5]);
		itemOptions.backgroundColor = style[7];
		itemOptions.fill = "#" + $(items[index]).attr('color');
		itemOptions.fillColor = $(items[index]).attr('color');
		
		var isAlias = $(items[index]).attr('isalias');

		if(isAlias == "1") {
			addAlias($(items[index]).attr('source'), faceIndex, itemOptions, function() {
				processDesignItem(items, index+1, callback);
			});
		} else {
			addText($(items[index]).attr('source'), faceIndex, itemOptions, function() {
				processDesignItem(items, index+1, callback);
			});
		}		
	} else if($(items[index]).attr('type') == 'vtext') {								
		itemOptions.fontFamily = style[0];
		itemOptions.fontSize = parseInt(style[1]);
		itemOptions.isBorder = !!style[2];
		if(itemOptions.isBorder) itemOptions.borderColor = style[3];
		itemOptions.strokeWidth = parseInt(style[4]);
		itemOptions.letterSpacing = parseInt(style[5]);
		itemOptions.backgroundColor = style[7];
		itemOptions.fill = "#" + $(items[index]).attr('color');
		itemOptions.fillColor = $(items[index]).attr('color');		

		addVerticalText($(items[index]).attr('source'), faceIndex, itemOptions, function() {
			processDesignItem(items, index+1, callback);
		});
	} else if($(items[index]).attr('type') == 'ctext') {								
		itemOptions.fontFamily = style[0];
		itemOptions.fontSize = parseInt(style[1]);
		itemOptions.isBorder = !!style[2];
		if(itemOptions.isBorder) itemOptions.borderColor = style[3];
		itemOptions.strokeWidth = parseInt(style[4]);
		itemOptions.letterSpacing = parseInt(style[5]);
		itemOptions.radius = parseFloat(style[6]);
		itemOptions.backgroundColor = style[7];		
		itemOptions.fill = "#" + $(items[index]).attr('color');
		itemOptions.fillColor = $(items[index]).attr('color');

		addCircleText($(items[index]).attr('source'), faceIndex, itemOptions, function() {
			processDesignItem(items, index+1, callback);
		});
	}
}

function changeProductList() {
	$("#tshirtlist").find(".jspPane").children().remove();
	$(dataXML).find($("#prdt_kind").val()).each(function () {
		$(this).find("product").each(function () {
			var shirtid = $(this).attr("id");
			var imagename = $(this).attr("name");
			var imagepath = server_url + $(this).attr("thumb");            
			var label = $(this).attr("name");
			$("#tshirtlist").find(".jspPane").append("<li><img id=\"" + shirtid + "\" title=\"" + imagename + "\" class=\"tshirtitem\" src=\"" + imagepath + "\"/></li>");
		});
	});
	
	$("#tshirtlist").jScrollPane();	
}

$("#art_kind").live("change", function() {	
	var id=$(this).val();
	var dataString = 'id='+ id;

	$.ajax({
		type: "POST",
		url: "www.laxpinnies.com" + "/designer/ajax_part.php",
		data: dataString,
		cache: false,
		success: function(html){
			$("#art_part").html(html);
			changeGalleryList();
		} 
	});	
});

$("#art_part").live("change", function() {
	changeGalleryList();
});

function changeGalleryList() {
	$("#artlist").find(".jspPane").children().remove();
	$(dataXML).find("depart").each(function() {
        if($(this).attr("id") == $("#art_kind").val()) {
			$(this).find("kind").each(function() {
				if($(this).attr("id") == $("#art_part").val()) {
					$(this).find("design").each(function() {
						var imagepath = server_url + $(this).attr("thumb");
						var id = $(this).attr("id");
						var label = $(this).attr("name");
						$("#artlist").find(".jspPane").append("<li><img class=\"designitem\" id=\"" + id + "\" title=\"" + label + "\" src=\"" + imagepath + "\"/><div class=\"label\">" + label + "</div></li>");
					});
				}
			});
		}
    });

	$("#artlist").jScrollPane();	
}

/*
function addFileAPI() {
	var fileselect = document.getElementById("fileselect");
	fileselect.addEventListener("change", fileSelectHandler, false);
}
*/
function fileSelectHandler(e) {
	var files = e.target.files || e.dataTransfer.files;
	for (var i = 0, f; f = files[i]; i++) {		
		if (!f.type.match('image/png') && !f.type.match('image/gif')) {
			//$("#fileselect").after('<span class="error">Please select .png or .gif file as image file type.</span>');
			continue;
        }

		$(".error").hide();
		parseFile(f);
	}
}
function parseFile(file) {
	if (file.type.indexOf("image") == 0) {
		var reader = new FileReader;
		reader.onload = function (e) {
			$("#fileselect").attr("text", file.name);

			fabric.Image.fromURL(e.target.result, function (img) {
				$("#preloader").show();
				var oImg = img.set();
				canvas.add(oImg).centerObjectH(oImg).centerObjectV(oImg).renderAll();
				oImg.setCoords();
				canvas.setActiveObject(oImg);
				addObjectToFace(oImg, currentFaceIndex);
				setFaceData(oImg);
				constrainToBounds(oImg);
				canvas.renderAll();
				//renderingDesign();
				$("#preloader").hide();
			});
		};
		reader.readAsDataURL(file);
	}
}

function addTshirt(shirtid, index, callback) {	

	$("#preloader").show();	

	base.removeChildren();		

	shirtlayers = [];

	loadShirtImage(shirtid, index, 0, function() {

		setProductColor(0);
		setProductColor(1);
		
		if(callback) callback();
	});	

	addColor(shirtid);

	addSideThumbs(shirtid);
	setBounds(shirtid, 0);	
	
	$("#preloader").hide();

}

function loadShirtImage(shirtid, index, layer_inx, callback) {	

	if(layer_inx >= 3) {
		callback(); 
		return;
	}
	
	

	tshirt = new Image();
	tshirt.src = getImageURL(shirtid, index, layer_inx);

	tshirt.onload = function () {		
		var image = new Kinetic.Image({			
			x: shirtPoint.x,
			y: shirtPoint.y,
			image: tshirt,
			width: SHIRT_WIDTH,
			height: SHIRT_HEIGHT
		});

		tshirtlayer = new Kinetic.Layer();
		tshirtlayer.add(image);
		base.add(tshirtlayer);

		loadShirtImage(shirtid, index, layer_inx+1, callback);
	};
}

function addGalleryWithOnlyID(xml,id) {
	xml.find("design").each(function() {
		if($(this).attr("id") == id) {
			addGallery(server_url + $(this).attr("src"), currentFaceIndex);
		}
	});
}

function addGalleryWithUpload(src, imgOptions, callback) {
	fabric.Image.fromURL(src, function (img) {
		$("#preloader").show();
		
		var oImg = img.set();
		canvas.add(oImg).centerObjectH(oImg).centerObjectV(oImg).renderAll();
		oImg.setCoords();
		canvas.setActiveObject(oImg);
		addObjectToFace(oImg, currentFaceIndex);
		setFaceData(oImg);
		constrainToBounds(oImg);
		canvas.renderAll();
		//renderingDesign();
		
		$("#preloader").hide();

		$("#dialog:ui-dialog").dialog("close");				

	}, imgOptions);
}

function addGallery(src, faceIndex, imgOptions, callback) {
	if(imgOptions) {
		fabric.Image.fromURL(src, function (img) {
			$("#preloader").show();

			var oImg = img.set();
			canvas.add(oImg);
			oImg.setCoords();
			canvas.setActiveObject(oImg);
			addObjectToFace(oImg, faceIndex);
			setFaceData(oImg);
			canvas.renderAll();
			//renderingDesign();
			
			if(!imgOptions.isUploadedImage) {
				if(imgOptions.originalColors.length == 1) {
					setGalleryColor('#' + imgOptions.currentColors[0]);
				} else if(imgOptions.originalColors.length > 1){
					for(var i=0; i<imgOptions.originalColors.length; i++) {				
						changeGalleryColor('#' + imgOptions.originalColors[i], '#' + imgOptions.currentColors[i]);				
					}
				}
			}
			
			$("#preloader").hide();

			if(callback) callback();				

			}, imgOptions);
	} else {	
		fabric.Image.fromURL(src, function (img) {
			$("#preloader").show();
			var oImg = img.set();
			canvas.add(oImg).centerObjectH(oImg).centerObjectV(oImg).renderAll();
			oImg.setCoords();
			canvas.setActiveObject(oImg);
			addObjectToFace(oImg, faceIndex);
			setFaceData(oImg);
			constrainToBounds(oImg);
			canvas.renderAll();
			//renderingDesign();
			$("#preloader").hide();

			if(callback) callback();			
		});		
	}
}

function addColor(shirtid) {
//	$("#prdt_colors").children().empty();
	$("#patterns").empty();
	$("#patterns").css("left", 0);

	$(dataXML).find("product").each(function() {
		if($(this).attr("id") == shirtid) {
			var count = 0;
			$(this).find("color").each(function() {
				var id = $(this).attr("id");
				var name = $(this).attr("name");
				var color = $(this).attr("hex");
				var imagePath = $(this).attr("image");
				var patternPath = $(this).attr("pattern");

				if(patternPath == "") {
					$("#patterns").append("<li class=\"color\" id=\"" + id + "\" title=\"" + name + "\" style=\"background: " + color + " no-repeat;\"></li>");
				} else {
					$("#patterns").append("<li class=\"pattern\" id=\"" + id + "\" title=\"" + name + "\" style=\"background: url(" + server_url + patternPath + ") no-repeat; background-size: 24px 24px;\"></li>");						
					/*
					$.ajax({
					  url: server_url + patternPath,
					  context: document.body,
					  success: function(){
					    $("#patterns").append("<li class=\"pattern\" id=\"" + id + "\" title=\"" + name + "\" style=\"background: url(" + server_url + patternPath + ") no-repeat; background-size: 24px 24px;\"></li>");						
					  }
					});
					*/
				}			
				count++;
			});			

			var width = (Math.floor(count / 3) + 1) * 31;
			$("#patterns").css("width", width);
		}
	});

	$(".color").live("click", function () {									
		var colorid = $(this).attr("id");

		if($("select#colorkind").val() == "0") outercolor = colorid;
		else innercolor = colorid;


		setProductColor(parseInt($("select#colorkind").val()));		
	});

	$(".pattern").live("click", function () {
		var colorid = $(this).attr("id");

		if($("select#colorkind").val() == "0") outercolor = colorid;
		else innercolor = colorid;

		setProductColor(parseInt($("select#colorkind").val()));		
	});
}

function listenItemEvents() {
	$(".tshirtitem").live("click", function () {
		//$("#preloader").show();

		//tshirt.src = $(this).attr("src");
		var shirtid = $(this).attr("id");
		
		global_shirtid = shirtid;

		getProductColor(shirtid, function() {
			//startRenderBg();

			//loadBackground(shirtid, 0, function() {
				showMessageDlg("Loading product image data...", "Loading...");
				addTshirt(shirtid, 0, function() {
					hideMessageDlg();
				});					
			//});
		});
	});
	
	$(".designitem").live("click", function () {	
		var id = $(this).attr("id");

		$(dataXML).find("depart").each(function() {
			if($(this).attr("id") == $("#art_kind").val()) {
				$(this).find("kind").each(function() {
					addGalleryWithOnlyID($(this),id);
				});
			}
		});	
	});
	
	$("#addTextBtn").click(function () {
		if($("#textinp").val() == "") return;
		addText($("#textinp").val(), currentFaceIndex);	
	});
	$("#addCircleTextBtn").click(function () {
		if($("#textinp").val() == "") return;
		addCircleText($("#textinp").val(), currentFaceIndex);
	});
	$("#addVertTextBtn").click(function () {
		if($("#textinp").val() == "") return;
		addVerticalText($("#textinp").val(), currentFaceIndex);
	});
	$("#changeTextBtn").click(function () {	
		$("#preloader").show();
		var activeObject = canvas.getActiveObject();
		if(activeObject == null || activeObject.type != "text") return;
		activeObject.setText($("#changeText").val());
		canvas.renderAll();
		//renderingDesign();
		$("#preloader").hide();
	});
	$("#hflip").click(function () {		
		var activeObject = canvas.getActiveObject();
		if(activeObject == null) return;
		$("#preloader").show();
		activeObject.flipX = !activeObject.flipX;
		canvas.renderAll();
		//renderingDesign();
		$("#preloader").hide();
	});
	$("#vflip").click(function () {		
		var activeObject = canvas.getActiveObject();
		if(activeObject == null) return;
		$("#preloader").show();
		activeObject.flipY = !activeObject.flipY;
		canvas.renderAll();
		//renderingDesign();
		$("#preloader").hide();
	});
	$("#vcenter").click(function () {		
		var activeObject = canvas.getActiveObject();
		if(activeObject == null) return;
		$("#preloader").show();
		canvas.centerObjectV(activeObject).renderAll();
		//renderingDesign();
		$("#preloader").hide();
	});
	$("#hcenter").click(function () {		
		var activeObject = canvas.getActiveObject();
		if(activeObject == null) return;
		$("#preloader").show();
		canvas.centerObjectH(activeObject).renderAll();
		//renderingDesign();
		$("#preloader").hide();
	});
	$("#sendtoback").click(function () {		
		var activeObject = canvas.getActiveObject();
		if(activeObject == null) return;
		$("#preloader").show();
		canvas.sendBackwards(activeObject);
		//renderingDesign();
		$("#preloader").hide();
	});
	$("#bringtofront").click(function () {		
		var activeObject = canvas.getActiveObject();
		if(activeObject == null) return;
		$("#preloader").show();
		canvas.bringForward(activeObject);
		//renderingDesign();
		$("#preloader").hide();
	});
	/*$('#font').fontselect().change(function(){
	    // replace + signs with spaces for css
		var font = $(this).val().replace(/\+/g, ' ');
	  
	    // split font into family and weight
	    font = font.split(':');

	    var activeObject = canvas.getActiveObject();
		if(activeObject == null) return;
		if(activeObject.type == "text" || activeObject.type == "alias") {
			$("#preloader").show();
			activeObject.set("fontFamily", font[0]);
			canvas.renderAll();
			rendering();
			$("#preloader").hide();
		}
	});
	$('#font').live("change", function(){		
		$(this).css("font-family", $(this).val());
	    var activeObject = canvas.getActiveObject();
		if(activeObject == null) return;
		if(activeObject.type == "text" || activeObject.type == "alias") {			
			$("#preloader").show();
			activeObject.set("fontFamily", $(this).val());
			canvas.renderAll();
			rendering();
			$("#preloader").hide();
		}
	});*/
	$('#fontselect').live("change", function(){		
		var id = $(this).val();

		changeFontList(id);	    
	});

	$(".font").live("click", function () {
		var activeObject = canvas.getActiveObject();
		if(activeObject == null) return;
		if(activeObject.type == "text") {			
			$("#preloader").show();
			activeObject.set("fontFamily", $(this).text());
			canvas.renderAll();
			//renderingDesign();
			$("#preloader").hide();
		}
	});	

	$(".colorSelector").live("click", function() {
		tablecolor_name = $(this).attr("id");
		
		$("#tableColorDialog").attr("title", process_name);
		$("#tableColorDialog").show();

		$("#tableColorDialog").dialog({
			resizable: false,
			width:283,
			height:190,
			modal: true
		});

		$(".tablecolor").live("click", function() {
			var color = tableColorArray[$(this).attr("id")];
			if(tablecolor_name == "artColor") {
				setGalleryColor(color);
				$('#artColor div').css('backgroundColor', color);
			} else if(tablecolor_name == "textColor") {
				var activeObject = canvas.getActiveObject();
				if(activeObject == null) return;
				if(activeObject.type == "text") {
					$("#preloader").show();	
					activeObject.setColor(color);
					canvas.renderAll();
					//renderingDesign();
					$("#preloader").hide();	
				}
				$('#textColor div').css('backgroundColor', color);
			} else if(tablecolor_name == "aliasColor") {
				var activeObject = canvas.getActiveObject();
				if(activeObject == null) return;
				if(activeObject.type == "alias") {
					$("#preloader").show();	
					activeObject.setColor(color);
					canvas.renderAll();
					//renderingDesign();
					$("#preloader").hide();	
				}
				$('#aliasColor div').css('backgroundColor', color);
			} else if(tablecolor_name == "borderColor") {
				if($('#chkborder').is(':checked')) {
					var activeObject = canvas.getActiveObject();
					if(activeObject == null) return;
					if(activeObject.type == "text") {
						$("#preloader").show();	
						activeObject.setBorder(color, true);						
						canvas.renderAll();
						//renderingDesign();
						$("#preloader").hide();	
					}
					$('#borderColor div').css('backgroundColor', color);
				}
			} else if(tablecolor_name == "aliasBorderColor") {
				if($('#aliasborder').is(':checked')) {
					var activeObject = canvas.getActiveObject();
					if(activeObject == null) return;
					if(activeObject.type == "alias") {
						$("#preloader").show();	
						activeObject.setBorder(color, true);						
						canvas.renderAll();
						//renderingDesign();
						$("#preloader").hide();	
					}
					$('#aliasBorderColor div').css('backgroundColor', color);
				}
			} else {
				if(colorMode == "Art Color") {
					var colorFrom = '#' + tablecolor_name;
					changeGalleryColor(colorFrom, color);				
				} else if(colorMode == "Inner Side Color") {
					var artColors = getArtColors();
					for(var i=0; i<artColors.length; i++) {
						if(artColors[i] == tablecolor_name) {
							innerSideColors[i] = color.substring(1, color.length);
						}
					}
				}
				$('#' + tablecolor_name + ' div').css('backgroundColor', color);
			}

			$("#tableColorDialog").dialog( "close" );
		});
	});


	$('#chkborder').prop('checked', false);

	$('#chkborder').live('click', function(e){	
		if($(this).is(':checked')) {			
			var activeObject = canvas.getActiveObject();
			if(activeObject == null) return;			
			if(activeObject.type == "text") {
				$("#preloader").show();
				var color = rgbtohex2($('#borderColor div').css('backgroundColor'));
				activeObject.setBorder(color, true);
				canvas.renderAll();
				//renderingDesign();
				$("#preloader").hide();
			}
		} else {
			var activeObject = canvas.getActiveObject();
			if(activeObject == null) return;			
			if(activeObject.type == "text") {	
				$("#preloader").show();
				activeObject.setBorder(color, false);	
				canvas.renderAll();
				//renderingDesign();
				$("#preloader").hide();
			}
		}
	});	

	$('#aliasborder').prop('checked', false);

	$('#aliasborder').live('click', function(e){	
		if($(this).is(':checked')) {			
			var activeObject = canvas.getActiveObject();
			if(activeObject == null) return;			
			if(activeObject.type == "alias") {
				$("#preloader").show();
				var color = rgbtohex2($('#aliasBorderColor div').css('backgroundColor'));
				activeObject.setBorder(color, true);
				canvas.renderAll();
				//renderingDesign();
				$("#preloader").hide();
			}
		} else {
			var activeObject = canvas.getActiveObject();
			if(activeObject == null) return;			
			if(activeObject.type == "alias") {	
				$("#preloader").show();
				activeObject.setBorder(color, false);	
				canvas.renderAll();
				//renderingDesign();
				$("#preloader").hide();
			}
		}
	});	

	$("#txtSpacing").live('change', function() {
		var activeObject = canvas.getActiveObject();
		if(activeObject == null) return;
		if(activeObject.type == "text") {
			$("#preloader").show();
			activeObject.setSpacing(parseInt($(this).val()));
			canvas.renderAll();
			//renderingDesign();
			$("#preloader").hide();
		}
	});

	$("#aliasSpacing").live('change', function() {
		var activeObject = canvas.getActiveObject();
		if(activeObject == null) return;
		if(activeObject.type == "alias") {
			$("#preloader").show();
			activeObject.setSpacing(parseInt($(this).val()));
			canvas.renderAll();
			//renderingDesign();
			$("#preloader").hide();
		}
	});

	$( "#sliderRadius" ).slider({
		value: Math.PI,
		min: Math.PI / 4,
		max: 2 * Math.PI,
		step: Math.PI / 180,
		slide: function( event, ui ) {
			var activeObject = canvas.getActiveObject();
			if(activeObject == null) return;
			if(activeObject.type == "text" && activeObject.kind == "Circle") {
				$("#preloader").show();
				activeObject.setRadius(ui.value);
				canvas.renderAll();
				//renderingDesign();
				$("#preloader").hide();
			}
		}
	});
}

function changeFontList(id) {
	if(id == "new") {
		$("#textlist").empty();
		for(var i=0; i<googlefonts.length; i++) {
			$("#textlist").append("<div class=\"font\" id=\"txtitem\" style=\"font-family: " + googlefonts[i] + "\"><a>" + googlefonts[i] + "</a></div>");
		}
	} else {
		var dataString = 'id='+ id;

		$.ajax({
			type: "POST",
			url: server_url + "designer/fonts.php",
			data: dataString,
			cache: false,
			success: function(html){
				$("#textlist").empty();
				$("#textlist").append(html);
			} 
		});
	}
}

function artDesignEditor(activeObject) {
	
	var originalColors = activeObject.originalColors;
	var currentColors = activeObject.currentColors;

	colorMode = "Art Color";

	$("#artChangeColor").empty();

	if(originalColors.length > 1) {

		var html = "";

		html += "<table style='width:100%; float:left;'>";	
		for(var i=0; i<originalColors.length; i++) {
			html += "<tr>";
			html += "<td><p>Original</p></td>";
			html += "<td><div class='colorChangeFrom' style='background-color:" + '#' + originalColors[i] + "'></div></td>";
			html += "<td><p>Cambiar por</p></td>";
			html += "<td>";
			html += "<div id='" + originalColors[i] + "' class='colorSelector'>";
			html += "<div style='background-color:" + '#' + currentColors[i] + "'></div>";
			html += "</div>";
			html += "</td>";
			html += "</tr>";
		}	
		html += "</table>";		
		
		$("#artChangeColor").append(html);
		alert("fjdkfdf");
	}
	
	$("#art_design").show();
}

function setGalleryColor(color) {	
	var activeObject = canvas.getActiveObject();
	if(activeObject == null) return;
	if(activeObject.type == "image") {
		$("#preloader").show();	
		activeObject.filters[0] = new fabric.Image.filters.SetColor({color: color});
		activeObject.applyFilters(canvas.renderAll.bind(canvas));
		activeObject.setSolidColor(color.substring(1, color.length));
		canvas.renderAll();
		//renderingDesign();
		$("#preloader").hide();	
	}
}

function changeGalleryColor(colorFrom, colorTo) {
	var activeObject = canvas.getActiveObject();
	if(activeObject == null) return;
	if(activeObject.type == "image") {
		$("#preloader").show();	
		activeObject.filters[0] = new fabric.Image.filters.ColorChange({origImageData: activeObject.originalImageData, colorFrom: colorFrom, colorTo: colorTo});
		activeObject.applyFilters(canvas.renderAll.bind(canvas));
		activeObject.setChangeColor(colorFrom.substring(1, colorFrom.length), colorTo.substring(1, colorTo.length));
		canvas.renderAll();
		//renderingDesign();
		$("#preloader").hide();	
	}
}

function getProductColor(shirtid, callback) {
	$(dataXML).find("product").each(function () {				
		if ($(this).attr("id") == shirtid) {					
			outercolor = $(this).attr("outercolor");				
			innercolor = $(this).attr("innercolor");											
			if(callback) {
				callback();
				return;
			}
		}
	});
}

// outer color : kind = 0; inner color : kind = 1;
function setProductColor(kind, bgCanvas, callback) {		
	var color = "";
	if(kind == 0) color = getColor(outercolor);
	else if(kind == 1) color = getColor(innercolor);
	else {
		if(callback) callback();
		return;
	}

	if(color == "") {
		if(callback) callback();
		return;	
	}

	if(color.substring(0,1) == '#') {
		$("#preloader").show();

		var layer_canvas;
		var layer_ctx;

		if(bgCanvas) {
			layer_canvas = bgCanvas;
			layer_ctx = bgCanvas.getContext('2d');
		} else {
			layer_canvas = base.children[kind].canvas;
			layer_ctx = base.children[kind].context;		
		}

		var bgData = layer_ctx.getImageData(0, 0, layer_canvas.width, layer_canvas.height);

		var rgb = hextorgb(color);

		layer_ctx.clearRect(0, 0, layer_canvas.width, layer_canvas.height);

		for (var i = 0, n = bgData.data.length; i < n; i += 4) {
			
			if(bgData.data[i+3] != 0) {
				bgData.data[i] = rgb[0];
				bgData.data[i+1] = rgb[1];
				bgData.data[i+2] = rgb[2];
			}
		}
		layer_ctx.putImageData(bgData,0,0);		

		$("#preloader").hide();

		if(callback) callback();
	} else {
		$("#preloader").show();

		var patternImgObj = new Image();

		color = server_url + color;	

		if(bgCanvas) {
			patternImgObj.onload = function () {		
				var image = new Kinetic.Image({			
					x: 0,
					y: 0,
					image: patternImgObj,
					width: 300,
					height: 300
				});			

				tshirtlayer = new Kinetic.Layer();
				tshirtlayer.add(image);
				base.add(tshirtlayer);			

				var layer_canvas = bgCanvas;
				var layer_ctx = bgCanvas.getContext("2d");

				var bgData = layer_ctx.getImageData(0, 0, layer_canvas.width, layer_canvas.height);
				var lastInx = base.children.length - 1;
				
				var pattern_canvas = base.children[lastInx].canvas;
				var pattern_ctx = base.children[lastInx].context;
				var pattern = pattern_ctx.getImageData(0, 0, layer_canvas.width, layer_canvas.height);

				layer_ctx.clearRect(0, 0, layer_canvas.width, layer_canvas.height);

				for (var i = 0, n = bgData.data.length; i < n; i += 4) {			
					if(bgData.data[i+3] != 0) {
						bgData.data[i] = pattern.data[i];
						bgData.data[i+1] = pattern.data[i+1];
						bgData.data[i+2] = pattern.data[i+2];
					}
				}

				layer_ctx.putImageData(bgData,0,0);

				base.remove(base.children[lastInx]);				

				$("#preloader").hide();

				if(callback) callback();
			};		
			patternImgObj.src = color;
		} else {			
			patternImgObj.onload = function () {		
				var image = new Kinetic.Image({			
					x: BASE_WIDTH / 2 - 300 / 2,
					y: BASE_HEIGHT / 2 - 300 / 2 - 40,
					image: patternImgObj,
					width: 300,
					height: 300
				});			

				tshirtlayer = new Kinetic.Layer();
				tshirtlayer.add(image);
				base.add(tshirtlayer);			

				var layer_canvas = base.children[kind].canvas;
				var layer_ctx = base.children[kind].context;	
				
				var bgData = layer_ctx.getImageData(0, 0, layer_canvas.width, layer_canvas.height);
				var lastInx = base.children.length - 1;
				
				var pattern_canvas = base.children[lastInx].canvas;
				var pattern_ctx = base.children[lastInx].context;
				var pattern = pattern_ctx.getImageData(0, 0, pattern_canvas.width, pattern_canvas.height);

				layer_ctx.clearRect(0, 0, layer_canvas.width, layer_canvas.height);

				for (var i = 0, n = bgData.data.length; i < n; i += 4) {			
					if(bgData.data[i+3] != 0) {
						bgData.data[i] = pattern.data[i];
						bgData.data[i+1] = pattern.data[i+1];
						bgData.data[i+2] = pattern.data[i+2];
					}
				}

				layer_ctx.putImageData(bgData,0,0);
				
				base.remove(base.children[lastInx]);

				$("#preloader").hide();

				if(callback) callback();
			};		
			patternImgObj.src = color;
		}	
	}	
}

function hextorgb(hexStr){
    // note: hexStr should be #rrggbb
    var hex = parseInt(hexStr.substring(1), 16);
    var r = (hex & 0xff0000) >> 16;
    var g = (hex & 0x00ff00) >> 8;
    var b = hex & 0x0000ff;
    return [r, g, b];
}

function rgbtohex(r, g, b) {	
	var rgb = b | (g << 8) | (r << 16);
    return '#' + rgb.toString(16);
}

// colorval : rgb(r, g, b)
function rgbtohex2(colorval) {	
    var parts = colorval.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    delete(parts[0]);
    for (var i = 1; i <= 3; ++i) {
        parts[i] = parseInt(parts[i]).toString(16);
        if (parts[i].length == 1) parts[i] = '0' + parts[i];
    }
    color = "#" + parts.join('');
	return color;
}

function rgbtohex3(r, g, b) {	
	var rgb = b | (g << 8) | (r << 16);
	rgb = rgb.toString(16);
	if(rgb.length < 6) {
		var str = "";
		for(var i=0; i<6-rgb.length; i++) {
			str += "0";
		}
		rgb = str + rgb;
	}
    return rgb;
}

function changeColor(oldHexStr, newHexStr){
	var oldHex = parseInt(oldHexStr.substring(1), 16);
	var newHex = parseInt(newHexStr.substring(1), 16);
	var hex = oldHex & newHex;
	return '#' + hex.toString(16);
}

function addAlias(val, faceIndex, txtOptions, callback) {
	$("#preloader").show();	

	if(txtOptions) {
		var txt = new fabric.Alias(val, txtOptions);		
		canvas.add(txt);
		canvas.setActiveObject(txt);
		addObjectToFace(txt, faceIndex);		
		setFaceData(txt);
		canvas.renderAll();
	} else {		
		var txt;
		if(val == "EXAMPLE") {
			var txt = new fabric.Alias("EXAMPLE", {
				fontFamily: "Impact",
				fontSize: 30,
				textAlign: "center",
				fill: "#000000",
				kind: "Name"
			});
		} else if(val == "00") {
			var txt = new fabric.Alias("00", {
				fontFamily: "CollegiateInsideFLF",
				fontSize: 50,
				textAlign: "center",
				fill: "#000000",
				kind: "Number"
			});
		}

		canvas.add(txt).centerObjectH(txt).centerObjectV(txt).renderAll();
		canvas.setActiveObject(txt);
		addObjectToFace(txt, currentFaceIndex);
		setFaceData(txt);
		constrainToBounds(txt);
		canvas.renderAll();		
	}

	//renderingDesign();
	
	$("#preloader").hide();

	if(callback) callback();
}

function addText(val, faceIndex, txtOptions, callback) {
	$("#preloader").show();	

	if(txtOptions) {		
		var txt = new fabric.Text(val, txtOptions);	
		canvas.add(txt);
		canvas.setActiveObject(txt);
		addObjectToFace(txt, faceIndex);	
		setFaceData(txt);
		canvas.renderAll();		
	} else {		
		var txt = new fabric.Text(val, {
			fontFamily: "Tahoma",
			textAlign: "center"
		});

		canvas.add(txt).centerObjectH(txt).centerObjectV(txt).renderAll();
		canvas.setActiveObject(txt);
		addObjectToFace(txt, faceIndex);
		setFaceData(txt);
		constrainToBounds(txt);
		canvas.renderAll();		
	}

	//renderingDesign();
	
	$("#preloader").hide();
/*
	$('#text_design').show();    
    $("#changeText").val(canvas.getActiveObject().getText());	
*/

	if(callback) callback();
}

function addCircleText(val, faceIndex, txtOptions, callback) {
	$("#preloader").show();

	if(txtOptions) {
		var txt = new fabric.CircleText(val, txtOptions);
		
		canvas.add(txt);
		canvas.setActiveObject(txt);
		addObjectToFace(txt, faceIndex);
		setFaceData(txt);
		canvas.renderAll();	

/*
		canvas.getActiveObject().setLeft(txt.left + (txt.width * txt.scaleX) / 2);	
		canvas.getActiveObject().setTop(txt.top + (txt.height * txt.scaleY) / 2);	
		canvas.renderAll();
*/
	} else {
		var txt = new fabric.CircleText(val, {
			fontFamily: "Tahoma",
			textAlign: "center"
		});
		
		canvas.add(txt).centerObjectH(txt).centerObjectV(txt).renderAll();
		canvas.setActiveObject(txt);
		addObjectToFace(txt, faceIndex);
		setFaceData(txt);
		constrainToBounds(txt);
		canvas.renderAll();
	}

	//renderingDesign();

	$("#preloader").hide();
	
	/*
	$("#radiusContent").css("display", "block");
	$("#text_design").show();
	$("#changeText").val(txt.getText());	
	*/

	if(callback) callback();
}

function addVerticalText(val, faceIndex, txtOptions, callback) {
	$("#preloader").show();

	if(txtOptions) {
		var txt = new fabric.VerticalText(val, txtOptions);
		
		canvas.add(txt);
		canvas.setActiveObject(txt);
		addObjectToFace(txt, faceIndex);
		setFaceData(txt);
		canvas.renderAll();
/*
		var angle = txt.getAngle() * Math.PI / 180;
		var boundWidth = Math.abs(txt.getHeight() * Math.sin(angle));

		canvas.getActiveObject().setLeft(txt.left + txt.width * txt.scaleX / 2 + boundWidth / 2);	
		canvas.getActiveObject().setTop(txt.top + txt.height * txt.scaleY / 2);	
		canvas.renderAll();
*/
	} else {
		var txt = new fabric.VerticalText(val, {
			fontFamily: "Tahoma",
			textAlign: "center"
		});
		
		canvas.add(txt).centerObjectH(txt).centerObjectV(txt).renderAll();
		canvas.setActiveObject(txt);
		addObjectToFace(txt, faceIndex);
		setFaceData(txt);
		constrainToBounds(txt);
		canvas.renderAll();		
	}

	//renderingDesign();

	$("#preloader").hide();

	/*
	$('#text_design').show();
	$("#changeText").val(txt.getText());
	*/
}

function addSideThumbs(shirtid) {	
	$(dataXML).find("product").each(function () {
		if ($(this).attr("id") == shirtid) {
			$(".thumblist").empty();
			var thumbcount = 0;
			$(this).find("side").each(function () {
				thumbcount++;
				var title = $(this).attr("thumb");
				var imagepath = server_url + "img/" + $(this).attr("thumb") + ".png";
				$(".thumblist").append("<li><img class=\"sidethumb\" title=\"" + title + "\" id=\"" + shirtid + "_" + thumbcount + "\" src=\"" + imagepath + "\"></li>");
			});
		}
	});
	$(".sidethumb").click(function () {
		$("#preloader").show();

		renderingDesign();
		
		var index = parseInt($(this).attr("id").split("_")[1]) - 1;	
		
		showMessageDlg("Loading product image data...", "Loading...");
		addTshirt(shirtid, index, function() {
			hideMessageDlg();
		});
	
		setBounds(shirtid, index);
		currentFaceIndex = index;
	
		showObjectsForFace();

		$("#art_design").hide();
	    $("#text_design").hide();
		$("#alias_design").hide();

		$("#preloader").hide();		
	});
}
function toShape(objects, options) {
	if (objects.length > 1) {
		return new fabric.PathGroup(objects, options);
	}
	return objects[0];
}
function removeDesign() {
	var activeObject = canvas.getActiveObject(),
	activeGroup = canvas.getActiveGroup();
	if (activeObject) {
		canvas.remove(activeObject);
	} else if (activeGroup) {
		var objectsInGroup = activeGroup.getObjects();
		canvas.discardActiveGroup();
		objectsInGroup.forEach(function (object) {
			canvas.remove(object);
		});
	}
}
function rgb2hex(RGB) {
	return "#" + hex(RGB.r) + hex(RGB.g) + hex(RGB.b);
}
function hex(x) {
	hexDigits = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F");
	return isNaN(x) ? "00": hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
}
function getThumbImage(tshirtid, index) {
	var thumbName;	
	$(dataXML).find("product").each(function () {		
		if ($(this).attr("id") == tshirtid) {	
			var thumbcount = 0;
			$(this).find("side").each(function () {
				if (thumbcount == index) {
					thumbName = $(this).attr("name");
				}
				thumbcount++;
			});
		}
	});
	return thumbName;
}
function getImageURL(tshirtid, side_inx, layer_inx) {
	var url;	
	$(dataXML).find("product").each(function () {		
		if ($(this).attr("id") == tshirtid) {	
			var count = 0;
			$(this).find("side").each(function () {
				if ($(this).attr("thumb") == SIDE_ID[side_inx]) {					
					if(layer_inx == 0) {
						url = server_url + $(this).attr("mask");												
					} else if(layer_inx == 1) {
						if($(this).attr("innermask") == "") url = server_url + "images/blank.png";
						else url = server_url + $(this).attr("innermask");						
					} else if(layer_inx == 2) {
						url = server_url + $(this).attr("image");	
					}
				}
				count++;
			});
		}
	});
	return url;
}
function constrainToBounds(activeObject) {
	var angle = activeObject.getAngle() * Math.PI / 180;
	var aspectRatio = activeObject.width / activeObject.height;
	var boundWidth = getBoundWidth(activeObject);
	var boundHeight = getBoundHeight(activeObject);
	if (boundWidth > bounds.width) {
		boundWidth = bounds.width;
		var targetWidth = aspectRatio * boundWidth / (aspectRatio * Math.abs(Math.cos(angle)) + Math.abs(Math.sin(angle)));
		activeObject.setScaleX(targetWidth * 0.5 / activeObject.width);
		activeObject.setScaleY(targetWidth * 0.5 / activeObject.width);
		boundHeight = getBoundHeight(activeObject);
	}
	if (boundHeight > bounds.height) {
		boundHeight = bounds.height;
		var targetHeight = boundHeight / (aspectRatio * Math.abs(Math.sin(angle)) + Math.abs(Math.cos(angle)));
		activeObject.setScaleX(targetHeight * 0.5 / activeObject.height);
		activeObject.setScaleY(targetHeight * 0.5 / activeObject.height);
		boundWidth = getBoundWidth(activeObject);
	}
	if (activeObject.getLeft() < bounds.x + boundWidth / 2) {
		activeObject.setLeft(bounds.x + boundWidth / 2);
	}
	if (activeObject.getLeft() > bounds.x + bounds.width - boundWidth / 2) {
		activeObject.setLeft(bounds.x + bounds.width - boundWidth / 2);
	}
	if (activeObject.getTop() < bounds.y + boundHeight / 2) {
		activeObject.setTop(bounds.y + boundHeight / 2);
	}
	if (activeObject.getTop() > bounds.y + bounds.height - boundHeight / 2) {
		activeObject.setTop(bounds.y + bounds.height - boundHeight / 2);
	}
}
function getBoundWidth(target) {
	var targetAngle = target.getAngle() * Math.PI / 180;
	var boundWidth = Math.abs(target.getWidth() * Math.cos(targetAngle)) + Math.abs(target.getHeight() * Math.sin(targetAngle));
	return boundWidth;
}
function getBoundHeight(target) {
	var targetAngle = target.getAngle() * Math.PI / 180;
	var boundHeight = Math.abs(target.getWidth() * Math.sin(targetAngle)) + Math.abs(target.getHeight() * Math.cos(targetAngle));
	return boundHeight;
}
function setSliders(target) {
	$("#scaleslider").slider("value", target.getScaleX() * 100);
	var objectAngle = Math.round(target.getAngle());
	if (objectAngle < 0) {
		objectAngle = 360 + objectAngle;
	}
	objectAngle = snapRotate(objectAngle, target);
	$(".top").css("transform", "rotate(" + objectAngle + "deg)");
	$("#rvalue").text(objectAngle.toString());
}
function snapRotate(angle, target) {
	var finalAngle = angle;
	if (angle <= 10 && angle >= 0) {
		finalAngle = 0;
		target.setAngle(finalAngle);
	}
	if (angle <= 100 && angle >= 80) {
		finalAngle = 90;
		target.setAngle(finalAngle);
	}
	if (angle <= 190 && angle >= 170) {
		finalAngle = 180;
		target.setAngle(finalAngle);
	}
	if (angle <= 280 && angle >= 260) {
		finalAngle = 270;
		target.setAngle(finalAngle);
	}
	return finalAngle;
}
function getShirtId(index) {
	var shirtid;
	var shirtcount = 0;
	$(dataXML).find("product").each(function () {
		if (shirtcount == index) {
			shirtid = $(this).attr("id");
		}
		shirtcount++;
	});
	return shirtid;
}
function setBounds(shirtid, index) {	
	$(dataXML).find("product").each(function () {
		if ($(this).attr("id") == shirtid) {
			var thumbcount = 0;
			$(this).find("side").each(function () {
				if (thumbcount == index) {
					var drawarea = $(this).attr("drawarea").split(";");
										
					bounds.x = shirtPoint.x + parseFloat(drawarea[0]) * 0.6;
					bounds.y = shirtPoint.y + parseFloat(drawarea[1]) * 0.6;
					bounds.width = parseFloat(drawarea[2]) * 0.6;
					bounds.height = parseFloat(drawarea[3]) * 0.6;

					/*
					bounds.x = parseInt($(this).attr("boundx"));
					bounds.y = parseInt($(this).attr("boundy"));
					bounds.width = parseInt($(this).attr("boundwidth"));
					bounds.height = parseInt($(this).attr("boundheight"));
					*/
				}
				thumbcount++;
			});
		}
	});
	$("#targetboundary").css("left", bounds.x + "px");
	$("#targetboundary").css("top", bounds.y + "px");
	$("#targetboundary").width(bounds.width);
	$("#targetboundary").height(bounds.height);
}
function addObjectToFace(object, index) {
	var faceVO = new FaceVO;
	faceVO.object = object;
	faceVO.faceIndex = index;

	if(index != currentFaceIndex) {
		faceVO.object.opacity = 0;
		faceVO.object.selectable = false;
		faceVO.object.setCoords();
	}

	faceData.push(faceVO);	
}
function showObjectsForFace() {

	for (var i = 0; i < faceData.length; i++) {
		faceData[i].object.opacity = 0;
		faceData[i].object.setLeft( - 100);
		faceData[i].object.selectable = false;
		faceData[i].object.setCoords();
	}
	for (var i = 0; i < faceData.length; i++) {
		if (faceData[i].faceIndex == currentFaceIndex) {
			faceData[i].object.selectable = true;
			faceData[i].object.opacity = 1;
			faceData[i].object.setLeft(faceData[i].position);
			faceData[i].object.setCoords();
		}
	}
	$("#targetboundary").hide();

	canvas.deactivateAll();	
	canvas.renderAll();
}

function setFaceData(target) {
	for (var i = 0; i < faceData.length; i++) {
		if (faceData[i].object.id == target.id) {
			faceData[i].position = target.getLeft();
		}
	}
}

function designShow(object) {
	 $("#text_design").hide();
	 $("#alias_design").hide();
	 $("#art_design").hide();
	 $("#targetboundary").hide();
	 $("#radiusContent").css("display", "none");

	if(object == null) return;	

	if(object.type == "text") {
		$("#text_design").show();	
	
		$("#changeText").val(object.getText());
		$("#txtSpacing").val(object.letterSpacing);
		$("#textColor div").css('backgroundColor', '#' + object.fillColor);		

		if(object.kind == "Circle") {
			$("#radiusContent").css("display", "block");
			$("#sliderRadius").slider({value:object.radius});			
		} 
				
		if(object.isBorder) {
			$("#chkborder").prop('checked', true);
			$("#borderColor div").css('backgroundColor', '#' + object.borderColor);
		} else {
			$("#chkborder").prop('checked', false);
			$("#borderColor div").css('backgroundColor', '#000000');
		}
	} else if(object.type == "image") {

		if(object.isUploadedImage) {
			$("#art_design").children().remove();
			$("#art_design").append(getArtDesignWithUploadHtml());			
		} else {
			$("#art_design").children().remove();
			$("#art_design").append(getArtDesignHtml());

			var originalColors = object.originalColors;
			var currentColors = object.currentColors;

			colorMode = "Art Color";

			$("#artChangeColor").empty();

			if(originalColors.length > 1) {

				var html = "";

				html += "<table style='width:100%; float:left;'>";	
				for(var i=0; i<originalColors.length; i++) {
					html += "<tr>";
					html += "<td><p>Original</p></td>";
					html += "<td><div class='colorChangeFrom' style='background-color:" + '#' + originalColors[i] + "'></div></td>";
					html += "<td><p>Change To</p></td>";
					html += "<td>";
					html += "<div id='" + originalColors[i] + "' class='colorSelector'>";
					html += "<div style='background-color:" + '#' + currentColors[i] + "'></div>";
					html += "</div>";
					html += "</td>";
					html += "</tr>";
				}	
				html += "</table>";		
				
				$("#artChangeColor").append(html);
			}
		}

		$("#art_design").show();	
	} else if(object.type == "alias") {
		$("#aliasColor div").css('backgroundColor', '#' + object.fillColor);		
		$("#aliasSpacing").val(object.letterSpacing);
		
		if(object.isBorder) {
			$("#aliasborder").prop('checked', true);
			$("#aliasBorderColor div").css('backgroundColor', '#' + object.borderColor);
		} else {
			$("#aliasborder").prop('checked', false);
			$("#aliasBorderColor div").css('backgroundColor', '#000000');
		}
		$("#alias_design").show();
	}
}

function getColor(colorid) {
	var color = "";
	$(dataXML).find("product").each(function () {
		if($(this).attr("id") == global_shirtid) {
			$(this).find("color").each(function () {
				if($(this).attr("id") == colorid) {

					if($(this).attr("pattern") == "") color = $(this).attr("hex");				
					else color = $(this).attr("image");
				}
			});
		}
	});

	return color;
}

function getProductID() {
	return global_shirtid;
}

function getOuterColorID() {
	return outercolor;
}

function getInnerColorID() {
	return innercolor;
}

function getArtColorsString() {
	var artColorArray = getArtColors();
	var strColors = "";

	for(var i=0; i<artColorArray.length; i++) {
		strColors += artColorArray[i] + ",";
	}

	strColors = strColors.substring(0, strColors.length - 1).toUpperCase();
	
	return strColors;
}

function getMapColors() {	
	var strMapColors = "";

	if(isInner == 0) return strMapColors;

	var artColors = getArtColors();
	

	for(var i=0; i<artColors.length; i++) {
		strMapColors += artColors[i] + "," + innerSideColors[i] + ";";
	}

	strMapColors = strMapColors.substring(0, strMapColors.length - 1).toUpperCase();

	return strMapColors;
}

function getArtColors() {
	var artColorArray = new Array();
	for(var i=0; i<faceData.length;i++) {	
		var colors = new Array();		
		if(faceData[i].object.type == "image")
			colors = faceData[i].object.currentColors;
		else {
			if(faceData[i].object.fillColor != "") colors.push(faceData[i].object.fillColor);
			if(faceData[i].object.borderColor != "") colors.push(faceData[i].object.borderColor);
		}

		for(var j=0; j<colors.length; j++) {
			var b = true;
			for(var k=0; k<artColorArray.length; k++) {
				if(artColorArray[k] == colors[j]) b = false;
			}
			if(b) {
				artColorArray.push(colors[j]);
			}
		}
	}
	
	return artColorArray;
}

function getColorCharge() {
	var artColorArray = getArtColors();
	var charge = 0;

	if(artColorArray.length > colorChargeArray.length)
		charge = parseFloat(colorChargeArray[colorChargeArray.length - 1]) + parseFloat(0.5);
	else {
		if(artColorArray.length == 1)
			charge = parseFloat(colorChargeArray[1]);
		else
			charge = parseFloat(colorChargeArray[artColorArray.length]) + parseFloat(0.5);
	}

	return charge;
	
}

function getOutlineColorCharge() {
	var charge = 0;
	for(var i=0; i<faceData.length;i++) {	
		if(faceData[i].object.type == "text" && faceData[i].object.isBorder) {
			charge = parseFloat(charge) + parseFloat(1.5);
		}
	}

	return charge;
}

function getBounds() {
	var bounds = "";
	var strBounds = new Array("", "", "", ""); 

	$(dataXML).find("product").each(function () {
		if ($(this).attr("id") == global_shirtid) {
			$(this).find("side").each(function () {
				if($(this).attr("thumb") == SIDE_ID[0]) strBounds[0] = $(this).attr("drawarea");
				if($(this).attr("thumb") == SIDE_ID[1]) strBounds[1] = $(this).attr("drawarea");
				if($(this).attr("thumb") == SIDE_ID[2]) strBounds[2] = $(this).attr("drawarea");
				if($(this).attr("thumb") == SIDE_ID[3]) strBounds[3] = $(this).attr("drawarea");
			});
		}
	});

	for(var i=0; i<strBounds.length; i++) {
		if(strBounds[i] != "") bounds += strBounds[i] + "|";
		else bounds += "0;0;0;0" + "|";
	}

	return bounds.substring(0, bounds.length - 1);
}

function getThumbsSize(shirtid) {	
	var thumbcount = 0;
	$(dataXML).find("product").each(function () {
		if ($(this).attr("id") == shirtid) {			
			$(this).find("side").each(function () {
				thumbcount++;				
			});			
			return;
		}
	});
	return thumbcount;
}

function loadShirtFromID(shirtid, side_inx, layer_inx, callback) {	
	if(layer_inx >= 3) {		
		if(callback) callback();
		return;
	}

	var canvas = document.getElementById('preview');
    var context = canvas.getContext('2d');

	context.clearRect(0, 0, canvas.width, canvas.height);	

	var imageObj = new Image();
	imageObj.onload = function() {		
		context.drawImage(imageObj, 0, 0, imageObj.width, imageObj.height, 0, 0, 300, 300);	

		setProductColor(layer_inx, canvas, function() {				
			renderingBG(side_inx, canvas);
			loadShirtFromID(shirtid, side_inx, layer_inx+1, callback);
		});
	};
	imageObj.src = getImageURL(shirtid, side_inx, layer_inx);	
}

function loadBackground(shirtid, index, callback) {

	if(index >= getThumbsSize(shirtid)) {
		//endRenderBg();
		if(callback) callback();
		return;
	}

	loadShirtFromID(shirtid, index, 0, function() {			
		loadBackground(shirtid, index+1, callback);
	});
}

function startRenderBg() {	
	for(var i=0; i<=3; i++) {
		var oCanvas = document.getElementById(SIDE_ID[i]);
		var ctx = oCanvas.getContext("2d");	

		ctx.clearRect(0, 0, oCanvas.width, oCanvas.height);

		ctx.fillStyle = '#ffffff';
		ctx.fillRect(0,0,300,300);
	}

	//showMessageDlg("Loading product image data...", "Loading...");
}

function endRenderBg() {
	hideMessageDlg();
}

function renderingAll(callback) {
	var id = "";

	renderingDesign();

	for(var i=0; i<=3; i++) {
		id = SIDE_ID[i];

		var bgCanvas = document.getElementById(id);
		var bgCtx = bgCanvas.getContext("2d");
		var designCanvas = document.getElementById(id + "Design");
		
		bgCtx.drawImage(designCanvas, 0 ,0);
	}
	
	if(callback) callback();
}

function renderingBG(faceIndex, bgCanvas) {
	var id = SIDE_ID[faceIndex];		

	var oCanvas = document.getElementById(id);
	var ctx = oCanvas.getContext("2d");	

	ctx.drawImage(bgCanvas, 0, 0);	
}

function renderingDesign(faceIndex) {
	var id = "";

	if(faceIndex) id = SIDE_ID[faceIndex] + "Design";	
	else id = SIDE_ID[currentFaceIndex] + "Design"; 

	var oCanvas = document.getElementById(id);
	var ctx = oCanvas.getContext("2d");	

	canvas.deactivateAll();
	canvas.renderAll();

	ctx.clearRect(0, 0, oCanvas.width, oCanvas.height);

	var designCanvas = document.getElementById("container");
	ctx.drawImage(designCanvas, BASE_WIDTH / 2 - 300 / 2, BASE_HEIGHT / 2 - 300 / 2 - 40, 300, 300, 0, 0, 300, 300);	
}