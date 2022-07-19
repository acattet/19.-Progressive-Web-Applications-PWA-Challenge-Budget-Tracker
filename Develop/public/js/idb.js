let db;
const request = indexedDB.open("budgeTracker", 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore("new_amount", { autoIncrement: true });
};

// upon a successful 
request.onsuccess = function(event) {
    db = event.target.result;

    if(navigator.onLine) {
        uploadAmount();
    }
};

request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
  };


  // This function will be executed if we attempt to submit a new pizza and there's no internet connection
function saveRecord(record) {
    const transaction = db.transaction(["new_amount"], "readwrite");
    const transactionObjectStore = transaction.objectStore("new_amount");
    transactionObjectStore.add(record);
}



function uploadAmount() {
    const transaction = db.transaction(["new_amount"], "readwrite");
    const transactionObjectStore = transaction.objectStore("new_amount");
    const getAll = transactionObjectStore.getAll();

    getAll.onsuccess = function() {
        if(getAll.result.length > 0) {
            fetch("/api/transaction", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if(serverResponse.message) {
                    throw new Error(serverResponse);
                }

                const transaction = db.transaction(["new_amount"], "readwrite");
                const transactionObjectStore = transaction.objectStore("new_amount");
                transactionObjectStore.clear();
                alert("All saved transactions have been submitted!");
            })
           
        }
    };
}

window.addEventListener("online", uploadAmount);