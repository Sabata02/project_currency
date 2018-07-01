const apiURL = `https://free.currencyconverterapi.com/api/v5/countries`;
fetch(apiURL).then((response) => {
 return response.json().then((responseValue) => {
  return responseValue.results

}).then((total_amount) =>{
  for(let data in total_amount){
  	let from_curr = document.createElement("option");
  	let selectFrom = document.getElementById("from_curr");
    selectFrom.appendChild(from_curr);
  	from_curr.innerHTML = `${total_amount[data].currencyId}__${total_amount[data].currencyName}`;
  	from_curr.setAttribute("total_amount", `${total_amount[data].currencyId}`);

  	let to_curr = document.createElement("option");
  	let selectTo = document.getElementById("to_curr");
    selectTo.appendChild(to_curr);
  	to_curr.innerHTML = `${total_amount[data].currencyId}__${total_amount[data].currencyName}`;
  	to_curr.setAttribute("total_amount", `${total_amount[data].currencyId}`);
  }
 })
}).catch((err) => {
  console.log(err);
});

function getCurrency() {
  let fromCurrency = from_curr.total_amount;
  let toCurrency = to_curr.total_amount;
  let query = fromCurrency + '_' + toCurrency;
  let enterAmount = document.getElementById("total_amount").total_amount;
  let resultValue = document.getElementById('fieldIn');
  let url = `https://free.currencyconverterapi.com/api/v5/convert?q=${query}&compact=ultra`;

  if (!('indexedDB' in window)) {
    console.log('This browser doesn\'t support IndexedDB');
    return;
  }
  let dbPromise = idb.open('converter-db', 1, (upgradeDb) =>{
  if (!navigator.serviceWorker) {
    return Promise.resolve();
  };
  if(!upgradeDb.objectStoreNames.contains('db-data')){
    let dbData = upgradeDb.createObjectStore('db-data',  {autoIncrement: true});
  }
  });

  fetch(url).then((response) =>{
    return response.json().then((results) =>{
      let total = results[query] * enterAmount;
      let actualConversion = Math.round(total * 100)/100;
      resultValue.total_amount = actualConversion.toFixed(2);
      dbPromise.then((db) => {
        let tx = db.transaction('db-data', 'readwrite');
        let store = tx.objectStore('db-data');
        store.put(results);
        return tx.complete;
      });
    });
  }).catch(() =>{
     dbPromise.then((db) => {
          let tx = db.transaction('db-data', 'readwrite');
          let store = tx.objectStore('db-data');
          return store.openCursor();
        }).then(function continueCursoring(cursor) {
          if (!cursor) {
            return;
          }

          for (let field in cursor.total_amount) {
            if(field === query){
              let cursorValue = cursor.total_amount[field];
              let dbtotal = cursorValue * enterAmount;
              let dbactualConversion = Math.round(dbtotal * 100)/100;
              resultValue.total_amount = dbactualConversion.toFixed(2);
            }
          }
          return cursor.continue().then(continueCursoring);
        })
  })
}

if('serviceWorker' in navigator) {

  navigator.serviceWorker.register('sw.js').then(() => {
    console.log("Service Worker Registered.");
  }).catch(() => {
    console.log("Service Worker failed to register the offline service");
  });
}
