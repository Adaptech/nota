// As per http://schema.org/MonetaryAmount
export default class MonetaryAmount {
  constructor(currency, value) {
    this.currency = currency || ""; // e.g. "USD". Use ISO 4217
    this.value = value || null;
  }

  validate() {
    var validationErrors = [];
    if(!this.currency) {
      validationErrors.push({"field": "currency", "msg": "Currency is a required field."});
    }    
    if(!this.value) {
      validationErrors.push({"field": "value", "msg": "Value is a required field."});
    }
    if(isNaN(this.value)) {
      validationErrors.push({"field": "value", "msg": "Value must be a number."});
    }        
    if(this.currency != "USD" && this.currency != "CAD") {
      validationErrors.push({"field": "currency", "msg": "Currency needs to be USD or CAD."});
    }        
    return validationErrors;    
  }
};

