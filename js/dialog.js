var basePrice = 0;
var colorCharge = 0;
var outlineColorCharge = 0;
var sideCharge = 0;
var itemPrice = 0;
var subTotal = 0;
var sizeCharge = 0;
var averagePrice = 0;
var totalAmount = 0;

var qtyArray = null;
var priceArray = null;

var nnIdx = 0;
var nnQtyArray = new Array();
var nnSizeArray = new Array();
var nnPriceArray = new Array();
var nnNoArray = new Array();
var nnNameArray = new Array();

var cartMode = "";
var designID = "";
var loginTo = "";

/* --------------- ShortCut ---------------- */

// add to cart shortcut
$("#shortcutAddCart").live("click", function() {
	if(faceData.length == 0) return;	

	cartMode = "Add to Cart";

	showInnerSideDesignDlg();
});

// names and numbers shortcut
$("#shortcutNamesNum").live("click", function() {

	$(".ui-state-active").next().css("display", "none");
	$(".ui-state-active").removeClass( "ui-state-active ui-corner-top" ).addClass( "ui-state-default ui-corner-all" ).children( ".ui-icon" ).removeClass( "ui-icon-triangle-1-s" ).addClass( "ui-icon-triangle-1-e" );
	$("#namesAndNum").parent().addClass( "ui-state-active" ).toggleClass( "ui-corner-all" ).toggleClass( "ui-corner-top" ).children( ".ui-icon" ).removeClass( "ui-icon-triangle-1-e" ).addClass( "ui-icon-triangle-1-s" );
	$("#namesAndNum").parent().next().addClass( "ui-accordion-content-active" );
	$("#namesAndNum").parent().next().css("display", "block");

	if(!hasAliasType()) {
		alert("This template does not contain name or number styles yet");
		return;
	}

	showNamesNumTableDlg();

});

// clear design shortcut
$("#shortcutClearDesign").live("click", function() {
	faceData = [];
	canvas.clear();
});

// product details shortcut
$("#shortcutPrdtDetails").live("click", function() {
	$("#dialog:ui-dialog").dialog("destroy");

	$("#dialog").empty();
	$("#dialog").attr("title", getPrdtTitle());
	$("#dialog").append(getPrdtDetailDlgHtml());

	$("#dialog").dialog({
		resizable: false,
		width:600,
		height:500,
		modal: true			
	});
});

// save design shortcut
$("#shortcutSaveDesign").live("click", function() {	
	if(faceData.length == 0) return;
	if(isAdmin) {
		showSaveDesignIdeasDlg();
	} else {
		if(user_id == 0) {		
			loginTo = "Save Design";
			showLoginDlg();		
			//window.location = server_url + "login.php";
		} else {		
			showSaveDesignDlg();
		}
	}
});

// retrieve design shortcut
$("#shortcutRetrieveDesign").live("click", function() {
	if(user_id == 0) {
		loginTo = "Retrieve Design";

		showLoginDlg();

		if($("#retrieveDesign").parent().hasClass("ui-state-active")) return;

		$(".ui-state-active").next().css("display", "none");
		$(".ui-state-active").removeClass( "ui-state-active ui-corner-top" ).addClass( "ui-state-default ui-corner-all" ).children( ".ui-icon" ).removeClass( "ui-icon-triangle-1-s" ).addClass( "ui-icon-triangle-1-e" );
		$("#retrieveDesign").parent().addClass( "ui-state-active" ).toggleClass( "ui-corner-all" ).toggleClass( "ui-corner-top" ).children( ".ui-icon" ).removeClass( "ui-icon-triangle-1-e" ).addClass( "ui-icon-triangle-1-s" );
		$("#retrieveDesign").parent().next().addClass( "ui-accordion-content-active" );
		$("#retrieveDesign").parent().next().css("display", "block");
		
		//window.location = server_url + "login.php";
	} else {
		if($("#retrieveDesign").parent().hasClass("ui-state-active")) return;

		$(".ui-state-active").next().css("display", "none");
		$(".ui-state-active").removeClass( "ui-state-active ui-corner-top" ).addClass( "ui-state-default ui-corner-all" ).children( ".ui-icon" ).removeClass( "ui-icon-triangle-1-s" ).addClass( "ui-icon-triangle-1-e" );
		$("#retrieveDesign").parent().addClass( "ui-state-active" ).toggleClass( "ui-corner-all" ).toggleClass( "ui-corner-top" ).children( ".ui-icon" ).removeClass( "ui-icon-triangle-1-e" ).addClass( "ui-icon-triangle-1-s" );
		$("#retrieveDesign").parent().next().addClass( "ui-accordion-content-active" );
		$("#retrieveDesign").parent().next().css("display", "block");

		retrieveDesign();
	}
});

// print design shortcut
$("#shortcutPrintDesign").live("click", function() {
	var html = "";
	var height = 90;

	canvas.deactivateAll();
	canvas.renderAll();

	startRenderBg();

	showMessageDlg("Loading product image data...", "Loading...");

	loadBackground(global_shirtid, 0, function() {				
		renderingAll(function() {
			hideMessageDlg();
			
			$(dataXML).find("product").each(function () {
				if($(this).attr("id") == getProductID()) {
					$(this).find("side").each(function() {
						var id = $(this).attr("thumb");
						var saveCanvas = document.getElementById(id);
						var image = saveCanvas.toDataURL("image/png");

						html += "<div style='width:300px;margin:20px auto;float:left;'>";
						html += "<img src='" + image + "' width='300' height='300'>";
						html += "</div>";

						height += 400;
					});
				}
			});

			var windowUrl = 'about:blank';
			var uniqueName = new Date();
			var windowName = 'Print' + uniqueName.getTime();    

			var windowContent = "<!DOCTYPE html>";
			windowContent += "<html>";
			windowContent += "<head>";
			windowContent += "<title>Print Preview</title>";
			windowContent += "<script src='" + server_url + "js/jquery.js'></script>";
			windowContent += "<script type='text/javascript'>";
			windowContent += "$(window).load(function() {";
			windowContent += "window.print();";
			windowContent += "window.close();";
			windowContent += "});";	
			windowContent += "</script>";
			windowContent += "</head>";
			windowContent += "<body>";
			windowContent += "<div style='width:600px;height:90px;'>";
			windowContent += "<img src='" + server_url + "images/site/header_bg.png' width='720px' height='90px'>";
			windowContent += "</div>"
			windowContent += html;
			windowContent += "</body>";
			windowContent += "</html>";	
			
			var printWin = window.open(windowUrl, windowName,'width=720,height=' + height);
			printWin.document.write(windowContent);	
			printWin.document.close();
			printWin.focus();
		});
	});
});

$("#shortcutZoomDesign").live("click", function() {
	
});

/* ------------------ Button Events --------------------- */

// OK Button in Design Password Input Dialog
$("#btnDesignPwdOk").live("click", function() {
	var id = $("#frmDesignId").val();
	var pwd = $("#frmDesignPwd").val();

	retriveDesignItem(id, pwd);

	hideWindowDlg();
});

// Cancel Button in Design Password Input Dialog
$("#btnDesignPwdCancel").live("click", function() {
	var shirtid = $(dataXML).find("startpid").text();
	loadProduct(shirtid);

	hideWindowDlg();
});

// Add Item Button
$("#btnAddItem").live("click", function() {
	var html = "";

	if($("#addItemName").val() != undefined && $("#addItemName").val() == "") {
		alert("Please input the name!");
		return;
	}

	if($("#addItemNum").val() != undefined && ($("#addItemNum").val() == "" || isNaN($("#addItemNum").val()))) {
		alert("Please input the No.(Number type) correctly!");
		return;
	}

	if($("#addItemQty").val() == "" || isNaN($("#addItemQty").val())) {
		alert("Please input the QTY(Number type) correctly!");
		return;
	}

	var length = $("table#tblNameNum tbody")[0].rows.length;
	var no = length + 1;

	html += "<tr>";

	html += "<td>";
	if($("#addItemNum").val() != undefined) html += "<p>" + $("#addItemNum").val() + "</p>";
	html += "</td>";

	html += "<td>";
	if($("#addItemName").val() != undefined) html += "<p>" + $("#addItemName").val() + "</p>";
	html += "</td>";

	html += "<td><p>" + $("#addItemSize").val() + "</p></td>";
	html += "<td><p>" + $("#addItemQty").val() + "</p></td>";

	if($("#addItemNum").val() != undefined) nnNoArray.push($("#addItemNum").val());
	else nnNoArray.push("");

	if($("#addItemName").val() != undefined) nnNameArray.push($("#addItemName").val());
	else nnNameArray.push("");

	nnSizeArray.push($("#addItemSize").val());
	nnQtyArray.push($("#addItemQty").val());

	$("table#tblNameNum tbody").append(html);
});

