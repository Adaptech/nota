/* eslint-disable */
const {newInject, getTypeName} = require('./utils');
const uuid = require('uuid');

/* README...

 This service provides a simple fluent interface based on lots of conventions to support
 the standard action workflow for command execution used in POST actions against controllers.

 Simple Summary:
 call commandActionHelper.handlerFor(TAggregate, TClass)

 customize result using autoGenProperty or skipVerification fluent interface methods (sig. below):
 autoGenProperty(propertyName, generatorFn?)
 skipVerification(propertyName)

 each fluent method returns the original object with mutations as requested.

 pass the result to app.post(..., {here})


 DETAILED INFORMATION:

 The conventions assumed by this helper service are as follows:

 C1. The classes passed for TAggregate and TCommand are ES6-style classes defined using
 the class keyword.  These are imported into the controller file using 'require' as follows:

 const Class = require('../domain/Class');
 const AddClassToCourse = require('../commands/AddClassToCourse');

 C2. All properties on the command class are shallow copied (with exact name matching) from one of:
 (a) the params of the request (from the :foo strings in the URI passed to app.post)
 (b) the body of the request (from the payload of the post)
 (c) the automatically generated properties using 'autoGenProperty' (see below).

 NOTE: no name manipulation occurs, so be sure names match exactly.
 NOTE: no value manipulation occurs, so be sure values are in reasonable JavaScript objects
 from the 'req' object.  If they need manipulation this helper will need to be
 enhanced to enable this.

 C3. All properties that end in 'Id' that are not 'autoGenProperty' properties or 'skipVerification'
 properties on the command class will be verified by attempting to load a read model with a
 similar name and id.  The conventions in place here are:

 C3.1 - properties that end in singular 'Id' are a ID for the appropriately named read model.

 C3.2 - properties that end in plural 'Ids' are an array of IDs for the appropriately named
 read models.

 C3.3 - the read models are plural names that match the property name without 'Id' or 'Ids'
 - for example, teachingAssistantIds will cause a search for read models named
 'teachingAssistants-{property value}' in the read repository.
 - note, the only 'intelligence' regarding pluralization that currently exists is
 around adding 'es' if the base word ends in 's' (class -> classes), and adding
 'ies' in place of 'y' (faculty -> faculties).
 If you need more pluralization support, add it to the _pluralize function in this
 file.

 C3.4 - the verification property used in the query filter of readRepository.findOne(...)
 matches the name of the property from the command ('classId' used for 'classes'
 lookup and must be also the name of the property on the command).

 C4. The handler is going to be used in a POST action, and the semantics of that action are as
 follows:

 C4.1 - POST actions return 400 if one or more required fields is missing, as indicated
 by the command handler returning an error of type 'RequiredFields'.  The error
 is returned as JSON in the body of the response.

 C4.2 - POST actions return 500 if any other error occurs during processing.  In this case
 the body of the response is { message: err.message }.

 The error stack is also logged to the logger using logger.error(err.stack)

 C4.3 - if all read model verifications succeed on the request, the commandHandler service
 is used to execute the command with the aggregate id fetched from the command and
 the type supplied as TAggregate.

 C5. All commands have an aggregate associated with them, from which the handler is located.  The
 property on the command that contains the aggregate id follows the naming convention:

 if TAggregate is SomeAggregateTypeName, then the property on the command must be
 'someAggregateTypeNameId'.  In other words, the name is:

 _lowerCaseFirst(TAggregate.name) + 'Id'

 C6. The constructor arguments and properties of the commands are named by the convention:

 constructor(propertyName1, propertyName2) {
 this.propertyName1 = propertyName1;
 this.propertyName2 = propertyName2;
 }

 in other words...  the property names match the argument names to the ctor exactly.

 The fluent interface supports the following:

 1. on CommandActionHelper service, there is a 'handlerFor' method that accepts TAggregate
 and TCommand arguments that should be the class functions for the aggregate and command
 types respectively.

 use it like this:
 // inside controller constructor (requires you to import commandActionHelper service into ctor)

 app.post('/api/v1/classes/addToCourse', commandActionHelper
 .handlerFor(Class, AddClassToCourse)
 .autoGenProperty('classId'));

 2. the result of handlerFor is a (res,req) => {} function that can be used as the second argument
 to the post method of 'app' as seen in example 1 above.  This function also has some methods
 added to it to customize its behavior (described below).

 3. the autoGenProperty(propertyName, generatorFn?) fluent interface method can be used as follows
 to control the generation of some properties of the command object in the handler.  By default
 these properties are UUIDs generated using uuid.v4().

 a. to generate a uuid.v4() value for 'someAggregateId' property on command, use

 app.post(..., commandActionHelper
 .handlerFor(...)
 .autoGenProperty('someAggregateId');

 b. if you want to control the generation of the value, instead of using uuid.v4(),
 pass your own function as the second arg like this:

 app.post(..., commandActionHelper
 .handlerFor(...)
 .autoGenProperty('someAggregateId', () => { ... });

 4. the skipVerification(propertyName) fluent interface method can be used as follows to disable
 automatic verification of ...Id or ...Ids properties.

 5. the 'customMapProperty' method allows you to write code to custom map a property from the
 req.body to your own result.  The result will be matched up on the command arguments by the
 name (property name) you supply.

 app.post(..., commandActionHelper
 .handlerFor(...)
 .customMapProperty('office', (body) => {
 return body.office
 ? new Office(body.office.room, body.office.building, body.office.streetAddress)
 : null })
 .autoGenProperty('instructorId'));

 6. the 'debug' method allows you to provide a function that is called in the first line of
 the request handler.  This is a good place to put a break point if you are having trouble
 figuring out what is going on.  Then, you can put a breakpoint in the error trap below
 (inside the promise returned from validateCommandIds).  Alternatively (and maybe easier)
 you can use the errorAction method to set an error (debug) handler that is called on
 errors and put your breakpoint there.

 the typical use of this method looks like:

 app.post(..., commandActionHelper
 .handlerFor(...)
 .customMapProperty('office', (body) => {
 return body.office
 ? new Office(body.office.room, body.office.building, body.office.streetAddress)
 : null })
 .autoGenProperty('instructorId')
 .debug(() => {}));    <----- just set your breakpoint inside this block.

 if you need them, the req and res handler arguments get passed to the function.

 7. the 'errorAction' method allows you to provide a handler for an error that gets called for
 debugging purposes.  This is useful if you are trying to debug a call and can't figure out
 what is happening.  Just pass any function (empty or not) and set a breakpoint inside that
 function.  If you need it, the err object gets passed to that function.

 */
