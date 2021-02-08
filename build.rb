require 'socket'
require 'fileutils'
	
directory_name = "build"
Dir.mkdir(directory_name) unless File.exists?(directory_name)

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


system ('gzip -f build/index.html')
puts "build web server \n"
system ('gcc server/web.c -o build/web') 
puts "build multi server \n"
system ('gcc server/multi.c -o build/multi') 
# puts "launch web server \n"
# Thread.new do 
#  system("cd build && web")
# end
# puts "launch multi server \n"
# Thread.new do 
# 	system("cd build && multi")
# end

