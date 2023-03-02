# How to Set Up SmartBard API Locally

## Start API Locally
1. Clone [SmartBard-API Repo](https://github.com/SmartBard/SmartBard-API) to local desktop
2. Run `npm install` to install required dependencies for API
3. Run `npm run start` to start API

## Connect to Database for Testing
1. Download Postman and Docker
2. Add `.env` file containing db connection details.  

   * Ex:
        ```
                POSTGRES_HOST=smbd-db-test-dbinstance-kidca86wuexs.csvlzu6ng5bv.us-east-1.rds.amazonaws.com
                POSTGRES_USER=smartbarduser
                POSTGRES_DATABASE=postgres
                POSTGRES_PASSWORD=smartbarduser
        ``` 
3. Replace `$PWD` in [dev-db.sh](../db/dev/dev-db.sh) with absolute path to [dev folder](../db/dev/)
    * Make sure to contain your path in quotes
4. Run [dev-db.sh](../db/dev/dev-db.sh) in terminal. You should see a new container named `postgres-sb`
started in Docker
    * If you are on windows, you may need to uninstall postgres if you have it to avoid confusion in the background processes. Reinstalling after you have the container running successfully seems to not cause issues. 
5. Test the container by sending a request to an endpoint through Postman.  
    * Ex:
        ```
            POST request to `http://localhost:3000/announcements`
            Request Body:
            {
                "title": "Sample Request",
                "body": "Some Text",
                "datefrom": "2023-02-13T00:00:00.000Z",
                "dateto": "2023-05-28T00:00:00.000Z",
                "priority": false
            }
        ```  
    * You should get back a status of approved or requested in the response body. This means setup was successful. 