function CommandActionHelper(commandHandler, readRepository, logger) {

  this.handlerFor = function(TAggregate, TCommand) {

    const autoGenProperties = [];
    const skipVerification = [];
    const customMapProperties = [];
    const customProperties = [];
    const options = {};

    function validateCommandIds(command, autoGenPropertyBag) {
      const validations = [];

      const simpleIds = Object.getOwnPropertyNames(command).filter((v) => v.endsWith('Id'));
      for (let propertyName of simpleIds) {
        if (autoGenPropertyBag.hasOwnProperty(propertyName)) {
          continue;
        }

        if (skipVerification.includes(propertyName)) {
          continue;
        }

        const elementName = propertyName.slice(0, -2); // remove 'Id'
        const modelName = _pluralize(elementName);
        const id = command[propertyName];

        const validation = readRepository.findOne(modelName, {[propertyName]: id});
        validations.push(validation);
      }

      const idLists = Object.getOwnPropertyNames(command).filter((v) => v.endsWith('Ids'));
      for (let propertyName of idLists) {
        const elementName = propertyName.slice(0, -3); // remove 'Ids'
        const modelName = _pluralize(elementName);

        const propName = propertyName.slice(0, -1); // Ids -> Id
        for (let id of command[propertyName]) {
          const validation = readRepository.findOne(modelName, {[propName]: id});
          validations.push(validation);
        }
      }

      return Promise.all(validations);
    }

    const handler = (req, res) => {
      if (options.debugAction) {
        options.debugAction(req, res);
      }

      const autoGenPropertyBag = {};
      autoGenProperties.forEach((x) => autoGenPropertyBag[x.propName] = x.generatorFunction());

      const customMapPropertyBag = {};
      customMapProperties.forEach((x) => customMapPropertyBag[x.propName] = x.mapFunction(req.body));

      const customPropertyBag = {};
      customProperties.forEach((x) => customPropertyBag[x.propName] = x.valueFunction(req.body));

      const toInject = Object.assign({}, autoGenPropertyBag, req.params, req.body, customMapPropertyBag, customPropertyBag);

      const command = newInject(TCommand, toInject);

      const aggregateIdProperty = _lowerCaseFirst(TAggregate.name) + 'Id';
      const aggregateId = command[aggregateIdProperty];

      if (!aggregateId) {
        const errMsg = `Unable to find aggregate ID property ('${aggregateIdProperty}') on command type ${TCommand}`;
        logger.error(errMsg);
        res.status(500).json({message: errMsg});
      }

      validateCommandIds(command, autoGenPropertyBag)
        .then(() => {
          const aggregate = new TAggregate;
          const aggregateId = command[aggregateIdProperty];
          return commandHandler(aggregateId, aggregate, command);
        })
        .then(() => {
          res.json(command);
        })
        .catch(err => {
          if (options.errorAction) {
            options.errorAction(err);
          }
          if (getTypeName(err) === 'RequiredFields') {
            logger.error(err.message);
            return res.status(400).json(err);
          }
          logger.error(err.stack);
          res.status(500).json({message: err.message});
        });
    }

    /* public API of fluent interface */
    handler.autoGenProperty = function(propName, generatorFunction) {
      generatorFunction = generatorFunction || (() => uuid.v4());
      autoGenProperties.push({propName, generatorFunction});
      return this;
    }

    handler.skipVerification = function(propName) {
      skipVerification.push(propName);
      return this;
    }

    handler.customMapProperty = function(propName, mapFunction) {
      if (!mapFunction) {
        throw new Error('map function cannot be null');
      }
      customMapProperties.push({propName, mapFunction});
      return this;
    }

    handler.customProperty = function(propName, valueFunction) {
      if (!valueFunction) {
        throw new Error('value function cannot be null');
      }
      customProperties.push({propName, valueFunction});
      return this;
    }

    handler.debug = function(action) {
      options.debugAction = action;
      return this;
    }

    handler.errorAction = function(errorAction) {
      options.errorAction = errorAction;
      return this;
    }

    return handler;
  }

  return this;

}

function _pluralize(elementName) {
  return elementName.endsWith('s')
    ? elementName + 'es'
    : elementName.endsWith('y')
      ? elementName.slice(0, -1) + 'ies'
      : elementName + 's';
}

function _lowerCaseFirst(s) {
  return s[0].toLowerCase() + s.slice(1);
}

module.exports = CommandActionHelper;