// const walkCountInputForm = document.getElementById("walkCount-form");
const username = document.querySelector("#username");
const phoneNumber = document.querySelector("#phoneNumber");
const walkCount = document.querySelector("#walkCount");
const totalWalkCnt = document.querySelector(".chart__value");
const elNumOfDesks = document.querySelector(".chart__numOfDesks");
const elDeskImg = document.querySelector("#chart__deskImg");
const thumbnailContainer = document.querySelector("#thumbnail__container");
const userTable = document.querySelector("#users");
const elBoard = document.querySelector("#board");
// const seeMoreBtn = document.querySelector("#seeMore");
const headerLogoSection = document.querySelector("#header");
const deskAnimImage = document.querySelector(".img_desk_anmation");

const COL_ADMIN = "admin";
const COL_USERS = "users";
const COL_WALKLOG = "walkLog";
const DOC_CHART = "chart";
const DOC_URLS = "urls";
const GET_WALKLOG_LIMIT_COUNT = 5;
let lastVisible = -1;

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCg-XnCKH6zScJY_04rXUf0Fmxbza_JnGU",
  authDomain: "walking4miracle.firebaseapp.com",
  projectId: "walking4miracle",
  storageBucket: "walking4miracle.appspot.com",
  messagingSenderId: "414251762442",
  appId: "1:414251762442:web:242b6a090d8013a7d9f0f3",
  measurementId: "G-X0KSZNYM6V",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
db.settings({
  timestampsInSnapshots: true,
});
// == Initialize Firebase

function clearInput() {
  username.value = "";
  phoneNumber.value = "";
  walkCount.value = "";
}

function onClickHeaderLogo() {
  window.location.href = "../index.html";
}
headerLogoSection.addEventListener("click", onClickHeaderLogo);

// GET 총 걸음 수
function selectTotalWalkCount() {
  getTotalWalkCount();
}
selectTotalWalkCount();

// GET  입력된 걸음 목록
// function selectUserList() {
//   getWalkLogs();
// }
// selectUserList();

// 누적 책상 수 가져오기
async function selectNumOfDesks() {
  await showNumOfDesks();
}
selectNumOfDesks();

// deskAnimImage.addEventListener("animationstart", () => {});
// deskAnimImage.addEventListener("animationend", () => {
//   deskAnimImage.classList.remove("active");
//   deskAnimImage.style.setProperty("display", "none");
// });
function showDeskAnimation() {
  deskAnimImage.style.setProperty("display", "block");
  deskAnimImage.classList.toggle("active");
}

// 입력
async function onSubmit(info) {
  info.preventDefault();

  if (!validateInputData(username.value, phoneNumber.value, walkCount.value)) {
    alert("이름, 번호, 걸음수 입력해주세요!");
    return;
  }

  if (!isNumber(walkCount.value)) {
    alert("걸음수는 숫자로 입력해주세요");
    return;
  }

  if (!isNumber(phoneNumber.value)) {
    alert("핸드폰 번호는 숫자로 입력해주세요");
    return;
  }

  try {
    const existUserWalks = await userExist(username.value, phoneNumber.value);
    if (existUserWalks) {
      await updateUser(
        username.value,
        phoneNumber.value,
        existUserWalks,
        walkCount.value
      );
    } else {
      await createUser(username.value, phoneNumber.value, walkCount.value);
    }

    // POST 걸음데이타
    const latestTotalWalkCount = await getTotalWalkCount();
    addWalkLog(
      username.value,
      phoneNumber.value,
      latestTotalWalkCount,
      walkCount.value
    );

    await updateNumOfDesks(latestTotalWalkCount, walkCount.value);
    showNumOfDesks();
  } catch (e) {
    console.log(e);
  }
}
// walkCountInputForm.addEventListener("submit", onSubmit);

async function updateNumOfDesks(latestTotalWalkCount, walkCount) {
  const numOfDesks = (latestTotalWalkCount + Number(walkCount)) / 50000;

  await db
    .collection(COL_ADMIN)
    .doc(DOC_CHART)
    .update({
      numOfDesks: Math.floor(numOfDesks),
    });
}

