var url = 'http://90.120.141.147:8080';
//var url = 'http://fpscube.hopto.org:8080';
//var url = 'http://192.168.1.12:8080';

var xhttp = new XMLHttpRequest(); 

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function sendData()
{	
	xhttp.open("POST", this.url, true);
	xhttp.setRequestHeader('Accept', '');
	xhttp.setRequestHeader('Accept-Language', '');
	xhttp.send("\0bonjour2");
	
setTimeout(sendData, 100) ;
}


function onChange()
{
	if (this.readyState == 4 && this.status == 200) {
		
		var resp = new Uint8Array(this.response);
		
		console.log(ab2str(resp.subarray(2)));
	}
}
xhttp.onreadystatechange =  onChange;
xhttp.responseType = 'arraybuffer';


setTimeout(sendData, 100) ;