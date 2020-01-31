#include <stdio.h>
#include <stdlib.h>
#include <errno.h>
#include <signal.h>
#include <sys/socket.h>
#include <resolv.h>
#include <arpa/inet.h>
#include <errno.h>
#include <strings.h>
#include <unistd.h>
#include <string.h>
#include <sys/time.h> //FD_SET, FD_ISSET, FD_ZERO macros  

#define K_MAX_NB_PLAYER 32     

#define MY_PORT				80
#define MY_ADDR				"0.0.0.0"
#define K_MAX_SIZE_TCP_IP_FRAME		4096
#define K_MAX_READ_SIZE				4096 
#define K_MAX_SIZE_HTTP_HEADER		2048
#define K_MAX_SIZE_HTTP_REPONSE		4096
#define K_MAX_NB_USER				32

#define K_HEADER_SIZE		191
#define K_MAX_FILE_SIZE			1024*1024*500

static char gHeader[] = 	"HTTP/1.1 200 OK\nConnection: Keep-Alive\nContent-Encoding: gzip\nContent-Type: text/html; charset=utf-8\nKeep-Alive: timeout=5, max=1000\nAccess-Control-Allow-Origin: *\nContent-Length:           ";

 
typedef struct 
{
	char header[K_HEADER_SIZE];
	char data[K_MAX_FILE_SIZE];
} T_txData;

T_txData	gTxBuffer;
static int 	client_fd[K_MAX_NB_PLAYER];


int main(int Count, char *Strings[])
{   
	int socketfd,activity;	
	long fileSize =  0;
	int txSize =  0;
	struct sockaddr_in self;
	FILE *fp;

	sigaction(SIGPIPE, &(struct sigaction){SIG_IGN}, NULL);

	if(sizeof(gHeader) != K_HEADER_SIZE)
	{
		printf("Error Sizeof(gHeader):%d not equal K_HEADER_SIZE:%d",sizeof(gHeader),K_HEADER_SIZE);
		return 0;
	}
	
	//init client tx buffer
	memcpy (gTxBuffer.header,gHeader,sizeof(gHeader));

	fp = fopen("index.html.gz", "r");
	if (fp != NULL) {
		fileSize = (size_t) fread(&gTxBuffer.data[0] , sizeof(char), K_MAX_FILE_SIZE, fp);
		fclose(fp);
		txSize = K_HEADER_SIZE + fileSize;
	}
	else
	{
		  printf("Error while opening the file index.html \n");
		  return 0;
	}

	// Add Size of message in http header
	char lengthString[8];
	sprintf (lengthString,"%9d\n\n", fileSize);
	memcpy(gTxBuffer.header + K_HEADER_SIZE - 11,lengthString,11);	

    //set of socket descriptors  
    fd_set readfds;   

	printf("Server initalize");

	printf("-Initialise %d client_sd[] to 0\n",K_MAX_NB_PLAYER);
    for (int i = 0; i < K_MAX_NB_PLAYER; i++)   
    {   
        client_fd[i] = 0;   
    }   

	printf("-Create socket file descriptor");
	socketfd = socket(AF_INET, SOCK_STREAM, 0);
	printf(" %d\n",socketfd);

	printf("-Initialize %s:%d structure\n",MY_ADDR,MY_PORT);
	bzero(&self, sizeof(self));
	self.sin_family = AF_INET;
	self.sin_port = htons(MY_PORT);
	self.sin_addr.s_addr = INADDR_ANY;
	self.sin_addr.s_addr = inet_addr(MY_ADDR);

	printf("-Bind structure to the socket\n");
    if ( bind(socketfd, (struct sockaddr*)&self, sizeof(self)) != 0 )
	{
		perror("socket--bind");
		exit(errno);
	}

	printf("-Make it a listening socket max:%d\n",K_MAX_NB_PLAYER);
	if ( listen(socketfd, K_MAX_NB_PLAYER) != 0 )
	{
		perror("socket--listen");
		exit(errno);
	}

	
	printf("Waiting for connections ...\n");
	while (1)
	{
		int max_sd;
		struct sockaddr_in client_addr;
		int addrlen=sizeof(client_addr);
		char buffer[K_MAX_READ_SIZE] ;
 
        FD_ZERO(&readfds); 

        FD_SET(socketfd, &readfds);  
		max_sd = socketfd +1;

      	//add child sockets to set  
        for (int i = 0 ; i < K_MAX_NB_PLAYER ; i++)   
        {   
            //socket descriptor  
            int sd = client_fd[i];   
                 
            //if valid socket descriptor then add to read list  
            if(sd > 0) FD_SET( sd , &readfds);   
                 
            //highest file descriptor number, need it for the select function  
            if(sd > max_sd)   
                max_sd = sd;   
        }   

        activity = select( max_sd + 1, &readfds , NULL , NULL , NULL);   
		if ((activity < 0) && (errno!=EINTR))   
        {   
            printf("select error\n");   
        }     

		if (FD_ISSET(socketfd, &readfds))   
		{ 
			int new_client_fd;  
			//printf("New connection");  
			new_client_fd = accept(socketfd, (struct sockaddr*)&client_addr, &addrlen);
			int i;	
           //add new socket to array of sockets  
            for (i = 0; i < K_MAX_NB_PLAYER; i++)   
            {   
                //if position is empty  
                if( client_fd[i] == 0 )   
                {   
                    client_fd[i] = new_client_fd;                           
                    break;   
                }   
            } 
			//inform user of socket number - used in send and receive commands  
            //printf(" id %d  socket fd is %d  ip is : %s  port : %d \n" ,i, new_client_fd , inet_ntoa(client_addr.sin_addr) , ntohs(client_addr.sin_port));  

		}
		else
		{
			for (int i = 0; i < K_MAX_NB_PLAYER; i++)   
			{  
				int sd = client_fd[i]; 
					
				if (FD_ISSET( sd , &readfds))   
				{ 					
					struct sockaddr_in address;
					socklen_t  addrlen;
					char *rxData;
					int size = 0;

					//Check if it was for closing , and also read the  
					//incoming message   
					getpeername(sd , (struct sockaddr*)&address ,(socklen_t*)&addrlen); 

					//read current socket 
					size = read( sd , &buffer, K_MAX_READ_SIZE);
					//printf("buffer :\n%s\n",&gTxBuffer.header[0] );
					send(sd, (const char *)&(gTxBuffer.header[0]),txSize, 0);
	
					close(sd);  						
					client_fd[i] = 0;  			
				}   
			}   		
		}

	}
	/*---Clean up (should never get here!)---*/
	//close(clientfd);
	//close(socketfd);
	return 0;
}
