
////////////////////////////////INFO////////////////////////////////////////
// This library was created by Kim Doberstein

// Version 1.1
// Date: 4/8/2010
//
// This set of jQuery-based plug-ins will turn any table into sortable by clicking on the column headers.
// In addition, it will alternate the table row background colors (zebra stripping).

// NOTE: These functions require the jQuery library.  It was created using version 1.2.6 and tested using 1.4.2
// You can downloaded jQuery at: http://jquery.com/
////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
// VARS USED IN THIS LIBRARY

var sortTableVars=new Object();


	sortTableVars.noSortClass='noSort'; //Class applied to a header cell if that column should not be sortable
	sortTableVars.sortHeaderClass='sortHeader'; //Class applied to the header cell link
	sortTableVars.headerLinkTitle="Sort this column"; //The title of the header sort link
	sortTableVars.alreadySortedAscendingClass='sortedAscending';//Class applied to the header cell of a column that is already sorted ascending on page load
	sortTableVars.alreadySortedDescendingClass='sortedDescending';//Class applied to the header cell of a column that is already sorted descending on page load
	
	
	sortTableVars.sortArrowClass='sortArrow'; //Class applied to the span that holds the sort arrow.
	sortTableVars.ascSortArrow='&nbsp;&darr;'; //HTML shown when a column is sorted ascending - normally a down arrow
	sortTableVars.descSortArrow='&nbsp;&uarr;'; //HTML shown when a column is sorted descending - normally an up arrow
	sortTableVars.sortDirectionAscClass='sortDirectionAsc';// Additional class applied to the span that holds the sort arrow when sorted ascending;
	sortTableVars.sortDirectionDesClass='sortDirectionDes';// Additional class applied to the span that holds the sort arrow when sorted descending;

	sortTableVars.sortKeyClassStart="dataType_";
	sortTableVars.sortFunctionClassStart="sort_";
	sortTableVars.sortKeyClass="sortKey";
	
	sortTableVars.sortedColumnClass='sortedCol';
	sortTableVars.sortHeaderRowClass='sortHeaderRow'; //Class applied to tell the script what row is the header row.
	sortTableVars.secondarySortClass="secondarySort_";//Start of the class to determine secondary column sorting
	//sortTableVars.callBack=sortTableVarsCallback; //if(typeof formValidationOverRide!="undefined"&&formValidationOverRide(formPointer)) return formValidationOverRide(formPointer);
	
	


////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////




