export const config = {
  key: 'referendumId'
};

function createOrUpdateReferendum(referendumResultsRepo, readRepository, event) {
  let referendumId = event.referendumId;
  return readRepository.exists('results', { referendumId })
    .then(exists => {
      if (!exists) {
          let results = []
          event.options.forEach(option => {
              results.push({ "name": option, "votes": 0 })
          })

          return referendumResultsRepo.create({
            referendumId: event.referendumId,
            organizationId: event.organizationId,
            name: event.name,
            proposal: event.proposal,
            results: results
          });
      }
      else {
        // TODO: Handle ReferendumModified
        // return referendumResultsRepo.updateOne(event.referendumId, referendumResult => {
        //   if(referendumResult.results.includes(event.vote))  { 
        //     referendumResult.results.votes = referendumResult.results.votes + 1;
        //   };
        // });
      }
    }
  )
}

function recordVote(referendumResultsRepo, readRepository, event) {
  let referendumId = event.referendumId;
  return readRepository.findOne('results', { referendumId })
    .then(r => {
      r.results.forEach(result => {
        if( result.name === event.vote) {
            result.votes = result.votes + 1;
        }
      })
    });
}


export function handler(resultsRepo, eventData, readRepository) {
  const event = eventData.event;
  switch (eventData.typeId) {
    case 'ReferendumCreated': return createOrUpdateReferendum(resultsRepo, readRepository, event);
    case 'VoteCast': return recordVote(resultsRepo, readRepository, event);
  }
  return resultsRepo;
}

// export function handler(referendumResults, eventData) {
//   const event = eventData.event;
//   switch(eventData.typeId) {
//     case 'ReferendumCreated':
//       let results = []
//       event.options.forEach(option => {
//           results.push({ "name": option, "votes": 0 })
//       })

//       referendumResults.create({
//         referendumId: event.referendumId,
//         organizationId: event.organizationId,
//         name: event.name,
//         proposal: event.proposal,
//         results: results
//       });
//       break;
//     case 'VoteCast':
//       console.log("REFERENDUMRESULTS")
//       console.log(referendumResults)
//       referendumResults.forEach(r => { 
//         if(r.name === event.vote) {
//           r.votes = r.votes + 1;
//         }
//       })
//       break;
//   }
//   return referendumResults;
// }

