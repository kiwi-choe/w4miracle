const users = document.querySelector("#users");

function readTextFile(file, callback) {
  var rawFile = new XMLHttpRequest();
  rawFile.overrideMimeType("application/json");
  rawFile.open("GET", file, true);
  rawFile.onreadystatechange = function () {
    if (rawFile.readyState === 4 && rawFile.status == "200") {
      callback(rawFile.responseText);
    }
  };
  rawFile.send(null);
}

//usage:
readTextFile("../users.json", function (text) {
  usersJson = JSON.parse(text);

  const wrapper = document.querySelector(".wrapper");
  const userSet = new Set();
  let userList = Object.keys(usersJson.__collections__.users);
  let arr = [];

  userList.map((el, idx) => {
    // 중복값 제거
    userSet.add(el.split("-")[0].trim());
  });
  userSet.delete("기나영");

  let countOfTd = 0;
  let tdArr = [];

  for (let el of userSet.values()) {
    const td = document.createElement("td");
    td.textContent = el;
    tdArr.push(td);
    countOfTd++;
    if (countOfTd === 4) {
      const tr = document.createElement("tr");
      tr.append(tdArr[0], tdArr[1], tdArr[2], tdArr[3]);
      tdArr = [];
      countOfTd = 0;
      users.appendChild(tr);
      continue;
    }
  }

  const td1 = document.createElement("td");
  const td2 = document.createElement("td");
  td1.textContent = "홍수민";
  td2.textContent = "황종윤";
  const tr = document.createElement("tr");
  tr.append(td1, td2);
  users.appendChild(tr);
});
