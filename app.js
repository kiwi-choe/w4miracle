const walkCountInputForm = document.getElementById("walkCount-form")
const username = walkCountInputForm.querySelector("#username")
const phoneNumber = walkCountInputForm.querySelector("#phoneNumber")
const walkCount = walkCountInputForm.querySelector("#walkCount")

// total walk count
const totalWalkCnt = document.querySelector(".chart__value")
// users list
const userTable = document.querySelector("#users")
// firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCg-XnCKH6zScJY_04rXUf0Fmxbza_JnGU",
  authDomain: "walking4miracle.firebaseapp.com",
  projectId: "walking4miracle",
  storageBucket: "walking4miracle.appspot.com",
  messagingSenderId: "414251762442",
  appId: "1:414251762442:web:242b6a090d8013a7d9f0f3",
  measurementId: "G-X0KSZNYM6V"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
db.settings({
  timestampsInSnapshots: true
});

// 걸음 입력한 교인 목록 조회
// GET  입력된 걸음 목록
function selectUserList() {
  db
    .collection('walkLog')
    .orderBy('createdAt', 'desc')
    .get()
    .then(snapshot => {
      snapshot.docs.forEach(doc => {
        const tr = document.createElement('tr');
        const tdUsername = document.createElement('td');
        const tdPhoneNumber = document.createElement('td');
        const tdWalkCount = document.createElement('td');
        const tdTotalWalkCount = document.createElement('td');
        const walkCount = Number(doc.data().walkCount).toLocaleString();
        const totalWalkCount = Number(doc.data().totalWalkCount).toLocaleString();
  
        tdUsername.setAttribute('class', 'username');
        tdPhoneNumber.setAttribute('class', 'phoneNumber');
        tdWalkCount.setAttribute('class', 'walkCount');
        tdTotalWalkCount.setAttribute('class', 'totalWalkCount');
  
        tdUsername.textContent = doc.data().username;
        tdPhoneNumber.textContent = doc.data().phoneNumber;
        tdWalkCount.textContent = walkCount;
        tdTotalWalkCount.textContent = totalWalkCount;
  
        tr.append(tdUsername, tdPhoneNumber, tdWalkCount, tdTotalWalkCount);
        userTable.appendChild(tr);
      })
      totalWalkCnt.textContent = snapshot.docs[0].data().totalWalkCount.toLocaleString();
    })
}
selectUserList();

function clearInput() {
  username.value = '';
  phoneNumber.value = '';
  walkCount.value = '';
}

async function onSubmit(info) {
  info.preventDefault();

  if (validateInputData(username.value, phoneNumber.value, walkCount.value)) {
    
    const walkCountNum = Number(walkCount.value);
    const today = new Date();

    if (!Boolean(walkCountNum)) {
      alert('걸음수는 숫자로 입력해주세요');
      return;
    } 

    try {
      const existUserWalks = await userExist(username.value, phoneNumber.value);

      if (existUserWalks) {
        const userWalks = {
          walkCount: walkCountNum,
          createdAt: today.toISOString()
        }
        // update
        updateUsersCollection(existUserWalks, userWalks);
      } else {
        // create
        createUsersCollection(walkCountNum);
      }
      // addWalkLog
      addWalkLog(walkCountNum);
    } catch (e) {
    } 
  } else {
    alert("이름, 번호, 걸음수 입력해주세요!")
  }
}

walkCountInputForm.addEventListener("submit", onSubmit)

function showCompletedMsg(username, walkCount) {
  completedMsg.innerText = `${username} ${walkCount}걸음 입력 완료!`
  completedMsg.classList.remove("hidden")
}

function hideInputForm() {
  // walkCountInputForm.classList.add("hidden")
  walkCountInputForm.style.setProperty("display", "none")
}

function validateInputData(username, phoneNumber, walkCount) {
  return (username !== "" &&
    phoneNumber !== "" &&
    walkCount !== "")
}


// 기존에 존재하는 유저인지?
async function userExist(username, phoneNumber) {
  const userWalk = await db
    .collection('users')
    .doc(`${username}-${phoneNumber}`)
    .get('walks')
    .then(snapshot => snapshot.data().walks)
    .catch(() => false)
  
  return userWalk;
}


// 사용자 걸음 update
function updateUsersCollection(existUserWalks, userWalks) {
  db
    .collection('users')
    .doc(`${username.value}-${phoneNumber.value}`)
    .update({
      walks: existUserWalks.concat(userWalks)
    })
}


// 사용자 걸음 create
function createUsersCollection(walkCountNum) {
  const today = new Date();
  db
    .collection('users')
    .doc(`${username.value}-${phoneNumber.value}`)
    .set({
      username: username.value,
      phoneNumber: phoneNumber.value,
      walks: [{
        walkCount: walkCountNum,
        createdAt: today.toISOString()
      }]
    })
}


// 걸음로그 입력
function addWalkLog(walkCountNum) {
  const today = new Date();
  db
    .collection('walkLog')
    .add({
      username: username.value,
      phoneNumber: phoneNumber.value,
      walkCount: walkCountNum,
      totalWalkCount: Number(totalWalkCnt.textContent.replace(',', '')) + walkCountNum,
      createdAt: today.toISOString()
    })
  .then(() => {
    userTable.textContent = '';
    clearInput();
    selectUserList();
  })
}