jQuery.fn.alternateRowColors = function() {
// This seems backwards because the first row is actually 0 (an even number)
  jQuery('tbody tr:visible:odd', this).removeClass('odd').addClass('even');
  jQuery('tbody tr:visible:even', this).removeClass('even').addClass('odd');
  
  return this;
};

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
jQuery.fn.easySortTable=function(){
	//this=table
	
	
	
	
	return this.each(function(){
		var headerRow;
	
		if(jQuery(this).find('tr.'+sortTableVars.sortHeaderRowClass).length>0){
			headerRow=jQuery(this).find('tr.'+sortTableVars.sortHeaderRowClass).eq(0);
		}
		else if(jQuery(this).find('thead').length>0){
			// let's assume that the last row in the thead is the actual header row
			headerRow=jQuery(this).find('thead tr:last');
		}
		else{
			// let's assume that the first row is the header row	
			headerRow=jQuery(this).find('tr:first');
		}
		
	
		
		if(jQuery(headerRow).parents('thead').length==0){
			// put the header row in a thead tag		
			jQuery(this).prepend("<thead></thead>");
			jQuery(this).find('thead:first').append(headerRow);
		}
		
		jQuery(headerRow).children().each(function(headerCellIndex){	
			jQuery(this).setSortLink(headerCellIndex);						  
		});
		
		
		jQuery(this).alternateRowColors();
		});
};

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
jQuery.fn.setSortLink=function(index,direction){
	
	
 	//this= header cell

	
	
	if(!jQuery(this).hasClass(sortTableVars.noSortClass)){
		
			
			/// find index if one is not provided
			if(index==undefined||index==""){

				var row= jQuery(this).parents('tr').eq(0);
				var currentCell2;
				 jQuery(this).each(function(){currentCell2=this;});
				 jQuery(row).find('th').each(function(i){
						if(this==currentCell2) index=i;								 
				});
				
				if(index==undefined||index==""){
					jQuery(row).find('td').each(function(i){
						if(this==currentCell2) index=i;								 
					});	
					
				}
				
			}
			
			
			
			
			
			
			var headerLink=this;
			var displayBlock=true;
			
			//Look to see if a column has already been sorted
			var direction="";
			
			//if(jQuery(headerLink).hasClass(sortTableVars.alreadySortedAscendingClass)) direction=1;
			//else if (jQuery(headerLink).hasClass(sortTableVars.alreadySortedDescendingClass)) direction=-1;
			
			// Check to see if a sortHeader class has been set 
			if(jQuery(headerLink).find('.'+sortTableVars.sortHeaderClass).length>0){
				var sortHeaderContainer=jQuery(headerLink).find('.'+sortTableVars.sortHeaderClass).eq(0);
				jQuery(sortHeaderContainer).removeClass(sortTableVars.sortHeaderClass);
				headerLink=sortHeaderContainer;
				displayBlock=false;
			}
			
			jQuery(headerLink).wrapInner('<a href="javascript:void(0)"></a>');
			var jQuerya=jQuery(headerLink).find('a:first');
			jQuerya.attr('title',sortTableVars.headerLinkTitle).addClass(sortTableVars.sortHeaderClass);

				
			if(jQuery(headerLink).hasClass(sortTableVars.alreadySortedAscendingClass))direction=1;
			if(jQuery(headerLink).hasClass(sortTableVars.alreadySortedDescendingClass))direction=-1;
		
			 jQuerya.setSortArrow(direction,false);			 //the false prevents other arrows in the table from being removed
			
			if(displayBlock)jQuerya.css('display','block');
			
			jQuerya.click(function(){jQuery(this).sortTableColumn(index);});
		}
	return this;	
};

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
jQuery.fn.setSecondarySort=function(secondaryCellObj,direction){	
	// this==link or this==table cell
	
	//first remove any secondarySort class
	jQuery(this).removeSecondarySort();
	
	var tableCell=jQuery(this).sortGetParentCell();
	
	
	// need to build the following string
	// index_direction_index_direction - etc;
	var secondarySortString=sortTableVars.secondarySortClass;
	var lastobj="";
	for(var i=0;i<arguments.length;i++){
		
		
		if(typeof arguments[i]=="object"){
			if(i!=0) secondarySortString+="_";
			//find index!!!
			var index=jQuery(arguments[i]).sortGetTableCellIndex();
			secondarySortString+=index+"_";
			if(arguments[i+1]!="object"&&arguments[i+1]!=undefined) secondarySortString+=arguments[i+1];
			else secondarySortString+="0";
		}
	}
	jQuery(tableCell).addClass(secondarySortString);
	
};

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
jQuery.fn.setSecondarySortByIndex=function(index,direction){
	//this==link or this==table cell
	
	if(arguments.length%2!=0){
		alert("Odd number of arguments sent to the setSecondarySortByIndex method")
		return this;
	}
	
	//first remove any secondarySort class
	var tableCell=jQuery(this).sortGetParentCell();
	
	var secondarySortString=sortTableVars.secondarySortClass;
	
	for(var i=0;i<arguments.length;i++){
		if(i!=0) secondarySortString+="_";
		secondarySortString+=arguments[i];
	}
	jQuery(tableCell).addClass(secondarySortString);
	
};

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
jQuery.fn.removeSecondarySort=function(){
	//this==link or this==table cell
	
	
	var thislink=jQuery(this).sortCheckForClass(sortTableVars.secondarySortClass);
	
	if(thislink!=""){
		jQuery(this).removeClass(thislink);
		return this;
	}
	
	
	var thistd=jQuery(this).parent('th');
	if(thistd.length!=0){
		var tdSort=jQuery(thistd).eq(0).sortCheckForClass(sortTableVars.secondarySortClass);
		if(tdSort!=""){
			jQuery(thistd).eq(0).removeClass(tdSort);
			return this;
		}
		
	}
	
	var thistd=jQuery(this).parent('td');
	if(thistd.length!=0){
		var tdSort=jQuery(thistd).eq(0).sortCheckForClass(sortTableVars.secondarySortClass);
		if(tdSort!=""){
			jQuery(thistd).eq(0).removeClass(tdSort);
			return this;
		}
		
	}
	
	
	return this;
	
	
	
};