// Remove Button
$("#btnRemoveItem").live("click", function() {
	$("table#tblNameNum tbody tr.row-selected").remove();

	nnNoArray.splice(parseInt(nnIdx), 1);
	nnNameArray.splice(parseInt(nnIdx), 1);
	nnSizeArray.splice(parseInt(nnIdx), 1);
	nnQtyArray.splice(parseInt(nnIdx), 1);
});

// Save Button
$("#btnSaveItem").live("click", function() {
	var obj = $("table#tblNameNum tbody tr.row-selected")[0];

	if(obj == undefined) return;

	if($("#editItemNo").val() != undefined && ($("#editItemNo").val() == "" || isNaN($("#editItemNo").val()))) {
		alert("Please input the No(Number type) correctly!");
		return;
	}
	if($("#editItemName").val() != undefined && $("#editItemName").val() == "") {
		alert("Please input the name!");
		return;
	}
	if($("#editItemQty").val() == "" || isNaN($("#editItemQty").val())) {
		alert("Please input the QTY(Number type) correctly!");
		return;
	}
	
	if($("#editItemNo").val() != undefined) {
		$(obj.cells[0].childNodes[0])[0].textContent = $("#editItemNo").val();
		nnNoArray[parseInt(nnIdx)] = $("#editItemNo").val();
	}

	if($("#editItemName").val() != undefined) {
		$(obj.cells[1].childNodes[0])[0].textContent = $("#editItemName").val();
		nnNameArray[parseInt(nnIdx)] = $("#editItemName").val();
	}

	$(obj.cells[2].childNodes[0])[0].textContent = $("#editItemSize").val();
	$(obj.cells[3].childNodes[0])[0].textContent = $("#editItemQty").val();		
	
	nnSizeArray[parseInt(nnIdx)] = $("#editItemSize").val();
	nnQtyArray[parseInt(nnIdx)] = $("#editItemQty").val();
});

// Continue Button in the Names and Numbers Table Dialog
$("#btnToInnerSideDlg").live("click", function() {
	if(nnNoArray.length == 0) return;

	cartMode = "Add to Cart for Names and Numbers";

	showInnerSideDesignDlg();
});

// Continue Button at the Inner Side Design Dialog
$("#btnToCart").live("click", function() {
	if(cartMode == "Add to Cart") {
		showCartDlg();
	} else {
		showNamesNumCartDlg(); 
	}
});

// Add Email Button at the Save Design Dialog
$("#btnAddEmail").live("click", function() {
	var emailAddress = $("#designEmail").val();
	var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
	var length = $("table#tblEmail tbody")[0].rows.length;

	$(".error").hide();

	if(emailAddress == "") {
		$("#designEmail").after('<span class="error">Please enter your email address.</span>');
		return;
	} else if(!emailReg.test(emailAddress)) {
		$("#designEmail").after('<span class="error">Enter a valid email address.</span>');
		return;
	} else {
		for(var i=0; i<length; i++) {
			if($($("table#tblEmail tbody tr")[i].cells[0].childNodes[0])[0].textContent == emailAddress) {
				$("#designEmail").after('<span class="error">Email address is duplicated.</span>');
				return;
			}			
		}
	}

	var html = "";

	html += "<tr><td>";
	html += "<p>" + emailAddress + "</p>";
	html += "</td></tr>";

	$("table#tblEmail tbody").append(html);
});

// Save Design Button at the Save Design Dialog
$("#btnSaveDesign").live("click", function() {
	var url = server_url + "designer/savedesign.php";	

	var _frmload = "save";
	var _frmname = $("#designName").val();
	var _frmpwd = $("#designPwd").val();
	var _frmnotes = $("#designNotes").val();
	var _frmemails = getEmailAddressString();
	var _frmurl = window.location.href;
	var _frmcolors = getArtColorsString();
	var _frmprocess = "Screen Printing";
	var _frmproduct = getProductID();
	var _frmcolor = getOuterColorID();
	var _frminnercolor = getInnerColorID();
	var _frmprice = getColorCharge();
	var _frmbounds = getBounds();
	var _frmcategory = "";
	var _frminner = isInner;
	var _frminnerside = "1";
	var _frmmap = getMapColors();

	showMessageDlg("Saving design data...", "Save Design");

    $.post( 
		url,
		{
			frmload: _frmload,
			frmname: _frmname,
			frmpwd: _frmpwd,
			frmnotes: _frmnotes,
			frmemails: _frmemails,
			frmurl: _frmurl,
			frmcolors: _frmcolors,
			frmprocess: _frmprocess,
			frmproduct: _frmproduct,
			frmcolor: _frmcolor,
			frminnercolor: _frminnercolor,
			frmprice: _frmprice,
			frmbounds: _frmbounds,
			frmcategory: _frmcategory,
			frminner: _frminner,
			frminnerside: _frminnerside,
			frmmap: _frmmap
		}, 
		function( xml ) {
			if($(xml).find('error').text() != "") {
				alert($(xml).find('error').text());
				hideMessageDlg();
				return;
			} else {
				showMessageDlg("Saved design data...", "Save Design");
				saveDesignList($(xml).find('id').text());
				saveDesignImage($(xml).find('id').text(), function() {
					hideMessageDlg();
				});						
			}			
		}
	);
});

// Save Design Button at the Save Design Ideas Dialog
$("#btnSaveDesignIdeas").live("click", function() {
	var url = server_url + "designer/savedesign.php";	

	var _frmload = "save";
	var _frmname = $("#designName").val();
	var _frmpwd = "";
	var _frmnotes = $("#designNotes").val();
	var _frmurl = window.location.href;
	var _frmcolors = getArtColorsString();
	var _frmprocess = "Screen Printing";
	var _frmproduct = getProductID();
	var _frmcolor = getOuterColorID();
	var _frminnercolor = getInnerColorID();
	var _frmprice = getColorCharge();
	var _frmbounds = getBounds();
	var _frmcategory = $("#categories").val();
	var _frminner = isInner;
	var _frminnerside = "1";
	var _frmmap = getMapColors();

	showMessageDlg("Saving design data...", "Save Design");

    $.post( 
		url,
		{
			frmload: _frmload,
			frmname: _frmname,
			frmpwd: _frmpwd,
			frmnotes: _frmnotes,
			frmurl: _frmurl,
			frmcolors: _frmcolors,
			frmprocess: _frmprocess,
			frmproduct: _frmproduct,
			frmcolor: _frmcolor,
			frminnercolor: _frminnercolor,
			frmprice: _frmprice,
			frmbounds: _frmbounds,
			frmcategory: _frmcategory,
			frminner: _frminner,
			frminnerside: _frminnerside,
			frmmap: _frmmap
		}, 
		function( xml ) {
			if($(xml).find('error').text() != "") {
				alert($(xml).find('error').text());
				hideMessageDlg();
				return;
			} else {
				showMessageDlg("Saved design data...", "Save Design");
				saveDesignList($(xml).find('id').text());
				saveDesignIdeas($(xml).find('id').text());
				saveDesignImage($(xml).find('id').text(), function() {
					hideMessageDlg();
				});					
			}			
		}
	);
});

// Retrieve Design
$("#retrieveDesign").live("click", function() {
	if(!$("#retrieveDesign").parent().hasClass("ui-state-active")) return;

	if(user_id == 0) {
		loginTo = "Retrieve Design";
		showLoginDlg();
		//window.location = server_url + "login.php";
	} else retrieveDesign();
});

// Qty check
$(".chkQty").live("click", function(e){	

	var qtyObj;

	calcCart();

	qtyObj = $($($(this).parent().parent())[0].cells[1].childNodes[0]);
	
	if($(this).is(':checked')) {
		qtyObj.removeAttr('disabled');
		qtyObj.val(1);
		qtyObj.live('input', function() {
			if(isNaN(parseInt($(this).val()))) {
				$(this).val("");
			} else {							
				calcCart();
			}
		});
	} else {
		qtyObj.attr('disabled','disabled');
		qtyObj.val(1);
	}
});

// copy design to the inner side 
$("#chkInnerSide").live("click", function() {
	if($(this).is(':checked')) {
		var html = "";
		var colors = getArtColors();

		colorMode = "Inner Side Color";
		isInner = 1;

		for(var i=0; i<colors.length; i++) {
			innerSideColors.push(colors[i]);
			html += "<div class='colorChangeFrom' style='float:left;background-color:" + '#' + colors[i] + "'></div>";
			html += "<p style='float:left;line-height:26px;margin:0 10px;'>>> Change To >></p>";
			html += "<div style='float:left;margin-right:20px;' id='" + colors[i] + "' class='colorSelector'>";
			html += "<div style='background-color:" + '#' + colors[i] + "'></div>";
			html += "</div>";
		}
		$("#innerSideContent").append(html);
		
	} else {
		isInner = 0;
		$("#innerSideContent").empty();
	}
});

