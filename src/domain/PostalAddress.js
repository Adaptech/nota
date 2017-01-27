// As per http://schema.org/PostalAddress
export default class PostalAddress {
  constructor(streetAddress, postOfficeBoxNumber, addressLocality, addressRegion, postalCode, addressCountry) {
    this.streetAddress = streetAddress; // e.g. "1600 Amphitheatre Pkwy".
    this.postOfficeBoxNumber = postOfficeBoxNumber 
    this.addressLocality = addressLocality; // e.g. "Vancouver"
    this.addressRegion = addressRegion; // e.g. "BC" or "OR".
    this.postalCode = postalCode; // e.g. "94043" or "V3H 4TK"
    this.addressCountry = addressCountry; // e.g. "USA". Alpha-3 code as of https://en.wikipedia.org/wiki/ISO_3166-1 . 
  }
};
