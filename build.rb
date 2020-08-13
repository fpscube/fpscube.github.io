require 'socket'
require 'fileutils'
	
htmlString = File.read("index.html")

 # concat in one file

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

 # minify

if(ARGV[0]!="debug") # minify

 newHtmlString.gsub!(/\/\/[^\r\n]*/ , "" );
 newHtmlString.gsub!(/[\r\n]/ , "" );

 newHtmlString.gsub!(/\/\*.*?\*\//, "" );
 newHtmlString.gsub!(/[ \t]+/, " " );
end

File.write('build/index.html', newHtmlString);