// Select the item in the table
$("table#tblNameNum tbody tr").live("click", function(e) {
	nnIdx = $(this).parent().children().index($(this));
	$("table#tblNameNum tbody tr.row-selected").removeClass("row-selected");
	$(this).addClass("row-selected");

	if($("#editItemNo").val() != undefined)
		$("#editItemNo").val($($(this)[0].cells[0].childNodes[0])[0].textContent);

	if($("#editItemName").val() != undefined)
		$("#editItemName").val($($(this)[0].cells[1].childNodes[0])[0].textContent);

	$("#editItemSize").val($($(this)[0].cells[2].childNodes[0])[0].textContent);
	$("#editItemQty").val($($(this)[0].cells[3].childNodes[0])[0].textContent);
});

// Add Name Alias Button
$("#btnAddName").live("click", function() {
	addAlias("EXAMPLE", currentFaceIndex);
});

// Add Number Alias Button
$("#btnAddNum").live("click", function() {
	addAlias("00", currentFaceIndex);
});

// Show Table Button
$("#btnShowTable").live("click", function() {	
	if(!hasAliasType()) {
		alert("This template does not contain name or number styles yet");
		return;
	}

	showNamesNumTableDlg();
});

// Add Cart Button
$("#btnAddCart").live("click", function() {
	if(totalAmount == 0) return;

	var url = server_url + "designer/savedesign.php";	

	var _frmload = "save";
	var _frmnotes = $("#note").val();
//	var _frmemails = user_email;
	var _frmurl = window.location.href;
	var _frmcolors = getArtColorsString();
	var _frmprocess = "Screen Printing";
	var _frmproduct = getProductID();
	var _frmcolor = getOuterColorID();
	var _frminnercolor = getInnerColorID();
	var _frmprice = getColorCharge();
	var _frmbounds = getBounds();
	var _frmcategory = "";
	var _frminner = isInner;
	var _frminnerside = "1";
	var _frmmap = getMapColors();

	showMessageDlg("Saving design image data...", "Save Design");

    $.post( 
		url, 
		{
			frmload: _frmload,
			frmnotes: _frmnotes,
//			frmemails: _frmemails,
			frmurl: _frmurl,
			frmcolors: _frmcolors,
			frmprocess: _frmprocess,
			frmproduct: _frmproduct,
			frmcolor: _frmcolor,
			frminnercolor: _frminnercolor,
			frmprice: _frmprice,
			frmbounds: _frmbounds,
			frmcategory: _frmcategory,
			frminner: _frminner,
			frminnerside: _frminnerside,
			frmmap: _frmmap
		}, 
		function( xml ) {
			if($(xml).find('error').text() != "") {
				alert($(xml).find('error').text());
				hideMessageDlg();
				return;
			} else {
				showMessageDlg("Saved design data...", "Save Design");
				saveDesignList($(xml).find('id').text());
				saveDesignImage($(xml).find('id').text(), function() {
					addToCart($(xml).find('id').text());
				});
			}	
		}
	);
});

// Add to Cart Button for Names and Numbers
$("#btnNamesNumCart").live("click", function() {
	if(totalAmount == 0) return;

	var url = server_url + "designer/savedesign.php";	

	var _frmload = "save";
	var _frmnotes = $("#note").val();
//	var _frmemails = user_email;
	var _frmurl = window.location.href;
	var _frmcolors = getArtColorsString();
	var _frmprocess = "Screen Printing";
	var _frmproduct = getProductID();
	var _frmcolor = getOuterColorID();
	var _frminnercolor = getInnerColorID();
	var _frmprice = getColorCharge();
	var _frmbounds = "";
	var _frmcategory = "";
	var _frminner = isInner;
	var _frminnerside = "1";
	var _frmmap = getMapColors();

    $.post( 
		url, 
		{
			frmload: _frmload,
			frmnotes: _frmnotes,
//			frmemails: _frmemails,
			frmurl: _frmurl,
			frmcolors: _frmcolors,
			frmprocess: _frmprocess,
			frmproduct: _frmproduct,
			frmcolor: _frmcolor,
			frminnercolor: _frminnercolor,
			frmprice: _frmprice,
			frmbounds: _frmbounds,
			frmcategory: _frmcategory,
			frminner: _frminner,
			frminnerside: _frminnerside,
			frmmap: _frmmap
		}, 
		function( xml ) {		
			if($(xml).find('error').text() != "") {
				alert($(xml).find('error').text());
				hideMessageDlg();
				return;
			} else {
				showMessageDlg("Saved design data...", "Save Design");						
				saveDesignList($(xml).find('id').text());
				saveDesignImage($(xml).find('id').text(), function() {
					addToCartNamesNum($(xml).find('id').text());				
				});				
			}
		}
	);
});

$("#btnLogin").live("click", function() {
	var url = server_url + "designer/login.php";

	var _frmload = "login";
	var _frmemail = $("#frmemail").val();
	var _frmpwd = $("#frmpwd").val();	

	$.post( 
		url, 
		{
			frmload: _frmload,
			frmemail: _frmemail,
			frmpwd: _frmpwd
		}, 
		function( xml ) {
			if($(xml).find('error').text() != "") {
				alert($(xml).find('error').text());				
				return;
			} else {
				$("#dialog").dialog("close");				

				user_id = $(xml).find('id').text();
				user_email = $(xml).find('email').text();

				if(loginTo == "Save Design") {
					showSaveDesignDlg();
					return;
				} else if(loginTo == "Retrieve Design") {
					retrieveDesign();
					return;
				}
			}
		}
	);
});


$("#btnToNamesNumCartDlg").live("click", function() {
	if(!hasAliasType()) {
		alert("This template does not contain name or number styles yet");
		return;
	}

	showNamesNumCartDlg();
});

$("#btnToUpload").live("click", function() {
	showUploadWizardDlg();
});

$("#chkLegalUpload").live("click", function() {
	if($(this).is(':checked')) {
		$("#btnUploadImage").removeAttr('disabled');
	} else {
		$("#btnUploadImage").attr('disabled','disabled');
	}
});

$("#btnUploadImage").live("click", function() {	
	$("#frmimage").click();
});

$("#frmimage").live("change", function(e) {
	var data = new FormData();

	$(".error").hide();	

	jQuery.each(e.target.files, function(i, file) {
		data.append('frmimage', file);
	});

	showMessageDlg("Please while uploading image", "Upload image");
	
	$.ajax({
        type: "POST",
        url: server_url + "designer/upload.php",
		data: data,
		cache: false,
		contentType: false,
		processData: false,
        success: function(xml) {
			hideMessageDlg();
			if($(xml).find('error').text() != "") {
				var html = "<span class='error'>" + $(xml).find('error').text() + "</span>";
				$("#btnUploadImage").after(html);
				return;
			} else {	
				hideMessageDlg();
				var thumb = $(xml).find("item").attr("thumb");
				var src = $(xml).find("item").attr("image");
				showUploadPrintProcess(src);
			}
        }
    });
});

$("#btnToUploadSelectClosedColors").live("click", function() {
	
});

/* -------------------- Show Dialog ---------------------*/

// Show Message Dialog
function showMessageDlg(msg, title) {
	$("#msgDialog:ui-dialog").dialog("destroy");

	$("#msgDialog").empty();
	$("#msgDialog").append("<p>" + msg + "</p>");	

	$("#msgDialog").attr("title", title);	

	$("#msgDialog").dialog({
		resizable: false,
		width:240,
		height:100,
		modal: true			
	});
}

function hideWindowDlg() {
	$("#dialog:ui-dialog").dialog("close");
}

function hideMessageDlg() {
	$("#msgDialog:ui-dialog").dialog("close");
}

// Show Loading Dialog
function showLoadingDlg() {
	$("#dialog:ui-dialog").dialog("destroy");

	$("#dialog").empty();
	$("#dialog").attr("title", "Loading...");
	$("#dialog").append(getLoadingDlgHtml());

	$("#dialog").dialog({
		resizable: false,
		draggable: false,
		width:235,
		height:155,
		modal: true			
	});
}

// Hide Loading Dialog
function hideLoadingDlg() {
	$("#dialog:ui-dialog").dialog("destroy");

	$("#dialog").dialog("close");
}

// Show Inner Side Design Dialog
function showInnerSideDesignDlg() {
	$("#dialog:ui-dialog").dialog("destroy");

	$("#dialog").empty();
	$("#dialog").attr("title", "Add to cart");
	$("#dialog").append(getInnerSideDlgHtml());

	$("#innerSideContent").empty();
	isInner = 0;

	$("#dialog").dialog({
		resizable: false,
		width:600,
		height:600,
		modal: true			
	});
}

// Show Names and Numbers Table Dialog
function showNamesNumTableDlg() {
	$("#dialog:ui-dialog").dialog("destroy");
	$("#dialog").empty();
	$("#dialog").append(getNamesNumTableHtml());

	$("#addItemSize").empty();
	$("#editItemSize").empty();

	$(dataXML).find("product").each(function() {
		if($(this).attr("id") == global_shirtid) {			
			$(this).find("size").each(function() {
				$(this).find("item").each(function() {
					$("#addItemSize").append("<option value=\"" + $(this).attr("name") + "\">" + $(this).attr("name") + "</option>");
					$("#editItemSize").append("<option value=\"" + $(this).attr("name") + "\">" + $(this).attr("name") + "</option>");
				});
			});
		}
	});

	$("#dialog").attr("title", "Names and Numbers table");
	$("#dialog").dialog({
		resizable: false,
		width:600,
		height:500,
		modal: true			
	});
}

