# Completed Assignment:
Thank you for providing the opportunity for me to complete this take home assingment. I learnt a lot of new things in the backend such as JWT authentication and file uploading. I also tried to get into the habbit of using kanban boards from Trello, as they would keep track of the completion of big projects.

## Level 0: Setup

- (0) Setup a NoSQL database : Implemented. Used MongoDB database with Mongoose library in NodeJS
- (1) Create a GET endpoint at `/api/health` to test whether your API server is functioning and healthy
  - This can return a JSON with `{"healthy": true}`: Implemented.
  
  
  
## Level 1: Easy

###Implemented: All three endpoints create a new user/training/animal model object and saves them in mongoDB. Error handling requirements are also satisfied.

- (2) Create a POST endpoint at `/api/user` to create a user in the database based on information passed into the body
- (3) Create a POST endpoint at `/api/animal` to create an animal in the database based on information passed into the body
- (4) Create a POST endpoint at `/api/training` to create a training log in the database based on information passed into the body
- Note these requests will have a similar request body and response statuses:
  - Body: A JSON containing the user/animal/training log information for the user/animal/training log we want to create
  - Response:
    - **Status 200 (Success):** If the body contains all of the information and is able to create the user/animal/training log
    - **Status 400:** If the body contains incorrect information
    - **Status 500:** For any other errors that occur
    
   

## Level 2: Medium
###Implemented: All 3 endpoints provide all the documents from their respective types, while implementing pagination. I kept it at a 100/page limit.


- (5) In the training log creation endpoint (3), we want to add in a check to ensure that the animal specified in the training log belongs to the user specified in the training log. Add in code to do this.

  - Response:
    - **Status 400:** If the training log animal is not owned by specified user

- We want to add admin functionality to this backend API to allow the admins to view all the data in the database
  - (6) Create a GET endpoint at `/api/admin/users` which will return all of the users in the database (not with their passwords)
  - (7) Create a GET endpoint at `/api/admin/animals` which will return all of the animals in the database
  - (8) Create a GET endpoint at `/api/admin/training` which will return all of the training logs in the database
  - Response:
    - **Status 200 (Success):** If we are able to retrieve the users/animals/training logs
    - **Status 500**: For any other errors
  - **Note:** These endpoints must implement pagination -- ideally using the document IDs or some other property that has natural ordering (i.e. take a look at approach 2 in this [article](https://www.codementor.io/@arpitbhayani/fast-and-efficient-pagination-in-mongodb-9095flbqr) if you are using MongoDB)
  
## Level 3: Hard
###Implemented: All endpoints except User Creation, and login have an authenticate endpoint. After login, a JWT token is issued for 5-10 minutes. After expiry the user must login for a new one. Used information from JWT to refactor 2 endpoints .i.e When creating animals and creating training logs. 
  


- (9) We want to add user authentication. In the user creation endpoint (1), add code that allows a password to be accepted. Encrypt this password using an encryption library (we reccommend using [bcrypt](https://www.npmjs.com/package/bcrypt)) and save it in the database under the user's password field
- (10) Create a POST endpoint at `/api/user/login` that accepts an email and password and tests whether the password is valid for the given email.

  - Response:
    - **Status 200 (Success):** If the email/password combo is valid
    - **Status 403**: If the email password combo is invalid
    


- (11) We are going to make our application even more secure by adding JSON Web Token (JWT) functionality to secure our endpoints. Create a POST endpoint at `/api/user/verify` that issues a JSON Web Token to the user if they issue the correct email/password combination.
  - Response:
    - **Status 200 (Success):** If the email/password combo is valid + issue a JWT that includes the entirety of their profile information
    - **Status 403**: If the email password combo is invalid
- (12) In each of our endpoints, verify the JWT and only allow execution of the endpoint if the JWT is not expired and is valid
- (13) Because the JWT includes information about the user making the request, refactor your endpoints to draw information from the JWT rather than the body of the request
  - I.e. we no longer need to manually specifiy a user id when creating a service animal beacuse we can pull from the info encoded into the JWT.
  
  
  - 
  
## Level 4: Expert
###Implemented: Used express-fileupload package to decode files from incoming requests, and these file objects are saved in the server seperately. When the save is complete, their references are saved as the profilePic/video of the user, animal, or the training log object. 

- (14) For the final part, we want to add file upload functionality. For this part, you are welcome to use any cloud file storage provider you would like. Create a POST endpoint at `/api/file/upload` to upload your file at.
  - Body: Contains the _type of data_ (i.e. animal image, user image, or training log video) and the ID of the user/animal/training log this file belongs to
  - Response:
    - **Status 200 (Success)**: Successfully uploaded the video to the cloud storage
    - **Status 500**: For any other errors
  - Notes:
    - The method you decide to transport the file (i.e. whether it be multipart, base64, etc.) is left up to you as a design decision
    - Make sure to update the specific document in your database with the correct file reference upon upload completion
    
 - 
