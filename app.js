const walkCountInputForm = document.getElementById("walkCount-form")
const username = walkCountInputForm.querySelector("#username")
const phoneNumber = walkCountInputForm.querySelector("#phoneNumber")
const walkCount = walkCountInputForm.querySelector("#walkCount")

// total walk count
const totalWalkCnt = document.querySelector(".chart__value")

// users list
const userTable = document.querySelector("#users")

const completedMsg = document.getElementById("completed-msg")

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

// 걸음 입력한 교인 목록 조회
db
	.collection('users')
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

			tdUsername.setAttribute('class', 'username');
			tdPhoneNumber.setAttribute('class', 'phoneNumber');
			tdWalkCount.setAttribute('class', 'walkCount');
			tdTotalWalkCount.setAttribute('class', 'totalWalkCount');

			tdUsername.textContent = doc.data().username;
			tdPhoneNumber.textContent = doc.data().phoneNumber;
			tdWalkCount.textContent = walkCount;
			tdTotalWalkCount.textContent = walkCount;

			tr.append(tdUsername, tdPhoneNumber, tdWalkCount, tdTotalWalkCount);
			userTable.appendChild(tr);
		})
	})

function onSubmit(info) {
	info.preventDefault();
	// console.log(info);

	if (validateInputData(username.value, phoneNumber.value, walkCount.value)) {
		const today = new Date();

		try {
			// 이미 등록한 교인이 있으면 ==> update
			// if (isExistUser(username.value, phoneNumver.value)) {
			// 	console.log('이미 교인 있어서 update')
			// } else {
			// 	// 처음 등록한 교인이라면 ==> create
			// 	console.log('처음 등록한 교인이어서 create')
			// }

			// 사용자 입력
			db
				.collection('users')
				.add({
					username: username.value,
					phoneNumber: phoneNumber.value,
					walkCount: walkCount.value,
					createdAt: today.toISOString()
				})
			.then()

			// 총 걸음 수 입력
			db
				.collection('totalWalkCnt')
				.doc('Krn2yRKgaTh9sALsvRhH')
				.update({
					totalWalkCnt: Number(totalWalkCnt.textContent.replace(',', '')) + Number(walkCount.value)
				})
		} catch (e) {

		}

		// hideInputForm()
		// showCompletedMsg(username.value, walkCount.value)
		window.location.reload();
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

function isExistUser(username, phoneNumber) {
	let userCollection = db.collection('users');

	// userCollection.doc
}