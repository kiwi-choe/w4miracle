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

// 총 걸음수 조회
// GET  총 걸음 수
function selectTotalWalkCount() {
  db
    .collection('totalWalkCnt')
    .get()
    .then(snapshot => {
      snapshot.docs.forEach(doc => {
        if (doc.data().totalWalkCnt > 0) {
          totalWalkCnt.textContent = doc.data().totalWalkCnt.toLocaleString();
        } else {
          totalWalkCnt.textContent = 0
        }
      })
    })
}
selectTotalWalkCount();

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
  // console.log(info);

  if (validateInputData(username.value, phoneNumber.value, walkCount.value)) {
    const today = new Date();

    try {
      // users에 입력 
      // 존재하지 않으면 새로 입력
      // 존재하면 walks update
      const existUserWalks = await userExist(username.value, phoneNumber.value);
      if (existUserWalks) {
        const userWalks = {
          walkCount: Number(walkCount.value),
          createdAt: today.toISOString()
        }
        
        db
          .collection('users')
          .doc(`${username.value}-${phoneNumber.value}`)
          .update({
            walks: existUserWalks.concat(userWalks)
          })
      } else {
        db
          .collection('users')
          .doc(`${username.value}-${phoneNumber.value}`)
          .set({
            username: username.value,
            phoneNumber: phoneNumber.value,
            walks: [{
              walkCount: Number(walkCount.value),
              createdAt: today.toISOString()
            }]
          })
      }

      // 둘 중 하나가 안 되고 넘어가버리는 현상이 생겨서 promise.all로 묶고 콜백함수 실행
      await Promise.all([
        // walkLog에 입력
			  // POST  걸음데이타
        db
          .collection('walkLog')
          .add({
            username: username.value,
            phoneNumber: phoneNumber.value,
            walkCount: Number(walkCount.value),
            totalWalkCount: Number(totalWalkCnt.textContent.replace(',', '')) + Number(walkCount.value),
            createdAt: today.toISOString()
          }),
        // 총 걸음 수 입력
        db
          .collection('totalWalkCnt')
          .doc('totalWalkCnt')
          .update({
            totalWalkCnt: Number(totalWalkCnt.textContent.replace(',', '')) + Number(walkCount.value)
          })
      ])
      .then(() => {
        userTable.textContent = '';
        selectTotalWalkCount();
        clearInput();
        selectUserList();
      })
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

async function userExist(username, phoneNumber) {
  const userWalk = await db
    .collection('users')
    .doc(`${username}-${phoneNumber}`)
    .get('walks')
    .then(snapshot => snapshot.data().walks)
    .catch(() => false)
  
  return userWalk;
}