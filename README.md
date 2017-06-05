
_NOTA ("None Of The Above") will be a secure online voting system._ We are building it at the https://www.meetup.com/DDD-CQRS-ES/ meetup in Vancouver, BC. We [regularly develop example DDD/CQRS/ES systems](https://adaptechsolutions.net/2016-in-review-vancouvers-cqrsesddd-meetup/) anyway to give meetup members an opportunity to get hands-on experience and this one seemed like it could turn out to be of some use.

*See also: https://github.com/Adaptech/notasimulator*

## Requirements

Below is the result of [the event storming](http://ziobrando.blogspot.de/2013/11/introducing-event-storming.html) we did for this system:

![NOTA Minimum Viable Event Storm](nota-eventstorming.jpg)

## Functionality

For what you can do and what events happen as a result, see ```src/commands``` and ```src/events```:

* CreateElectionAdmin  
* CreateOrganization  
* CreateReferendum  
* RegisterVoter
* OpenPolls  
* AuthenticateVoter  
* CastVote  
* ClosePolls  
* DeleteReferendum  

## Getting Started

### Installing & running the event store

See https://geteventstore.com/downloads/ .
- unzip at ~/
- cd into extracted folder
- `./run-node.sh` (start event store) or
`./run-node.sh --int-ip=0.0.0.0 --ext-ip=0.0.0.0`
if running in a Vagrant box
- For the admin UI, go to ```http://localhost:2113```
- login: admin pass: changeit (defaults)

### Installing & running the API

#### Change to api directory

```cd api```

#### Install modules

```npm install```

#### Run the API

```npm start```

#### Run the unit tests

```npm test```

#### Run the API integration tests

1. Find the eventstore data folder and delete everything in it; the tests won't pass if there are results from a previous run.
2. Start eventstore
3. ```cd api```
4. Delete any existing read model data: ```rm -fr db```
5. Start API: ```npm start```.
6. Run the tests: ```npm run test-api```

#### Exploring the API

1. Install https://chrome.google.com/webstore/detail/postman/fhbjgbiflinjbdggehcddcbncdddomop
2. In Postman, import the ```api/noneoftheabove-localhost.postman_environment.json``` environment. (Top right in Postman: "Cogwheel-thingy" -> "Manage Environments" -> "Import")
3. Import the collection ```api/noneoftheabove.postman_collection.json```. (Top left in Postman: "Import" button.)

The collection has examples of API calls.

### Installing & running the web app

#### Change to web directory

```cd web```

#### Install modules

```npm install```

#### Run the web application

```npm start```

#### View the web application

Open `localhost:3000`

