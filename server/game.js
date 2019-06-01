//var url = 'http://90.120.141.147:8080';
//var url = 'http://fpscube.hopto.org:8080';
//var url = 'http://192.168.1.12:8080';
var url = 'http://127.0.0.1:8080';

var xhttp = new XMLHttpRequest(); 
var i=0;

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function sendData()
{	
	xhttp.open("POST", this.url, true);
	xhttp.send("\x00\x09bonjour " + i);
	
}


function onChange()
{
	if (this.readyState == 4 && this.status == 200) {
		//sendData();
		setTimeout(sendData, 50) ;
		
		var resp = new Uint8Array(this.response);
		
		
		console.log(ab2str(resp.subarray(0)));
		i=(i+1) %10;
	}
}
xhttp.onreadystatechange =  onChange;
xhttp.responseType = 'arraybuffer';


setTimeout(sendData, 100) ;