////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

jQuery.fn.setSortArrow=function(direction,removeEmpty){
	//this=link
	//direction =1 or ascending or -1 for descending
	//direction of any other value will be ignored
	
	
	if(removeEmpty!=false) removeEmpty=true;
	
	
	//check to see if the arrow span exists - if not, create it
	if(jQuery(this).find('.'+sortTableVars.sortArrowClass).length==0){
		jQuery(this).append("<span class='"+sortTableVars.sortArrowClass+"'></span>");
	}
	
	
	
	if(removeEmpty)jQuery(this).parents('table').eq(0).find('.'+sortTableVars.sortArrowClass).empty();
	
	
	jQuery(this).removeClass(sortTableVars.sortDirectionAscClass).removeClass(sortTableVars.sortDirectionDesClass).find('.'+sortTableVars.sortArrowClass).eq(0).empty();
	if(direction==1){
		jQuery(this).addClass(sortTableVars.sortDirectionAscClass).find('.'+sortTableVars.sortArrowClass).eq(0).html(sortTableVars.ascSortArrow);
	}
	
	else if(direction==-1){ 
		jQuery(this).addClass(sortTableVars.sortDirectionDesClass).find('.'+sortTableVars.sortArrowClass).eq(0).html(sortTableVars.descSortArrow);
	}
	
	

	return this;
};

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

