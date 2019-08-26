
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

File.write('server/index.html', newHtmlString);
system("gzip server/index.html")