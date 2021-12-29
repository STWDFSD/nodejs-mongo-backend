# Node.js MongoDB back-end basic demo app.
Basic nodejs back-end that exposes CRUD functionality and queries to a MongoDB collection using the library devextreme-query-mongodb.

# 1. Database server setup
## Option 1: VirtualBox Vagrant setup
- Change directory to the base path of this project.
- Execute the `vagrant up` command, once the process completes an Ubuntu-MongoDB virtual machine will be running.
- [Continue to step 2](#2-run-the-project).

## Option 2: Mongo DB local installation
<details>
<summary>Click to expand!</summary>

### Install Nodejs
Todo: Document how to install Nodejs  
### Install MongoDB
#### Ubuntu
https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/.

#### Windows
https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/.

[install mongosh](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/#install-mongosh) as a separate package. \
[Install MongoDB tools](https://docs.mongodb.com/database-tools/installation/installation-windows/) (mongoimport).

Add the path to mongoDB files to windows PATH
In my case it was \
`C:\Program Files\MongoDB\Server\5.0\bin\` \
`C:\Program Files\MongoDB\Tools\100\bin\`

It wasn't required to add mongosh app to the windows PATH variable, but it was installed on this directory: \
`C:\Users\HP\AppData\Local\Programs\mongosh`

### Start mongoDB as a replica
Stop any mongodb server instance.

### Create data directory and Start a replica instance in the default port 27017  
Run the following commands to set up a simple, single-node replica set (for testing purposes).
#### Windows  
```
mkdir C:\mongodb\data
mongod --replSet rs0 --dbpath "C:\mongodb\data"
```

#### Ubuntu  
```
mkdir -p /mongodb/data
mongod --replSet rs0 --dbpath /mongodb/data
```

### Connect (in a different terminal) using mongosh and initialize the replica 
`mongosh mongodb://<MONGODB_SERVER_IP>:27017/test` \
`rs.initiate()`

## Import test collection
Import the [restaurants](https://raw.githubusercontent.com/mongodb/docs-assets/drivers/restaurants.json) collection into the test database as shown in this readme file:
https://github.com/mongodb/docs-assets/tree/drivers
</details>

# 2. Run the project
Once the mongodb server is running you can continue and run this project
## From the Vagrant virtual machine
The Nodejs server is installed and automatically started within the Vagrant virtual machine. You should be able to access at:  
`http://localhost:8080/grades?take=10`

### The following endpoints are available for testing:

1. **GET /grades**: this endpoint uses the library [devextreme-query-mongodb](https://github.com/oliversturm/devextreme-query-mongodb) to format request/response parameters. So it can be used to test DevExtreme components.

2. **(GET, POST, PUT, PATCH, DELETE) /api/grades**: this endpoint exposes a basic CRUD functionality.

3. **GET /grades/stream**: This endpoint uses mongo Change Streams to respond with a Server-sent event when any operation (insert, update, delete) is performed on the Grades collection (similar to what we have in the Ratpack back-end demo app).

4. **GET /frontend**: This is an endpoint for testing the back-end endpoints. It responds with an HTML page that displays a list of Grades and dynamically updates the table when a notification (Server-sent event) is received.
  
## From a local Nodejs installation
You can start the nodejs server by running:  
`node app`  

# 3. Update the collection using mongosh

Connect to mongosh \
`mongosh mongodb://localhost:27017/test`

Then within mongosh
To update a single document:  
```
db.grades.updateOne( 
   { quizScore: { $gte: 90 } }, 
   [{ $set: { examScore: { $round: [ { $multiply: [ { $rand: {} }, 100 ] }, 2 ] } } }]
);
```

To update multiple documents:  
```
try {
   db.grades.updateMany(
      { examScore: { $lte: 25 } },
      [{ $set: { examScore: { $round: [ { $multiply: [ { $rand: {} }, 100 ] }, 2 ] } } }],
   );
} catch (e) {
   print(e);
}
```

# References
- https://ryantravitz.com/2018-11-29-server-sent-events/
- https://community.devexpress.com/blogs/oliver/archive/2017/04/03/devextreme-real-world-patterns-devextreme-widgets.aspx