async function showNumOfDesks() {
  const numOfDesks = await getNumOfDesks();

  if (numOfDesks !== 0) {
    elDeskImg.style.display = "inline";
    elNumOfDesks.textContent = " x " + numOfDesks;
  }
}

function showCompletedMsg(username, walkCount) {
  completedMsg.innerText = `${username} ${walkCount}걸음 입력 완료!`;
  completedMsg.classList.remove("hidden");
}

function hideSeeMoreButton() {
  seeMoreBtn.style.setProperty("display", "none");
}
function showSeeMoreButton() {
  seeMoreBtn.style.setProperty("display", "block");
}

function validateInputData(username, phoneNumber, walkCount) {
  return (
    username &&
    phoneNumber &&
    walkCount &&
    walkCount > 0 &&
    String(phoneNumber).length === 4
  );
}

// 더보기 더블 클릭 방지
let seeMoreFlag = false;
function isDoubleClicked() {
  if (seeMoreFlag === true) {
    return seeMoreFlag;
  } else {
    seeMoreFlag = true;
    return false;
  }
}
function clickInit() {
  seeMoreFlag = false;
}

// 더보기
// function onClickSeeMore() {
//   if (isDoubleClicked() === true) {
//     return;
//   }

//   getNextWalkLogs();
// }
// seeMoreBtn.addEventListener("click", onClickSeeMore);
/**
 * DB
 */
function getUserDocName(username, phoneNumber) {
  return `${username}-${phoneNumber}`;
}

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

// 책상 갯수 가져오기
async function getNumOfDesks() {
  const chartInfo = await db
    .collection(COL_ADMIN)
    .doc(DOC_CHART)
    .get()
    .then((doc) => {
      return doc.data();
    });
  return chartInfo.numOfDesks;
}

// async function getWalkLogs() {
//   await db
//     .collection(COL_WALKLOG)
//     .orderBy("createdAt", "desc")
//     .limit(GET_WALKLOG_LIMIT_COUNT)
//     .get()
//     .then((snapshot) => {
//       snapshot.docs.forEach((doc) => {
//         if (doc.length !== 0) {
//           elBoard.style.display = "block";
//           const walkCount = Number(doc.data().walkCount).toLocaleString();
//           const totalWalkCount = Number(
//             doc.data().totalWalkCount
//           ).toLocaleString();

//           addWalkLogTable(
//             doc.data().username,
//             doc.data().phoneNumber,
//             walkCount,
//             totalWalkCount
//           );
//         }
//       });
//       // check if last item
//       if (snapshot.docs.length < GET_WALKLOG_LIMIT_COUNT) {
//         hideSeeMoreButton();
//         return;
//       }
//       lastVisible = snapshot.docs[snapshot.docs.length - 1];
//     });
// }

async function getNextWalkLogs() {
  await db
    .collection(COL_WALKLOG)
    .orderBy("createdAt", "desc")
    .startAfter(lastVisible)
    .limit(GET_WALKLOG_LIMIT_COUNT)
    .get()
    .then((snapshot) => {
      snapshot.docs.forEach((doc) => {
        const walkCount = Number(doc.data().walkCount).toLocaleString();
        const totalWalkCount = Number(
          doc.data().totalWalkCount
        ).toLocaleString();

        addWalkLogTable(
          doc.data().username,
          doc.data().phoneNumber,
          walkCount,
          totalWalkCount
        );
      });
      // check if last item
      if (snapshot.docs.length < GET_WALKLOG_LIMIT_COUNT) {
        hideSeeMoreButton();
        return;
      }
      lastVisible = snapshot.docs[snapshot.docs.length - 1];
      clickInit(); // 다음 워크로그 조회 후에 seeMoreFlag를 다시 false로 초기회
    });
}

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

function isNumber(walkCount) {
  const walkCountNo = Number(walkCount);
  return String(walkCountNo) !== "NaN";
}

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
      phoneNumber: number,
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
      showDeskAnimation();
      initView();
    });
}

function initView() {
  userTable.textContent = "";
  selectTotalWalkCount();
  clearInput();
  selectUserList();
  showSeeMoreButton();
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

function onClickThumbnailSection() {
  console.log("clcick!!!!!!!!!!!!");
  window.location.href = "../pages/gallary.html";
}
thumbnailContainer.addEventListener("click", onClickThumbnailSection);
