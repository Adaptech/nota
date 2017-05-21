import Referendum from '../domain/Referendum';
import CreateReferendum from '../commands/CreateReferendum';
import OpenPolls from '../commands/OpenPolls';
import CastVote from '../commands/CastVote';
import AuthenticateVoter from '../commands/AuthenticateVoter';

export default class ReferendumController {
  constructor(app, readRepository, commandHandler, logger) {
    function CreateReferendumHandler(req, res) {
      var params = req.body;
      var options = params.options;
      const command = new CreateReferendum(params.referendumId, params.organizationId, params.name, params.proposal, options);
      commandHandler(command.referendumId, new Referendum(), command)
          .then(() => {
            res.status(202).json(command);
          })
          .catch(err => {
            handleError(logger, err, res);
          });
    }
    app.post('/api/v1/organization/referendum/create', CreateReferendumHandler);

    function AuthenticateVoterHandler(req, res) {
      var params = req.body;

      Promise.all([
          readRepository.findWhere('voterlist', {voterId: params.voterId, organizationId: params.organizationId }),
        ])
        .then(([voterlist ]) => {
          const command = new AuthenticateVoter(params.referendumId, params.organizationId, params.voterId, voterlist);
          var referendumInstance = new Referendum();
          return commandHandler(command.referendumId, referendumInstance, command);
        })
        .then(() => {
          res.status(202).json(params);
        })
        .catch(err => {
          handleError(logger, err, res);
        });
    }
    app.post('/api/v1/organization/referendum/voter/authenticate', AuthenticateVoterHandler);

    function OpenPollsHandler(req, res) {
      var params = req.body;
      const command = new OpenPolls(params.referendumId);
      commandHandler(command.referendumId, new Referendum(), command)
      .then(() => {
        res.status(202).json(params);
      })
      .catch(err => {
        handleError(logger, err, res);
      });
    }
    app.post('/api/v1/organization/referendum/polls/open', OpenPollsHandler);

    function CastVoteHandler(req, res) {
      var params = req.body;
      const command = new CastVote(params.referendumId, params.vote);
      console.log(command)
      commandHandler(command.referendumId, new Referendum(), command)
      .then(() => {
        res.status(202).json(params);
      })
      .catch(err => {
        handleError(logger, err, res);
      });
    }
    app.post('/api/v1/organization/referendum/vote', CastVoteHandler);
   }
}

const handleError = (logger, err, res) => {
  logger.error(err.stack);
  if (err.name === "ValidationFailed") {
    res.status(400).json({message: err.message});
  } else if (err.name === "Unauthorized") {
    res.status(401).json({message: err.message});
  } else if (err.name === "Forbidden") {
    res.status(403).json({message: err.message});
  } else {
    res.status(500).json({message: err.message});
  }
}
