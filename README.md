# Linked Data Project - Nobel Peace Prize Database

This application is hosted at : https://nikz99.github.io/LinkedDataProject/#

Since  `http://data.nobelprize.org/sparql` is an insecure interface, we have to enable unsafe scripts in the `https` hosted for the application to work

#### Chrome 
![enable_chrome.gif](https://www.dropbox.com/s/ptadof3wpwsgurj/enable_chrome.gif?dl=0&raw=1)

#### Firefox
![enable_firefox.gif](https://www.dropbox.com/s/z9xgs5sixa1a9lz/enable_firefox.gif?dl=0&raw=1)



## Application Setup   

Setup instructions can be found at https://www.youtube.com/watch?v=yYvzeLs77hs  

### Server Side

#### Prerequisites
- StarDog Knowledge Graph Platform server - https://www.stardog.com/download/
- Jar Converter - http://www.l3s.de/~minack/rdf2rdf/


#### Steps 
- Download the rdf file for the Nobel Dataset from the following path   
	
    https://old.datahub.io/dataset/nobelprizes 

- Using the Jar Converter run the following command  
    
   ``` java -jar rdf2rdf-1.0.1-2.3.1.jar dump.nt NobelData.rdf```

- Go To Bin Folder of Startdog Software and run the following (note please disable security)  
    
    `stardog-admin.bat server start --web-console --disable-security`  

    Create a database named 'NobelDB'  

	`stardog-admin db create -n NobelDB`

	Upload the rdf in Nobel-DB   

	`stardog data add NobelDB "D:\.....\data.rdf"`  

	Run the following sample query to check if it runs successfully or not  

	`stardog query NobelDB "select ?s where {?s ?p ?o} limit 10"`  

- Run the application hosted on github : https://nikz99.github.io/LinkedDataProject/
        
- Enable the local server and update the Stardog server port number on the application

### Client Side

Please follow the below steps if the application need to be hosted locally 

#### Prerequisites
- nodejs - https://nodejs.org/en/

#### Steps 
- Clone this repository
- Open node js command prompt `.../LinkedDataProject` directory
- Enter `npm install` - This will install all node js dependencies
- Enter `npm start` - This will start the angular application (in port 4200)

#### References
- Styling library used : https://picturepan2.github.io/spectre/