// Show Cart Dialog
function showCartDlg() {
	$("#dialog:ui-dialog").dialog("destroy");
	$("#dialog").empty();
	$("#dialog").append(getCartDlgHtml());
	$("#dialog").attr("title", "Add to Cart :: " + getPrdtTitle());
	$("#dialog").dialog({
		resizable: false,
		width:600,
		height:600,
		modal: true			
	});
}

// Show Names and Numbers Cart Dialog
function showNamesNumCartDlg() {
	$("#dialog:ui-dialog").dialog("destroy");
	$("#dialog").empty();
	$("#dialog").append(getNamesNumCartDlgHtml());
	$("#dialog").attr("title", "Save and Add to Cart Dialog");
	$("#dialog").dialog({
		resizable: false,
		width:600,
		height:500,
		modal: true			
	});
	
	var html = "";

	$("table#tblCart tbody").empty();

	calcNamesNumCart();
		
	for(var i=0; i<nnNoArray.length; i++) {
		var size = nnSizeArray[i];
		var qty = nnQtyArray[i];		

		html += "<tr>";
		html += "<td><p>" + nnNoArray[i] + "</p></td>";
		html += "<td><p>" + nnNameArray[i] + "</p></td>";
		html += "<td><p>" + nnSizeArray[i] + "</p></td>";
		html += "<td><p>$" + nnPriceArray[i].toFixed(2) + "</p></td>";
		html += "<td><p>" + nnQtyArray[i] + "</p></td>";
		html += "</tr>";			
	}

	$("table#tblCart tbody").append(html);	
	$("#nnTotalAmount")[0].innerHTML = 'Amount : $' + totalAmount.toFixed(2);
}

// Show Save Design Dialog
function showSaveDesignDlg() {
	$("#dialog:ui-dialog").dialog("destroy");
	$("#dialog").empty();
	$("#dialog").append(getSaveDesignDlgHtml());
	$("#dialog").attr("title", "Save design");
	$("#dialog").dialog({
		resizable: false,
		width:600,
		height:500,
		modal: true			
	});

	$("table#tblEmail tbody").empty();
}

// Show Save Design Ideas Dialog
function showSaveDesignIdeasDlg() {	
	$("#dialog:ui-dialog").dialog("destroy");
	$("#dialog").empty();
	$("#dialog").append(getSaveDesignIdeasDlgHtml());
	$("#dialog").attr("title", "Save design ideas");
	$("#dialog").dialog({
		resizable: false,
		width:600,
		height:500,
		modal: true			
	});

	$.post(
		server_url + "designer/addtoadmin.php", 
		{
			frmload: "getcategories"
		},
		function(xml) {		
			var html = "";
			$(xml).find("item").each(function() {
				html += "<option value='" + $(this).attr("id") + "'>" + $(this).attr("name") + "</option>";
			});
			$("#categories").append(html);
		}
	);	
}

// Show Login Dialog
function showLoginDlg() {
	$("#dialog:ui-dialog").dialog("destroy");
	$("#dialog").empty();
	$("#dialog").append(getLoginDlgHtml());
	$("#dialog").attr("title", "Login");
	$("#dialog").dialog({
		resizable: false,
		width:350,
		height:185,
		modal: true			
	});
}

// Show Login Dialog
function showDesignPwdDlg(id, msg) {
	$("#dialog:ui-dialog").dialog("destroy");
	$("#dialog").empty();
	$("#dialog").append(getDesignPwdDlgHtml(id, msg));
	$("#dialog").attr("title", msg);
	$("#dialog").dialog({
		resizable: false,
		width:350,
		height:180,
		modal: true			
	});
}



// Show Upload Wizard Dialog
function showUploadWizardDlg() {
	$("#dialog:ui-dialog").dialog("destroy");
	$("#dialog").empty();
	$("#dialog").append(getUploadImageDlgHtml());
	$("#dialog").attr("title", "Upload Wizard");
	$("#dialog").dialog({
		resizable: false,
		width:600,
		height:600,
		modal: true			
	});
}

function showUploadPrintProcess(src) {
	$("#dialog:ui-dialog").dialog("destroy");
	$("#dialog").empty();
	$("#dialog").append(getUploadPrintProcessDlgHtml(src));
	$("#dialog").attr("title", "Upload Wizard");
	$("#dialog").dialog({
		resizable: false,
		width:600,
		height:600,
		modal: true			
	});
}

function showUploadSelectClosedColorsDlg(fn) {
	$("#dialog:ui-dialog").dialog("destroy");
	$("#dialog").empty();
	$("#dialog").append(getUploadSelectClosedColorsDlgHtml(fn));
	$("#dialog").attr("title", "Upload Wizard");
	$("#dialog").dialog({
		resizable: false,
		width:600,
		height:600,
		modal: true			
	});
}

/* -------------------- functions ---------------------- */

function retrieveDesign() {
	var url = server_url + "designer/retrieve.php";	

	$("#designlist").empty();

	$("#design_loading").css("display", "block");

	$.post(url, 
		{
			frmuserid: user_id
		},
		function(xml) {			
			$(xml).find("item").each(function() {			
				var id = $(this).attr("id");
				var name = $(this).attr("name");
				var image = server_url + $(this).attr("image");		
				var link = server_url + "Retrieve/" + id + ".php";

				$("#designlist").append("<li><a href=\"" + link + "\"><img id=\"" + id + "\" title=\"" + name + "\" class=\"tshirtitem\" src=\"" + image + "\"/></a></li>");							
			});

			$("#designlist").jScrollPane({ autoReinitialise: true });
			$("#design_loading").css("display", "none");
	});
}

function saveDesignImage(id, callback) {
	startRenderBg();
	loadBackground(global_shirtid, 0, function() {		
		renderingAll(function() {
			var oFrontCanvas = document.getElementById("front");
			var oBackCanvas = document.getElementById("back");
			var oLeftCanvas = document.getElementById("left");
			var oRightCanvas = document.getElementById("right");

			var imgFront = oFrontCanvas.toDataURL("image/png");
			var imgBack = oBackCanvas.toDataURL("image/png");
			var imgLeft = oLeftCanvas.toDataURL("image/png");
			var imgRight = oRightCanvas.toDataURL("image/png");

			imgFront = imgFront.replace('data:image/png;base64,', '');
			imgBack = imgBack.replace('data:image/png;base64,', '');
			imgLeft = imgLeft.replace('data:image/png;base64,', '');
			imgRight = imgRight.replace('data:image/png;base64,', '');

			var url = server_url + "designer/savedesign.php";
			
			var data = {};
			var thumbSize = parseInt(getThumbsSize(global_shirtid));

			if(thumbSize == 1) {
				data.frmfront = imgFront;				
			} else if(thumbSize == 2) {
				data.frmfront = imgFront;
				data.frmback = imgBack;
			} else if(thumbSize == 3) {
				data.frmfront = imgFront;
				data.frmback = imgBack;
				data.frmleft = imgLeft;
			} else if(thumbSize == 4) {
				data.frmfront = imgFront;
				data.frmback = imgBack;
				data.frmleft = imgLeft;
				data.frmright = imgRight;
			}
			
			data.frmload = "sides";
			data.frmid = id;

			showMessageDlg("Saving design image data...", "Save Design");

			$.post(url, data, function(data) {
				showMessageDlg("Saved design image data...", "Save Design");
				if(callback) callback();
			});
		});	
	});
}

function saveDesignIdeas(id, callback) {
	var url = server_url + "designer/addtoadmin.php";
	var data = {};

	data.frmdesign = id;
	data.frmname = $("#designName").val();
	data.frmcat = $("#categories").val();

	showMessageDlg("Saving design ideas data...", "Save Design Ideas");

	$.post(url, data, function(data) {	
		showMessageDlg("Saved design ideas data...", "Save Design Ideas");
		if(callback) callback();
	});
}

