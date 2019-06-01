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
// #define MY_ADDR				"192.168.1.12"
#define MY_ADDR				"127.0.0.1"
#define K_MAX_SIZE_TCP_IP_FRAME		4096
#define K_MAX_READ_SIZE				4096 
#define K_MAX_SIZE_HTTP_HEADER		2048
#define K_MAX_SIZE_HTTP_REPONSE		4096

#define K_HEADER_SIZE		164
#define K_MAX_NB_PLAYER		8
#define K_DATA_SIZE			160

static char gHeader[] = 	"HTTP/1.1 200 OK\nConnection: Keep-Alive\nContent-Type: text/html; charset=utf-8\nKeep-Alive: timeout=5, max=1000\nAccess-Control-Allow-Origin: *\nContent-Length:       ";

typedef enum
{
	RX_MODE_HTTP_HEADER,
	RX_MODE_DATA,
	RX_MODE_COMPLETE,
}T_readMode;

 
typedef struct 
{
	char header[K_HEADER_SIZE];
	int dstId;
	char data[K_DATA_SIZE*K_MAX_NB_PLAYER];
} T_txData;


typedef struct 
{
	T_readMode 	rxMode;
	char 		rxBuffer[K_MAX_SIZE_TCP_IP_FRAME];
	int			rxSize;
} T_clientData;

T_clientData gClientData[K_MAX_NB_PLAYER];
T_txData	gTxBuffer;



static int 	client_fd[K_MAX_NB_PLAYER];

int main(int Count, char *Strings[])
{   
	int socketfd,activity;
	struct sockaddr_in self;

	if(sizeof(gHeader) != K_HEADER_SIZE)
	{
		printf("Error Sizeof(gHeader):%d not equal K_HEADER_SIZE:%d",sizeof(gHeader),K_HEADER_SIZE);
		return 0;
	}

	//init client tx buffer
	for (int i=0;i<K_MAX_NB_PLAYER;i++)
	{		
		memcpy (gTxBuffer.header,gHeader,sizeof(gHeader));
		gClientData[i].rxMode = RX_MODE_COMPLETE;
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
			printf("New connection");  
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
            printf(" id %d  socket fd is %d  ip is : %s  port : %d \n" ,i, new_client_fd , inet_ntoa(client_addr.sin_addr) , ntohs(client_addr.sin_port));  

		}
		else
		{
			//else its some IO operation on some other socket 
			for (int i = 0; i < K_MAX_NB_PLAYER; i++)   
			{  
				T_clientData *clientDataRx = &gClientData[i]; 
				int sd = client_fd[i]; 
				char buffer[K_MAX_READ_SIZE] ;
					
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
					
					//printf("START DEFORMAT size %d\n",size);
					//deformat rx data into  client rx buffer 
					for (int rxi=0;rxi<size;rxi++)
					{
						unsigned char rxByte = buffer[rxi];
						
							//printf("counter  %d\n",rxi);

						if (clientDataRx->rxMode == RX_MODE_COMPLETE)
						{
							//printf("P\n",rxByte, rxByte);
							if(rxByte=='P')	clientDataRx->rxMode =   RX_MODE_HTTP_HEADER;
							
						}
						else if (clientDataRx->rxMode == RX_MODE_HTTP_HEADER)
						{
							
							//printf("HEADER byte %c %d\n",rxByte, rxByte);
							if(rxByte==0)
							{
								//printf("pos null %d\n",rxi);
								clientDataRx->rxMode = RX_MODE_DATA;
								clientDataRx->rxBuffer[0] = 0;
								clientDataRx->rxSize=1;
							}		
						}
						else /*RX_MODE_DATA*/
						{
							//printf("DATA* byte %c %d\n",rxByte, rxByte);
							clientDataRx->rxBuffer[clientDataRx->rxSize] = rxByte;
							clientDataRx->rxSize++;
							if(clientDataRx->rxSize >= K_DATA_SIZE) 
							{
								clientDataRx->rxMode = RX_MODE_COMPLETE;
							}
							
						}						

					}
			    
					//printf("clientDataRx->rxMode %d\n",clientDataRx->rxMode );
					// Disconnect if receive size <=0
					if (size<=0)   
					{ 
						printf("Hosts disconnected , ip %s , port %d \n" ,  
						inet_ntoa(address.sin_addr) , ntohs(address.sin_port));   
							
						//Close the socket and mark as 0 in list for reuse  
						close(sd);  						
						client_fd[i] = 0;  
						gClientData[i].rxMode = RX_MODE_COMPLETE;
					}
					// If rx is complete for current client store for other client and send response for current client
					else if(clientDataRx->rxMode == RX_MODE_COMPLETE)
					{
						//write rx data to txBuffer 
						memcpy(gTxBuffer.data + (i*K_DATA_SIZE),clientDataRx->rxBuffer,K_DATA_SIZE);	

						// Add Size of message in http header
						char lengthString[8];
						sprintf (lengthString,"%5d\n\n", K_DATA_SIZE * K_MAX_NB_PLAYER + 4);
						memcpy(gTxBuffer.header + K_HEADER_SIZE - 7,lengthString,7);					

						//printf("response:\n%s\n",gTxBuffer.header);
						// Send Tx Buffer
						gTxBuffer.dstId = i;
						//printf("gTxBuffer.dstId  %d\n",gTxBuffer.dstId );

						send(sd, (const char *)&(gTxBuffer.header[0]),sizeof(T_txData), 0);

	

						// Print Client Info
						//printf("- send http OK response ip %s , port %d \n", inet_ntoa(address.sin_addr) , ntohs(address.sin_port));
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
