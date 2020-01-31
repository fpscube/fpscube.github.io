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
puts "build web server \n"
system ('gcc server/web.c -o build/web') 
puts "build multi server \n"
system ('gcc server/multi.c -o build/multi') 
puts "launch web server \n"
Thread.new do 
 system("cd build && web")
end
puts "launch multi server \n"
Thread.new do 
	system("cd build && multi")
end

