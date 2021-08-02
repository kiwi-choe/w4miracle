const walkCountInputForm = document.getElementById("walkCount-form");
const username = walkCountInputForm.querySelector("#username");
const phoneNumber = walkCountInputForm.querySelector("#phoneNumber");
const walkCount = walkCountInputForm.querySelector("#walkCount");

const totalWalkCnt = document.querySelector(".chart__value");
const userTable = document.querySelector("#users");

const COL_USERS = "users";
const COL_WALKLOG = "walkLog";

/**
 * DB
 */
const firebaseConfig = {
  apiKey: "AIzaSyCg-XnCKH6zScJY_04rXUf0Fmxbza_JnGU",
  authDomain: "walking4miracle.firebaseapp.com",
  projectId: "walking4miracle",
  storageBucket: "walking4miracle.appspot.com",
  messagingSenderId: "414251762442",
  appId: "1:414251762442:web:242b6a090d8013a7d9f0f3",
  measurementId: "G-X0KSZNYM6V",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
db.settings({
  timestampsInSnapshots: true,
});

function getUserDocName(username, phoneNumber) {
  return `${username}-${phoneNumber}`;
}

function clearInput() {
  username.value = "";
  phoneNumber.value = "";
  walkCount.value = "";
}

// GET  총 걸음 수
function selectTotalWalkCount() {
  this.getTotalWalkCount();
}
selectTotalWalkCount();

async function getTotalWalkCount() {
  const latestWalkLog = await db
    .collection(COL_WALKLOG)
    .orderBy("createdAt", "desc")
    .limit(1)
    .get()
    .then((snapshot) => {
      if (snapshot.docs.length > 0) {
        let docs = snapshot.docs.map((doc) => doc.data());
        totalWalkCnt.textContent = docs[0].totalWalkCount.toLocaleString();
        return docs[0].totalWalkCount;
      } else {
        totalWalkCnt.textContent = 0;
        return 0;
      }
    })
    .catch(() => 0);
  return latestWalkLog;
}

// GET  입력된 걸음 목록
function selectUserList() {
  this.getWalkLogs();
}
selectUserList();
async function getWalkLogs() {
  await db
    .collection(COL_WALKLOG)
    .orderBy("createdAt", "desc")
    .get()
    .then((snapshot) => {
      snapshot.docs.forEach((doc) => {
        const tr = document.createElement("tr");
        const tdUsername = document.createElement("td");
        const tdPhoneNumber = document.createElement("td");
        const tdWalkCount = document.createElement("td");
        const tdTotalWalkCount = document.createElement("td");
        const walkCount = Number(doc.data().walkCount).toLocaleString();
        const totalWalkCount = Number(
          doc.data().totalWalkCount
        ).toLocaleString();
        tdUsername.setAttribute("class", "username");
        tdPhoneNumber.setAttribute("class", "phoneNumber");
        tdWalkCount.setAttribute("class", "walkCount");
        tdTotalWalkCount.setAttribute("class", "totalWalkCount");
        tdUsername.textContent = doc.data().username;
        tdPhoneNumber.textContent = doc.data().phoneNumber;
        tdWalkCount.textContent = walkCount;
        tdTotalWalkCount.textContent = totalWalkCount;
        tr.append(tdUsername, tdPhoneNumber, tdWalkCount, tdTotalWalkCount);
        userTable.appendChild(tr);
      });
    });
}
async function onSubmit(info) {
  info.preventDefault();

  if (!validateInputData(username.value, phoneNumber.value, walkCount.value)) {
    alert("이름, 번호, 걸음수 입력해주세요!");
    return;
  }

  try {
    const existUserWalks = await userExist(username.value, phoneNumber.value);
    console.log("existUserWalks: " + existUserWalks);
    if (existUserWalks) {
      updateUser(
        username.value,
        phoneNumber.value,
        existUserWalks,
        walkCount.value
      );
    } else {
      createUser(username.value, phoneNumber.value, walkCount.value);
    }

    // POST  걸음데이타
    const latestTotalWalkCount = await getTotalWalkCount();
    addWalkLog(
      username.value,
      phoneNumber.value,
      latestTotalWalkCount,
      walkCount.value
    );
  } catch (e) {
    console.log(e);
  }
}

walkCountInputForm.addEventListener("submit", onSubmit);

async function updateUser(username, number, existUserWalks, walkCount) {
  const today = new Date();
  const userWalk = {
    walkCount: Number(walkCount),
    createdAt: today.toISOString(),
  };
  await db
    .collection(COL_USERS)
    .doc(getUserDocName(username, number))
    .update({
      walks: existUserWalks.concat(userWalk),
    });
}

async function createUser(username, number, walkCount) {
  const today = new Date();
  const userWalk = {
    walkCount: Number(walkCount),
    createdAt: today.toISOString(),
  };
  await db
    .collection(COL_USERS)
    .doc(getUserDocName(username, number))
    .set({
      username: username,
      phoneNumber: phoneNumber,
      walks: [userWalk],
    });
}

async function addWalkLog(username, number, latestTotalWalkCount, walkCount) {
  const today = new Date();
  await db
    .collection(COL_WALKLOG)
    .add({
      username: username,
      phoneNumber: number,
      walkCount: Number(walkCount),
      totalWalkCount: latestTotalWalkCount + Number(walkCount),
      createdAt: today.toISOString(),
    })
    .then(() => {
      userTable.textContent = "";
      selectTotalWalkCount();
      clearInput();
      selectUserList();
    });
}

function showCompletedMsg(username, walkCount) {
  completedMsg.innerText = `${username} ${walkCount}걸음 입력 완료!`;
  completedMsg.classList.remove("hidden");
}

function hideInputForm() {
  // walkCountInputForm.classList.add("hidden")
  walkCountInputForm.style.setProperty("display", "none");
}

function validateInputData(username, phoneNumber, walkCount) {
  return username !== "" && phoneNumber !== "" && walkCount !== "";
}

async function userExist(username, phoneNumber) {
  const userWalk = await db
    .collection(COL_USERS)
    .doc(getUserDocName(username, phoneNumber))
    .get("walks")
    .then((snapshot) => snapshot.data().walks)
    .catch(() => false);
  return userWalk;
}
