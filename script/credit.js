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

  // userSet.forEach((v, k) => {
  // const td = document.createElement("td");
  // td.textContent = v;
  // tdArr.push(td);
  // console.log(v);

  // countOfTd++;

  // if (countOfTd === 4) {
  //   const tr = document.createElement("tr");
  //   tr.append(tdArr[0], tdArr[1], tdArr[2], tdArr[3]);
  //   countOfTd = 0;
  // }
  // });

  // function addWalkLogTable(username, phoneNumber, walkCount, totalWalkCount) {
  //   const tr = document.createElement("tr");
  //   const tdUsername = document.createElement("td");
  //   const tdPhoneNumber = document.createElement("td");
  //   const tdWalkCount = document.createElement("td");
  //   const tdTotalWalkCount = document.createElement("td");

  //   tdUsername.setAttribute("class", "username");
  //   tdPhoneNumber.setAttribute("class", "phoneNumber");
  //   tdWalkCount.setAttribute("class", "walkCount");
  //   tdTotalWalkCount.setAttribute("class", "totalWalkCount");
  //   tdUsername.textContent = username;
  //   tdPhoneNumber.textContent = phoneNumber;
  //   tdWalkCount.textContent = walkCount;
  //   tdTotalWalkCount.textContent = totalWalkCount;
  //   tr.append(tdUsername, tdPhoneNumber, tdWalkCount, tdTotalWalkCount);
  //   userTable.appendChild(tr);
  // }

  // for (let i = 0; i < 5; i++) {
  //   let name = document.createElement("div");
  //   name.setAttribute("class", "name");
  //   name.textContent = "w4m!!";

  //   let x = Math.floor(Math.random() * 1000);

  //   name.style.position = "absolute";
  //   name.style.top = document.body.clientHeight * x + "px";
  //   name.style.left = document.body.clientWidth * x + "px";

  //   wrapper.appendChild(name);
  // }
});