function saveDesignList(id, callback) {
	var url = server_url + "designer/savedesign.php";
	var position = 0;

	var data = {};

	data.frmid = id;
	data.frmload = "list";

	showMessageDlg("Saving design list data...", "Save Design");

	for(var i=0; i<=3; i++) {
		if(i == 0) data.frmside = "front";
		else if(i == 1) data.frmside = "back";
		else if(i == 2) data.frmside = "left";
		else if(i == 3) data.frmside = "right";

		var len = faceData.length;

		for(var j=0; j<len; j++) {
			if(faceData[j].object.left == -100)
				faceData[j].object.setLeft(faceData[j].position);			

			if(faceData[j].faceIndex == i) {
				data.frmisalias = "0";

				if(faceData[j].object.type == "image") {
					data.frmtype = "image";
					data.frmsource = faceData[j].object._originalImage.src;
					if(faceData[j].object.currentColors.length == 1) data.frmcolor = faceData[j].object.currentColors[0];
					else {
						var tempOrgColor = "";
						var tempCurColor = "";
						for(var inx=0; inx<faceData[j].object.currentColors.length; inx++) {
							tempOrgColor += faceData[j].object.originalColors[inx] + ";";
							tempCurColor += faceData[j].object.currentColors[inx] + ";";
						}
						data.frmcolorsorigin = tempOrgColor.substring(0, tempOrgColor.length - 1);
						data.frmcolorarray = tempCurColor.substring(0, tempCurColor.length - 1);
					}
					data.frmstyle = faceData[j].object.isUploadedImage + ";";
				} else if(faceData[j].object.type == "text") {					
					if(faceData[j].object.kind == "Horizontal") data.frmtype = "text";
					else if(faceData[j].object.kind == "Circle") data.frmtype = "ctext";
					else if(faceData[j].object.kind == "Vertical") data.frmtype = "vtext";

					data.frmsource = faceData[j].object.text;
					data.frmcolor = faceData[j].object.fillColor;

					/**
						@style : fontFamily ; fontSize ; isBorder ; borderColor ; strokeWidth ; letterSpacing ; radius ; backgroundColor
					**/
					data.frmstyle = faceData[j].object.fontFamily + ";" + faceData[j].object.fontSize + ";" + faceData[j].object.isBorder + ";" + faceData[j].object.borderColor + ";" + faceData[j].object.strokeWidth + ";" + faceData[j].object.letterSpacing + ";" + faceData[j].object.radius + ";" + faceData[j].object.backgroundColor;
				} else if(faceData[j].object.type == "alias") {
					data.frmtype = "text";
					data.frmisalias = "1";
					data.frmsource = faceData[j].object.text;
					data.frmcolor = faceData[j].object.fillColor;

					/**
						@style : fontFamily ; fontSize ; isBorder ; borderColor ; strokeWidth ; letterSpacing ; radius ; backgroundColor
					**/
					data.frmstyle = faceData[j].object.fontFamily + ";" + faceData[j].object.fontSize + ";" + faceData[j].object.isBorder + ";" + faceData[j].object.borderColor + ";" + faceData[j].object.strokeWidth + ";" + faceData[j].object.letterSpacing + ";" + faceData[j].object.radius + ";" + faceData[j].object.backgroundColor;
				}

				data.frmposition = position;
				data.frmprocess = "1";

				data.frmflip = !(faceData[j].object.flipX) + ";" + !(faceData[j].object.flipY);
				data.frmsize = faceData[j].object.scaleX + ";" + faceData[j].object.scaleY;
				data.frmrectangle = faceData[j].object.left + ";" + faceData[j].object.top + ";" + faceData[j].object.width + ";" + faceData[j].object.height + ";" + faceData[j].object.angle;
				
				$.post(url, data, function(data) {	
					showMessageDlg("Saved design list data...", "Save Design");
//					if(callback) callback();
				});

				position++;
			}			
		}
	}
}

function addToCart(id) {
	var url = server_url + "designer/addtocart.php";	

	var _frmdesign = id;
	var _frminner = getInnerColorID();
	var _frmdata = getPrdtItemData();
	var _frmoutlineprice = outlineColorCharge;

	showMessageDlg("Adding to cart...", "Save Design");

	$.post( 
		url, 
		{
			frmdesign: _frmdesign,
			frminner: _frminner,
			frmdata: _frmdata,
			frmoutlineprice: _frmoutlineprice
		}, 
		function( xml ) {
			hideMessageDlg();
			if($(xml).find('error').text() != "") {
				alert($(xml).find('error').text());
				return;
			} else {				
				$("#msgDialog:ui-dialog").dialog("destroy");

				$("#msgDialog").empty();
				$("#msgDialog").append("<p>Continue to checkout page?</p>");	

				$("#msgDialog").attr("title", "Add to cart");	

				$("#msgDialog").dialog({
					resizable: false,
					width:240,
					height:150,
					modal: true,
					buttons: {
						Yes: function() {
							checkout();
							$( this ).dialog( "close" );								 
						},
						No: function() { 
							$( this ).dialog( "close" );
						}
					}
				});
			}
		}
	);
}

function addToCartNamesNum(id) {
	var url = server_url + "designer/addtocart.php";	

	var _frmload = "names";
	var _frmdesign = id;
	var _frminner = getInnerColorID();
	var _frmoutlineprice = outlineColorCharge;

	showMessageDlg("Adding to cart...", "Save Design");

	for(var i=0; i<nnNoArray.length; i++) {
		var _frmnumber = nnNoArray[i];
		var _frmname = nnNameArray[i];
		var _frmqty = nnQtyArray[i];
		var _frmsize = nnSizeArray[i];
		var _frmprice = nnPriceArray[i];

		$.post( 
			url, 
			{
				frmload: _frmload,
				frmdesign: _frmdesign,
				frminner: _frminner,
				frmnumber: _frmnumber,
				frmname: _frmname,
				frmqty: _frmqty,
				frmsize: _frmsize,
				frmprice: _frmprice,
				frmoutlineprice: _frmoutlineprice
			}, 
			function( xml ) {
				hideMessageDlg();
				if($(xml).find('error').text() != "") {
					alert($(xml).find('error').text());
					return;
				} else {
					$("#msgDialog:ui-dialog").dialog("destroy");

					$("#msgDialog").empty();
					$("#msgDialog").append("<p>Continue to checkout page?</p>");	

					$("#msgDialog").attr("title", "Add to cart");	

					$("#msgDialog").dialog({
						resizable: false,
						width:240,
						height:150,
						modal: true,
						buttons: {
							"Yes": function() {
								checkout();
								$( this ).dialog( "close" );								 
							},
							"No": function() { 
								$( this ).dialog( "close" );
							}
						}
					});
				}
			}
		);
	}
}

function checkout() {
	window.location = server_url + "cart.php";
}

function getAliasType() {
	if(!hasAliasName() && !hasAliasNumber()) return "NO_ALIAS";
	else if(!hasAliasName() && hasAliasNumber()) return "Number";
	else if(hasAliasName() && !hasAliasNumber()) return "Name";
	else if(hasAliasName() && hasAliasNumber()) return "ALL_ALIAS";
}

function hasAliasName() {
	for(var i=0; i<faceData.length; i++) {
		if(faceData[i].object.type == "alias" && faceData[i].object.kind == "Name") return true;
	}
	return false;
}

function hasAliasNumber() {
	for(var i=0; i<faceData.length; i++) {
		if(faceData[i].object.type == "alias" && faceData[i].object.kind == "Number") return true;
	}
	return false;
}

function hasAliasType() {
	for(var i=0; i<faceData.length; i++) {
		if(faceData[i].object.type == "alias") return true;
	}
	return false;
}

function getEmailAddressString() {
	var length = $("table#tblEmail tbody")[0].rows.length;
	var strEmail = "";

	for(var i=0; i<length; i++) {
		strEmail += $($("table#tblEmail tbody tr")[i].cells[0].childNodes[0])[0].textContent + ";";
	}

	return strEmail.substring(0, strEmail.length - 1);
}

function getPrdtItemData() {
	var prdtItemData = ""; 

	$('.chkQty').each(function(inx) {		
		if($(this).is(':checked')) {
			prdtItemData += $($(this).parent())[0].children[1].textContent + ";";
			prdtItemData += $($($(this).parent().parent())[0].cells[1].childNodes[0]).val() + ";";
			var realItemPrice = itemPrice + parseFloat($(this).val());
			prdtItemData += realItemPrice;
			prdtItemData += "|";
		}
	});

	return prdtItemData.substring(0, prdtItemData.length-1);
}

function getSizePrice(name) {
	var price = 0;

	$(dataXML).find("product").each(function() {
		if($(this).attr("id") == global_shirtid) {			
			$(this).find("size").each(function() {
				$(this).find("item").each(function() {
					if($(this).attr("name") == name)
						price = $(this).attr("price");
				});
			});
		}
	});

	return price;
}

function setPriceTable() {
	qtyArray = new Array();
	priceArray = new Array();

	$(dataXML).find("product").each(function() {
		if($(this).attr("id") == global_shirtid) {	
			$(this).find("pricetable").each(function() {
				$(this).find("item").each(function() {
					qtyArray.push(parseInt($(this).attr("qty")));
					priceArray.push(parseFloat($(this).attr("price")));
				});
			});
		}
	});

}


