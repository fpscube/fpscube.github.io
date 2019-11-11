require 'socket'
require 'fileutils'
	
htmlString = File.read("index.html")

newHtmlString = ""

htmlString.each_line do |line|
	tabMatch = line.match(/<script type="text\/javascript" src="([^"]*)".*/)
	
	if(tabMatch!=nil && tabMatch.size==2)
		newHtmlString +=  '<script type="text/javascript">'
		newHtmlString +=  File.read(tabMatch[1])
		newHtmlString +=  '</script>'

	else
		newHtmlString +=  line
	end
	
end

 newHtmlString.gsub!(/\/\/[^\r\n]*/ , "" );
 newHtmlString.gsub!(/[\r\n]/ , "" );

 newHtmlString.gsub!(/\/\*.*?\*\//, "" );
 newHtmlString.gsub!(/[ \t]+/, " " );

FileUtils.mkdir_p 'build/dbgNotMin'
File.write('build/index.html', newHtmlString);
system ('gzip -f build/index.html')
system ('gcc -D MY_ADDR=\'"192.168.1.71"\' server/web.c -o build/webDbg') 
system ('gcc -D MY_ADDR=\'"192.168.1.71"\' server/multi.c -o build/multiDbg') 
system ('gcc -D MY_ADDR=\'"192.168.1.57"\' server/web.c -o build/web') 
system ('gcc -D MY_ADDR=\'"192.168.1.57"\' server/multi.c -o build/multi') 