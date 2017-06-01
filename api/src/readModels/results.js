export const config = {
  key: 'referendumId'
};

function createOrUpdateReferendum(referendumResults, readRepository, event) {
  let referendumId = event.referendumId;
  return readRepository.exists('results', { referendumId })
    .then(exists => {
      if (!exists) {
          let results = []
          event.options.forEach(option => {
              results.push({ "name": option, "votes": 0 })
          })

          return referendumResults.create({
            referendumId: event.referendumId,
            organizationId: event.organizationId,
            name: event.name,
            proposal: event.proposal,
            results: results
          });
      }
    }
  )
}

function recordVote(referendumResults, readRepository, event) {
  return referendumResults.updateOne({referendumId: event.referendumId}, r => {
    r.results.forEach(result => {
        if( result.name === event.vote) {
            result.votes = result.votes + 1;
            console.log("VOTES: ")
            console.log(result.votes)
        }
      })
  });
}

export function handler(referendumResults, eventData, readRepository) {
  const event = eventData.event;
  switch (eventData.typeId) {
    case 'ReferendumCreated': return createOrUpdateReferendum(referendumResults, readRepository, event);
    case 'VoteCast': return recordVote(referendumResults, readRepository, event);
    // case 'ReferendumDeleted':
    //TODO: Results from deleted referendum still show up in the referendum results read model.
  }
  return referendumResults;
}

