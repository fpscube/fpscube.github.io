#include <stdio.h>
#include <stdlib.h>
#include <errno.h>
#include <sys/socket.h>
#include <resolv.h>
#include <arpa/inet.h>
#include <errno.h>
#include <strings.h>
#include <unistd.h>
#include <string.h>
#include <sys/time.h> //FD_SET, FD_ISSET, FD_ZERO macros  
     

#define MY_PORT				8080
#define MY_ADDR				"192.168.1.12"
#define K_MAX_NB_PLAYER		32
#define K_MAX_SIZE_TCP_IP_FRAME		65536
#define K_MAX_SIZE_PLAYER_DATA		256
#define K_RX_BUFFER_SIZE			100*K_MAX_SIZE_TCP_IP_FRAME
#define K_MAX_SIZE_HTTP_HEADER		2048
#define K_MAX_SIZE_HTTP_REPONSE		4096
#define K_TX_HEADER_SIZE			(sizeof(header)-1 + 7)

static char header[] = 	"HTTP/1.1 200 OK\nConnection: Keep-Alive\nContent-Type: text/html; charset=utf-8\nKeep-Alive: timeout=5, max=1000\nAccess-Control-Allow-Origin: *\nContent-Length:";
static char rxBuffer[K_MAX_SIZE_TCP_IP_FRAME];

typedef struct 
{
	char buffer[K_MAX_SIZE_TCP_IP_FRAME];
	int  size;
} T_clientTxBuffer;

T_clientTxBuffer gClientTxBuffer[K_MAX_NB_PLAYER];




static int 	client_fd[K_MAX_NB_PLAYER];

int main(int Count, char *Strings[])
{   
	int socketfd,activity;
	struct sockaddr_in self;

	//init client tx buffer
	for (int i=0;i<K_MAX_NB_PLAYER;i++)
	{		
		memcpy (gClientTxBuffer[i].buffer,header,sizeof(header));
		// initial si
		gClientTxBuffer[i].size = K_TX_HEADER_SIZE;
	}

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
 
        FD_ZERO(&readfds); 

        FD_SET(socketfd, &readfds);  
		max_sd = socketfd +1;

      	//add child sockets to set  
        for (int i = 0 ; i < K_MAX_NB_PLAYER ; i++)   
        {   
            //socket descriptor  
            int sd = client_fd[i];   
                 
            //if valid socket descriptor then add to read list  
            if(sd > 0)   
                FD_SET( sd , &readfds);   
                 
            //highest file descriptor number, need it for the select function  
            if(sd > max_sd)   
                max_sd = sd;   
        }   

        activity = select( max_sd + 1, &readfds , NULL , NULL , NULL);   
		if ((activity < 0) && (errno!=EINTR))   
        {   
            printf("select error");   
        }     

		if (FD_ISSET(socketfd, &readfds))   
		{ 
			int new_client_fd;  
			printf("New connection");  
			new_client_fd = accept(socketfd, (struct sockaddr*)&client_addr, &addrlen);

			//inform user of socket number - used in send and receive commands  
            printf(" socket fd is %d  ip is : %s  port : %d \n" , new_client_fd , inet_ntoa(client_addr.sin_addr) , ntohs(client_addr.sin_port));  

           //add new socket to array of sockets  
            for (int i = 0; i < K_MAX_NB_PLAYER; i++)   
            {   
                //if position is empty  
                if( client_fd[i] == 0 )   
                {   
                    client_fd[i] = new_client_fd;                           
                    break;   
                }   
            }  
		}
		else
		{
			//else its some IO operation on some other socket 
			for (int i = 0; i < K_MAX_NB_PLAYER; i++)   
			{   
				int size = 0;
				int sd = client_fd[i];   
					
				if (FD_ISSET( sd , &readfds))   
				{   
					struct sockaddr_in address;
					socklen_t  addrlen;

					//Check if it was for closing , and also read the  
					//incoming message   
					getpeername(sd , (struct sockaddr*)&address ,(socklen_t*)&addrlen); 

					//read current socket into the first circular buffer
					size = read( sd , &rxBuffer, K_MAX_SIZE_TCP_IP_FRAME);
					
					//search null char to detect start of data
					char *rxData =	strchr(rxBuffer,0);
					
					//ignore null charater
					rxData+=1;

					//compute data size
					size = size - (int)(rxData-rxBuffer);

					if ( rxData!=NULL && size>0 && size<K_MAX_SIZE_PLAYER_DATA)   
					{ 
					

						// Copy rx data into players buffer if connected
						for (int y = 0; y < K_MAX_NB_PLAYER; y++)   
						{
							// Client not conn
							if(client_fd[y]==0) continue;
							if((gClientTxBuffer[y].size + size + 2) > K_MAX_SIZE_HTTP_REPONSE) 
							{
								printf ("Client soket %d buffer overflow\n",y);
								continue;
							}
							
							printf ("UpdateClient:%d  msgfromClient:%d size :%d\n ",y,i,size);
							printf ("Data: %s\n ",rxData);
							
							//write player id
							gClientTxBuffer[y].buffer[gClientTxBuffer[y].size] = i;
							//write data Size
							gClientTxBuffer[y].buffer[gClientTxBuffer[y].size+1] = size;
							//write data
							memcpy (gClientTxBuffer[y].buffer + gClientTxBuffer[y].size + 2,rxData,size) ;
							gClientTxBuffer[y].size += size + 2;
						}
						

						// Add Size of message in http header
						char lengthString[8];
						sprintf (lengthString,"%5d\n\n", gClientTxBuffer[i].size - K_TX_HEADER_SIZE);
						memcpy(gClientTxBuffer[i].buffer + sizeof(header) -1,lengthString,7);
						

						//printf("response %s\n",gClientTxBuffer[i].buffer);
						// Send Tx Buffer
						send(sd, (const char *)&gClientTxBuffer[i].buffer,gClientTxBuffer[i].size, 0);

						// Clear tx buffer for current player after sending
						gClientTxBuffer[i].size = K_TX_HEADER_SIZE;

						// Print Client Info
						printf("- send http OK response ip %s , port %d \n", inet_ntoa(address.sin_addr) , ntohs(address.sin_port));
					}   
						
					//Echo back the message that came in  
					else 
					{   
						printf("Host disconnected , ip %s , port %d \n" ,  
						inet_ntoa(address.sin_addr) , ntohs(address.sin_port));   
							
						//Close the socket and mark as 0 in list for reuse  
						close( sd );   
						client_fd[i] = 0;   	
					}   
				}   
			}   
		
		}

	}
	/*---Clean up (should never get here!)---*/
	//close(clientfd);
	//close(socketfd);
	return 0;
}
