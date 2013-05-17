//  ///////////////////////////////////////////////////////////////////////////////////////////////////// 
//  SHIVALIB POSTER  
//  ///////////////////////////////////////////////////////////////////////////////////////////////////// 

SHIVA_Show.prototype.DrawPoster=function() 											//	DRAW POSTER
{
	var str;
	var options=this.options;
	var container=this.container;
	var con="#"+container;
	var items=new Array();
 	this.items=items;
	var _this=this;
    for (var key in options) {
		if (key.indexOf("item-") != -1) {
			var o=new Object;
			var v=options[key].split(';');
			for (i=0;i<v.length;++i) {
				v[i]=v[i].replace(/http:/g,"http`");
				o[v[i].split(':')[0]]=v[i].split(':')[1].replace(/\^/g,"&").replace(/~/g,"=").replace(/\`/g,":");
				}
			items.push(o);
			}
		}
	var v=options.pos.split("|");														// Get start pos
	this.posterScale=v[0]/1000;															// Get scale
	this.posterX=v[1]/1000;																// Get x
	this.posterY=v[2]/1000;																// Get y
	var str="<div id='posterDiv' style='position:absolute;left:0px;top:0px'></div>";	// Make poster div
	$(con).html(str);																	// Add div
	$(con).css({"width":options.width+"px","height":options.height+"px"});				// Resize container	
	$(con).css({border:"1px solid",overflow:"hidden",margin:"0px",padding:"0px"});		// Put border and hode overflow on container
	$("#posterDiv").width(options.width*this.posterScale);								// Set poster width
	$("#posterDiv").height(options.height*this.posterScale);							// Set poster height
	$("#posterDiv").css("background-color","#"+options.backCol);						// Back color
	var l=$(con).position().left;														// Left boundary
	var r=l-0+(options.width-(options.width*this.posterScale));							// Right boundary
	var t=$(con).position().top;														// Top boundary
	var b=t-0+(options.height-(options.height*this.posterScale));						// Bottom boundary

	$("#posterDiv").draggable({ containment: [r,b,l,t],									// Containment 
								drag:function(event,ui) {								// Make it draggable
								var w=$("#posterDiv").width();							// Get image width
								var h=$("#posterDiv").height();							// Get image height
								var s=shivaLib.posterScale;								// Current scale
								shivaLib.posterX=(-$("#posterDiv").css("left").replace(/px/,"")+(w/s/2))/w; // Get centerX %
								shivaLib.DrawPosterOverview();							// Reflect pos in overview
								}});	 
	if (options.dataSourceUrl) {														// If a back img spec'd
		str="<img src='"+options.dataSourceUrl+"' ";									// Name
		str+="height='"+options.height*this.posterScale+"' ";							// Height
		str+="width='"+options.width*this.posterScale+"'>";								// Width
		$("#posterDiv").append(str);													// Add image to poster
		}	
	var w=$("#posterDiv").width();														// Get image width
	var h=$("#posterDiv").height();														// Get image height
	var l=w*this.posterX-(w/this.posterScale/2);										// Get left
	var t=h*this.posterY-(h/this.posterScale/2);										// Get top
	$("#posterDiv").css({"left":-l,"top":-t});											// Position poster	
	if (typeof(DrawPosterGrid) == "function")											// If not in embedded
		DrawPosterGrid();																// Draw grid if enabled
	this.DrawPosterOverview();															// Draw overview, if enabled
	if (this.posterMode != "Connect") {													// If editing
		this.DrawPosterPanes();															// Draw panes
		this.DrawLayerControlBox(this.items,(options.controlbox == "true"));			// Draw control box?
		}
	this.SendReadyMessage(true);														// Send ready message
}

SHIVA_Show.prototype.GoToPosterPane=function(num) 									// DRAW POSTER OVERVIEW
{
	if (num < this.items.length) {														// If a pane													
		var v=this.items[num].data.split("|");											// Get pane pos
		v[0]=Math.round(1000/v[0]*1000);												// Rescale
		this.options.pos=v[0]+"|"+v[1]+"|"+v[2];										// Set pos
		}
	else																				// If start
		this.options.pos="1000|500|500";												// Centered full screen
	this.DrawPoster();																	// Redraw
	trace($("#shcr0").length)
	$("#shcr"+num).attr("checked","checked");											// Reset radio button
}

SHIVA_Show.prototype.DrawPosterOverview=function() 									// DRAW POSTER OVERVIEW
{
	var str;
	var options=this.options;
	var w=options.width/4;																// Width of frame
	var h=w*options.height/options.width;												// Height based on aspect
	if (($("#posterOverDiv").length == 0) && (options.overview == "true"))  {			// If not initted yet and showing
		var css = { position:"absolute",												// Frame factors
					left:options.width-w+"px",
					width:w+"px",
					height:h+"px",
					top:options.height-h+"px",
					border:"1px solid",
					"background-color":"#"+options.backCol
					};
		
		str="<div id='posterOverDiv'></div>";											// Frame box div
		$("#"+this.container).append(str);												// Add to container
		$("#posterOverDiv").css(css);													// Set overview frame
		if (options.dataSourceUrl) {													// If a back img spec'd
			str="<img src='"+options.dataSourceUrl+"' ";								// Name
			str+="height='"+h+"' ";														// Height
			str+="width='"+w+"' >";														// Width
			$("#posterOverDiv").append(str);											// Add image to poster
			}	
		if (typeof(DrawPosterOverviewGrid) == "function")								// If not embedded
			DrawPosterOverviewGrid();													// Draw grid in overview if enabled
		var css = { position:"absolute",												// Box factors
					width:w/this.posterScale+"px",
					height:h/this.posterScale+"px",
					border:"1px solid #666",
					"z-index":3,
					"background-color":"rgba(220,220,220,0.4)"
					};
		str+="<div id='posterOverBox'></div>";											// Control box div
		$("#posterOverDiv").append(str);												// Add control box to overview frame
		$("#posterOverBox").css(css);													// Set overview frame
		var l=$("#posterOverDiv").offset().left;										// Left boundary
		var t=$("#posterOverDiv").offset().top;											// Left boundary
		var r=(l+w)-(w/this.posterScale)												// Right boundary
		var b=(t+h)-(h/this.posterScale)												// Bottom boundary
		$("#posterOverBox").draggable({ containment:[l,t,r,b], 							// Make it draggable 
							drag:function(event,ui) {									// Handle drag						
								var w=$("#posterOverDiv").width();						// Overview width
								var pw=$("#posterDiv").width();							// Poster width
								var h=$("#posterOverDiv").height();						// Overview hgt
								var ph=$("#posterDiv").height();						// Poster hgt
								var s=shivaLib.posterScale;								// Current scale
								var x=Math.max(0,ui.position.left/w*pw);				// Calc left
								var y=Math.max(0,ui.position.top/h*ph);					// Calc top
								shivaLib.posterX=(x+(pw/s/2))/pw; 						// Get center X%
								shivaLib.posterY=(y+(ph/s/2))/ph;  						// Get center Y%
								$("#posterDiv").css({"left":-x+"px","top":-y+"px"});	// Position poster	
								$("#propInput0").val(shivaLib.options.pos=Math.round(shivaLib.posterScale*1000)+"|"+Math.round(shivaLib.posterX*1000)+"|"+Math.round(shivaLib.posterY*1000));  // Set cur pos
								}
							 });		
		}
	$("#posterOverBox").resizable({ containment:"parent",								// Resizable
									aspectRatio:true,
									minHeight:12,
									stop:function(event,ui) {							// Om resize stop
										var w=$("#posterOverDiv").width();				// Overview width
										var pw=$("#posterDiv").width();					// Poster width
										var h=$("#posterOverDiv").height();				// Overview hgt
										var ph=$("#posterDiv").height();				// Poster hgt
										shivaLib.posterScale=Math.max(w/ui.size.width,1); // Get new scale, cap at 100%					
										var s=shivaLib.posterScale;						// Current scale
										var x=Math.max(0,ui.position.left/w*pw);		// Calc left
										var y=Math.max(0,ui.position.top/h*ph);			// Calc top
										shivaLib.posterX=(x+(pw/s/2))/pw; 				// Get center X%
										shivaLib.posterY=(y+(ph/s/2))/ph;  				// Get center Y%
										$("#propInput0").val(shivaLib.options.pos=Math.round(shivaLib.posterScale*1000)+"|"+Math.round(shivaLib.posterX*1000)+"|"+Math.round(shivaLib.posterY*1000));  // Set cur pos
										shivaLib.DrawPoster();							// Redraw
										}
									}); 
	var x=options.left=$("#posterDiv").css("left").replace(/px/,"");					// Get x pos
	x=-x/options.width*w/this.posterScale;												// Scale to fit
	var y=options.top=$("#posterDiv").css("top").replace(/px/,"");						// Get y pos
	y=-y/options.height*h/this.posterScale;												// Scale to fit
	$("#posterOverBox").css({"left":x+"px","top":y+"px"});								// Position control box		
}

SHIVA_Show.prototype.DrawPosterPanes=function(num) 									// DRAW POSTER PANES
{
	var i,v,u,str,dw,dh,x,y,s=0,isImg=true;
	var scale=this.posterScale;
	var e=this.items.length;															// Assume end is all items
	var w=$("#posterDiv").width();														// Poster width
	var h=$("#posterDiv").height();														// Poster height
	if (num != undefined) s=num,e=num-0+1;												// Just draw one
	for (i=0;i<e;++i) {																	// For each pain
		v=this.items[i].data.split("|");												// Get specs
		dw=v[0]/1000*w;																	// Div width
		dh=v[0]/1000*h;																	// Div height
		x=w*v[1]/1000-(dw/2);															// Sert centered left
		y=h*v[2]/1000-(dh/2);															// Set centered top
		str="<div id='posterPane"+i+"' style='position:absolute;background:none transparent;";	// Base
		str+="left:"+x+"px;";															// Left
		str+="top:"+y+"px;";															// Left
		str+="height:"+dh+"	px;";														// Height
		str+="width:"+dw+"px'>";														// Width
		u=this.items[i].url;															// Point at url
		if (isImg=u.match(/[[.]jpg|jpeg|gif|png]/i))									// If an image file
			str+="<img src='"+this.items[i].url+"' width='"+dw+"'>";					// Image				
		else if (u) {																	// Something else
			if (!isNaN(u))																// If a number
				u="http://www.viseyes.org/shiva/go.htm?e="+u;							// Add file base
			str+="<iframe src='"+u+"' height='"+dh+"' width='"+dw+"' ";					// Iframe base
			if (this.items[i].scrollbars == "false")									// If not scrolling
				str+="scrolling='no' ";													// Inhibit it
			str+="frameborder='0' allowtransparency='true'></iframe>";					// Finish iframe				
			}
		if (num == undefined) {															// If doing them all
			$("#posterDiv").append(str+"</div>");										// Add div to poster
			if (this.posterMode == "Edit") {											// If editing
				y=$("#posterPane"+i).height();											// Get height
				var str="<div style='position:absolute;left:0px;top:0px;width:100%;height:100%;border:1px dashed'>";	// Make overlay div for dragging
				str+="<div style='position:absolute;left:0px;top:"+(y+3)+"px;text-shadow:1px 1px #eee'>";
				str+="<b> "+(i+1)+". "+this.items[i].layerTitle+"</b></div>";	// Label
				$("#posterPane"+i).append(str+"</div>");								// Add div
				}
			}
		if (this.options.overview == "true")  {											// If showing overview
			str="<div id='posterOverPane"+i+"' style='position:absolute;opacity:.4;border:1px solid;pointer-events:none;background-color:#666;";	// Base
			str+="height:"+dh/4/scale+"px;";											// Height
			str+="width:"+dw/4/scale+"px'></div>";										// Width
			if (num == undefined) 														// If doing them all
				$("#posterOverDiv").append(str);										// Add div to overview
			x=$("#posterPane"+i).position().left;										// Get left
			y=$("#posterPane"+i).position().top;										// Get top
			$("#posterOverPane"+i).css({"left":x/4/scale+"px","top":y/4/scale+"px"});	// Set pos			
			}
		if (this.posterMode != "Edit")													// If viewing
			continue;																	// No need for interaction
		$("#posterPane"+i).resizable({ 	containment:"parent",							// Resizable
										aspectRatio:isImg,
										stop:function(event,ui) {						// On resize stop
											var i=event.target.id.substr(10);			// Extract id
											var v=shivaLib.items[i].data.split("|");	// Get parts
											v[0]=Math.floor(Math.min(ui.size.width/$("#containerDiv").width()/shivaLib.posterScale,1)*1000); // Get new scale, cap at 100%					
											shivaLib.items[i].data=v[0]+"|"+v[1]+"|"+v[2];		// Calc new size
											$("#itemInput"+i+"-1").val(shivaLib.items[i].data);	// Put in menu
											Draw();										// Redraw 									
											}
										});
		$("#posterPane"+i).draggable({  containment:"parent",							// Draggable
										drag:function(event,ui) {						// On drag stop
											var i=event.target.id.substr(10);			// Extract id
											var v=items[i].data.split("|");				// Get parts
											var w=$("#posterDiv").width();				// Poster wid
											var h=$("#posterDiv").height();				// Poster hgt
											var off=0;									// Iframe offset
											if (shivaLib.items[i].url.match(/[[.]jpg|jpeg|gif|png]/i))	// If an image file
												off=12*shivaLib.posterScale;			// Set offset
											v[1]=Math.round(($("#posterPane"+i).position().left+$("#posterPane"+i).width()/2)/w*1000);
											v[2]=Math.round(($("#posterPane"+i).position().top+$("#posterPane"+i).height()/2+off)/h*1000);
											shivaLib.items[i].data=v[0]+"|"+v[1]+"|"+v[2];		// Calc new size
											$("#itemInput"+i+"-1").val(shivaLib.items[i].data);	// Put in menu
											shivaLib.DrawPosterPanes(i);				// Redraw this pane in overview									
											}
										});
		}	
}