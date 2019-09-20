

 	//set your source path
 	var source_path = "/sdcard1/tickets/";

	//Global Vars
	var pos_focus = 0
	var debug = true;
	var window_status = "list";
	var items = [];
	k = -1;




$(document).ready(function() 
 {



function finder()
{



	$("div#items-list").empty()
	var filelist = navigator.getDeviceStorages('sdcard');
	for(var i = 0; i< filelist.length; i++)
	{
		var cursor = filelist[i].enumerateEditable();

		

		cursor.onsuccess = function () {
		if(cursor.result) 
		{
			var file = cursor.result;

			if(file.type.match('image/*'))
			{
				fileURL = URL.createObjectURL(file)

				var str = file.name;

				var dir = str.split('/');
				var file_name = dir[dir.length-1];
				
				var file_path = "";
				var file_path = str.split("/").slice(0, -1).join("/")+"/";


				if(file_path == source_path)
				{
					items.push([file_name,fileURL])
					k++;
					$("ul#items-list").append('<li class="items"  tabindex="'+k+'"><div class="item-name">'+file_name+'</div><img src="'+fileURL+'"></li>');
				}	

				
			}
			$('li[tabindex=0]').focus()



			// Once we found a file we check if there is other results
			if (!this.done) {
			// Then we move to the next result, which call the
			// cursor success with the next file as result.
			this.continue();
			}

			}

		}


		cursor.onerror = function () 
		{
			alert("No file found: " + this.error); 
		}


	}
}

finder()



function show_image()
{
	window_status = "image_view";
	$('li.items').css("display","none")
	$(":focus").css("display","block")
	$(":focus img").css("display","block")
	$(":focus div.item-name").css("display","none")

}

function show_image_list()
{
	if(window_status == "image_view")
	{
		$("li.items div.item-name").css("display","block")
		$('li.items').css("display","block");
		$("img").css("display","none");
	
	}
	window_status = "list";
	
}





////////////////////////
//NAVIGATION
/////////////////////////



	function nav (move) {
		
		if(move == "+1")
		{
			pos_focus++



			if(pos_focus <= items.length)
			{

				$("div#finder").find('li[tabindex='+pos_focus+']').focus()
			}	

			if( pos_focus == items.length)
			{
				pos_focus = 0;
				$('li[tabindex=0]').focus()

				  
			}


		}

		if(move == "-1")
		{
			pos_focus--
			if( pos_focus >= 0)
			{
				
				$("div#finder").find('li[tabindex='+pos_focus+']').focus()


			}

			if(pos_focus == -1)
			{
				pos_focus = items.length-1;
				
				$("div#finder").find('li[tabindex='+pos_focus+']').focus()


			}
		}


	}








var key_time
var press_time = 0;
var longpress = false;
function func_interval()
{
	longpress = false;
	press_time = 0;
	key_time = setInterval(function() { 
				press_time++

				if(press_time > 2)
				{
				longpress = true;
				}
				if(press_time < 2)
				{
				longpress = false;
				}
			
	}, 1000);
				
	
}


	//////////////////////////
	////KEYPAD TRIGGER////////////
	/////////////////////////
function handleKeyDown(evt) 

{	

	switch (evt.key) 
	{
		case 'Enter':
			func_interval();
			show_image();

		break;

			case 'Backspace':
			evt.preventDefault();
			
			if(window_status == "list")
			{
				window.close()
			}
			
			break; 

		

	}
}



	function handleKeyUp(evt) {
			clearInterval(key_time)

			switch (evt.key) {

			case 'Enter':
		if(longpress == false)
		{
			show_image_list();
			
		}

		if(longpress == true)
		{	
			show_image_list();
		}
		break;

	case 'Backspace':
			evt.preventDefault();
			if(window_status == "list")
			{
				window.close()
			}
			break; 
		


			case 'ArrowDown':
				nav("+1")
			break; 


			case 'ArrowUp':
				nav("-1")
			break; 

			case 'ArrowRight':
				nav("slide_right")
			break; 

			case 'ArrowLeft':
				nav("slide_left");

			break; 

			case 'SoftLeft':
			break; 

			 


		}

	};



	document.addEventListener('keydown', handleKeyDown);
	document.addEventListener('keyup', handleKeyUp);


	//////////////////////////
	////BUG OUTPUT////////////
	/////////////////////////

if(debug == true)
{
	$(window).on("error", function(evt) {

	console.log("jQuery error event:", evt);
	var e = evt.originalEvent; // get the javascript event
	console.log("original event:", e);
	if (e.message) { 
	    alert("Error:\n\t" + e.message + "\nLine:\n\t" + e.lineno + "\nFile:\n\t" + e.filename);
	} else {
	    alert("Error:\n\t" + e.type + "\nElement:\n\t" + (e.srcElement || e.target));
	}
	});

}




});

