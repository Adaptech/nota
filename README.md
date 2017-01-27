
NOTA ("None Of The Above") is a secure online voting system. We are building it at the https://www.meetup.com/DDD-CQRS-ES/ meetup in Vancouver, BC.

## Getting Started

### Install & run Eventstore on localhost

See https://geteventstore.com/downloads/ .
- unzip at ~/
- cd into extracted folder
- `./run-node.sh` (start event store)
- For the admin UI, go to ```http://localhost:2113```
- login: admin pass: changeit (defaults)

### Install modules

```npm install```

### Run the unit tests

```npm test```

### Run the API integration tests

They will only pass if the eventstore is empty. To delete all eventstore data, delete all files in /eventstore/install/location/data

1. Install the Postman command line tool: ```sudo npm install -g newman```
2. Find the eventstore data folder and delete everything in it; the tests won't pass if there are results from a previous run.
3. Start eventstore
4. Start API: ```npm start```.
5. Run the tests: ```npm run test-api```

### Start API

```npm start```

## Exploring the API

1. Install https://chrome.google.com/webstore/detail/postman/fhbjgbiflinjbdggehcddcbncdddomop
2. In Postman, import the ```localhost.postman_environment.json``` environment. (Top right in Postman: "Cogwheel-thingy" -> "Manage Environments" -> "Import")
3. Import the collection ```noneoftheabove.postman_collection.json```. (Top left in Postman: "Import" button.)

The collection has examples of API calls.