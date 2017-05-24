export const config = {
  key: 'referendumId'
};

function createOrUpdateOne(referendumResultsRepo, readRepository, event) {
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

export function handler(referendumResultsRepo, eventData, readRepository) {
  const event = eventData.event;
  switch (eventData.typeId) {
    case 'ReferendumCreated': return createOrUpdateOne(referendumResultsRepo, readRepository, event);
    // case 'VoteCast': return createOrUpdateByOrderId(referendumResultsRepo, readRepository, event.orderId, 'canceled');
  }
  return referendumResultsRepo;
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