jQuery.fn.sortTableColumn=function(index,direction,sortKeyFunction,sortFunction){
	//alert(typeof index); //'object'
	//this=link, cell, or table


	
	//////////////////////////////////////////////////////////////////
	// SORT KEY - AKA DATA TYPE
	dataType_alpha=function(jQuerycell) {
		//IE DOESN"T REMOVE LEADING SPACES IF &NBSP;
		// so first replace all nbsp; with just spaces
		
		if(jQuery.browser.msie){
			var html=jQuerycell.html().replace(/&nbsp;+/g," ");
			jQuerycell.html(html);
		}
		
		return jQuery.trim(jQuerycell.find('.'+sortTableVars.sortKeyClass).text().toUpperCase()) + ' ' + jQuery.trim(jQuerycell.text().toUpperCase());		
	};
	
	dataType_numeric= function(jQuerycell) {
		
		
		var num=jQuerycell.text();
		if(jQuerycell.find('.'+sortTableVars.sortKeyClass).length>0) num=jQuerycell.find('.'+sortTableVars.sortKeyClass).eq(0);
	 	var key = parseFloat(num.replace(/^[^\d.]*/, ''));
	 	return isNaN(key) ? 0 : key;
	};
			  
	  dataType_date = function(jQuerycell) {
		 	// let's assume it is mm/dd/yyyy or mm-dd-yyyy
			// so proper sort would be yyyy+mm+dd
			if(jQuery.browser.msie){
				var html=jQuerycell.html().replace(/&nbsp;+/g," ");
				jQuerycell.html(html);
			}
			
			var aa= jQuery.trim(jQuerycell.text());
			if(jQuerycell.find('.'+sortTableVars.sortKeyClass).length>0) aa=jQuery.trim(jQuerycell.find('.'+sortTableVars.sortKeyClass).eq(0));
			return aa.substr(6, 4) + aa.substr(0, 2) + aa.substr(3, 2);
		 	
		};
			  
	
	//////////////////////////////////////////////////////////////////
	// SORT FUNCTION
	sort_default=function(a,b){
		for(var i=0;i<a.sortKey.length;i++){
			if (a.sortKey[i] > b.sortKey[i]){
				//alert(a.sortKey[i]+" > "+b.sortKey[i]);
				return a.sortDirection[i];
			}
			if (a.sortKey[i] < b.sortKey[i]){
				//alert(b.sortKey[i]+" > "+a.sortKey[i]);
				return -a.sortDirection[i];
			}
			//alert(b.sortKey[i]+" = "+a.sortKey[i]);
		}
		return 0;
	};
	
	
	
	
	
	////////////////////////////////////////////////////////////////
	//Helper functions
	
	checkSecondarySort=function(obj){

		var sortClass=jQuery(obj).sortCheckForClass(sortTableVars.secondarySortClass);
		if(sortClass=="")return ""; //alert('empty');
		
		var tempArray=sortClass.split('_');
		
		// remove the first item which will contain "secondarySort"
		tempArray.shift();
		
		if(tempArray.length%2!=0){
			alert('incorrect number of items set in the secondarySort class');
			return "";
		}
		
		var itemArray=new Array();
		for(var i=0;i<tempArray.length;i=i+2){
			itemArray.push(new Array(tempArray[i],tempArray[i+1]));
		}
		return itemArray;
		
	};	
	
	var checkForSecondarySort=false; // quick flag to check and see if the script should check for a secondary sort.  
									// This is a hack - it should happen in the if statement below - but it needs to know the 
									// primaryHeaderCell (determined below)
	var sortArray;
	if(typeof index!="object"){
		sortArray=new Array(new Array(index,direction,sortKeyFunction));
		checkForSecondarySort=true;	
	}
	else{
		sortArray=index;
		sortFunction=direction;
	}
	

	var primaryHeaderCell;//currentCell;
	var table;
	var headerLink;
	var primaryHeaderLink; //headerLink;
	var primaryIndex=sortArray[0][0];
	var primaryDirection=sortArray[0][1];
	
	var tag=jQuery(this).getTagName();
	//jQuery(this).each(function(){tag=this.tagName});
	
	
	if(tag=="table"||tag=="TABLE"){
		table=this;	
		if(primaryIndex==undefined){// index=primaryIndex
			/// there is no way we can figure out primaryHeaderCell OR header link - kill sortTableColumn function
			alert("No column index was passed to the sortTableColumn function - sorting did not happen.");
			return this;
		}
		
		if(jQuery(table).find('tr.'+sortTableVars.sortHeaderRowClass).length>0){
			headerRow=jQuery(table).find('tr.'+sortTableVars.sortHeaderRowClass).eq(0);
		}
		else if(jQuery(table).find('thead').length>0){
			headerRow=jQuery(table).find('thead tr:last');
		}
		else{
			// let's assume that the first row is the header row	
			headerRow=jQuery(table).find('tr:first');
		}
			
		primaryHeaderCell=jQuery(headerRow).children().eq(primaryIndex);//primaryIndex=index;
		primaryHeaderLink=jQuery(primaryHeaderCell).find('.'+sortTableVars.sortHeaderClass).eq(0);
		
	}
	
	else if(tag=="td"||tag=="TD"||tag=="th"||tag=="TH"){
		primaryHeaderCell=this;	
		headerRow=jQuery(primaryHeaderCell).parents('tr').eq(0);
		table=jQuery(this).parents('table').eq(0);
		primaryHeaderLink=jQuery(this).find('.'+sortTableVars.sortHeaderClass).eq(0);
	}
	
	else if((tag=="a"||tag=="A")&&jQuery(this).hasClass(sortTableVars.sortHeaderClass)){
		if(jQuery(this).parents('th').length>0)primaryHeaderCell=jQuery(this).parents('th').eq(0);	
		else primaryHeaderCell=jQuery(this).parents('td').eq(0);
		headerRow=jQuery(primaryHeaderCell).parents('tr').eq(0);
		table=jQuery(this).parents('table').eq(0);
		primaryHeaderLink=this;
		
	}
	else{
		alert("Improper object daisy-chained to the sortTableColumn function - sorting did not happen.");
		// Kill this sortTableColumn
		return this;	
	
	}
	
	
	
	/*************** CHECK TO SEE IF THERE IS A SECONDARY SORT ******************/
	
	if(checkForSecondarySort){
	/* ****************************************** */
		var secondarySortArray=checkSecondarySort(primaryHeaderCell);
		if(secondarySortArray!=""&&secondarySortArray.length>0){
			for(var i=0;i<secondarySortArray.length;i++){
				sortArray.push(secondarySortArray[i]);
			}
		}
	/* ******************************************* */
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////
	//determine index if not set
	
	

	
	if(primaryIndex==undefined||primaryIndex==""){//primaryIndex=index;
		
		var row= jQuery(primaryHeaderCell).parents('tr').eq(0);
		var currentCell2;
		 jQuery(primaryHeaderCell).each(function(){currentCell2=this;});
		 jQuery(row).find('th').each(function(i){
				if(this==currentCell2) sortArray[0][0]=i;								 
		});
		
		if(index==undefined||index==""){
			jQuery(row).find('td').each(function(i){
				if(this==currentCell2) sortArray[0][0]=i;								 
			});	
			
		}
		primaryIndex=sortArray[0][0];
		
	}
	var rows = jQuery(table).find('tbody > tr').get();
	
	//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	// Loop through sortArray and make sure this is an index, direction, sortKeyFunc foreach
	
	for(var j=0;j<sortArray.length;j++){
		
		
		var index=sortArray[j][0];
		var direction=sortArray[j][1];
		var sortKeyFunc=sortArray[j][2];
		
		//determine direction if not set
			//get from class
		
		if(direction==0){
			// this should only happen coming from a secondary sort.  It tells the script that for secondary sort, it should be the same as the primary
			direction=primaryDirection;
			
		}
		
		if(direction==undefined||direction==""||(direction!=1&&direction!=-1)){
			
			//if(jQuery(primaryHeaderLink).hasClass(sortTableVars.sortDirectionAscClass)){sortDirection=-1;}
			
			if(jQuery(headerRow).children().eq(index).find('.'+sortTableVars.sortHeaderClass).eq(0).hasClass(sortTableVars.sortDirectionAscClass)){direction=-1;}
			
			else{direction=1;}
			
			if(j==0) primaryDirection=direction;
		}

		
		//determine setKey if not set
			//get from class
			// if not set in class - automatically determine
				//set class
		
		if(sortKeyFunc==undefined||sortKeyFunc==""){
			sortKeyFunc="";
			//var sortKeyFromClass=checkForClass(jQuery(headerRow).children().eq(index),sortTableVars.sortKeyClassStart);
			var sortKeyFromClass=jQuery(headerRow).children().eq(index).sortCheckForClass(sortTableVars.sortKeyClassStart);
			
			if(sortKeyFromClass) sortKeyFunc=eval(sortKeyFromClass);
		}
		if(sortKeyFunc==""){
			//The sortKey wasn't part of the class, need to auto determine here	
			sortKeyFunc=dataType_alpha;
			jQuery(headerRow).children().eq(index).addClass('dataType_alpha');
			
			//need to find the text of the first non-empty cell
			var cellText="";
			for(var i=0;cellText=="";i++){
				var sortCell=jQuery(table).find('tbody tr').eq(i).find('td').eq(index);
				
				if(jQuery.browser.msie){
					var html=jQuery(sortCell).html().replace(/&nbsp;+/g," ");
					jQuery(sortCell).html(html);
				}
			
				
				var currentCellText=jQuery.trim(jQuery(table).find('tbody tr').eq(i).find('td').eq(index).text());
				if(currentCellText!="")cellText=currentCellText;
			}
			
			
			if ( cellText.match(/^\d\d[\/-]\d\d[\/-]\d\d\d\d$/) ){
					
					sortKeyFunc=dataType_date;
					jQuery(headerRow).children().eq(index).removeClass('dataType_alpha').addClass('dataType_date');
			}
			if ( cellText.match(/^\d\d[\/-]\d\d[\/-]\d\d$/) ){
				
					sortKeyFunc=dataType_date;
					jQuery(headerRow).children().eq(index).removeClass('dataType_alpha').addClass('dataType_date');
			}
			if ( cellText.match(/^[£$]/) ){
			
				sortKeyFunc=dataType_numeric;
				jQuery(headerRow).children().eq(index).removeClass('dataType_alpha').addClass('dataType_numeric');
			}
			if ( cellText.match(/^[\d\.]+$/) ){
				
				sortKeyFunc=dataType_numeric;
				jQuery(headerRow).children().eq(index).removeClass('dataType_alpha').addClass('dataType_numeric');
			}
		
			
			
		}
		

	
		
		
		
		
		  jQuery.each(rows, function(p, row) {
			if(j==0){
				row.sortKey=new Array();
				row.sortDirection=new Array();
			}
			
			row.sortKey[j] = sortKeyFunc(jQuery(row).children('td').eq(index));
			row.sortDirection[j]=direction;
		  });
	}
	

	//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	
	

	//determine sortFunction
		//get from class
		// if not form class - use default
	if(sortFunction==undefined||sortFunction==""){
		sortFunction="";
		//var sortFunctionFromClass=checkForClass(primaryHeaderCell,sortTableVars.sortFunctionClassStart);
		var sortFunctionFromClass=jQuery(primaryHeaderCell).sortCheckForClass(sortTableVars.sortFunctionClassStart);
		if(sortFunctionFromClass!="") sortKey=eval(sortFunctionFromClass);
	}
	
	
	
	
	if(sortFunction==""){
		//The sortKey wasn't part of the class, need to auto determine here	
		sortFunction=sort_default;
		
		//Then set the class so we know to use it next time
		jQuery(primaryHeaderCell).addClass('sort_default');
	}	
		
	
	
	
	  rows.sort(sortFunction);
	  jQuery.each(rows, function(i, row) {
		jQuery(table).children('tbody').append(row);
		jQuery(row).find('.'+sortTableVars.sortedColumnClass).removeClass(sortTableVars.sortedColumnClass);
		jQuery(row).find('td').eq(primaryIndex).addClass(sortTableVars.sortedColumnClass);
		
		//alert(row.sortKey+" | "+row.sortDirection);
		
		row.sortKey = null;
		row.sortDirection=null;
	  });
	
	
	
	
	jQuery(primaryHeaderCell).parents('tr').eq(0).find('.'+sortTableVars.sortedColumnClass).removeClass(sortTableVars.sortedColumnClass);
	jQuery(primaryHeaderCell).addClass(sortTableVars.sortedColumnClass);

	jQuery(table).alternateRowColors();
	jQuery(primaryHeaderLink).setSortArrow(primaryDirection);


	
	if(typeof sortTableCallBack!="undefined") sortTableCallBack({"index":index,"direction":direction}); 

	return this;
};

///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////

//THE FOLLOWING ARE HELPER FUNCTIONS - THEY DO NOT RETURN A JQUERY OBJECT AND SHOULD NOT BE DAISY CHAINED

jQuery.fn.sortCheckForClass=function(regExp){
	
		var classes=new Array();
		var regExp=new RegExp(regExp);
		
		
		classes=jQuery(this).attr('class').split(' ');
		for(var i=0;i<classes.length;i++){
			if(classes[i].match(regExp)) return classes[i];
		
		}
		return "";
	
};


jQuery.fn.getTagName=function(){
	var thisTagName="";
	jQuery(this).each(function(){thisTagName=this.tagName;});
	return thisTagName;
	
	
};



jQuery.fn.sortGetParentCell=function(){
	var tagname=jQuery(this).getTagName();
	if(tagname=="th"||tagname=="TH"||tagname=="td"||tagname=="TD")return this;

	var parentCell=jQuery(this).parent('th');
	if(parentCell.length>0)return parentCell.eq(0);
	
	var parentCell=jQuery(this).parent('td');
	if(parentCell.length>0)return parentCell.eq(0);
	return this; //just in case
};


jQuery.fn.sortGetTableCellIndex=function(){
	
	//primaryIndex=index;
		var tableCell=jQuery(this).sortGetParentCell();	
		var row= jQuery(tableCell).parents('tr').eq(0);
		var currentCell2;
		var index="";
		 jQuery(tableCell).each(function(){currentCell2=this;});
		 jQuery(row).find('th').each(function(i){
				if(this==currentCell2){
					index=i;
					alert('th '+i);
				}
		});
		
		if(index==undefined||index==""){
			jQuery(row).find('td').each(function(i){
				if(this==currentCell2){
					index=i;
				}								 
			});	
			
		}
		return index;
		
	
	
	
};