function calcNamesNumCart() {
	var qtyValue = 0;

	basePrice = 0;
	colorCharge = 0;
	outlineColorCharge = 0;
	sideCharge = 0;
	itemPrice = 0;
	subTotal = 0;
	sizeCharge = 0;
	averagePrice = 0;
	totalAmount = 0;	

	for(var i=0; i<nnNoArray.length; i++) {
		qtyValue = parseInt(qtyValue) + parseInt(nnQtyArray[i]);
	}

	setPriceTable();
	
	var length = qtyArray.length;

	if(qtyValue >= qtyArray[length-1]) {
		basePrice = priceArray[length-1];
	} else {
		for(var i=0; i<length-1; i++) {			
			if(qtyValue >= qtyArray[i] && qtyValue < qtyArray[i+1]) {					
				if(qtyValue == qtyArray[i])
					basePrice = priceArray[i];
				else {
					var diffPrice = (priceArray[i] - priceArray[i+1]) * (qtyValue - qtyArray[i]) / (qtyArray[i+1] - qtyArray[i]);
					basePrice = parseFloat(priceArray[i]) - diffPrice.toFixed(2);
				}
			}
		}
	}	

	if(basePrice != 0) {
		if(isInner == 1) colorCharge = getColorCharge() * 2;
		else colorCharge = getColorCharge();

		outlineColorCharge = getOutlineColorCharge();
	}

	itemPrice = parseFloat(basePrice) + parseFloat(colorCharge) + parseFloat(outlineColorCharge);

	nnPriceArray = new Array();

	for(var i=0; i<nnNoArray.length; i++) {
		nnPriceArray[i] = parseFloat(itemPrice) + parseFloat(getSizePrice(nnSizeArray[i]));
		totalAmount += parseFloat(nnPriceArray[i]) * parseFloat(nnQtyArray[i]);
	}
}

function calcCart() {
	var qtyValue = 0;

	basePrice = 0;
	colorCharge = 0;
	outlineColorCharge = 0;
	sideCharge = 0;
	itemPrice = 0;
	subTotal = 0;
	sizeCharge = 0;
	averagePrice = 0;
	totalAmount = 0;	

	$('.chkQty').each(function(inx) {		
		if($(this).is(':checked')) {
			qtyValue = parseInt(qtyValue) + parseInt($($($(this).parent().parent())[0].cells[1].childNodes[0]).val());
			sizeCharge = parseFloat(sizeCharge) + parseFloat($($($(this).parent().parent())[0].cells[1].childNodes[0]).val()) * parseFloat($(this).val());
		}
	});

	setPriceTable();

	var length = qtyArray.length;

	if(qtyValue >= qtyArray[length-1]) {
		basePrice = priceArray[length-1];
	} else {
		for(var i=0; i<length-1; i++) {			
			if(qtyValue >= qtyArray[i] && qtyValue < qtyArray[i+1]) {					
				if(qtyValue == qtyArray[i])
					basePrice = priceArray[i];
				else {
					var diffPrice = (priceArray[i] - priceArray[i+1]) * (qtyValue - qtyArray[i]) / (qtyArray[i+1] - qtyArray[i]);
					basePrice = parseFloat(priceArray[i]) - diffPrice.toFixed(2);
				}
			}
		}
	}

	if(basePrice != 0) {
		if(isInner == 1) colorCharge = getColorCharge() * 2;
		else colorCharge = getColorCharge();

		outlineColorCharge = getOutlineColorCharge();
	}

	sideCharge = 0;
	itemPrice = parseFloat(basePrice) + parseFloat(colorCharge) + parseFloat(sideCharge) + parseFloat(outlineColorCharge);
	subTotal = parseFloat(itemPrice) * parseFloat(qtyValue);
	totalAmount = parseFloat(subTotal) + parseFloat(sizeCharge);
	if(qtyValue != 0) averagePrice = parseFloat(totalAmount) / parseFloat(qtyValue);
	else averagePrice = parseFloat(0);

	$("#basePrice")[0].innerHTML = '$' + basePrice.toFixed(2);
	$("#colorCharge")[0].innerHTML = '$' + colorCharge.toFixed(2);
	$("#outlineColorCharge")[0].innerHTML = '$' + outlineColorCharge.toFixed(2);
	$("#sideCharge")[0].innerHTML = '$' + sideCharge.toFixed(2);
	$("#itemPrice")[0].innerHTML = '$' + itemPrice.toFixed(2);
	$("#subTotal")[0].innerHTML = '$' + subTotal.toFixed(2);
	$("#sizeCharge")[0].innerHTML = '$' + sizeCharge.toFixed(2);
	$("#averagePrice")[0].innerHTML = '$' + averagePrice.toFixed(2);
	$("#totalAmount")[0].innerHTML = '$' + totalAmount.toFixed(2);
} 

function addUploadImage(src) {
	
	var itemOptions = {};
	var originalColors = [];
	var currentColors = [];	

	$(".chkuploadcolor").each(function(inx) {
		if($(this).is(':checked')) {
			var color = $(this).val();
			originalColors.push(color.substring(1, color.length));
			currentColors.push(color.substring(1, color.length));
		}		
	});

	if(originalColors.length == 0) {
		alert("No colors were selected");
		return;
	}

	itemOptions.originalColors = originalColors;
	itemOptions.currentColors = currentColors;
	itemOptions.isUploadedImage = true;
	
	addGalleryWithUpload(server_url + src, itemOptions, function() {
		$("#dialog:ui-dialog").dialog("close");				
	});
}

/* ---------------------- Get HTML ----------------------- */

function getLoadingDlgHtml() {
	var html = "";

	html += "<div style='width:100px;margin:0 auto;'>";
	html += "<img src='../images/loading.gif' width='100px' height='100px' />";
	html += "</div>";

	return html;
}

function getLoginDlgHtml() {
	var html = "";

	html += "<table width='100%' cellspacing='0' cellpadding='3'>";
    html += "<tbody>";
	html += "<tr><td align='right' class='form'>Email address:</td>";
    html += "<td class='form'><input type='text' class='forminput' value='' id='frmemail'></td></tr>";
    html += "<tr><td align='right' class='form'>Password:</td>";
    html += "<td class='form'><input type='password' class='forminput' value='' id='frmpwd'></td></tr>";
    html += "</tbody>";
	html += "</table>";
    html += "<p align='center' style='margin-top:10px'><input type='button' id='btnLogin' value='Submit' class='submitbutton'></p>";
	html += "<table width='100%' cellspacing='0' cellpadding='0' style='margin-top:15px'>";
    html += "<tbody><tr><td width='50%' class='form'><a title='Forgotten password' href='http://www.laxpinnies.com/forgotten.php'>Forgotten password</a></td>";
    html += "<td width='50%' align='right' class='form'><a title='Register a New Account' href='http://www.laxpinnies.com/register.php'>Register a New Account</a></td></tr>";
    html += "</tbody></table>";

	return html;
}

function getDesignPwdDlgHtml(id, msg){
	var html = "";

	html += "<p>" + msg + "</p>";
	html += "<input type='hidden' id='frmDesignId' name='frmDesignId' value='" + id + "'/>";
	html += "<input type='text' id='frmDesignPwd' name='frmDesignPwd' />";
	html += "<input type='button' class='submitbutton' id='btnDesignPwdOk' value='OK' style='margin-top:20px; margin-left:75px; width:80px;'/>";
	html += "<input type='button' class='submitbutton' id='btnDesignPwdCancel' value='Cancel' style='margin-top:20px; margin-left:10px; width:80px;'/>";

	return html;
}

function getSaveDesignDlgHtml() {
	var html = "";

	html += "<table class='tbl_dialog' cellpadding='0' cellspacing='0' border='0'>";
	html += "<tr>";
	html += "<td width='20%' align='right'><p>Design Name: </p></td>";
	html += "<td width='80%'><input id='designName' type='text' value='' /></td>";
	html += "</tr>";
	html += "<tr>";
	html += "<td width='20%' align='right'><p>Password: </p></td>";
	html += "<td width='80%'><input id='designPwd' type='password' value='' /></td>";
	html += "</tr>";
	html += "<tr>";
	html += "<td width='20%' align='right'><p>Design Notes: </p></td>";
	html += "<td width='80%'>&nbsp;</td>";
	html += "</tr>";
	html += "</table>";
	html += "<textarea id='designNotes'></textarea>";
	html += "<p>Send to friends:</p>";
	html += "<table class='tbl_dialog' cellpadding='0' cellspacing='0' border='0'>";
	html += "<tr>";
	html += "<td width='85%' style='padding:0;'><input id='designEmail' type='text' value='' style='width:98%;'/></td>";
	html += "<td width='15%'><input id='btnAddEmail' class='submitbutton' type='button' value='Add email'/></td>";
	html += "</tr>";
	html += "</table>";
	html += "<div style='overflow:auto;width:100%;height:130px;border:1px solid #959595;'>"
	html += "<table class='tbl_dialog' id='tblEmail' cellpadding='0' cellspacing='0' border='0'>";
	html += "<tbody>";
	html += "</tbody>";
	html += "</table>";
	html += "</div>"
	html += "<input id='btnSaveDesign' class='submitbutton' type='button' value='Save design' style='margin-left:265px;margin-top:10px;'/>";

	return html;
}

