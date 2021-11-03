let db;

const request = indexedDB.open("budgetDB", 1);

request.onupgradeneeded = ({ target }) => {
  let db = target.result;
  db.createObjectStore("reserve", { autoIncrement: true });
};

request.onerror = function ({ target }) {
  console.log(`Oops, ${target.errorCode}`);
};

request.onsuccess = function ({ target }) {
  console.log("Success");
  db = target.result;

  if (navigator.online) {
    checkDatabase();
  }
};

function checkDatabase() {
  console.log("Checking Database");

  const transaction = db.transaction(["reserve"], "readwrite");
  const store = transaction.objectStore("reserve");
  const getAll = storage.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          return res.json();
        })
        .then(() => {
          const transaction = db.transaction(["reserve"], "readwrite");
          const store = transaction.objectStore("reserve");
          store.clear();
        });
    }
  };
}

function saveRecord(record) {
  const transaction = db.transaction(["reserve"], "readwrite");
  const store = transaction.objectStore("reserve");
  store.add(record);
}

window.addEventListener("online", checkDatabase);