function getSaveDesignIdeasDlgHtml() {
	var html = "";

	html += "<table class='tbl_dialog' cellpadding='0' cellspacing='0' border='0'>";
	html += "<tr>";
	html += "<td width='20%'><p>Design Name: </p></td>";
	html += "<td width='80%'><input id='designName' type='text' value='' /></td>";
	html += "</tr>";
	html += "<tr>";
	html += "<td width='20%'><p>Category: </p></td>";
	html += "<td width='80%'><select id='categories'></select></td>";
	html += "</tr>";
	html += "<tr>";
	html += "<td width='20%'><p>Design Notes: </p></td>";
	html += "<td width='80%'>&nbsp;</td>";
	html += "</tr>";
	html += "</table>";
	html += "<textarea id='designNotes'></textarea>";
	html += "<input id='btnSaveDesignIdeas' class='submitbutton' type='button' value='Save design' style='margin-top:10px;'/>";

	return html;
}

function getNamesNumTableHtml() {
	var html = "";

	html += "<p><b>Add item:</b></p>";
	html += "<table class='tbl_dialog' cellpadding='0' cellspacing='0' border='0'>";
	html += "<tr>";

	html += "<td width='10%'>";
	if(getAliasType() == "Number" || getAliasType() == "ALL_ALIAS") {
		html += "<p>No.</p>";
	}
	html += "</td>";

	html += "<td width='40%'>";
	if(getAliasType() == "Name" || getAliasType() == "ALL_ALIAS") {
		html += "<p>Name</p>";
	}
	html += "</td>";	

	html += "<td width='30%'><p>Size</p></td>";
	html += "<td width='20%'><p>QTY</p></td>";	
	html += "</tr>";
	html += "<tr>";

	html += "<td width='10%'>";
	if(getAliasType() == "Number" || getAliasType() == "ALL_ALIAS") {
		html += "<input type='text' id='addItemNum' value=''/>";
	}
	html += "</td>";

	html += "<td width='40%'>";
	if(getAliasType() == "Name" || getAliasType() == "ALL_ALIAS") {
		html += "<input type='text' id='addItemName' value=''/>";
	}
	html += "</td>";	

	html += "<td width='30%'>";
	html += "<select id='addItemSize'>";            
	html += "</select>";
	html += "</td>";
	html += "<td width='20%'><input type='number' id='addItemQty'/></td>";
	html += "</tr>";
	html += "</table>";
	html += "<div style='float:right;'>";
	html += "<input id='btnAddItem' class='submitbutton' type='button' value='Add item' style='margin-right:5px;'/>";
	html += "</div>";	
	html += "<p><b>Names and Numbers table:</b></p>";
	html += "<table id='tblNameNum' class='tbl_dialog' cellpadding='0' cellspacing='0' border='0'>";
	html += "<thead>";
	html += "<tr>";
	html += "<td width='10%'><p>No.</p></td>";
	html += "<td width='40%'><p>Name</p></td>";
	html += "<td width='30%'><p>Size</p></td>";
	html += "<td width='20%'><p>QTY</p></td>";
	html += "</tr>";
	html += "</thead>";
	html += "<tbody>";	

	for(var i=0; i<nnNoArray.length; i++) {
		html += "<tr>";
		html += "<td><p>" + nnNoArray[i] + "</p></td>";
		html += "<td><p>" + nnNameArray[i] + "</p></td>";
		html += "<td><p>" + nnSizeArray[i] + "</p></td>";
		html += "<td><p>" + nnQtyArray[i] + "</p></td>";
	}

	html += "</thead>";
	html += "</table>";
	html += "<hr />";
	html += "<p><b>Edit selected item:</b></p>";
	html += "<div style='float:right;'>";
	html += "<input id='btnSaveItem' class='submitbutton' type='button' value='Save' style='margin-right:5px;'/>";
	html += "<input id='btnRemoveItem' class='submitbutton' type='button' value='Remove'/>";
	html += "</div>";
	html += "<table class='tbl_dialog' cellpadding='0' cellspacing='0' border='0'>";
	html += "<tbody>";
	html += "<tr>";

	html += "<td width='10%'>";
	if(getAliasType() == "Number" || getAliasType() == "ALL_ALIAS") {
		html += "<p>No.</p>";
	}
	html += "</td>";

	html += "<td width='40%'>";
	if(getAliasType() == "Name" || getAliasType() == "ALL_ALIAS") {
		html += "<p>Name</p>";
	}
	html += "</td>";
	
	html += "<td width='30%'><p>Size</p></td>";
	html += "<td width='20%'><p>QTY</p></td>";
	html += "</tr>";
	html += "<tr>";

	html += "<td>";
	if(getAliasType() == "Number" || getAliasType() == "ALL_ALIAS") {
		html += "<input type='text' id='editItemNo'/>";
	}
	html += "</td>";

	html += "<td>";
	if(getAliasType() == "Name" || getAliasType() == "ALL_ALIAS") {
		html += "<input type='text' id='editItemName'/>";
	}
	html += "</td>";

	html += "<td>";
	html += "<select id='editItemSize'>";               
	html += "</select>";
	html += "</td>";
	html += "<td><input type='number' id='editItemQty'/></td>";
	html += "</tr>";
	html += "</tbody>";
	html += "</table>";
	html += "<hr />";
	html += "<input id='btnUploadText' class='submitbutton' type='button' value='Upload text file'/>";
	html += "<input id='btnToInnerSideDlg' class='submitbutton' type='button' value='Continue' style='float:right;'/>";

	return html;
}

function getInnerSideDlgHtml() {
	var html = "";

	html += "<input type='checkbox' id='chkInnerSide' /><label for='chkInnerSide'>Copy your design to the INNER SIDE of the product.</label><br />";
	html += "<div id='innerSideContent'>";
	html += "</div>";
	html += "<div style='clear:both;'><p>NOT APPLICABLE ON SHORTS:If you would like your design printed on the inner side of your product(for example, if you are ordering a black and white reversible pinie and you would like your design printed on both the black side and the white side), please check the above box. Once the color box(es) appear, please select the color(s) you would like for your design on the inverse side(For example, if your design is white on the black side, you can choose to have your design printed in black on the white side). Additional charges apply for printing your design on the inverse side. Be sure to add your names and numbers, if applica</p></div>";
	html += "<input id='btnToCart' class='submitbutton' type='button' value='Continue' style='float:right;'/>";

	return html;
}

function getNamesNumCartDlgHtml() {
	var html = "";

	html += "<p><b>Names and Numbers table:</b></p>";
	html += "<table id='tblCart' class='tbl_dialog' cellpadding='0' cellspacing='0' border='0'>";
	html += "<thead>";
	html += "<tr>";
	html += "<td width='10%'><p>No.</p></td>";
	html += "<td width='40%'><p>Name</p></td>";
	html += "<td width='20%'><p>Size</p></td>";
	html += "<td width='20%'><p>Price</p></td>";
	html += "<td width='10%'><p>QTY</p></td>";
	html += "</tr>";
	html += "</thead>";
	html += "<tbody>";
	html += "</tbody>";
	html += "</table>";
	html += "<hr />";
	html += "<p><b>Design notes:</b></p>";
	html += "<textarea id='designNotes'></textarea>";
	html += "<hr />";
	html += "<p id='nnTotalAmount' style='font-weight:bold;text-align:center;'></p>";
	html += "<hr />";				
	html += "<input id='btnShowTable' class='submitbutton' type='button' value='Show table'/>";
	html += "<input id='btnNamesNumCart' class='submitbutton' type='button' value='Add to Cart' style='float:right;'/>";

	return html;
}

function getCartDlgHtml() {
	var html = "";

	$(dataXML).find("product").each(function() {
		if($(this).attr("id") == global_shirtid) {
			var title = $(this).attr("name");				
			var inx = 0;		

			html += "<div id='quantityContainer' style='float:left;width:60%;'>";
			html += "<p><b>Select quantity</b></p>";
			html += "<table class='tbl_dialog' cellpadding='0' cellspacing='0' border='0'>";
			
			inx = 0;
			$(this).find("size").each(function() {
				$(this).find("item").each(function() {
					html += "<tr>";
					html += "<td width='40%'><input class='chkQty' id='chkQty" + inx + "' type='checkbox' value='" + $(this).attr("price") + "' /><label for='chkQty" + inx + "'>" + $(this).attr("name") + "</label></td>";
					html += "<td width='30%'><input type='text' style='width:90%;' value='1' disabled/></td>";
					if(parseFloat($(this).attr("price")) != 0)
						html += "<td width='30%'><p>+$" + $(this).attr("price") + "</p></td>";
					else
						html += "<td width='30%'><p>&nbsp;</p></td>";
					html += "</tr>";
					inx++;
				});
			});

			html += "</table>";
			html += "</div>";

			html += "<div id='summaryContainer' style='float:left;width:40%;'>";
			html += "<p><b>Summary</b></p>";
			html += "<table class='tbl_dialog' cellpadding='0' cellspacing='0' border='0'>";
			html += "<tr>";
			html += "<td width='70%' align='right'><p>Item base price:</p></td>";
			html += "<td width='30%' align='right'><p id='basePrice'>$0</p></td>";
			html += "</tr>";
			html += "<tr>";
			html += "<td width='70%' align='right'><p>Color charge:</p></td>";
			html += "<td width='30%' align='right'><p id='colorCharge'>$0</p></td>";
			html += "</tr>";
			html += "<tr>";
			html += "<td width='70%' align='right'><p>Outline color charge:</p></td>";
			html += "<td width='30%' align='right'><p id='outlineColorCharge'>$0</p></td>";
			html += "</tr>";
			html += "<tr>";
			html += "<td width='70%' align='right'><p>Additional side charge:</p></td>";
			html += "<td width='30%' align='right'><p id='sideCharge'>$0</p></td>";
			html += "</tr>";
			html += "<tr>";
			html += "<td width='70%' align='right'><p>Final item price:</p></td>";
			html += "<td width='30%' align='right'><p id='itemPrice'>$0</p></td>";
			html += "</tr>";
			html += "</table>";
			html += "<hr />";

			html += "<table class='tbl_dialog' cellpadding='0' cellspacing='0' border='0'>";
			html += "<tr>";
			html += "<td width='70%' align='right'><p>Items subtotal:</p></td>";
			html += "<td width='30%' align='right'><p id='subTotal'>$0</p></td>";
			html += "</tr>";
			html += "<tr>";
			html += "<td width='70%' align='right'><p>Size/s charge:</p></td>";
			html += "<td width='30%' align='right'><p id='sizeCharge'>$0</p></td>";
			html += "</tr>";
			html += "<tr>";
			html += "<td width='70%' align='right'><p>Average item price:</p></td>";
			html += "<td width='30%' align='right'><p id='averagePrice'>$0</p></td>";
			html += "</tr>";
			html += "</table>";
			html += "<hr />";

			html += "<table class='tbl_dialog' cellpadding='0' cellspacing='0' border='0'>";
			html += "<tr>";
			html += "<td width='70%' align='right'><p>Amount:</p></td>";
			html += "<td width='30%' align='right'><p id='totalAmount'>$0</p></td>";
			html += "</tr>";
			html += "</table>";
			html += "<hr />";
			
			html += "<p>Your additional design notes:</p>";
			html += "<textarea id='note' style='width:100%;height:70px;' />";

			html += "<input class='submitbutton' type='button' id='btnAddCart' value='Add to Cart' style='margin-left:70px;margin-top:10px;'/>";
			//html += "<input class='submitbutton' type='button' value='Checkout' onclick='checkout()'/>";

			html += "</div>";			
		}
	});	

	return html;
}

function getPrdtDetailDlgHtml() {
	var html = "";
	
	$(dataXML).find("product").each(function() {
		if($(this).attr("id") == global_shirtid) {			
			var title = $(this).attr("name");
			var thumbUrl = $(this).attr("thumb");
			var desc = $(this).attr("desc");
			var tags = $("font" , desc);

			html += "<img class='tshirtitem' src='" + server_url + thumbUrl + "' />";
			html += "<div id='desc'`><p>";

			tags.each(function(){
				var tag = $(this); 
				html += tag[0].innerHTML;
			});

			html += "</p></div>";		
			html += "<div style='height:195px;overflow:auto;'>";
			html += "<table class='tbl_dialog' cellpadding='0' cellspacing='0' border='0'>";
			html += "<thead><tr>";
			html += "<td width='30%'><p>Size</p></td>";
			html += "<td width='30%'><p>Short Name</p></td>";
			html += "<td width='40%'></td>";
			html += "</tr></thead>";
			html += "<tbody>";

			$(this).find("size").each(function() {
				$(this).find("item").each(function() {
					html += "<tr>";
					html += "<td><p>" + $(this).attr("name") + "</p></td>";
					html += "<td><p>" + $(this).attr("short") + "</p></td>";
					html += "<td>";

					var price = parseFloat($(this).attr("price")).toFixed(2);
					if(price != 0) html += "<p>+$" + price + "</p>";

					html += "</td>";
					html += "</tr>";
				});
			}); 
			
			html += "</tbody>";
			html += "</table>";
		}
	});

	return html;
}

function getUploadImageDlgHtml() {
	var html = "";
	
	html += "<h5>Upload Image</h5>";
	html += "<p><input type='checkbox' id='chkLegalUpload' />I have a legal right to use the image</p>";
	html += "<form id='uploadform' enctype='multipart/form-data' method='post' action='" + server_url + "designer/upload.php'>";
	html += "<input type='button' class='submitbutton' value='Upload image' id='btnUploadImage' disabled/>";	
	html += "<input type='file' id='frmimage' name='frmimage' style='position:absolute; left:-100px; top:-100px;'/>";
	html += "<input type='submit' value='submit' id='submitUpload' style='position:absolute; left:-100px; top:-100px;' />";
	html += "</form>";
	html += "<br>";
	html += "<hr>";
	html += "<br>";
	html += "<p><b>Allowed file types:</b> jpg,png,gif,jpeg,giff,eps,ai <b>max.5MB</b></p>";
	html += "<p><b>Please select your image to upload it</b></p>";

	return html;
}

function getUploadPrintProcessDlgHtml(src) {	
	var html = "";

	html += "<h5>Select Print Process</h5>";
	html += "<img src='" + server_url + src + "' width='100' height='100' />";
	html += "<p>Print process:";
	html += "<select style='width:200px;'>";
	html += "<option value='screenprinting' selected>Selecciona el color</option>";
	html += "</select>";
	html += "</p>";
	html += "<p>Screen Printing:Please note that all of our products listed on our site will be screen printed unless otherwise specified. We recommend that you keep your camera ready artwork down to a limit of one color per front and back to keep the cost of our product low. If you have any questions, feel free to contact us.</p>";
	html += "<br>";
	html += "<p>Please note that color printed may vary from what your custom rendition shows due to your computers screen resolution settings. We aim to provide you with the closest possible replication of what you have created on our site. Thanks.</p>";
	html += "<input id='btnToUploadSelectClosedColors' type='button' class='submitbutton' value='Continue' onclick='showUploadSelectClosedColorsDlg(\"" + src + "\");'/>";

	return html;
}

function getUploadSelectClosedColorsDlgHtml(src) {
	var html = "";
	
	html += "<h5>Select Closed Colors</h5>";
	html += "<img src='" + server_url + src + "' width='100' height='100' />";
	html += "<p>Screen Printing:";
	html += "<ul id='upload_colors'>";
	
	$(dataXML).find("settings").each(function() {
		$(this).find("process").each(function() {
			$(this).find("item").each(function() {
				if($(this).attr("id") == "1") {					
					$(this).find("table").each(function() {
						$(this).find("item").each(function() {
							var id = $(this).attr("id");
							var name = $(this).attr("name");
							var color = '#' + $(this).attr("hex");
							tableColorArray[id] = color;
							html += "<li class='uploadcolor' id='" + id + "' title='" + name + "' style='background: " + color + " no-repeat;'>";
							html += "<input class='chkuploadcolor' type='checkbox' value='" + color + "'/>";
							html += "</li>";
						});
					});
				}
			});
		});
	});
	
	html += "</ul>";
	html += "<p>PLEASE SELECT *ALL* DESIRED COLORS IN YOUR UPLOADED IMAGE. ONLY COLORS SELECTED BY YOU WILL BE PRINTED ON YOUR PRODUCT. IF YOU UPLOAD AN IMAGE WITH MULTIPLE COLORS BUT ONLY SELECT ONE COLOR, OUR STAFF WILL CONVERT YOUR IMAGE TO THE COLOR YOU HAVE SELECTED (AND ONLY THAT COLOR).</p>";
	html += "<input id='btnUploadFinish' type='button' class='submitbutton' value='Finish' style='width:60px;float:right;' onclick='addUploadImage(\"" + src + "\")' />";

	return html;
}

function getArtDesignHtml() {
	var html = "";

	html += "<h1>Dise–o</h1>";
	html += "<p style='float: left; margin-top: 5px;'>Solid Color : </p>";
	html += "<div id='artColor' class='colorSelector' style='margin-left: 76px;'>";                    
	html += "<div style='background-color: #000000'></div>";
	html += "</div>";
	html += "<div id='artChangeColor'>";
	html += "</div>";

	return html;
}

function getArtDesignWithUploadHtml() {
	var html = "";
	
	html += "<h1>Die–o</h1>";
	html += "<p style='color:#ff0000;'>Your uploaded image has been added to your design. Please note the colors you have selected for your uploaded image in the bottom left corner of the design area. PLEASE NOTE: If the image you uploaded has a \"box\" background(typically white or black) appearing on your design, the image background will NOT be printed on your product unless otherwise specified in your design notes.</p>";

	return html;
}

function getPrdtTitle() {
	var title = "";

	$(dataXML).find("product").each(function() {
		if($(this).attr("id") == global_shirtid) {			
			title = $(this).attr("name");
		}
	});

	return title;
}
